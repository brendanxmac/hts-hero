import { Country } from "../../../constants/countries";
import { calculate } from "../../../tariffs/engine-v2/calculate";
import { AllRules } from "../../../tariffs/engine-v2/data";
import { SUMMARY_COUNTRY_CODES } from "../../../libs/hts-duty-summary";
import { originRates } from "../product/analysis/analysis";
import { TrackedProduct } from "../report";

// Ways to pay less duty on one catalog product, each worth a dollar amount on the product's own
// shipment (its value and quantity):
// - program: a trade program its origin can claim and it doesn't yet
// - exemption: a condition that, if it's true of the product, lowers the duty
// - origin: the cheapest other country of origin, with any trade agreement it can claim
// The first two need no change of supplier; the last one does.

export type SavingKind = "program" | "exemption" | "origin";

export interface Saving {
  kind: SavingKind;
  productKey: string;
  // Less duty on one shipment, in dollars and in points of the rate
  usd: number;
  pts: number;
  title: string;
  detail: string;
  // origin: the country, and the agreement it would claim
  country?: Country;
}

// Below this it isn't worth showing
const MIN_PTS = 0.01;

const programSavings = (product: TrackedProduct): Saving[] => {
  const { result, input, adjustments, customsValue, entry, key } = product;
  if (result.claimedPreference) return [];
  return result.availablePreferences.flatMap((p): Saving[] => {
    const claimed = calculate(AllRules, { ...input, answers: adjustments.answers ?? {}, claimedPreference: p.symbol });
    const usd = result.totalDuty - claimed.totalDuty;
    const pts = (usd / customsValue) * 100;
    return pts >= MIN_PTS
      ? [{ kind: "program", productKey: key, usd, pts, title: `Claim ${p.name}`, detail: `Available for goods from ${entry.country.name}` }]
      : [];
  });
};

const exemptionSavings = (product: TrackedProduct): Saving[] =>
  Object.entries(product.impacts).flatMap(([id, delta]): Saving[] => {
    const question = product.result.questions.find((q) => q.input.id === id);
    const pts = (-delta / product.customsValue) * 100;
    if (!question || question.answered || pts < MIN_PTS) return [];
    return [
      {
        kind: "exemption",
        productKey: product.key,
        usd: -delta,
        pts,
        title: "An exemption may apply",
        detail: question.input.label,
      },
    ];
  });

// Many origins often tie on the lowest rate; the one shown is a major source of US imports
// where there is one, so the suggestion is a realistic place to make the product
const sourceRank = (code: string) => {
  const i = SUMMARY_COUNTRY_CODES.indexOf(code);
  return i < 0 ? Infinity : i;
};

const originSaving = (product: TrackedProduct): Saving[] => {
  const candidates = originRates(product)
    .filter((o) => !o.isOrigin)
    .map((o) => ({ o, pct: o.agreement ? Math.min(o.pct, o.agreement.pct) : o.pct }));
  if (!candidates.length) return [];
  const lowest = Math.min(...candidates.map((c) => c.pct));
  const tied = candidates.filter((c) => c.pct - lowest < 0.005);
  const best = tied.sort((a, b) => sourceRank(a.o.country.code) - sourceRank(b.o.country.code) || a.o.country.name.localeCompare(b.o.country.name))[0];
  const pts = product.totalPct - best.pct;
  if (pts < MIN_PTS) return [];
  const viaAgreement = best.o.agreement && best.o.agreement.pct <= best.o.pct;
  const others = tied.length - 1;
  return [
    {
      kind: "origin",
      productKey: product.key,
      usd: (pts / 100) * product.customsValue,
      pts,
      title: `Source from ${best.o.country.name}`,
      detail: [
        viaAgreement ? `With ${best.o.agreement!.name}` : "Lowest duty of every origin",
        others > 0 ? `${others} other ${others === 1 ? "origin pays" : "origins pay"} the same` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      country: best.o.country,
    },
  ];
};

// Every saving on a product, biggest first. About 200 calculations for the origins.
export const productSavings = (product: TrackedProduct): Saving[] =>
  [...programSavings(product), ...exemptionSavings(product), ...originSaving(product)].sort((a, b) => b.usd - a.usd);

// Exemptions turn on facts about the goods (a donation, informational materials…) that usually
// aren't true, so they're listed as worth checking but never counted in a dollar total
export const COUNTED: SavingKind[] = ["program", "origin"];

// The best counted saving on a product that keeps its supplier (a trade program), the best
// counted one overall, and whether it has an exemption worth checking
export const bestSavings = (savings: Saving[]) => ({
  keepSupplier: savings.filter((s) => s.kind === "program").sort((a, b) => b.usd - a.usd)[0],
  any: savings.filter((s) => COUNTED.includes(s.kind)).sort((a, b) => b.usd - a.usd)[0],
  exemption: savings.some((s) => s.kind === "exemption"),
});
