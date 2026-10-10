import { Metadata } from "next";
import config from "@/config";
import { CountriesHub, HubRow, hubDescription, hubFaqs, hubLead } from "@/components/duty-calculator/countries";
import { THEME } from "@/components/ui/theme";
import { countryRows, hubSummary } from "@/libs/country-pages/allCountries";
import { formatImports, IMPORT_SOURCE } from "@/libs/country-pages/importStats";
import { renderSchemaJsonLd } from "@/libs/seo";
import { getLatestVerifiedRevision } from "@/tariffs/engine-v2/revisions";

// /duty-calculator/countries: US tariffs for every country of origin. Rebuilt daily, so the
// table follows the tariff data without a deploy.
export const revalidate = 86400;

const PATH = "/duty-calculator/countries";
const URL_ = `https://${config.domainName}${PATH}`;
const TITLE = "US Tariffs by Country (2026): Rates for Every Country of Origin";

const todayIso = () => new Date().toISOString().slice(0, 10);
const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const monthYear = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
// "2026HTSRev20" → "2026 HTS Revision 20"
const revisionTitle = (name: string) => name.replace(/^(\d{4})HTSRev(\d+)$/, "$1 HTS Revision $2");

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export function generateMetadata(): Metadata {
  const asOf = todayIso();
  const description = hubDescription(hubSummary(countryRows(asOf)), monthYear(asOf));
  return {
    title: TITLE,
    description,
    alternates: { canonical: PATH },
    openGraph: { title: TITLE, description, url: URL_, siteName: "HTS Hero", type: "website" },
    twitter: { card: "summary", title: TITLE, description },
  };
}

export default function CountriesHubRoute() {
  const asOf = todayIso();
  const asOfLabel = longDate(asOf);
  const verifiedThrough = revisionTitle(getLatestVerifiedRevision().name);
  const all = countryRows(asOf);
  const summary = hubSummary(all);
  const faqs = hubFaqs(all, summary, asOfLabel, verifiedThrough);
  const rows: HubRow[] = all.map((r) => ({
    code: r.code,
    name: r.name,
    flag: r.flag,
    slug: r.slug,
    imports: r.imports2025,
    importsLabel: r.imports2025 ? formatImports(r.imports2025) : null,
    rank: r.rank2025,
    forcedLabor: r.forcedLabor,
    forcedLaborPct: r.forcedLaborPct,
    otherTariffs: r.otherTariffs.map((t) => `${t.name}: ${lowerFirst(t.rates)} on ${t.allProducts ? "all products" : "listed products"}`),
    dealRates: r.dealRates,
    preferences: r.preferences,
    column2: r.column2,
  }));

  return (
    <main className={`${THEME} w-full flex-1 shrink-0 flex flex-col`}>
      {renderSchemaJsonLd({
        "@type": "Dataset",
        name: "US tariffs by country of origin",
        description: hubLead(summary, asOfLabel),
        url: URL_,
        dateModified: asOf,
        temporalCoverage: asOf,
        spatialCoverage: { "@type": "Place", name: "United States" },
        creator: { "@type": "Organization", name: "HTS Hero", url: `https://${config.domainName}` },
        isBasedOn: [
          { "@type": "CreativeWork", name: "Harmonized Tariff Schedule of the United States", url: "https://hts.usitc.gov" },
          { "@type": "CreativeWork", name: IMPORT_SOURCE.name, url: IMPORT_SOURCE.url },
        ],
        variableMeasured: [
          "US goods imports in 2025 (USD)",
          "Section 301 forced-labor tariff rate",
          "Country-specific tariffs",
          "Column 2 status",
          "Trade agreements and preference programs",
        ],
        isAccessibleForFree: true,
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
          { name: "Tariffs by country", item: URL_ },
        ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
      })}
      <CountriesHub
        rows={rows}
        summary={summary}
        lead={hubLead(summary, asOfLabel)}
        faqs={faqs}
        verifiedThrough={verifiedThrough}
        asOfLabel={asOfLabel}
      />
    </main>
  );
}
