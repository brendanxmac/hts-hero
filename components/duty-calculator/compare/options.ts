import { preferenceName } from "@/libs/hts-duty-summary";
import { calculate } from "@/tariffs/engine-v2/calculate";
import { AllRules } from "@/tariffs/engine-v2/data";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { OriginRate, RateBasis } from "@/components/tariff-tracker/product/analysis/analysis";
import { OriginHistory, RateSegment } from "@/components/tariff-tracker/product/analysis/history";
import { RatePart, TrackedProduct } from "@/components/tariff-tracker/report";

// What Compare compares: options, not only countries. Every country is an option at its standard
// rate, and a country that can claim a trade agreement that lowers it has a second option: the
// same country with the agreement applied ("Mexico with USMCA"). Compare's control bar picks which
// to show: without trade programs, with them (each country at its agreement rate when it has
// one), or both, side by side.

export interface CompareOption {
  // The country's code, or its code and the agreement's symbol ("MX:S")
  key: string;
  origin: OriginRate;
  // The agreement claimed, for an agreement option
  agreement?: { symbol: string; name: string };
  pct: number;
  parts: RatePart[];
}

export const optionsOf = (origin: OriginRate): CompareOption[] => [
  { key: origin.country.code, origin, pct: origin.pct, parts: origin.parts },
  ...(origin.agreement
    ? [
        {
          key: `${origin.country.code}:${origin.agreement.symbol}`,
          origin,
          agreement: { symbol: origin.agreement.symbol, name: origin.agreement.name },
          pct: origin.agreement.pct,
          parts: origin.agreement.parts,
        },
      ]
    : []),
];

export type ProgramMode = "without" | "with" | "both";

// A country's options under the control bar's choice
export const optionsFor = (origin: OriginRate, mode: ProgramMode): CompareOption[] => {
  const [standard, agreement] = optionsOf(origin);
  if (mode === "without") return [standard];
  if (mode === "with") return [agreement ?? standard];
  return agreement ? [standard, agreement] : [standard];
};

// The rates a chart of countries (one mark each) draws: with the agreements only when asked for
export const basisFor = (mode: ProgramMode): RateBasis => (mode === "with" ? "agreements" : "standard");

// "Mexico", or "Mexico with USMCA" (the agreement's short name, as the calculator writes it)
export const shortAgreement = preferenceName;
export const optionLabel = (o: CompareOption) => (o.agreement ? `${o.origin.country.name} with ${shortAgreement(o.agreement.name)}` : o.origin.country.name);

// The option's rate history: the agreement's, for an agreement option
export const segmentsFor = (o: CompareOption, h: OriginHistory | undefined): RateSegment[] => (h ? (o.agreement && h.agreement ? h.agreement : h.standard) : []);

// The option's full calculation (every line and fee) on a date (today when left out), for the
// side-by-side
export const optionResult = (product: TrackedProduct, o: CompareOption, asOf?: string): CalculationResult =>
  calculate(AllRules, {
    ...product.input,
    ...(asOf ? { asOf } : {}),
    country: o.origin.country.code,
    claimedPreference: o.agreement?.symbol,
    answers: product.adjustments.answers ?? {},
  });
