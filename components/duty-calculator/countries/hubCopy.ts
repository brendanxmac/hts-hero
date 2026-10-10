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

// Short, dated facts for the top of the page: each one a sentence an answer engine can lift whole
export const hubKeyFacts = (rows: CountryRow[], s: HubSummary) => {
  const byImports = rows.filter((r) => r.imports2025).sort((a, b) => (b.imports2025 ?? 0) - (a.imports2025 ?? 0));
  const largest = byImports.slice(0, 3).map((r) => `${r.name} (${formatImports(r.imports2025!)})`);
  const programs = s.byPreference.filter((p) => p.names.length > 1).map((p) => `${p.name} (${p.names.length})`);
  return [
    `Section 301 forced-labor tariff: ${s.forcedLabor.count} countries since July 24, 2026 (${s.forcedLabor.byRate
      .map((g) => `${lowerFirst(g.rates)}: ${g.names.length}`)
      .join("; ")}).`,
    s.countrySpecific.length ? `Tariffs written for one country: ${s.countrySpecific.map(specificPhrase).join("; ")}.` : "",
    s.column2.length ? `Column 2 base rates: ${joinList(s.column2)}.` : "",
    `Trade agreements and preference programs: ${s.withPreferences} countries${programs.length ? `, including ${joinList(programs)}` : ""}.`,
    `No added tariff: ${s.none.length} countries pay only their HTS base rate and Section 232.`,
    "The IEEPA tariffs, including the reciprocal tariffs, ended when the Supreme Court ruled them unlawful on February 20, 2026; the Section 122 tariff that followed has expired.",
    `Largest sources of US imports in 2025: ${joinList(largest)}.`,
  ].filter(Boolean);
};

export interface HubGroup {
  id: string;
  title: string;
  note: string;
  names: string[];
  // Shown after a country's name: its agreement, in the group of single-country agreements
  details?: Record<string, string>;
}

// The page's groups, each a heading and the complete list of countries in it. Programs with a
// single country share one group, so the page isn't a run of one-name headings.
export const hubGroups = (s: HubSummary): HubGroup[] => [
  ...s.forcedLabor.byRate.map((g) => ({
    id: `forced-labor-${g.rates.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`,
    title: g.rates.startsWith("Up to")
      ? `Countries with a Section 301 forced-labor tariff of ${lowerFirst(g.rates)}`
      : `Countries with a ${g.rates} Section 301 forced-labor tariff`,
    note: g.rates.startsWith("Up to")
      ? "These countries have a US trade deal: the forced-labor tariff tops their duty up to this rate, including the base rate."
      : "Charged on top of the base rate, on all products, since July 24, 2026.",
    names: g.names,
  })),
  ...(s.countrySpecific.length
    ? [{ id: "country-tariffs", title: "Countries with tariffs of their own", note: s.countrySpecific.map(specificPhrase).join("; ") + ".", names: s.countrySpecific.map((r) => r.name) }]
    : []),
  ...(s.column2.length
    ? [{ id: "column-2", title: "Countries that pay Column 2 rates", note: "No normal trade relations with the US: their goods pay the HTS Column 2 base rates.", names: s.column2 }]
    : []),
  ...s.byPreference
    .filter((p) => p.names.length > 1)
    .map((p) => ({
      id: `program-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: `${p.name} countries`,
      note: "Goods that meet the program's rules of origin can claim its preferential rates.",
      names: p.names,
    })),
  ...singleAgreements(s),
  { id: "no-added-tariff", title: "Countries with no added US tariff", note: "Their goods pay only the HTS base rate and the Section 232 tariffs every country pays.", names: s.none },
];

// Agreements with one country each (US-Korea FTA, US-Peru TPA…) as one group
function singleAgreements(s: HubSummary): HubGroup[] {
  const single = s.byPreference.filter((p) => p.names.length === 1);
  if (!single.length) return [];
  const details: Record<string, string> = {};
  single.forEach((p) => (details[p.names[0]] = details[p.names[0]] ? `${details[p.names[0]]}, ${p.name}` : p.name));
  return [
    {
      id: "other-agreements",
      title: "Other US trade agreements",
      note: "Bilateral free trade and trade promotion agreements. Goods that meet an agreement's rules of origin can claim its rates.",
      names: Object.keys(details).sort(),
      details,
    },
  ];
}
