import { Metadata } from "next";
import config from "@/config";
import { ExclusionsPage } from "@/components/tariff-programs/ExclusionsPage";
import { codeInfoFor } from "@/libs/tariff-programs/codeLinks";
import { exclusionFaqs, exclusionsLead, exclusionsPage, EXCLUSIONS_PATH, getExclusionUpdates } from "@/libs/tariff-programs/exclusions";
import { longDate } from "@/libs/tariff-programs/heading";
import { hubBySlug, hubPath } from "@/libs/tariff-programs/hubs";
import { renderSchemaJsonLd } from "@/libs/seo";

// Rebuilt daily, like the program pages, so the list and dates follow the tariff data without a deploy
export const revalidate = 86400;

const TITLE = "Section 301 Exclusions: HTS Codes, Deadline & Extension History (2026)";
const NAME = "Section 301 China Exclusions";

const descriptionOf = (page: ReturnType<typeof exclusionsPage>) => {
  const codes = new Set(page.rows.map((r) => r.code)).size;
  const options = page.through
    ? [
        `${page.exclusionCount ? `${page.exclusionCount} ` : ""}Section 301 China exclusions apply through ${longDate(page.through)}. Every excluded HTS code (${codes}) under 9903.88.69 and 9903.88.70, the deadline and each extension.`,
        `Section 301 China exclusions apply through ${longDate(page.through)}. Every excluded HTS code under 9903.88.69 and 9903.88.70, and each extension.`,
      ]
    : [];
  return options.find((d) => d.length <= 160) ?? exclusionsLead(page).slice(0, 157).replace(/\s+\S*$/, "") + "…";
};

export async function generateMetadata(): Promise<Metadata> {
  const page = exclusionsPage();
  const description = descriptionOf(page);
  const title = `${TITLE} | HTS Hero`.length <= 75 ? `${TITLE} | HTS Hero` : TITLE;
  return {
    title,
    description,
    alternates: { canonical: EXCLUSIONS_PATH },
    openGraph: { title: TITLE, description, url: `https://${config.domainName}${EXCLUSIONS_PATH}`, siteName: "HTS Hero", type: "website" },
    twitter: { card: "summary", title: TITLE, description },
  };
}

export default async function Section301ExclusionsRoute() {
  const page = exclusionsPage();
  const lead = exclusionsLead(page);
  const faqs = exclusionFaqs(page);
  const [codeInfo, updates] = await Promise.all([
    codeInfoFor([...page.rows.map((r) => r.code), ...page.headings.map((p) => p.code), ...page.overridden.map((o) => o.code)]),
    getExclusionUpdates(),
  ]);
  const url = `https://${config.domainName}${EXCLUSIONS_PATH}`;
  const site = `https://${config.domainName}`;
  const hub = hubBySlug("section-301-china");

  return (
    <main className="flex w-full flex-1 flex-col">
      {renderSchemaJsonLd({
        "@type": "WebPage",
        name: TITLE,
        description: lead,
        url,
        dateModified: page.asOf,
        isPartOf: { "@type": "WebSite", name: "HTS Hero", url: site },
      })}
      {renderSchemaJsonLd({
        "@type": "Dataset",
        name: NAME,
        description: lead,
        url,
        dateModified: page.asOf,
        creator: { "@type": "Organization", name: "HTS Hero", url: site },
        license: `${site}/tos`,
        isAccessibleForFree: true,
        ...(page.sources.some((s) => s.url) ? { citation: page.sources.filter((s) => s.url).map((s) => s.url) } : {}),
      })}
      {renderSchemaJsonLd({
        "@type": "FAQPage",
        mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "US Tariff Programs", item: `${site}/tariffs` },
          ...(hub ? [{ name: hub.title, item: `${site}${hubPath(hub)}` }] : []),
          { name: NAME, item: url },
        ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
      })}
      <ExclusionsPage page={page} codeInfo={codeInfo} updates={updates} faqs={faqs} />
    </main>
  );
}
