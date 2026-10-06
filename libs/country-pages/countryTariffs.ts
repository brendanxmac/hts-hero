import { calculate } from "@/tariffs/engine-v2/calculate";
import { AllRules } from "@/tariffs/engine-v2/data";
import { countryMatches, getRulesAsOf } from "@/tariffs/engine-v2/snapshot";
import type { Tariff } from "@/tariffs/engine-v2/types";
import type { HtsElement } from "@/interfaces/hts";
import { findRateElement, preferenceName } from "@/libs/hts-duty-summary";
import { getHtsElementByCode, getHtsElementParentsServer } from "@/libs/hts-server";

// What a country page says about the tariffs on its goods, worked out from the engine's rules
// for today, so the page matches the calculator on every build.

export interface ProgramSummary {
  id: string;
  name: string;
  // "25%", "7.5% to 100%", "Up to 15% including the base rate"
  rates: string;
  // Every product of the country, or only listed products
  allProducts: boolean;
  headings: string[];
}

const AUTHORITY_ORDER = ["301", "232", "338", "201", "122", "deal", "other"];

// Headings that apply only once the importer confirms a fact (a lower rate for U.S.-melted
// metal, an onshoring plan) are reliefs, not the rate a country's goods pay
const isConditionalRelief = (t: Tariff) =>
  (t.requires ?? []).some((c) => c.kind === "answer" || c.kind === "dateBefore" || c.kind === "inputCompare");

const charges = (t: Tariff) =>
  (t.rate.kind === "adValorem" && Number(t.rate.pct) > 0) || t.rate.kind === "topUpTo";

const formatPct = (n: number) => `${Number(n.toFixed(2))}%`;

const describeRates = (tariffs: Tariff[]) => {
  const flat = tariffs.filter((t) => t.rate.kind === "adValorem").map((t) => Number(t.rate.pct));
  const caps = tariffs.filter((t) => t.rate.kind === "topUpTo").map((t) => Number(t.rate.pct));
  const parts: string[] = [];
  if (flat.length > 0) {
    const lo = Math.min(...flat);
    const hi = Math.max(...flat);
    parts.push(lo === hi ? formatPct(lo) : `${formatPct(lo)} to ${formatPct(hi)}`);
  }
  if (caps.length > 0) {
    const hi = Math.max(...caps);
    parts.push(`up to ${formatPct(hi)} including the base rate`);
  }
  const text = parts.join(", or ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const summarize = (tariffs: Tariff[], programName: (id: string) => string) => {
  const byProgram = new Map<string, Tariff[]>();
  tariffs.forEach((t) => byProgram.set(t.program, [...(byProgram.get(t.program) ?? []), t]));
  return Array.from(byProgram, ([id, group]) => ({
    id,
    name: programName(id),
    rates: describeRates(group),
    allProducts: group.some((t) => t.scope.codes === "all"),
    headings: Array.from(new Set(group.map((t) => t.code))).sort(),
  }));
};

export interface CountryTariffs {
  // Programs aimed at this country by name (Section 301 China, forced labor, Brazil, Canada 338)
  programs: ProgramSummary[];
  // The country's own Section 232 headings (deal and reduced rates), each with what it covers
  dealRates: { code: string; name: string; rate: string }[];
}

// The Chapter 99 tariffs written for this country on `asOf`. Section 232 applies to every
// country, and which of its headings wins for a product is worked out per entry, so only the
// country's own deal headings are summarized here; the examples show real totals.
export const countryTariffs = (code: string, asOf: string): CountryTariffs => {
  const snapshot = getRulesAsOf(AllRules, asOf);
  const authority = (t: Tariff) => snapshot.programs.get(t.program)?.authority ?? "other";
  const programName = (id: string) => snapshot.programs.get(id)?.name ?? id;
  const named = snapshot.tariffs.filter(
    (t) =>
      charges(t) &&
      t.scope.countries !== "all" &&
      countryMatches(t.scope.countries, code, snapshot) &&
      !countryMatches(t.scope.excludeCountries, code, snapshot)
  );
  const byAuthority = (a: { id: string }, b: { id: string }) =>
    AUTHORITY_ORDER.indexOf(snapshot.programs.get(a.id)?.authority ?? "other") -
    AUTHORITY_ORDER.indexOf(snapshot.programs.get(b.id)?.authority ?? "other");
  return {
    programs: summarize(
      named.filter((t) => authority(t) !== "232" && !isConditionalRelief(t)),
      programName
    ).sort(byAuthority),
    dealRates: named
      .filter((t) => authority(t) === "232")
      .map((t) => ({
        code: t.code,
        name: t.name,
        rate:
          t.rate.kind === "topUpTo"
            ? `${formatPct(Number(t.rate.pct))} including the base rate`
            : `+${formatPct(Number(t.rate.pct))}`,
      }))
      .sort((a, b) => a.code.localeCompare(b.code)),
  };
};

// Trade agreements and preference programs the country's goods can claim, by short name
export const countryPreferences = (code: string, asOf: string): string[] => {
  const snapshot = getRulesAsOf(AllRules, asOf);
  return Array.from(
    new Set(
      snapshot.preferences
        .filter((p) => p.countries !== "all" && countryMatches(p.countries, code, snapshot))
        .map((p) => preferenceName(p.name))
    )
  );
};

// Everyday products the examples are worked out for, by statistical HTS number
export const EXAMPLE_PRODUCTS = [
  { code: "6109.10.00.12", label: "Men's cotton T-shirts" },
  { code: "8471.30.01.00", label: "Laptops" },
  { code: "8517.13.00.00", label: "Smartphones" },
  { code: "7326.90.86.88", label: "Steel hardware" },
  { code: "9401.61.40.11", label: "Upholstered wooden chairs" },
  { code: "9503.00.00.90", label: "Toys" },
];

const CUSTOMS_VALUE = 10000;

export interface ExampleDuty {
  label: string;
  htsno: string;
  totalPct: number | null;
  totalDuty: number;
  // The Chapter 99 headings charged, by name
  tariffs: { code: string; name: string; ratePct?: number }[];
}

// The duty on $10,000 of each example product from this country on `asOf`, without claiming a
// trade preference or answering any question. Products missing from the current HTS are skipped.
export const countryExamples = (code: string, asOf: string, elements: HtsElement[]): ExampleDuty[] =>
  EXAMPLE_PRODUCTS.flatMap((product) => {
    const element = getHtsElementByCode(product.code, elements);
    if (!element) return [];
    const rateElement = findRateElement(element, getHtsElementParentsServer(element, elements));
    if (!rateElement.general && !rateElement.other) return [];
    const result = calculate(AllRules, {
      htsCode: element.htsno,
      country: code,
      asOf,
      customsValue: CUSTOMS_VALUE,
      quantity: 100,
      baseRates: { general: rateElement.general, special: rateElement.special, other: rateElement.other },
      transportMode: "ocean",
    });
    return [
      {
        label: product.label,
        htsno: element.htsno,
        totalPct: result.requiresQuantity ? null : Number(((result.totalDuty / CUSTOMS_VALUE) * 100).toFixed(2)),
        totalDuty: result.totalDuty,
        tariffs: result.lines
          .filter((l) => l.status === "applies" && l.amount > 0)
          .map((l) => ({ code: l.code, name: l.name, ratePct: l.ratePct })),
      },
    ];
  });
