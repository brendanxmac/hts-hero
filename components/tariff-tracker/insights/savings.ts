import { Country } from "../../../constants/countries";
import type { UsImports } from "../../duty-calculator/lib/usImportsData";
import { calculate } from "../../../tariffs/engine-v2/calculate";
import { AllRules } from "../../../tariffs/engine-v2/data";
import { CalculationResult } from "../../../tariffs/engine-v2/types";
import { OriginRate, originRates } from "../product/analysis/analysis";
import { TrackedProduct } from "../report";

// Ways to pay less duty on one catalog product, each worth a dollar amount on the product's own
// shipment (its value and quantity):
// - program: a trade program its origin can claim and it doesn't yet
// - exemption: a condition that, if it's true of the product, lowers the duty
// - origin: the cheapest other country of origin that already makes it for the US (Census), with
//   any trade agreement it can claim; with no Census figures for the code, the cheapest of all,
//   flagged as unverified (see Supply)
// The first two need no change of supplier; the last one does.

export type SavingKind = "program" | "exemption" | "origin";

// Whether a country is a realistic place to make a product, from Census (US imports by country):
// - proven: the US imported this product from there last year
// - unproven: Census has figures for the code, but none from there
// - unknown: Census has no figures for the code, so manufacturing capacity is unverified
export type Supply = "proven" | "unproven" | "unknown";

export const supplyOf = (imports: UsImports | null, countryCode: string): Supply =>
  !imports ? "unknown" : (imports.byCountry.get(countryCode)?.value ?? 0) > 0 ? "proven" : "unproven";

export const SUPPLY_NOTES: Record<Supply, string> = {
  proven: "Already makes it for the US",
  unproven: "No US imports from there on record · manufacturing capacity unverified",
  unknown: "No Census figures for this code · manufacturing capacity unverified",
};

// Why it's unverified, in a few words, beside a short "Capacity unverified" chip
export const SUPPLY_REASONS: Record<Exclude<Supply, "proven">, string> = {
  unproven: "No US imports from there on record",
  unknown: "No Census figures for this code",
};

// The Chapter 99 headings an exemption turns on, with what each one is
export interface ExemptionHeading {
  code: string;
  name: string;
}

export const exemptionHeadings = (result: CalculationResult, headings: string[]): ExemptionHeading[] =>
  headings.map((code) => ({ code, name: result.lines.find((l) => l.code === code)?.name ?? "" }));

export interface Saving {
  kind: SavingKind;
  productKey: string;
  // What it is, as a product's saving options name it (opportunities/options.ts): the SPI symbol,
  // the question id, or the country code with any agreement ("MX:S"), so a tracked opportunity's
  // status can be matched to it
  ref: string;
  // Less duty on one shipment, in dollars and in points of the rate
  usd: number;
  pts: number;
  title: string;
  detail: string;
  // origin: the country, and the agreement it would claim
  country?: Country;
  // origin: how sure it is that the country can make it
  supply?: Supply;
  // exemption: the Chapter 99 headings it turns on
  headings?: ExemptionHeading[];
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
      ? [{ kind: "program", productKey: key, ref: p.symbol, usd, pts, title: `Claim ${p.name}`, detail: `Available for goods from ${entry.country.name}` }]
      : [];
  });
};

const exemptionSavings = (product: TrackedProduct): Saving[] =>
  Object.entries(product.impacts).flatMap(([id, delta]): Saving[] => {
    const question = product.result.questions.find((q) => q.input.id === id);
    const pts = (-delta / product.customsValue) * 100;
    if (!question || question.answered || pts < MIN_PTS) return [];
    const headings = exemptionHeadings(product.result, question.headings);
    return [
      {
        kind: "exemption",
        productKey: product.key,
        ref: id,
        usd: -delta,
        pts,
        title: headings.length ? `Exemption under ${headings.map((h) => h.code).join(", ")}` : "An exemption may apply",
        detail: question.input.label,
        headings,
      },
    ];
  });

// The cheapest other origin: among the countries that already make it for the US when Census has
// figures for the code (the most imported from first on a tie), else among all of them, flagged
// as unverified. Countries Census has nothing from are never counted when it has figures.
const originSaving = (product: TrackedProduct, rates: OriginRate[], imports: UsImports | null): Saving[] => {
  const candidates = rates
    .filter((o) => !o.isOrigin && (!imports || supplyOf(imports, o.country.code) === "proven"))
    .map((o) => ({ o, pct: o.agreement ? Math.min(o.pct, o.agreement.pct) : o.pct }));
  if (!candidates.length) return [];
  const lowest = Math.min(...candidates.map((c) => c.pct));
  const tied = candidates.filter((c) => c.pct - lowest < 0.005);
  const shipped = (code: string) => imports?.byCountry.get(code)?.value ?? 0;
  const best = tied.sort((a, b) => shipped(b.o.country.code) - shipped(a.o.country.code) || a.o.country.name.localeCompare(b.o.country.name))[0];
  const pts = product.totalPct - best.pct;
  if (pts < MIN_PTS) return [];
  const viaAgreement = best.o.agreement && best.o.agreement.pct <= best.o.pct;
  const others = tied.length - 1;
  const supply = supplyOf(imports, best.o.country.code);
  return [
    {
      kind: "origin",
      productKey: product.key,
      ref: best.o.agreement && best.o.agreement.pct < best.o.pct ? `${best.o.country.code}:${best.o.agreement.symbol}` : best.o.country.code,
      usd: (pts / 100) * product.customsValue,
      pts,
      title: `Source it from ${best.o.country.name}`,
      detail: [
        viaAgreement ? `With ${best.o.agreement!.name}` : "Lowest duty of every origin",
        others > 0 ? `${others} other ${others === 1 ? "origin pays" : "origins pay"} the same` : "",
        SUPPLY_NOTES[supply],
      ]
        .filter(Boolean)
        .join(" · "),
      country: best.o.country,
      supply,
    },
  ];
};

// Every saving on a product, biggest first, with the code's US imports by country (Census; null
// when it has none). About 200 calculations for the origins.
export const productSavings = (product: TrackedProduct, imports: UsImports | null, rates: OriginRate[] = originRates(product)): Saving[] =>
  [...programSavings(product), ...exemptionSavings(product), ...originSaving(product, rates, imports)].sort((a, b) => b.usd - a.usd);

// Each other origin's duty on a product, kept small for the Sourcing tab (the full results are
// let go once the savings are worked out): the lower of its standard rate and its best agreement
export interface OriginCost {
  country: Country;
  pct: number;
  // The trade agreement the rate needs, when it needs one
  agreement?: string;
}

export const originCosts = (rates: OriginRate[]): OriginCost[] =>
  rates
    .filter((o) => !o.isOrigin)
    .map((o) =>
      o.agreement && o.agreement.pct < o.pct ? { country: o.country, pct: o.agreement.pct, agreement: o.agreement.name } : { country: o.country, pct: o.pct }
    );

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
