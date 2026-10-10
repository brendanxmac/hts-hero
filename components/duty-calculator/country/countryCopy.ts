import type { CountryPage } from "@/libs/country-pages/countries";
import { capitalized } from "@/libs/country-pages/countries";
import type { CountryTariffs, ExampleDuty } from "@/libs/country-pages/countryTariffs";
import { formatImports, ImportFacts, IMPORT_SOURCE, largestOrdinal } from "@/libs/country-pages/importStats";

// The words of a country page, built from its tariff data so they never contradict the tables

// "United Kingdom" for titles, "the United Kingdom" mid-sentence
export const titleName = (country: CountryPage) => capitalized(country.name.replace(/^the /, ""));

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// "Section 301 – China (7.5% to 100% on listed products)"
const programPhrase = (p: CountryTariffs["programs"][number]) =>
  `${p.name} (${lowerFirst(p.rates)} on ${p.allProducts ? "all products" : "listed products"})`;

const joinList = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

// The one-sentence answer at the top of the page and in its first FAQ
export const tariffSummary = (country: CountryPage, tariffs: CountryTariffs) => {
  const named = tariffs.programs.map(programPhrase);
  const s232 =
    tariffs.dealRates.length > 0
      ? "Section 232 tariffs on metals, autos, trucks, wood, pharmaceuticals and drones, with its own lower rates on some of them"
      : "Section 232 tariffs on metals, autos, trucks, wood, pharmaceuticals and drones";
  const parts = named.length > 0 ? `${joinList(named)}, plus ${s232}` : s232;
  return `Goods from ${country.name} pay their HTS base rate plus ${parts}.`;
};

// How much the US buys from the country: a fact answer engines can quote with its source
export const importSentence = (country: CountryPage, facts: ImportFacts) => {
  const year = `The US imported ${formatImports(facts.imports2025)} of goods from ${country.name} in 2025, making it the ${largestOrdinal(facts.rank2025)} source of US imports (${facts.sharePct}% of the total).`;
  if (!facts.ytd) return year;
  const change =
    facts.ytd.changePct === null
      ? ""
      : `, ${facts.ytd.changePct >= 0 ? "up" : "down"} ${Math.abs(facts.ytd.changePct)}% on the same months of 2025`;
  const span = facts.ytd.months === 1 ? facts.ytd.through : `January to ${facts.ytd.through}`;
  return `${year} Imports from ${span} were ${formatImports(facts.ytd.imports)}${change}.`;
};

// Goods from the page's country against the same goods from another (China, or Vietnam on the
// China page): how many of the example products cost less, the same or more
export interface ExampleComparison {
  name: string;
  examples: ExampleDuty[];
}

export const compareExamples = (examples: ExampleDuty[], other: ExampleComparison) => {
  const pairs = examples.flatMap((e) => {
    const o = other.examples.find((x) => x.htsno === e.htsno);
    return o && e.totalPct !== null && o.totalPct !== null ? [{ label: e.label, here: e.totalPct, there: o.totalPct }] : [];
  });
  return {
    pairs,
    lower: pairs.filter((p) => p.here < p.there - 0.005).length,
    same: pairs.filter((p) => Math.abs(p.here - p.there) <= 0.005).length,
    higher: pairs.filter((p) => p.here > p.there + 0.005).length,
  };
};

// A short version for the meta description
export const metaDescription = (country: CountryPage, tariffs: CountryTariffs, month: string) => {
  const named = tariffs.programs.slice(0, 2).map((p) => `${p.name} ${lowerFirst(p.rates)}`);
  const lead = `US import duty on goods from ${country.name}: ${named.length ? `${named.join(", ")}, ` : ""}Section 232 and every exemption, line by line.`;
  const full = `${lead} Updated ${month}.`;
  return full.length <= 160 ? full : lead.slice(0, 159);
};

export const countryFaqs = ({
  country,
  tariffs,
  examples,
  preferences,
  asOfLabel,
  facts,
  comparison,
}: {
  country: CountryPage;
  tariffs: CountryTariffs;
  examples: ExampleDuty[];
  preferences: string[];
  asOfLabel: string;
  facts: ImportFacts | null;
  comparison: ExampleComparison | null;
}) => {
  const faqs: { question: string; answer: string }[] = [
    {
      question: `What tariffs apply to imports from ${country.name} in 2026?`,
      answer: `${tariffSummary(country, tariffs)} Exemptions, trade agreements and the product's HTS code decide which of these apply to a given import; the calculator on this page asks the questions for yours.`,
    },
  ];
  // The IEEPA tariffs are gone; what replaced them for this country, if anything
  const forcedLabor = tariffs.programs.find((p) => p.id === "301-forced-labor");
  const others = tariffs.programs.filter((p) => p.id !== "301-forced-labor").map(programPhrase);
  faqs.push({
    question: `Is there still a reciprocal tariff on goods from ${country.name}?`,
    answer: [
      "No. The IEEPA tariffs, including the reciprocal tariffs, ended when the Supreme Court ruled them unlawful on February 20, 2026, and the temporary Section 122 tariff that followed has expired.",
      forcedLabor
        ? `Since July 24, 2026, goods from ${country.name} pay a Section 301 forced-labor tariff instead: ${lowerFirst(forcedLabor.rates)} on ${forcedLabor.allProducts ? "all products" : "listed products"}.`
        : `${capitalized(country.name)} is not among the countries charged the Section 301 forced-labor tariffs that began on July 24, 2026.`,
      others.length ? `Its goods also pay ${joinList(others)}.` : "",
      "Section 232 tariffs on metals, autos, wood and other products apply to every country.",
    ]
      .filter(Boolean)
      .join(" "),
  });

  if (facts) {
    faqs.push({
      question: `How much does the US import from ${country.name}?`,
      answer: `${importSentence(country, facts)} Source: ${IMPORT_SOURCE.name}.`,
    });
  }

  if (comparison) {
    const { pairs, lower, same, higher } = compareExamples(examples, comparison);
    const sample = pairs.find((p) => Math.abs(p.here - p.there) > 0.005) ?? pairs[0];
    if (sample) {
      const counts = [
        lower ? `less on ${lower}` : "",
        same ? `the same on ${same}` : "",
        higher ? `more on ${higher}` : "",
      ].filter(Boolean);
      faqs.push({
        question: `Are US tariffs on goods from ${country.name} lower than on goods from ${comparison.name}?`,
        answer: `For the ${pairs.length} example products on this page, entered ${asOfLabel} with no trade agreement claimed, goods from ${country.name} pay ${joinList(counts)} than the same goods from ${comparison.name}. ${sample.label}, for instance, pay ${sample.here}% from ${country.name} and ${sample.there}% from ${comparison.name}. The calculator compares any product across countries.`,
      });
    }
  }

  const example = examples.find((e) => e.totalPct !== null);
  if (example) {
    const charged = example.tariffs.map((t) => `${t.code} (${t.name})`);
    faqs.push({
      question: `How much is the US tariff on ${example.label.toLowerCase()} from ${country.name}?`,
      answer: `${example.label} under HTS ${example.htsno} from ${country.name} pay ${example.totalPct}% on ${asOfLabel}: $${example.totalDuty.toLocaleString("en-US", { maximumFractionDigits: 2 })} on a $10,000 shipment${charged.length ? `, from the base rate plus ${joinList(charged)}` : ", the base rate alone"}. Exemptions or a trade agreement claim can lower it.`,
    });
  }
  faqs.push({
    question: `Do goods from ${country.name} qualify for a US trade agreement?`,
    answer:
      preferences.length > 0
        ? `Yes. Goods from ${country.name} that meet the rules of origin can claim ${joinList(preferences)}. Claim it in the calculator to see the preferential base rate and any tariffs the claim removes.`
        : `No. ${capitalized(country.name)} has no US free trade agreement or preference program on the HTS, so its goods pay the General (Column 1) base rate.`,
  });
  if (country.code === "CA") {
    faqs.push({
      question: "Are any Canadian products banned from import?",
      answer:
        "Yes. From September 29, 2026, Proclamations 11061, 11062 and 11063 ban imports of certain Canadian alcoholic beverages (some only when packaged for consumption), whey, molasses, non-alcoholic beer and motorcycles over 800 cc. The calculator flags these products.",
    });
  }
  faqs.push({
    question: `How do I calculate import duty on goods from ${country.name}?`,
    answer: `Enter the product's HTS code, its customs value and the entry date in the calculator above, with ${country.name} as the country of origin. It applies the base rate, every Chapter 99 tariff in force that day and the customs fees, and shows each line with its legal source.`,
  });
  return faqs;
};
