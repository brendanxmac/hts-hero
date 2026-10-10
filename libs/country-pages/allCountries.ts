import { Countries } from "@/constants/countries";
import { AllRules } from "@/tariffs/engine-v2/data";
import { getRulesAsOf } from "@/tariffs/engine-v2/snapshot";
import { countryPageByCode } from "./countries";
import { countryPreferences, countryTariffs } from "./countryTariffs";
import { importFacts } from "./importStats";

// Every country of origin the calculator covers, with what its goods pay on `asOf`: the data
// behind the "US tariffs by country" hub. Built from the engine's rules and the Census import
// figures, the same sources as the country pages.

export interface CountryRow {
  code: string;
  name: string;
  flag: string;
  // Its own calculator page, if it has one
  slug: string | null;
  imports2025: number | null; // millions of USD
  rank2025: number | null;
  // The Section 301 forced-labor rate, as written ("12.5%", "Up to 10% including the base rate")
  forcedLabor: string | null;
  // The highest number in it, for sorting
  forcedLaborPct: number | null;
  // Other tariffs written for this country by name (Section 301 China, Section 338 Canada…)
  otherTariffs: { name: string; rates: string; allProducts: boolean }[];
  // Its own Section 232 deal headings (lower rates on autos, metals…)
  dealRates: number;
  // Trade agreements and preference programs it can claim, by short name
  preferences: string[];
  // Pays Column 2 (non-normal trade relations) base rates
  column2: boolean;
}

const FORCED_LABOR = "301-forced-labor";

const highestPct = (rates: string) => {
  const numbers = Array.from(rates.matchAll(/(\d+(?:\.\d+)?)%/g), (m) => Number(m[1]));
  return numbers.length ? Math.max(...numbers) : null;
};

export const countryRows = (asOf: string): CountryRow[] => {
  const snapshot = getRulesAsOf(AllRules, asOf);
  return Countries.filter((c) => c.code !== "US").map((c) => {
    const tariffs = countryTariffs(c.code, asOf);
    const forcedLabor = tariffs.programs.find((p) => p.id === FORCED_LABOR) ?? null;
    const facts = importFacts(c.code);
    return {
      code: c.code,
      name: c.name,
      flag: c.flag,
      slug: countryPageByCode(c.code)?.slug ?? null,
      imports2025: facts?.imports2025 ?? null,
      rank2025: facts?.rank2025 ?? null,
      forcedLabor: forcedLabor?.rates ?? null,
      forcedLaborPct: forcedLabor ? highestPct(forcedLabor.rates) : null,
      otherTariffs: tariffs.programs
        .filter((p) => p.id !== FORCED_LABOR)
        .map((p) => ({ name: p.name, rates: p.rates, allProducts: p.allProducts })),
      dealRates: tariffs.dealRates.length,
      preferences: countryPreferences(c.code, asOf),
      column2: snapshot.column2Countries.has(c.code),
    };
  });
};

// Goods pay only their base rate and the Section 232 tariffs every country pays
export const noCountryTariffs = (r: CountryRow) => !r.forcedLabor && r.otherTariffs.length === 0 && !r.column2;

export interface HubSummary {
  total: number;
  forcedLabor: { count: number; byRate: { rates: string; names: string[] }[] };
  withPreferences: number;
  // Each program and the countries that can claim it
  byPreference: { name: string; names: string[] }[];
  column2: string[];
  // Countries with tariffs of their own beyond the forced-labor tariff
  countrySpecific: CountryRow[];
  none: string[];
}

export const hubSummary = (rows: CountryRow[]): HubSummary => {
  const byRate = new Map<string, string[]>();
  rows.filter((r) => r.forcedLabor).forEach((r) => byRate.set(r.forcedLabor!, [...(byRate.get(r.forcedLabor!) ?? []), r.name]));
  const byPreference = new Map<string, string[]>();
  rows.forEach((r) => r.preferences.forEach((p) => byPreference.set(p, [...(byPreference.get(p) ?? []), r.name])));
  return {
    total: rows.length,
    forcedLabor: {
      count: rows.filter((r) => r.forcedLabor).length,
      byRate: Array.from(byRate, ([rates, names]) => ({ rates, names })).sort((a, b) => b.names.length - a.names.length),
    },
    withPreferences: rows.filter((r) => r.preferences.length > 0).length,
    byPreference: Array.from(byPreference, ([name, names]) => ({ name, names })).sort((a, b) => b.names.length - a.names.length),
    column2: rows.filter((r) => r.column2).map((r) => r.name),
    countrySpecific: rows.filter((r) => r.otherTariffs.length > 0),
    none: rows.filter(noCountryTariffs).map((r) => r.name),
  };
};

// The primary sources behind the hub's tariffs, from the engine's own citations
export const hubSources = (asOf: string) => {
  const snapshot = getRulesAsOf(AllRules, asOf);
  const forcedLabor = snapshot.tariffs.find((t) => t.program === FORCED_LABOR && t.source?.url)?.source;
  const proclamations = Array.from(
    new Set(
      snapshot.tariffs
        .filter((t) => t.program === "338-canada")
        .flatMap((t) => Array.from((t.source?.citation ?? "").matchAll(/\b(1\d{4})\b/g), (m) => m[1]))
    )
  ).sort();
  return [
    { name: "Harmonized Tariff Schedule of the United States (USITC)", url: "https://hts.usitc.gov" },
    ...(forcedLabor?.citation ? [{ name: forcedLabor.citation, url: forcedLabor.url ?? null }] : []),
    ...(proclamations.length
      ? [{ name: `Section 338 tariffs on Canada: Presidential Proclamations ${proclamations.join(", ")}`, url: null }]
      : []),
  ] as { name: string; url: string | null }[];
};

// Each country in exactly one tier, by the most it faces: tariffs of its own or Column 2, then
// its forced-labor rate, then nothing added. For the breakdown bar.
export const hubTiers = (rows: CountryRow[]) => {
  const tiers = new Map<string, number>();
  const tierOf = (r: CountryRow) => {
    if (r.otherTariffs.length > 0 || r.column2) return "Own tariffs or Column 2 Rates";
    if (r.forcedLabor) return `Forced labor ${r.forcedLabor.replace(/ including the base rate$/, "").replace(/^Up to/, "up to")}`;
    return "No added tariff";
  };
  rows.forEach((r) => tiers.set(tierOf(r), (tiers.get(tierOf(r)) ?? 0) + 1));
  const order = (label: string) =>
    label.startsWith("Own") ? 0 : label === "No added tariff" ? 99 : 10 - (Number(label.match(/(\d+(?:\.\d+)?)%/)?.[1] ?? 0) / 10) + (label.includes("up to") ? 0.05 : 0);
  return Array.from(tiers, ([label, count]) => ({ label, count })).sort((a, b) => order(a.label) - order(b.label));
};
