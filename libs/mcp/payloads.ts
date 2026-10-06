import { AllRules } from "../../tariffs/engine-v2/data";
import { DutyLine } from "../../tariffs/engine-v2/types";
import { htsProductName } from "../hts-duty-summary";
import { OriginRate, RateBasis, rateOf } from "../../components/tariff-tracker/product/analysis/analysis";
import { DutyCalculation, impactsOf, sortedQuestions } from "./duty";
import { analysisUrl, fullBreakdownUrl, htsPageUrl, LinkContext } from "./links";

// The structured results MCP tools return: plain JSON with snake_case keys, rounded for reading.
// `kind` tells the widget which view to draw.

export const DISCLAIMER =
  "Estimate from HTS Hero's tariff engine, not legal or customs advice. Confirm with a licensed customs broker before filing.";

const round = (n: number, places = 2) => Math.round(n * 10 ** places) / 10 ** places;

export const programName = (id?: string) => AllRules.programs.find((p) => p.id === id)?.name;


// The product as people say it: "T-shirts, singlets, tank tops and similar garments, of cotton"
export const productDescription = (calc: Pick<DutyCalculation, "line">) =>
  htsProductName(calc.line.element, calc.line.parents);

const layer = (line: DutyLine) => ({
  code: line.code,
  name: line.name,
  program: programName(line.program) ?? null,
  status: line.status,
  rate_pct: line.ratePct ?? null,
  basis_usd: round(line.basisValue),
  amount_usd: round(line.amount),
  reasons: line.reasons,
  source: line.source ?? null,
});

export const dutyPayload = (calc: DutyCalculation, ctx: LinkContext) => {
  const { result, customsValue } = calc;
  const impacts = impactsOf(calc);
  const total = result.totalDuty + result.totalFees;
  const preferenceName = (symbol: string) =>
    result.availablePreferences.find((p) => p.symbol === symbol)?.name ?? symbol;

  return {
    kind: "duty" as const,
    product: {
      hts_code: calc.line.element.htsno,
      description: productDescription(calc),
      country_of_origin: { code: calc.country.code, name: calc.country.name },
      entry_date: calc.asOf,
      customs_value_usd: customsValue,
      quantity: calc.quantity,
      transport_mode: calc.transportMode,
      trade_program_claimed: result.claimedPreference ?? null,
    },
    totals: {
      duty_usd: round(result.totalDuty),
      fees_usd: round(result.totalFees),
      duty_and_fees_usd: round(total),
      effective_duty_rate_pct: round((result.totalDuty / customsValue) * 100, 3),
      landed_cost_usd: round(customsValue + total),
    },
    base: {
      column: result.column,
      rate: result.base.reasons[0] ?? "Free",
      amount_usd: round(result.base.amount),
      requires_quantity: result.requiresQuantity,
    },
    // Chapter 99 duties the engine considered; ones that can't apply to this entry are left out
    layers: result.lines.filter((l) => l.status !== "notApplicable").map(layer),
    fees: result.fees.map((f) => ({ name: f.name, rate_pct: f.ratePct, amount_usd: round(f.amount), note: f.note ?? null })),
    available_trade_programs: Array.from(new Set(result.availablePreferences.map((p) => p.symbol))).map((symbol) => ({
      symbol,
      name: preferenceName(symbol),
      claimed: symbol === result.claimedPreference,
      change_if_claimed_usd: symbol === result.claimedPreference ? 0 : round(impacts.preferences[symbol] ?? 0),
    })),
    // Facts the engine needs from the importer. Ask the user the open ones whose impact isn't 0,
    // then call again with `answers`.
    questions: sortedQuestions(calc).map((q) => ({
      id: q.input.id,
      question: q.input.label,
      help: q.input.help ?? null,
      type: q.input.type,
      unit: q.input.unit ?? null,
      affects: q.headings,
      answered: q.answered,
      answer: calc.answers[q.input.id] ?? null,
      change_if_yes_usd: q.input.type === "boolean" ? round(impacts.questions[q.input.id] ?? 0) : null,
    })),
    warnings: calc.warnings,
    as_of: calc.asOf,
    rates_revision: calc.line.ratesRevision,
    rules_revision: calc.rulesRevision,
    verified: calc.verified,
    disclaimer: DISCLAIMER,
    links: {
      full_breakdown_url: fullBreakdownUrl(calc, ctx),
      analysis_url: analysisUrl(calc, ctx),
      hts_page_url: htsPageUrl(calc.line.element.htsno, ctx),
    },
  };
};

export type DutyPayload = ReturnType<typeof dutyPayload>;

// A short reading of a duty result, for clients that only pass text to the model
export const dutySummary = (p: DutyPayload) => {
  const applied = p.layers.filter((l) => l.status === "applies" && l.amount_usd > 0);
  const open = p.questions.filter((q) => !q.answered && (q.change_if_yes_usd ?? 1) !== 0);
  return [
    `HTS ${p.product.hts_code} (${p.product.description}) from ${p.product.country_of_origin.name}, entered ${p.as_of}, customs value $${p.product.customs_value_usd.toLocaleString("en-US")}:`,
    `Total duty $${p.totals.duty_usd.toLocaleString("en-US")} (${p.totals.effective_duty_rate_pct}% of value) + fees $${p.totals.fees_usd.toLocaleString("en-US")}.`,
    `Base rate ${p.base.rate} = $${p.base.amount_usd.toLocaleString("en-US")}.`,
    ...applied.map((l) => `${l.code} ${l.program ?? l.name}: ${l.rate_pct ?? "?"}% = $${l.amount_usd.toLocaleString("en-US")}.`),
    open.length ? `Open questions that could change the duty: ${open.map((q) => `${q.id} (${q.question})`).join("; ")}.` : "",
    ...p.warnings.map((w) => `Warning: ${w}`),
  ]
    .filter(Boolean)
    .join("\n");
};

// ── Comparison ──

// `effective_duty_rate_pct` is the rate the ranking uses: standard, or with the origin's best
// trade program claimed
export const originRow = (o: OriginRate, customsValue: number, rank: number, basis: RateBasis) => ({
  rank,
  country: { code: o.country.code, name: o.country.name, flag: o.country.flag },
  effective_duty_rate_pct: round(rateOf(o, basis), 3),
  duty_usd: round((rateOf(o, basis) / 100) * customsValue),
  standard_rate_pct: round(o.pct, 3),
  best_trade_program: o.agreement
    ? { symbol: o.agreement.symbol, name: o.agreement.name, effective_duty_rate_pct: round(o.agreement.pct, 3) }
    : null,
  is_requested_origin: o.isOrigin,
});

export type OriginRow = ReturnType<typeof originRow>;
