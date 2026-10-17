import { CalculationResult, DutyLine } from "@/tariffs/engine-v2/types";
import { BASE_SLICE, sliceForProgram } from "../results/slices";
import { countryNames, tariffOn } from "./explain";
import { formatDate, formatMoney, formatPct } from "./format";
import { TariffFinder } from "./useTariffFinder";

// The duty breakdown at a glance (DutySummary), worked out from the engine's result and the
// tariff rules alone (no model): the answer as a rate, each charge with a few words on why, what's
// switched on (a claimed program, an exemption at work, a yes answered), what could lower it
// (always "could": the importer may not qualify), and how the rate has moved.

const pct = (n: number) => formatPct(Math.round(n * 100) / 100);

type SummaryInput = Pick<
  TariffFinder,
  "history" | "customsValue" | "answers" | "impacts" | "preferenceChanges" | "unadjustedResult"
>;

export interface GlanceCharge {
  code: string;
  name: string;
  // The slice it's drawn in (base duty, or its program), for its color
  slice: string;
  pct: number;
  usd: number;
  // Why it applies, in a few words
  why: string;
}

// Something switched on: a claimed trade program, an exemption at work, a yes answered
export interface GlanceOn {
  title: string;
  detail: string;
  // The user's own doing (a claimed program, a confirmed exemption, a yes answered), not an
  // exemption that applies on its own
  byYou: boolean;
  // What it does to the rate, in percent of the value (negative lowers it), when that's known
  pct?: number;
}

// A way the duty could be lower, if the goods qualify
export interface GlanceSaving {
  title: string;
  how: string;
  // Off the rate, in percent of the value, and in dollars on this shipment (both positive)
  pct: number;
  usd: number;
}

export interface Glance {
  ratePct: number;
  duty: number;
  fees: number;
  value: number;
  charges: GlanceCharge[];
  on: GlanceOn[];
  savings: GlanceSaving[];
  // The rate on the first verified date, when it's moved since
  history: { fromDate: string; fromPct: number } | null;
  // Tariffs checked that don't apply, and how many of those wait on an answer
  ruledOut: number;
  waiting: number;
}

const COLUMN_WHY: Record<CalculationResult["column"], string> = {
  general: "The normal rate for this HTS code",
  special: "The trade program rate for this HTS code",
  column2: "The higher rate for countries without normal trade relations",
};

// Why a charge applies, in a few words: what brought it in, or who and what it covers
const shortWhy = (line: DutyLine, result: CalculationResult, nameOf: (code: string) => string) => {
  const trigger = line.reasons.map((r) => r.match(/^Applies because (\S+) applies$/)?.[1]).find(Boolean);
  if (trigger) return `Comes with ${nameOf(trigger)}`;
  const t = tariffOn(line.code, result.asOf);
  if (!t) return "Applies to this import";
  const answered = (t.requires ?? []).some((c) => (c as { input?: string }).input);
  if (answered) return "Applies because of your answer";
  const from = t.scope.countries === "all" ? "every country" : countryNames(t.scope.countries);
  return t.scope.codes === "all" ? `Every product from ${from}` : `Listed products from ${from}`;
};

export const glance = (f: SummaryInput, result: CalculationResult): Glance => {
  const value = f.customsValue > 0 ? f.customsValue : 1;
  const ofValue = (usd: number) => (usd / value) * 100;
  const nameOf = (code: string) => result.lines.find((l) => l.code === code)?.name ?? tariffOn(code, result.asOf)?.name ?? code;
  const applied = result.lines.filter((l) => l.status === "applies");
  const charged = applied.filter((l) => l.amount > 0.005);
  const free = applied.filter((l) => l.amount <= 0.005);
  const switchedOffBy = (code: string) => result.lines.filter((l) => l.status !== "applies" && l.reasons.includes(`Excluded by ${code}`));

  const charges: GlanceCharge[] = [
    {
      code: "BASE",
      name: "Base duty",
      slice: BASE_SLICE,
      pct: result.base.amount > 0.005 ? ofValue(result.base.amount) : 0,
      usd: result.base.amount,
      why: COLUMN_WHY[result.column],
    },
    ...charged
      .map((l) => ({ code: l.code, name: l.name, slice: sliceForProgram(l.program), pct: ofValue(l.amount), usd: l.amount, why: shortWhy(l, result, nameOf) }))
      .sort((a, b) => b.usd - a.usd),
  ];

  // Switched on
  const on: GlanceOn[] = [];
  const preference = result.claimedPreference
    ? (result.availablePreferences.find((p) => p.symbol === result.claimedPreference)?.name ?? result.claimedPreference)
    : null;
  if (preference) {
    const before = f.unadjustedResult?.base;
    on.push({
      title: `${preference} claimed`,
      byYou: true,
      pct: before ? ofValue(result.base.amount - before.amount) : undefined,
      detail:
        before && Math.abs(before.amount - result.base.amount) >= 0.005
          ? `Base duty ${pct(ofValue(before.amount))} → ${pct(ofValue(result.base.amount))}`
          : "No change to the base duty here",
    });
  }
  // The input a free heading needs answered yes, if any: such a heading is shown with its answer
  const answerFor = (code: string) =>
    (tariffOn(code, result.asOf)?.requires ?? [])
      .map((c) => String((c as { input?: string }).input ?? ""))
      .find((id) => id && !id.startsWith("confirm:") && f.answers[id] === true);
  const offsOf = (code: string) => switchedOffBy(code).map((o) => o.name);
  free
    .filter((l) => !answerFor(l.code))
    .forEach((l) => {
      const offs = offsOf(l.code);
      const confirmed = f.answers[`confirm:${l.code}`] === true;
      const effect = f.impacts[`confirm:${l.code}`];
      on.push({
        title: l.name,
        byYou: confirmed,
        pct: confirmed && effect !== undefined ? ofValue(effect) : undefined,
        detail: offs.length
          ? `${confirmed ? "You confirmed it. " : ""}Switches off ${offs.join(" and ")}`
          : confirmed
            ? "You confirmed your goods qualify"
            : "Applies, and adds no duty",
      });
    });
  Object.entries(f.answers)
    .filter(([id, v]) => v === true && !id.startsWith("confirm:"))
    .forEach(([id]) => {
      const q = result.questions.find((x) => x.input.id === id) ?? f.unadjustedResult?.questions.find((x) => x.input.id === id);
      const effect = f.impacts[id];
      // What the yes turned on, and what that switches off
      const offs = free.filter((l) => answerFor(l.code) === id).flatMap((l) => offsOf(l.code));
      const change =
        effect !== undefined && Math.abs(effect) >= 0.005
          ? `${effect < 0 ? "Lowers" : "Raises"} the rate by ${pct(Math.abs(ofValue(effect)))}`
          : "No change to the duty";
      on.push({
        title: `Yes: ${(q?.input.label ?? id).replace(/\?$/, "")}`,
        byYou: true,
        pct: effect !== undefined ? ofValue(effect) : undefined,
        detail: offs.length ? `Switches off ${offs.join(" and ")}. ${change}` : change,
      });
    });

  // Could lower it: trade programs not claimed, and answers not given yet
  const savings: GlanceSaving[] = [
    ...Object.entries(f.preferenceChanges)
      .filter(([, usd]) => usd < -0.005)
      .map(([symbol, usd]) => ({
        title: result.availablePreferences.find((p) => p.symbol === symbol)?.name ?? symbol,
        how: "Claim it, if your goods meet its rules of origin",
        pct: ofValue(-usd),
        usd: -usd,
      })),
    ...Object.entries(f.impacts)
      .filter(([id, usd]) => usd < -0.005 && f.answers[id] !== true)
      .map(([id, usd]) => {
        const q = result.questions.find((x) => x.input.id === id);
        return id.startsWith("confirm:")
          ? { title: nameOf(id.slice("confirm:".length)), how: "If your goods qualify", pct: ofValue(-usd), usd: -usd }
          : { title: (q?.input.label ?? id).replace(/\?$/, ""), how: "If the answer is yes", pct: ofValue(-usd), usd: -usd };
      }),
  ].sort((a, b) => b.usd - a.usd);

  // How it's moved
  const today = new Date().toISOString().slice(0, 10);
  const past = f.history.filter((x) => x.from <= today);
  const first = past[0];
  const moved = first && past.length > 1 && Math.abs(first.result.totalDuty - result.totalDuty) >= 0.005;

  const ruled = result.lines.filter((l) => l.status !== "applies");
  return {
    ratePct: ofValue(result.totalDuty),
    duty: result.totalDuty,
    fees: result.totalFees,
    value: f.customsValue,
    charges,
    on,
    savings,
    history: moved ? { fromDate: first.from, fromPct: ofValue(first.result.totalDuty) } : null,
    ruledOut: ruled.length,
    waiting: ruled.filter((l) => l.status === "needsAnswer").length,
  };
};

// The free account's pitch to a signed-out visitor (AccountCta): a headline with the most money at
// stake, and what the account explains about this import. Only names and amounts already shown
// on the page, never the answers (why, what was ruled out, how). Savings are only ever "could".
export const accountPitch = (
  f: Pick<TariffFinder, "openQuestions" | "history">,
  result: CalculationResult,
  bestSaving: number,
): { headline: string; thisImport: string[] } => {
  const thisImport: string[] = [];
  const top = result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .sort((a, b) => b.amount - a.amount)[0];
  if (top) thisImport.push(`Why ${top.name} applies to your goods, and adds ${formatMoney(top.amount)}`);
  const ruledOut = result.lines.filter((l) => l.status !== "applies").length;
  if (ruledOut) thisImport.push(`Why ${ruledOut === 1 ? "1 other tariff doesn't" : `${ruledOut} other tariffs don't`} apply, so you know nothing was missed`);
  const today = new Date().toISOString().slice(0, 10);
  const past = f.history.filter((s) => s.from <= today);
  if (past.length > 1) thisImport.push(`A plain-English summary of this duty, and how it's moved since ${formatDate(past[0].from)}`);
  else thisImport.push("A plain-English summary of this duty");

  const headline =
    bestSaving < -0.005
      ? `This duty could be up to ${formatMoney(Math.abs(bestSaving))} lower. See what it would take.`
      : top
        ? `${top.name} is ${formatMoney(top.amount)} of this duty. Know why before you pay it.`
        : "See exactly why this is what you owe.";
  return { headline, thisImport };
};
