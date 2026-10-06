import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlternativesPage, ROUNDUP_LEAD, RoundupPage, VsPage } from "@/components/compare";
import { COMPARE_PAGES, comparePage, comparePageTitle } from "@/libs/compare/pages";
import config from "@/config";

interface Props {
  params: { slug: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARE_PAGES.map((p) => ({ slug: p.slug }));
}

const describe = (page: NonNullable<ReturnType<typeof comparePage>>) => {
  if (page.kind === "roundup") return ROUNDUP_LEAD;
  if (page.kind === "vs") return page.tool.vs!.verdict;
  return page.tool.alternatives!.intro;
};

export function generateMetadata({ params }: Props): Metadata {
  const page = comparePage(params.slug);
  if (!page) return {};
  const title = comparePageTitle(page);
  const description = describe(page);
  return {
    title: `${title} | HTS Hero`,
    description: description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description,
    alternates: { canonical: `/compare/${page.slug}` },
    openGraph: {
      title,
      description,
      url: `https://${config.domainName}/compare/${page.slug}`,
      siteName: config.appName,
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function ComparisonPage({ params }: Props) {
  const page = comparePage(params.slug);
  if (!page) notFound();
  if (page.kind === "roundup") return <RoundupPage />;
  if (page.kind === "vs") return <VsPage slug={page.slug} tool={page.tool} content={page.tool.vs!} />;
  const alt = page.tool.alternatives!;
  return <AlternativesPage slug={page.slug} title={comparePageTitle(page)} tool={page.tool} content={alt} />;
}
