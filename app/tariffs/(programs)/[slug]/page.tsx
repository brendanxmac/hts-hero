import { Metadata } from "next";
import { notFound } from "next/navigation";
import config from "@/config";
import { ProgramHubPage, showsCodeNames } from "@/components/tariff-programs/ProgramHubPage";
import { codeInfoFor } from "@/libs/tariff-programs/codeLinks";
import { hubFaqs } from "@/libs/tariff-programs/faqs";
import { hubBySlug, hubPath, PROGRAM_HUBS } from "@/libs/tariff-programs/hubs";
import { hubLead, programPage } from "@/libs/tariff-programs/program";
import { renderSchemaJsonLd } from "@/libs/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

// Rebuilt daily, so the tables follow the tariff data without a deploy
export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAM_HUBS.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const hub = hubBySlug(slug);
  if (!hub) return {};
  const page = programPage(hub);
  // "Every HTS Code (2026)" is what people search these programs for: the list
  // Programs without a code list: "Rates, Countries & Dates" when it fits a search result, else the
  // name and year alone
  const title =
    page.codes.length > 0
      ? `${hub.title}: Every HTS Code (2026)`
      : [`${hub.title} (2026): Rates, Countries & Dates`, `${hub.title} (2026)`].find((t) => t.length <= 70) ?? `${hub.title} (2026)`;
  const lead = hubLead(page);
  const description = lead.length <= 160 ? lead : `${lead.slice(0, 157).replace(/\s+\S*$/, "")}…`;
  return {
    title: `${title} | HTS Hero`.length <= 75 ? `${title} | HTS Hero` : title,
    description,
    alternates: { canonical: hubPath(hub) },
    openGraph: { title, description, url: `https://${config.domainName}${hubPath(hub)}`, siteName: "HTS Hero", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProgramRoute(props: Props) {
  const { slug } = await props.params;
  const hub = hubBySlug(slug);
  if (!hub) notFound();

  const page = programPage(hub);
  const lead = hubLead(page);
  const faqs = hubFaqs(page, lead);
  const headings = [...page.inForce, ...page.exemptions, ...page.scheduled, ...page.ended].map((p) => p.code);
  const codeInfo = await codeInfoFor(
    [...page.codes.map((r) => r.code), ...headings, ...page.changes.map((c) => c.heading)],
    showsCodeNames(page)
  );
  const url = `https://${config.domainName}${hubPath(hub)}`;

  return (
    <main className="flex w-full flex-1 flex-col">
      {renderSchemaJsonLd({
        "@type": "Dataset",
        name: hub.title,
        description: lead,
        url,
        dateModified: page.asOf,
        creator: { "@type": "Organization", name: "HTS Hero", url: `https://${config.domainName}` },
        license: `https://${config.domainName}/tos`,
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
          { name: "US Tariff Programs", item: `https://${config.domainName}/tariffs` },
          { name: hub.title, item: url },
        ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
      })}
      <ProgramHubPage page={page} codeInfo={codeInfo} faqs={faqs} />
    </main>
  );
}
