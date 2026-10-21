import { Countries, Country } from "../../../constants/countries";
import { calculate } from "../../../tariffs/engine-v2/calculate";
import { AllRules } from "../../../tariffs/engine-v2/data";
import { Answers, CalculationResult } from "../../../tariffs/engine-v2/types";
import type { UsImports } from "../../duty-calculator/lib/usImportsData";
import { COUNTED, ExemptionHeading, exemptionHeadings, OriginCost, SavingKind, Supply, supplyOf } from "../insights/savings";
import { originRates } from "../product/analysis/analysis";
import { TrackedProduct } from "../report";

// Every way to pay less duty on one catalog product, each as a full setup (origin, trade program,
// answers) with its own calculation, so it can be compared side by side with what the product
// pays today and applied to the catalog once it's secured. The catalog-wide Savings tab sums up
// the best of these (insights/savings.ts); a product's Savings tab lays them all out.

export interface Setup {
  country: Country;
  claimedPreference?: string;
  answers: Answers;
}

export interface SavingOption {
  // `${kind}:${ref}`: stable across visits, so a tracked opportunity finds its option again
  id: string;
  kind: SavingKind;
  // The SPI symbol, the question id, or the country code (with its agreement: "VN:S")
  ref: string;
  title: string;
  detail: string;
  setup: Setup;
  result: CalculationResult;
  // Less duty on one shipment, in dollars and in points of the rate, and the rate with it
  usd: number;
  pts: number;
  ratePct: number;
  // Counted in totals (exemptions aren't: they turn on facts that are rarely true; nor are origins
  // with no US imports on record)
  counted: boolean;
  // origin: the trade agreement it would claim there; how sure it is the country can make it
  // (Census); and the US's imports of the product from there last year, in USD
  agreement?: string;
  supply?: Supply;
  importsValue?: number;
  // exemption: the Chapter 99 headings it turns on
  headings?: ExemptionHeading[];
}

// Below this it isn't a saving
const MIN_PTS = 0.01;
// Countries of origin offered as options: the cheapest few that already make it for the US, then
// a couple that are cheaper still but unproven (Census has none of it from them)
const PROVEN_OPTIONS = 5;
const UNPROVEN_OPTIONS = 2;

export const optionId = (kind: SavingKind, ref: string) => `${kind}:${ref}`;

// What the product pays today, as a setup
export const currentSetup = (product: TrackedProduct): Setup => ({
  country: product.entry.country,
  claimedPreference: product.adjustments.claimedPreference,
  answers: product.adjustments.answers ?? {},
});

const priced = (
  product: TrackedProduct,
  base: Omit<SavingOption, "result" | "usd" | "pts" | "ratePct" | "counted" | "id">
): SavingOption | null => {
  const result = calculate(AllRules, {
    ...product.input,
    country: base.setup.country.code,
    claimedPreference: base.setup.claimedPreference,
    answers: base.setup.answers,
  });
  const usd = product.result.totalDuty - result.totalDuty;
  const pts = (usd / product.customsValue) * 100;
  if (pts < MIN_PTS) return null;
  return {
    ...base,
    id: optionId(base.kind, base.ref),
    result,
    usd,
    pts,
    ratePct: (result.totalDuty / product.customsValue) * 100,
    // Unproven origins are shown, but no total counts on them
    counted: COUNTED.includes(base.kind) && base.supply !== "unproven",
  };
};

// Trade programs the product's own origin can claim and it doesn't yet
const programOptions = (product: TrackedProduct): SavingOption[] => {
  const now = currentSetup(product);
  return product.result.availablePreferences
    .filter((p) => p.symbol !== product.result.claimedPreference)
    .flatMap((p) => {
      const option = priced(product, {
        kind: "program",
        ref: p.symbol,
        title: `Claim ${p.name}`,
        detail: `A trade program for goods from ${product.entry.country.name}. Keeps your supplier.`,
        setup: { ...now, claimedPreference: p.symbol },
      });
      return option ? [option] : [];
    });
};

// Conditions that, if they're true of the goods, lower the duty (yes/no questions only)
const exemptionOptions = (product: TrackedProduct): SavingOption[] => {
  const now = currentSetup(product);
  return product.result.questions
    .filter((q) => !q.answered && q.input.type === "boolean" && (product.impacts[q.input.id] ?? 0) < 0)
    .flatMap((q) => {
      const headings = exemptionHeadings(product.result, q.headings);
      const option = priced(product, {
        kind: "exemption",
        ref: q.input.id,
        title: headings.length ? `Exemption under ${headings.map((h) => h.code).join(", ")}` : "An exemption may apply",
        detail: q.input.label,
        setup: { ...now, answers: { ...now.answers, [q.input.id]: true } },
        headings,
      });
      return option ? [option] : [];
    });
};

// Other countries of origin, priced in full with the trade agreement each would claim. Census
// first, as the sanity check: the cheapest countries the US already imports this product from,
// then a couple of cheaper ones it doesn't (flagged unverified). With no Census figures for the
// code, the cheapest of all, every one flagged unverified. Costs are the catalog's worked-out
// origin rates (Insights), to pick from without working out all ~200 again.
const originOptions = (product: TrackedProduct, costs: OriginCost[] | undefined, imports: UsImports | null): SavingOption[] => {
  const all = costs ?? originRates(product).filter((r) => !r.isOrigin).map((r) => ({ country: r.country, pct: r.agreement ? Math.min(r.pct, r.agreement.pct) : r.pct }));
  const shipped = (code: string) => imports?.byCountry.get(code)?.value ?? 0;
  const cheaper = all.filter((c) => c.pct < product.totalPct - MIN_PTS).sort((a, b) => a.pct - b.pct || shipped(b.country.code) - shipped(a.country.code));
  const picks = imports
    ? [
        ...cheaper.filter((c) => supplyOf(imports, c.country.code) === "proven").slice(0, PROVEN_OPTIONS),
        ...cheaper.filter((c) => supplyOf(imports, c.country.code) === "unproven").slice(0, UNPROVEN_OPTIONS),
      ]
    : cheaper.slice(0, PROVEN_OPTIONS);
  const codes = picks.map((c) => c.country.code);
  const rates = originRates(product, codes);
  return codes.flatMap((code) => {
    const r = rates.find((x) => x.country.code === code);
    if (!r) return [];
    const viaAgreement = r.agreement && r.agreement.pct < r.pct ? r.agreement : undefined;
    const supply = supplyOf(imports, code);
    const option = priced(product, {
      kind: "origin",
      ref: viaAgreement ? `${code}:${viaAgreement.symbol}` : code,
      title: `Source it from ${r.country.name}`,
      detail: viaAgreement
        ? `With ${viaAgreement.name}. Needs the goods to be made there, and to meet its rules of origin.`
        : "Needs the goods to be made there (substantial transformation), not only shipped from there.",
      setup: { country: r.country, claimedPreference: viaAgreement?.symbol, answers: product.adjustments.answers ?? {} },
      agreement: viaAgreement?.name,
      supply,
      importsValue: shipped(code) || undefined,
    });
    return option ? [option] : [];
  });
};

// Every option on a product, biggest counted saving first, then exemptions
// (origins: proven suppliers before unproven ones). Imports: the code's Census figures, null when
// it has none.
const supplyRank = (o: SavingOption) => (o.supply === "unproven" ? 1 : 0);

export const productOptions = (product: TrackedProduct, costs: OriginCost[] | undefined, imports: UsImports | null): SavingOption[] =>
  [...programOptions(product), ...exemptionOptions(product), ...originOptions(product, costs, imports)].sort(
    (a, b) => Number(b.counted) - Number(a.counted) || supplyRank(a) - supplyRank(b) || b.usd - a.usd
  );

// The country an origin option's ref points to
export const originCountry = (ref: string) => Countries.find((c) => c.code === ref.split(":")[0]);
