import { createClient } from "@supabase/supabase-js";
import { CallToolResult, fromJsonSchema, McpServer, ServerContext } from "@modelcontextprotocol/server";
import { todayIso } from "../../components/duty-calculator/lib/format";
import { originRates, RateBasis, rateKey, rateOf } from "../../components/tariff-tracker/product/analysis/analysis";
import { AllRules } from "../../tariffs/engine-v2/data";
import { addDays, calculateHistory, lastDay } from "../../tariffs/engine-v2/history";
import { getVerifiedRevisions, isVerifiedDate } from "../../tariffs/engine-v2/revisions";
import { TransportMode } from "../../tariffs/engine-v2/types";
import { describeTotal, getHtsDutySummary, SUMMARY_COUNTRY_CODES } from "../hts-duty-summary";
import { getChangelogEntries } from "../supabase/tariff-changelog";
import {
  calculateDuty,
  childLines,
  DutyInputError,
  DutyRequest,
  findHtsLine,
  findOrigin,
  firstVerifiedDate,
} from "./duty";
import { changelogUrl, htsPageUrl, LinkContext } from "./links";
import { DISCLAIMER, dutyPayload, dutySummary, originRow, programName, productDescription } from "./payloads";
import { RequestInfo, trackToolCall } from "./track";
import { WIDGET_URI } from "./widget";

// The MCP server's tools. All read-only and open to anyone: they only read public tariff data.
// Tools that touch a user's own data (tracking products, alerts) come with sign-in in v1.

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  // The HTS and HTS Hero's tariff rules are a closed dataset, not the open web
  openWorldHint: false,
};

// Tools whose results the duty card can draw. `openai/outputTemplate` is ChatGPT's older alias.
const WITH_WIDGET = { ui: { resourceUri: WIDGET_URI }, "openai/outputTemplate": WIDGET_URI };

// ── Shared input schemas ──

const HTS_CODE = {
  type: "string",
  description: 'The product\'s 10-digit HTS code (8 digits works where the line has no 10-digit lines), dotted or not: "8471.30.0100" or "8471300100".',
};
const COUNTRY = {
  type: "string",
  description: 'Country of origin as an ISO 3166 two-letter code ("CN", "VN", "MX") or its name.',
};
const VALUE = { type: "number", exclusiveMinimum: 0, description: "Customs (entered) value in USD. Default 10000." };
const QUANTITY = {
  type: "number",
  exclusiveMinimum: 0,
  description: "Quantity in the HTS line's unit. Only matters for per-unit base rates (the result says requires_quantity). Default 1000.",
};
const MODE = {
  type: "string",
  enum: ["ocean", "air", "truck", "rail"],
  description: "How the goods arrive. Ocean adds the Harbor Maintenance Fee. Default ocean.",
};
const ENTRY_DATE = {
  type: "string",
  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
  description: "Entry date, YYYY-MM-DD. Default today. Past dates use the tariffs in force then.",
};
const TRADE_PROGRAM = {
  type: "string",
  description: 'SPI symbol of a trade program to claim, e.g. "S" (USMCA), "KR" (US-Korea FTA). See available_trade_programs in a result.',
};
const ANSWERS = {
  type: "object",
  additionalProperties: { type: ["boolean", "number", "string"] },
  description: 'Answers to questions from a previous result, keyed by question id: {"steelContentPct": 40, "confirm:9903.82.18": true}.',
};

interface ShipmentArgs {
  hts_code: string;
  country_of_origin: string;
  customs_value_usd?: number;
  quantity?: number;
  transport_mode?: TransportMode;
  entry_date?: string;
  trade_program?: string;
  answers?: Record<string, unknown>;
}

const toRequest = (a: ShipmentArgs): DutyRequest => ({
  htsCode: a.hts_code,
  country: a.country_of_origin,
  customsValue: a.customs_value_usd,
  quantity: a.quantity,
  transportMode: a.transport_mode,
  entryDate: a.entry_date,
  tradeProgram: a.trade_program,
  answers: a.answers,
});

// ── Results ──

const ok = (structuredContent: Record<string, unknown>, text: string): CallToolResult => ({
  structuredContent,
  // Clients that only pass text to the model still get the whole result
  content: [{ type: "text", text: `${text}\n\n${JSON.stringify(structuredContent)}` }],
});

const fail = (text: string): CallToolResult => ({ isError: true, content: [{ type: "text", text }] });

// Runs a tool, turning input problems into errors the model can act on, and records the call
const handler =
  <A>(tool: string, request: RequestInfo, run: (args: A, links: LinkContext) => Promise<CallToolResult>) =>
  async (args: A, ctx: ServerContext): Promise<CallToolResult> => {
    const started = Date.now();
    const links: LinkContext = { client: request.clientFor(ctx), tool };
    let result: CallToolResult;
    try {
      result = await run(args, links);
    } catch (error) {
      if (error instanceof DutyInputError) {
        result = fail(error.message);
      } else {
        console.error(`MCP tool ${tool} failed:`, error);
        result = fail("HTS Hero couldn't complete this calculation because of a server error. Try again shortly.");
      }
    }
    await trackToolCall(request, ctx, {
      tool,
      client: links.client,
      status: result.isError ? "error" : "ok",
      duration_ms: Date.now() - started,
      args,
    });
    return result;
  };

// ── Registration ──

export const registerTools = (server: McpServer, request: RequestInfo) => {
  server.registerTool(
    "calculate_import_duty",
    {
      title: "Calculate US import duty",
      description: [
        "Use this when the user wants the US import duty, tariff rate or landed duty cost for a product whose HTS code they know, from a specific country of origin.",
        "Returns every duty layer that stacks on the entry: the base (column 1/2) rate plus Chapter 99 measures such as Section 301, Section 232 and other additional duties, with MPF and HMF fees, as of the entry date.",
        "If the result has open `questions` whose change_if_yes_usd isn't 0, ask the user and call again with `answers`; mention trade programs in available_trade_programs that would lower the duty.",
        "Do not use this to find or guess an HTS code from a product description, and do not use it for exports or other countries' import duties.",
      ].join(" "),
      inputSchema: fromJsonSchema<ShipmentArgs>({
        type: "object",
        properties: {
          hts_code: HTS_CODE,
          country_of_origin: COUNTRY,
          customs_value_usd: VALUE,
          quantity: QUANTITY,
          transport_mode: MODE,
          entry_date: ENTRY_DATE,
          trade_program: TRADE_PROGRAM,
          answers: ANSWERS,
        },
        required: ["hts_code", "country_of_origin"],
        additionalProperties: false,
      }),
      annotations: { title: "Calculate US import duty", ...READ_ONLY },
      _meta: WITH_WIDGET,
    },
    handler<ShipmentArgs>("calculate_import_duty", request, async (args, links) => {
      const payload = dutyPayload(await calculateDuty(toRequest(args)), links);
      return ok(payload, dutySummary(payload));
    })
  );

  interface CompareArgs extends Omit<ShipmentArgs, "country_of_origin" | "trade_program"> {
    country_of_origin?: string;
    countries?: string[];
    limit?: number;
    basis?: "with_trade_programs" | "standard";
  }

  server.registerTool(
    "compare_origins",
    {
      title: "Compare duty across countries of origin",
      description: [
        "Use this when the user asks which country is cheapest to import a product from, how the duty on a product differs between countries of origin, or where to source to lower US tariffs, for a known HTS code.",
        "Works out the duty from every country (about 200), with and without the best trade program each can claim, and returns them ranked lowest first.",
        "Pass `countries` to compare specific origins, or leave it out for the cheapest ones overall; pass `country_of_origin` for the user's current origin so it's marked and ranked.",
        "Do not use this to find an HTS code from a description.",
      ].join(" "),
      inputSchema: fromJsonSchema<CompareArgs>({
        type: "object",
        properties: {
          hts_code: HTS_CODE,
          country_of_origin: { ...COUNTRY, description: `${COUNTRY.description} The user's current origin, to compare against. Optional.` },
          countries: {
            type: "array",
            items: { type: "string" },
            maxItems: 30,
            description: "Origins to compare (ISO codes or names). Leave out for the cheapest origins overall.",
          },
          limit: { type: "integer", minimum: 1, maximum: 50, description: "How many origins to return when `countries` is left out. Default 10." },
          basis: {
            type: "string",
            enum: ["with_trade_programs", "standard"],
            description: "Rank by the rate with each origin's best trade program claimed (the goods must qualify under its rules of origin), or by the standard rate. Default with_trade_programs.",
          },
          customs_value_usd: VALUE,
          quantity: QUANTITY,
          transport_mode: MODE,
          entry_date: ENTRY_DATE,
          answers: ANSWERS,
        },
        required: ["hts_code"],
        additionalProperties: false,
      }),
      annotations: { title: "Compare duty across countries of origin", ...READ_ONLY },
      _meta: WITH_WIDGET,
    },
    handler<CompareArgs>("compare_origins", request, async (args, links) => {
      const requested = args.country_of_origin ? findOrigin(args.country_of_origin) : null;
      const chosen = (args.countries ?? []).map(findOrigin);
      const calc = await calculateDuty(
        toRequest({ ...args, country_of_origin: requested?.code ?? chosen[0]?.code ?? "CN" })
      );
      const basis: RateBasis = args.basis === "standard" ? "standard" : "agreements";
      // Among origins on the same rate, the largest sources of US imports first
      const importRank = (code: string) => {
        const i = SUMMARY_COUNTRY_CODES.indexOf(code);
        return i === -1 ? SUMMARY_COUNTRY_CODES.length : i;
      };
      const rates = originRates({
        input: calc.input,
        customsValue: calc.customsValue,
        adjustments: { answers: calc.answers },
        entry: { country: { code: requested?.code ?? "" } },
      }).sort(
        (a, b) =>
          rateKey(rateOf(a, basis)) - rateKey(rateOf(b, basis)) ||
          importRank(a.country.code) - importRank(b.country.code) ||
          a.country.name.localeCompare(b.country.name)
      );

      // Origins on the same rate share a rank
      const distinct = Array.from(new Set(rates.map((r) => rateKey(rateOf(r, basis)))));
      const rankOf = (pct: number) => distinct.indexOf(rateKey(pct)) + 1;
      const rows = rates.map((r) => originRow(r, calc.customsValue, rankOf(rateOf(r, basis)), basis));
      const tiers = distinct.slice(0, 12).map((pct, i) => {
        const at = rows.filter((r) => r.rank === i + 1);
        return { rank: i + 1, rate_pct: pct, origins: at.length, examples: at.slice(0, 6).map((r) => r.country.name) };
      });

      const chosenCodes = new Set(chosen.map((c) => c.code));
      const shown = chosen.length
        ? rows.filter((r) => chosenCodes.has(r.country.code) || r.is_requested_origin)
        : [
            ...rows.slice(0, args.limit ?? 10),
            ...rows.slice(args.limit ?? 10).filter((r) => r.is_requested_origin),
          ];
      const lowest = rows[0];
      const highest = rows[rows.length - 1];
      const requestedRow = rows.find((r) => r.is_requested_origin) ?? null;

      const payload = {
        kind: "comparison" as const,
        product: {
          hts_code: calc.line.element.htsno,
          description: productDescription(calc),
          entry_date: calc.asOf,
          customs_value_usd: calc.customsValue,
          transport_mode: calc.transportMode,
        },
        basis: basis === "agreements" ? "with_trade_programs" : "standard",
        origins: shown,
        rate_tiers: tiers,
        summary: {
          origins_compared: rows.length,
          distinct_rates: distinct.length,
          lowest_rate_pct: lowest.effective_duty_rate_pct,
          origins_at_lowest_rate: rows.filter((r) => r.rank === 1).length,
          highest_rate_pct: highest.effective_duty_rate_pct,
          requested_origin: requestedRow,
          saving_vs_requested_origin_pct: requestedRow
            ? Math.max(0, Math.round((requestedRow.effective_duty_rate_pct - lowest.effective_duty_rate_pct) * 1000) / 1000)
            : null,
        },
        note: "Rates are duty as a percent of customs value, without fees, and exclude antidumping/countervailing duties. Trade program rates apply only to goods that meet the program's rules of origin.",
        as_of: calc.asOf,
        rates_revision: calc.line.ratesRevision,
        rules_revision: calc.rulesRevision,
        verified: calc.verified,
        warnings: calc.warnings,
        disclaimer: DISCLAIMER,
        links: {
          analysis_url: dutyPayload(calc, links).links.analysis_url,
          hts_page_url: htsPageUrl(calc.line.element.htsno, links),
        },
      };
      const text = [
        `Duty on HTS ${payload.product.hts_code} (${payload.product.description}) across ${rows.length} origins, ${calc.asOf}:`,
        `Lowest ${lowest.effective_duty_rate_pct}% (${payload.summary.origins_at_lowest_rate} origins), highest ${highest.effective_duty_rate_pct}%.`,
        requestedRow ? `${requestedRow.country.name}: ${requestedRow.effective_duty_rate_pct}%, rank ${requestedRow.rank} of ${distinct.length} distinct rates.` : "",
        ...shown.map(
          (r) =>
            `#${r.rank} ${r.country.name}: ${r.effective_duty_rate_pct}%${
              r.best_trade_program && r.effective_duty_rate_pct !== r.standard_rate_pct
                ? ` with ${r.best_trade_program.symbol} (${r.standard_rate_pct}% standard)`
                : r.best_trade_program
                  ? ` (${r.best_trade_program.effective_duty_rate_pct}% with ${r.best_trade_program.symbol})`
                  : ""
            }`
        ),
      ]
        .filter(Boolean)
        .join("\n");
      return ok(payload, text);
    })
  );

  interface HistoryArgs extends Omit<ShipmentArgs, "entry_date"> {
    from?: string;
    to?: string;
  }

  server.registerTool(
    "get_duty_history",
    {
      title: "Get a product's duty history",
      description: [
        "Use this when the user asks how the US tariff on a product from a country has changed over time, what the duty was on a past date or entry, or when a particular tariff started or ended for it.",
        "Returns each stretch of dates with a constant duty, the rate in it, and which duty layers were added, removed or changed at each step.",
        "For a single past entry date, calculate_import_duty with entry_date is simpler.",
      ].join(" "),
      inputSchema: fromJsonSchema<HistoryArgs>({
        type: "object",
        properties: {
          hts_code: HTS_CODE,
          country_of_origin: COUNTRY,
          from: { ...ENTRY_DATE, description: "Start date, YYYY-MM-DD. Default: the first date of HTS Hero's verified tariff data." },
          to: { ...ENTRY_DATE, description: "End date (inclusive), YYYY-MM-DD. Default today." },
          customs_value_usd: VALUE,
          quantity: QUANTITY,
          transport_mode: MODE,
          trade_program: TRADE_PROGRAM,
          answers: ANSWERS,
        },
        required: ["hts_code", "country_of_origin"],
        additionalProperties: false,
      }),
      annotations: { title: "Get a product's duty history", ...READ_ONLY },
    },
    handler<HistoryArgs>("get_duty_history", request, async (args, links) => {
      const from = args.from ?? firstVerifiedDate();
      const to = args.to ?? todayIso();
      if (to < from) throw new DutyInputError(`"to" (${to}) is before "from" (${from}).`);
      const calc = await calculateDuty(toRequest({ ...args, entry_date: to }));
      const segments = calculateHistory(AllRules, { ...calc.input, answers: calc.answers }, from, addDays(to, 1)).map((s) => ({
        from: s.from,
        to: lastDay(s),
        rules_revision: s.revision?.name ?? null,
        verified: isVerifiedDate(s.from),
        duty_usd: Math.round(s.result.totalDuty * 100) / 100,
        effective_duty_rate_pct: Math.round((s.result.totalDuty / calc.customsValue) * 100000) / 1000,
        changes: s.changes.map((c) => ({
          kind: c.kind,
          code: c.code,
          name: c.name,
          program: programName(c.program) ?? null,
          rate_before_pct: c.before?.ratePct ?? null,
          rate_after_pct: c.after?.ratePct ?? null,
          duty_change_usd: Math.round(c.delta * 100) / 100,
        })),
      }));
      const verified = getVerifiedRevisions();
      const payload = {
        kind: "history" as const,
        product: {
          hts_code: calc.line.element.htsno,
          description: productDescription(calc),
          country_of_origin: { code: calc.country.code, name: calc.country.name },
          customs_value_usd: calc.customsValue,
        },
        segments,
        coverage: { verified_from: verified[0]?.from ?? null, verified_through_revision: verified[verified.length - 1]?.name ?? null },
        note: `Chapter 99 duties are as of each date; the base rate is from the current HTS (${calc.line.ratesRevision}).`,
        disclaimer: DISCLAIMER,
        links: { analysis_url: dutyPayload(calc, links).links.analysis_url },
      };
      const text = [
        `Duty history for HTS ${payload.product.hts_code} from ${calc.country.name}, ${from} to ${to}:`,
        ...segments.map(
          (s) =>
            `${s.from} – ${s.to}: ${s.effective_duty_rate_pct}%${s.verified ? "" : " (unverified)"}${
              s.changes.length ? ` — ${s.changes.map((c) => `${c.kind} ${c.code}`).join(", ")}` : ""
            }`
        ),
      ].join("\n");
      return ok(payload, text);
    })
  );

  server.registerTool(
    "get_hts_code",
    {
      title: "Look up an HTS code",
      description: [
        "Use this when the user gives a US HTS code and wants what it covers, its base duty rates (general, special, column 2), its parent headings or the more specific lines under it, or a quick view of its total duty from major origins.",
        "Do not use this to search for a code by product description.",
      ].join(" "),
      inputSchema: fromJsonSchema<{ hts_code: string }>({
        type: "object",
        properties: { hts_code: { ...HTS_CODE, description: 'An 8- or 10-digit HTS code, dotted or not, e.g. "8471.30.0100" or "84713001".' } },
        required: ["hts_code"],
        additionalProperties: false,
      }),
      annotations: { title: "Look up an HTS code", ...READ_ONLY },
    },
    handler<{ hts_code: string }>("get_hts_code", request, async (args, links) => {
      const line = await findHtsLine(args.hts_code, { requireLeaf: false });
      const { element, rateElement, parents, elements } = line;
      const children = childLines(element, elements);
      const summary = children.length ? null : getHtsDutySummary(element, rateElement);
      const payload = {
        kind: "hts_code" as const,
        hts_code: element.htsno,
        description: productDescription({ line }),
        line_description: element.description.replace(/<[^>]+>/g, "").trim(),
        headings: parents.map((p) => ({ hts_code: p.htsno || null, description: p.description.replace(/<[^>]+>/g, "").trim() })),
        base_rates: {
          from_line: rateElement.htsno,
          general: rateElement.general || null,
          special: rateElement.special || null,
          column_2: rateElement.other || null,
        },
        units: element.units,
        footnotes: [...rateElement.footnotes, ...(rateElement === element ? [] : element.footnotes)].map((f) => f.value),
        more_specific_lines: children.slice(0, 50).map((c) => ({ hts_code: c.htsno, description: c.description.replace(/<[^>]+>/g, "").trim() })),
        duty_from_major_origins: summary
          ? summary.rows.map((r) => ({
              country: r.country.code,
              name: r.country.name,
              total: describeTotal(r),
              additional_duties: r.additional.map((a) => `${a.code} ${a.program} ${a.ratePct}%`),
              with_trade_program: r.preference ? { symbol: r.preference.symbol, name: r.preference.name, total_pct: r.preference.totalPct } : null,
            }))
          : null,
        as_of: summary?.asOf ?? todayIso(),
        rates_revision: line.ratesRevision,
        disclaimer: DISCLAIMER,
        links: { hts_page_url: htsPageUrl(element.htsno, links) },
      };
      const text = [
        `HTS ${payload.hts_code}: ${payload.description}.`,
        `Base rates (from ${payload.base_rates.from_line}): general ${payload.base_rates.general ?? "–"}, special ${payload.base_rates.special ?? "–"}, column 2 ${payload.base_rates.column_2 ?? "–"}.`,
        children.length ? `${children.length} more specific lines under it; duty needs one of them.` : "",
      ]
        .filter(Boolean)
        .join("\n");
      return ok(payload, text);
    })
  );

  interface ChangesArgs {
    since?: string;
    limit?: number;
  }

  server.registerTool(
    "get_recent_tariff_changes",
    {
      title: "Get recent US tariff changes",
      description: [
        "Use this when the user asks what has changed in US tariffs or the HTS recently, what a recent HTS revision changed, or whether there is tariff news to know about.",
        "Returns HTS Hero's changelog of tariff data updates (new HTS revisions and the Chapter 99 changes in them), newest first.",
        "To see how a change affects a specific product, follow up with get_duty_history.",
      ].join(" "),
      inputSchema: fromJsonSchema<ChangesArgs>({
        type: "object",
        properties: {
          since: { ...ENTRY_DATE, description: "Only changes on or after this date, YYYY-MM-DD. Default 90 days ago." },
          limit: { type: "integer", minimum: 1, maximum: 20, description: "Most entries to return. Default 10." },
        },
        additionalProperties: false,
      }),
      annotations: { title: "Get recent US tariff changes", ...READ_ONLY },
    },
    handler<ChangesArgs>("get_recent_tariff_changes", request, async (args, links) => {
      const since = args.since ?? addDays(todayIso(), -90);
      // The anon key: row-level security shows only published entries
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const entries = (await getChangelogEntries(supabase, { limit: 50 }))
        .filter((e) => e.entry_date >= since)
        .slice(0, args.limit ?? 10)
        .map((e) => ({ date: e.entry_date, type: e.type, title: e.title, summary: e.summary, revision: e.revision }));
      const payload = {
        kind: "changes" as const,
        since,
        entries,
        links: { changelog_url: changelogUrl(links) },
      };
      const text = entries.length
        ? entries.map((e) => `${e.date} — ${e.title}: ${e.summary}`).join("\n")
        : `No tariff changes recorded since ${since}.`;
      return ok(payload, text);
    })
  );

  interface BatchArgs {
    lines: { hts_code: string; country_of_origin: string; customs_value_usd: number; quantity?: number }[];
    transport_mode?: TransportMode;
    entry_date?: string;
  }

  server.registerTool(
    "calculate_duty_batch",
    {
      title: "Calculate duty for many lines",
      description: [
        "Use this when the user has several products or invoice lines (HTS code, origin, value) and wants the US import duty for each and in total, such as a commercial invoice or a product list.",
        "Returns duty and fees per line and totals. For one product, or to work through a line's open questions, use calculate_import_duty.",
      ].join(" "),
      inputSchema: fromJsonSchema<BatchArgs>({
        type: "object",
        properties: {
          lines: {
            type: "array",
            minItems: 1,
            maxItems: 200,
            items: {
              type: "object",
              properties: {
                hts_code: HTS_CODE,
                country_of_origin: COUNTRY,
                customs_value_usd: { type: "number", exclusiveMinimum: 0, description: "Customs value of the line in USD." },
                quantity: QUANTITY,
              },
              required: ["hts_code", "country_of_origin", "customs_value_usd"],
              additionalProperties: false,
            },
          },
          transport_mode: MODE,
          entry_date: ENTRY_DATE,
        },
        required: ["lines"],
        additionalProperties: false,
      }),
      annotations: { title: "Calculate duty for many lines", ...READ_ONLY },
    },
    handler<BatchArgs>("calculate_duty_batch", request, async (args) => {
      const lines = await Promise.all(
        args.lines.map(async (l, i) => {
          try {
            const calc = await calculateDuty({
              htsCode: l.hts_code,
              country: l.country_of_origin,
              customsValue: l.customs_value_usd,
              quantity: l.quantity,
              transportMode: args.transport_mode,
              entryDate: args.entry_date,
            });
            const r = calc.result;
            return {
              line: i + 1,
              hts_code: calc.line.element.htsno,
              country_of_origin: calc.country.code,
              customs_value_usd: calc.customsValue,
              duty_usd: Math.round(r.totalDuty * 100) / 100,
              fees_usd: Math.round(r.totalFees * 100) / 100,
              effective_duty_rate_pct: Math.round((r.totalDuty / calc.customsValue) * 100000) / 1000,
              duty_layers: r.lines.filter((x) => x.status === "applies" && x.amount > 0).map((x) => x.code),
              open_questions: r.questions.filter((q) => !q.answered).length,
              error: null as string | null,
            };
          } catch (error) {
            if (!(error instanceof DutyInputError)) throw error;
            return { line: i + 1, hts_code: l.hts_code, country_of_origin: l.country_of_origin, error: error.message };
          }
        })
      );
      const done = lines.filter((l): l is Extract<typeof l, { duty_usd: number }> => l.error === null);
      const sum = (pick: (l: (typeof done)[number]) => number) => Math.round(done.reduce((s, l) => s + pick(l), 0) * 100) / 100;
      const payload = {
        kind: "batch" as const,
        entry_date: args.entry_date ?? todayIso(),
        lines,
        totals: {
          lines_calculated: done.length,
          lines_with_errors: lines.length - done.length,
          customs_value_usd: sum((l) => l.customs_value_usd),
          duty_usd: sum((l) => l.duty_usd),
          fees_usd: sum((l) => l.fees_usd),
        },
        note: "Fees (MPF) are per line here; on one entry, MPF is charged once with a minimum and cap. Lines with open questions may change once answered (use calculate_import_duty).",
        disclaimer: DISCLAIMER,
      };
      const text = `${done.length} lines: duty $${payload.totals.duty_usd.toLocaleString("en-US")} on $${payload.totals.customs_value_usd.toLocaleString("en-US")}${
        lines.length > done.length ? `; ${lines.length - done.length} lines had errors` : ""
      }.`;
      return ok(payload, text);
    })
  );
};
