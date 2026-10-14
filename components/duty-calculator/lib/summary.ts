import { CalculationResult } from "@/tariffs/engine-v2/types";
import { tariffOn, whyApplies } from "./explain";
import { plainReasons } from "./plainReason";
import { formatDate, formatMoney, formatPct } from "./format";
import { TariffFinder } from "./useTariffFinder";

// The duty breakdown after its first sentence, in plain English (DutySummary): what it's made of,
// why the biggest tariff applies, what was claimed and ruled out, what could lower it, and how
// it's moved

const pct = (n: number) => formatPct(Math.round(n * 100) / 100);

// The duty breakdown explained, section by section, from the engine's result and the tariff
// rules alone (no model): every charge and why it applies, every exemption at work and what it
// switches off, what the user's own adjustments did, what was checked and ruled out, and what
// could still change it
export interface SummarySection {
  title: string;
  items: string[];
}

type SummaryInput = Pick<TariffFinder, "openQuestions" | "history" | "customsValue" | "answers" | "impacts" | "unadjustedResult">;

const money = formatMoney;
const rateOf = (r: CalculationResult["base"], fallback: number) => (r.ratePct === undefined ? pct(fallback) : r.ratePct === 0 ? "Free" : pct(r.ratePct));
const COLUMN_WHY: Record<CalculationResult["column"], string> = {
  general: "the standard rate for goods from countries with normal trade relations (Column 1 General)",
  special: "the trade program rate (Column 1 Special)",
  column2: "the higher rate for countries without normal trade relations (Column 2)",
};

// What a heading that was switched off would have added, from its rule
const wouldAdd = (code: string, asOf: string, customsValue: number) => {
  const t = tariffOn(code, asOf);
  const r = t?.rate as { kind?: string; pct?: number } | undefined;
  return r?.kind === "adValorem" && r.pct ? ` which would otherwise add ${r.pct}% (about ${money((r.pct / 100) * customsValue)})` : "";
};

export const summarySections = (f: SummaryInput, result: CalculationResult, bestSaving: number): SummarySection[] => {
  const sections: SummarySection[] = [];
  const nameOf = (code: string) => result.lines.find((l) => l.code === code)?.name ?? tariffOn(code, result.asOf)?.name ?? code;
  const ref = (code: string) => `${code} (${nameOf(code)})`;
  const applied = result.lines.filter((l) => l.status === "applies");
  const charged = applied.filter((l) => l.amount > 0.005);
  const free = applied.filter((l) => l.amount <= 0.005);
  const switchedOffBy = (code: string) => result.lines.filter((l) => l.status !== "applies" && l.reasons.includes(`Excluded by ${code}`));
  const preference = result.claimedPreference
    ? result.availablePreferences.find((p) => p.symbol === result.claimedPreference)?.name ?? result.claimedPreference
    : null;

  // What you pay
  const pay: string[] = [];
  const baseRate = rateOf(result.base, result.baseRateEquivalentPct);
  pay.push(
    result.base.amount > 0.005
      ? `Base duty: ${baseRate} of ${money(result.base.basisValue)} is ${money(result.base.amount)}, ${COLUMN_WHY[result.column]}.`
      : `Base duty: ${baseRate === "Free" ? "free" : baseRate}, ${COLUMN_WHY[result.column]}.`
  );
  charged.forEach((l) => {
    const why = whyApplies(l, result, result.questions)[0];
    const basis = Math.abs(l.basisValue - f.customsValue) >= 0.005 ? ` on ${money(l.basisValue)} of the value` : "";
    pay.push(`${ref(l.code)}: ${pct(l.ratePct ?? 0)}${basis} is ${money(l.amount)}.${why ? ` ${why}.` : ""}`);
  });
  if (!charged.length && result.base.amount <= 0.005) pay.push("No duty applies: every tariff checked is free or switched off for this import.");
  sections.push({ title: "What you pay", items: pay });

  // Exemptions and free headings at work
  const exemptions: string[] = [];
  free.forEach((l) => {
    const trigger = l.reasons.map((r) => r.match(/^Applies because (\S+) applies$/)?.[1]).find(Boolean);
    const why = trigger
      ? `applies because ${ref(trigger)} applies to this import`
      : whyApplies(l, result, result.questions).some((w) => w.startsWith("You confirmed"))
        ? "applies because you confirmed your goods qualify"
        : (whyApplies(l, result, result.questions).find((w) => w.startsWith("You answered")) ?? "applies to this import").replace(/^You answered/, "applies because you answered");
    const offs = switchedOffBy(l.code);
    // Headings this one brings in (they apply only alongside it)
    const brings = applied.filter((x) => x.reasons.includes(`Applies because ${l.code} applies`));
    const effect = offs.length
      ? ` It switches off ${offs.map((o) => `${ref(o.code)},${wouldAdd(o.code, result.asOf, f.customsValue)}`).join("; and ")}.`.replace(/,\./g, ".").replace(/,;/g, ";")
      : brings.length
        ? ` It's duty-free itself, and brings in ${brings.map((x) => ref(x.code)).join(" and ")}.`
        : " It adds no duty.";
    exemptions.push(`${ref(l.code)} ${why}.${effect}`);
  });
  result.lines
    .filter((l) => l.status !== "applies")
    .forEach((l) => {
      const notStacked = l.reasons.map((r) => r.match(/^Not stacked: (.+)$/)?.[1]).find(Boolean);
      if (notStacked) exemptions.push(`${ref(l.code)} doesn't stack with another tariff here: ${notStacked}.`);
    });
  if (exemptions.length) sections.push({ title: "Exemptions at work", items: exemptions });

  // The user's own adjustments
  const adjustments: string[] = [];
  if (preference) {
    const before = f.unadjustedResult?.base;
    adjustments.push(
      before && Math.abs(before.amount - result.base.amount) >= 0.005
        ? `You claimed ${preference}: the base duty goes from ${rateOf(before, f.unadjustedResult?.baseRateEquivalentPct ?? 0)} (${money(before.amount)}) to ${baseRate} (${money(result.base.amount)}).`
        : `You claimed ${preference}. It doesn't change the base duty on this import.`
    );
  }
  Object.entries(f.answers)
    .filter(([, v]) => v === true)
    .forEach(([id]) => {
      const q = result.questions.find((x) => x.input.id === id) ?? f.unadjustedResult?.questions.find((x) => x.input.id === id);
      const label = id.startsWith("confirm:") ? `that your goods qualify for ${ref(id.slice("confirm:".length))}` : `yes to “${(q?.input.label ?? id).replace(/\?$/, "")}”`;
      const saving = f.impacts[id];
      adjustments.push(
        `You ${id.startsWith("confirm:") ? "confirmed" : "answered"} ${label}${saving !== undefined && Math.abs(saving) >= 0.005 ? `, ${saving < 0 ? "saving" : "adding"} ${money(Math.abs(saving))}` : ", with no change to the duty"}.`
      );
    });
  if (adjustments.length) sections.push({ title: "Your adjustments", items: adjustments });

  // Checked and ruled out (headings switched off by one at work are explained above)
  const explained = new Set(free.flatMap((l) => switchedOffBy(l.code).map((o) => o.code)));
  const ruled = result.lines.filter((l) => l.status !== "applies" && !explained.has(l.code) && !l.reasons.some((r) => r.startsWith("Not stacked")));
  const waiting = ruled.filter((l) => l.status === "needsAnswer");
  const other = ruled.filter((l) => l.status !== "needsAnswer");
  const plain = plainReasons(result, f.unadjustedResult?.questions);
  const out: string[] = [];
  if (waiting.length)
    out.push(
      `${waiting.length === 1 ? "1 exemption needs" : `${waiting.length} exemptions need`} an answer before ${waiting.length === 1 ? "it" : "they"} can apply (see Possible Adjustments): ${waiting.map((l) => l.name.replace(/^Section \d+ /, "")).join("; ")}.`
    );
  other.forEach((l) => out.push(`${ref(l.code)} doesn't apply: ${plain(l.reasons[0] ?? "it doesn't cover this import").replace(/^Only/, "it only").replace(/^It only/, "it only")}.`));
  if (out.length) sections.push({ title: "Checked, not applied", items: out });

  // What could change it
  const next: string[] = [];
  if (bestSaving < -0.005) next.push(`If your goods qualify, a trade program or exemption could lower the duty by up to ${money(Math.abs(bestSaving))}.`);
  else if (f.openQuestions > 0) next.push(`${f.openQuestions} possible ${f.openQuestions === 1 ? "adjustment" : "adjustments"} could still change it.`);
  const today = new Date().toISOString().slice(0, 10);
  const past = f.history.filter((x) => x.from <= today);
  const first = past[0];
  const last = past[past.length - 1];
  if (first && last && first !== last && first.result.totalDuty > 0.005) {
    const rate = (x: typeof first) => (f.customsValue > 0 ? pct((x.result.totalDuty / f.customsValue) * 100) : money(x.result.totalDuty));
    next.push(
      Math.abs(last.result.totalDuty - first.result.totalDuty) >= 0.005
        ? `The duty rate went from ${rate(first)} on ${formatDate(first.from)} to ${rate(last)} now (see Duty Over Time).`
        : `The duty hasn't changed since ${formatDate(first.from)}.`
    );
  }
  if (next.length) sections.push({ title: "What could change it", items: next });
  return sections;
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
