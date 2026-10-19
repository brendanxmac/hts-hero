import { Metadata } from "next";
import { notFound } from "next/navigation";
import config from "@/config";
import { CountryCalculatorPage, countryFaqs, metaDescription, titleName } from "@/components/duty-calculator/country";
import * as mk from "@/components/ui/marketing/styles";
import { COUNTRY_PAGES, countryPageByCode, countryPageBySlug } from "@/libs/country-pages/countries";
import { IMPORT_SOURCE, importFacts } from "@/libs/country-pages/importStats";
import { countryTopImports } from "@/libs/country-pages/topImports";
import { countryExamples, countryPreferences, countryTariffs } from "@/libs/country-pages/countryTariffs";
import { getHtsElementsServer } from "@/libs/hts-server";
import { renderSchemaJsonLd } from "@/libs/seo";

interface Props {
  params: Promise<{ country: string }>;
}

// Rebuilt daily, so the tables and examples follow the tariff data without a deploy
export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRY_PAGES.map((c) => ({ country: c.slug }));
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const monthYear = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const country = countryPageBySlug(params.country);
  if (!country) return {};
  const name = titleName(country);
  const title = `${name} to US Tariff Calculator (2026): Import Duty & Tariffs`;
  const description = metaDescription(country, countryTariffs(country.code, todayIso()), monthYear(todayIso()));
  const url = `https://${config.domainName}/duty-calculator/${country.slug}`;
  return {
    // The brand goes on when it fits; long country names need the room for the keyword
    title: `${title} | HTS Hero`.length <= 70 ? `${title} | HTS Hero` : title,
    description,
    alternates: { canonical: `/duty-calculator/${country.slug}` },
    openGraph: { title, description, url, siteName: "HTS Hero", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CountryCalculatorRoute(props: Props) {
  const params = await props.params;
  const country = countryPageBySlug(params.country);
  if (!country) notFound();

  const asOf = todayIso();
  const tariffs = countryTariffs(country.code, asOf);
  const elements = await getHtsElementsServer();
  const examples = countryExamples(country.code, asOf, elements);
  const preferences = countryPreferences(country.code, asOf);
  const facts = importFacts(country.code);
  // Everyone asks how a country compares with China; China's page compares with Vietnam, the
  // largest alternative it has lost share to
  const other = countryPageByCode(country.code === "CN" ? "VN" : "CN");
  const comparison = other ? { name: titleName(other), examples: countryExamples(other.code, asOf, elements) } : null;
  const faqs = countryFaqs({ country, tariffs, examples, preferences, asOfLabel: longDate(asOf), facts, comparison });
  const name = titleName(country);
  const url = `https://${config.domainName}/duty-calculator/${country.slug}`;

  return (
    <main className={`${mk.page} flex w-full flex-1 flex-col`}>
      {renderSchemaJsonLd({
        "@type": "WebApplication",
        name: `${name} to US Tariff Calculator`,
        url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "All",
        dateModified: asOf,
        description: metaDescription(country, tariffs, monthYear(asOf)),
        about: { "@type": "Country", name: titleName(country) },
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: { "@type": "Organization", name: "HTS Hero", url: `https://${config.domainName}` },
        ...(facts ? { citation: { "@type": "CreativeWork", name: IMPORT_SOURCE.name, url: IMPORT_SOURCE.url } } : {}),
      })}
      {renderSchemaJsonLd({
        "@type": "FAQPage",
        mainEntity: faqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Duty Calculator", item: `https://${config.domainName}/duty-calculator` },
          { name, item: url },
        ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
      })}
      <CountryCalculatorPage
        country={country}
        tariffs={tariffs}
        examples={examples}
        faqs={faqs}
        asOfLabel={longDate(asOf)}
        facts={facts}
        comparison={comparison}
        topImports={countryTopImports(country.code, elements)}
      />
    </main>
  );
}
