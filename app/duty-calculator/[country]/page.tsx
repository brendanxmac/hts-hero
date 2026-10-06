import { Metadata } from "next";
import { notFound } from "next/navigation";
import config from "@/config";
import { CountryCalculatorPage, countryFaqs, metaDescription, titleName } from "@/components/duty-calculator/country";
import { THEME } from "@/components/ui/theme";
import { COUNTRY_PAGES, countryPageBySlug } from "@/libs/country-pages/countries";
import { countryExamples, countryPreferences, countryTariffs } from "@/libs/country-pages/countryTariffs";
import { getHtsElementsServer } from "@/libs/hts-server";
import { renderSchemaJsonLd } from "@/libs/seo";
import { getLatestVerifiedRevision } from "@/tariffs/engine-v2/revisions";

interface Props {
  params: { country: string };
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
// "2026HTSRev20" → "2026 HTS Revision 20"
const revisionTitle = (name: string) => name.replace(/^(\d{4})HTSRev(\d+)$/, "$1 HTS Revision $2");

export function generateMetadata({ params }: Props): Metadata {
  const country = countryPageBySlug(params.country);
  if (!country) return {};
  const name = titleName(country);
  const title = `${name} to US Tariff Calculator (2026): Import Duty & Tariffs`;
  const description = metaDescription(country, countryTariffs(country.code, todayIso()), monthYear(todayIso()));
  const url = `https://${config.domainName}/duty-calculator/${country.slug}`;
  return {
    title: `${title} | HTS Hero`,
    description,
    alternates: { canonical: `/duty-calculator/${country.slug}` },
    openGraph: { title, description, url, siteName: "HTS Hero", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CountryCalculatorRoute({ params }: Props) {
  const country = countryPageBySlug(params.country);
  if (!country) notFound();

  const asOf = todayIso();
  const tariffs = countryTariffs(country.code, asOf);
  const examples = countryExamples(country.code, asOf, await getHtsElementsServer());
  const preferences = countryPreferences(country.code, asOf);
  const faqs = countryFaqs({ country, tariffs, examples, preferences, asOfLabel: longDate(asOf) });
  const name = titleName(country);
  const url = `https://${config.domainName}/duty-calculator/${country.slug}`;

  return (
    <main className={`${THEME} w-full flex-1 shrink-0 flex flex-col`}>
      {renderSchemaJsonLd({
        "@type": "WebApplication",
        name: `${name} to US Tariff Calculator`,
        url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "All",
        dateModified: asOf,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: { "@type": "Organization", name: "HTS Hero", url: `https://${config.domainName}` },
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
        verifiedThrough={revisionTitle(getLatestVerifiedRevision().name)}
        asOfLabel={longDate(asOf)}
      />
    </main>
  );
}
