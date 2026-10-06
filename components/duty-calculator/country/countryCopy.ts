import type { CountryPage } from "@/libs/country-pages/countries";
import { capitalized } from "@/libs/country-pages/countries";
import type { CountryTariffs, ExampleDuty } from "@/libs/country-pages/countryTariffs";

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
}: {
  country: CountryPage;
  tariffs: CountryTariffs;
  examples: ExampleDuty[];
  preferences: string[];
  asOfLabel: string;
}) => {
  const name = titleName(country);
  const faqs: { question: string; answer: string }[] = [
    {
      question: `What tariffs apply to imports from ${name} in 2026?`,
      answer: `${tariffSummary(country, tariffs)} Exemptions, trade agreements and the product's HTS code decide which of these apply to a given import; the calculator on this page asks the questions for yours.`,
    },
  ];
  const example = examples.find((e) => e.totalPct !== null);
  if (example) {
    const charged = example.tariffs.map((t) => `${t.code} (${t.name})`);
    faqs.push({
      question: `How much is the US tariff on ${example.label.toLowerCase()} from ${name}?`,
      answer: `${example.label} under HTS ${example.htsno} from ${country.name} pay ${example.totalPct}% on ${asOfLabel}: $${example.totalDuty.toLocaleString("en-US", { maximumFractionDigits: 2 })} on a $10,000 shipment${charged.length ? `, from the base rate plus ${joinList(charged)}` : ", the base rate alone"}. Exemptions or a trade agreement claim can lower it.`,
    });
  }
  faqs.push({
    question: `Do goods from ${name} qualify for a US trade agreement?`,
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
    question: `How do I calculate import duty on goods from ${name}?`,
    answer: `Enter the product's HTS code, its customs value and the entry date in the calculator above, with ${country.name} as the country of origin. It applies the base rate, every Chapter 99 tariff in force that day and the customs fees, and shows each line with its legal source.`,
  });
  return faqs;
};
