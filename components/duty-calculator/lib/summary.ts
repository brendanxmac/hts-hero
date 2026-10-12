import { CalculationResult } from "@/tariffs/engine-v2/types";
import { whyApplies } from "./explain";
import { formatDate, formatMoney, formatPct } from "./format";
import { TariffFinder } from "./useTariffFinder";

// The duty breakdown after its first sentence, in plain English (DutySummary): what it's made of,
// why the biggest tariff applies, what was claimed and ruled out, what could lower it, and how
// it's moved

const pct = (n: number) => formatPct(Math.round(n * 100) / 100);

export const summarySentences = (
  f: Pick<TariffFinder, "openQuestions" | "history">,
  result: CalculationResult,
  bestSaving: number,
): string[] => {
  const out: string[] = [];
  const parts = [
    {
      name: `the base rate of ${pct(result.base.ratePct ?? result.baseRateEquivalentPct)}`,
      amount: result.base.amount,
    },
    ...result.lines
      .filter((l) => l.status === "applies" && l.amount > 0)
      .map((l) => ({
        name: `${l.name} at ${pct(l.ratePct ?? 0)}`,
        amount: l.amount,
      })),
  ]
    .filter((p) => p.amount > 0.005)
    .sort((a, b) => b.amount - a.amount);
  if (parts.length === 1) out.push(`All of it is ${parts[0].name}.`);
  else if (parts.length > 1)
    out.push(
      `It's made up of ${parts
        .map((p) => `${p.name} (${formatMoney(p.amount)})`)
        .join(parts.length === 2 ? " and " : ", ")
        .replace(/, ([^,]*)$/, ", and $1")}.`,
    );
  else
    out.push(
      "No duty applies: every tariff checked is either free or switched off for this import.",
    );

  const top = result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .sort((a, b) => b.amount - a.amount)[0];
  if (top) {
    const why = whyApplies(top, result, result.questions)[0];
    if (why) out.push(`${why}.`);
  }
  if (result.claimedPreference) {
    const name =
      result.availablePreferences.find(
        (p) => p.symbol === result.claimedPreference,
      )?.name ?? result.claimedPreference;
    out.push(`You've claimed ${name}, so the base duty uses its rate.`);
  }
  const ruledOut = result.lines.filter((l) => l.status !== "applies").length;
  if (ruledOut)
    out.push(
      `${ruledOut} other ${ruledOut === 1 ? "tariff was" : "tariffs were"} checked and ${ruledOut === 1 ? "doesn't" : "don't"} apply.`,
    );
  if (bestSaving < -0.005)
    out.push(
      `If your goods qualify, a trade program or exemption could lower the duty by up to ${formatMoney(Math.abs(bestSaving))}.`,
    );
  else if (f.openQuestions > 0)
    out.push(
      `${f.openQuestions} possible ${f.openQuestions === 1 ? "adjustment" : "adjustments"} could still change it.`,
    );

  const today = new Date().toISOString().slice(0, 10);
  const past = f.history.filter((s) => s.from <= today);
  const first = past[0];
  const last = past[past.length - 1];
  if (first && last && first !== last && first.result.totalDuty > 0.005) {
    const change =
      (last.result.totalDuty - first.result.totalDuty) / first.result.totalDuty;
    if (Math.abs(change) >= 0.005)
      out.push(
        `It's ${Math.round(Math.abs(change) * 100)}% ${change < 0 ? "lower" : "higher"} than on ${formatDate(first.from)}.`,
      );
    else out.push(`It hasn't changed since ${formatDate(first.from)}.`);
  }
  return out;
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
  if (bestSaving < -0.005)
    thisImport.push(`Which adjustment could take up to ${formatMoney(Math.abs(bestSaving))} off, and what it would change`);
  else if (f.openQuestions > 0)
    thisImport.push(`What each of ${f.openQuestions} possible ${f.openQuestions === 1 ? "adjustment" : "adjustments"} would change`);
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
