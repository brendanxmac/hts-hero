import type { CountryRow, HubSummary } from "@/libs/country-pages/allCountries";
import { formatImports, IMPORT_SOURCE } from "@/libs/country-pages/importStats";

// The words of the "US tariffs by country" hub, built from its rows so they never contradict
// the table. Every list is complete: answer engines quote these whole.

const joinList = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const tariffPhrase = (t: CountryRow["otherTariffs"][number]) =>
  `${t.name} (${lowerFirst(t.rates)} on ${t.allProducts ? "all products" : "listed products"})`;

// "China (Section 301 – China, 7.5% to 100% on listed products)"
const specificPhrase = (r: CountryRow) => `${r.name}: ${joinList(r.otherTariffs.map(tariffPhrase))}`;

// The forced-labor rates in force, "10% or 12.5%"
const forcedLaborRates = (s: HubSummary) => {
  const pcts = Array.from(
    new Set(s.forcedLabor.byRate.flatMap((g) => Array.from(g.rates.matchAll(/(\d+(?:\.\d+)?)%/g), (m) => Number(m[1]))))
  ).sort((a, b) => a - b);
  return pcts.length <= 1 ? pcts.map((p) => `${p}%`).join("") : `${pcts.slice(0, -1).map((p) => `${p}%`).join(", ")} or ${pcts.at(-1)}%`;
};

export const hubLead = (s: HubSummary, asOfLabel: string) =>
  [
    `As of ${asOfLabel}, ${s.forcedLabor.count} of the ${s.total} countries of origin pay a Section 301 forced-labor tariff on US imports, at ${forcedLaborRates(s)} (for countries with a US trade deal, up to that rate including the base rate).`,
    s.countrySpecific.length
      ? `${joinList(s.countrySpecific.map((r) => r.name))} also pay tariffs written for them alone.`
      : "",
    s.column2.length ? `${joinList(s.column2)} pay the higher Column 2 base rates.` : "",
    `${s.withPreferences} countries can claim a US trade agreement or preference program, and Section 232 tariffs on metals, autos, wood and other products apply to every country.`,
  ]
    .filter(Boolean)
    .join(" ");

export const hubDescription = (s: HubSummary, month: string) =>
  `US tariffs for all ${s.total} countries of origin: Section 301 forced-labor rates, country tariffs, Column 2 and trade agreements, with 2025 import values. Updated ${month}.`;

export const hubFaqs = (rows: CountryRow[], s: HubSummary, asOfLabel: string, verifiedThrough: string) => {
  const byImports = rows.filter((r) => r.imports2025).sort((a, b) => (b.imports2025 ?? 0) - (a.imports2025 ?? 0));
  const top = byImports.slice(0, 5).map((r) => `${r.name} (${formatImports(r.imports2025!)})`);
  return [
    {
      question: "Which countries have the highest US tariffs in 2026?",
      answer: [
        s.countrySpecific.length
          ? `Goods from ${joinList(s.countrySpecific.map((r) => r.name))} pay tariffs written for those countries on top of everything else: ${s.countrySpecific.map(specificPhrase).join("; ")}.`
          : "",
        s.column2.length
          ? `${joinList(s.column2)} pay Column 2 base rates, which are far higher than the normal rates for most products.`
          : "",
        `Beyond those, the forced-labor tariff (${forcedLaborRates(s)}) is the main difference between countries. What a product pays also depends on its HTS code, Section 232 and any trade agreement claimed.`,
      ]
        .filter(Boolean)
        .join(" "),
    },
    {
      question: "Which countries pay the Section 301 forced-labor tariff?",
      answer: `${s.forcedLabor.count} countries, since July 24, 2026. ${s.forcedLabor.byRate
        .map((g) => `${g.rates}: ${joinList(g.names)}.`)
        .join(" ")} Countries with a US trade deal pay up to the rate shown, including the base rate.`,
    },
    {
      question: "Which countries have a trade agreement or preference program with the US?",
      answer: `${s.withPreferences} countries can claim one, if their goods meet its rules of origin. ${s.byPreference
        .map((p) => `${p.name}: ${joinList(p.names)}.`)
        .join(" ")}`,
    },
    {
      question: "Which countries have no additional US tariffs?",
      answer: `${s.none.length} countries' goods pay only their HTS base rate plus the Section 232 tariffs every country pays, with no forced-labor or other country tariff: ${joinList(s.none)}.`,
    },
    {
      question: "Which countries does the US import the most from?",
      answer: `In 2025 the largest sources of US goods imports were ${joinList(top)}. The table shows the 2025 value and rank for every country, from the ${IMPORT_SOURCE.name}.`,
    },
    {
      question: "How is this table built?",
      answer: `From HTS Hero's tariff engine, the same data as the duty calculator, with tariff rules verified through ${verifiedThrough}, for goods entered ${asOfLabel}. Import values come from the ${IMPORT_SOURCE.name}. The rates are what a country's goods face before an HTS code is known; enter a code in the calculator for the exact duty.`,
    },
  ];
};
