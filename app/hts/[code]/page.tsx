import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getHtsElementsServer,
  getHtsSectionsServer,
  getHtsElementByCode,
  getHtsElementParentsServer,
  getSectionAndChapterForElement,
} from "../../../libs/hts-server";
import { HtsElement } from "../../../interfaces/hts";
import { HtsCodePageContent } from "../../../components/HtsCodePageContent";
import config from "@/config";

interface HtsCodePageProps {
  params: { code: string };
}

export async function generateStaticParams() {
  const elements = await getHtsElementsServer();

  return elements
    .filter((el) => el.htsno && el.htsno.trim().length > 0)
    .map((el) => ({ code: el.htsno }));
}

export async function generateMetadata({
  params,
}: HtsCodePageProps): Promise<Metadata> {
  const elements = await getHtsElementsServer();
  const sections = await getHtsSectionsServer();
  const element = getHtsElementByCode(params.code, elements);

  if (!element) {
    return { title: "HTS Code Not Found | HTS Hero" };
  }

  const sectionChapter = getSectionAndChapterForElement(
    sections,
    element.chapter
  );

  const truncDesc = element.description.length > 120
    ? element.description.slice(0, 117) + "..."
    : element.description;

  const dutySnippet = element.general
    ? ` General duty rate: ${element.general}.`
    : "";

  const chapterSnippet = sectionChapter
    ? ` Chapter ${element.chapter} (${sectionChapter.chapterDescription}).`
    : "";

  const codeWithoutDots = element.htsno.replace(/\./g, "");

  const specialSnippet = element.special
    ? ` Special rates may apply: ${element.special}.`
    : "";

  return {
    title: `HTS ${element.htsno} – ${truncDesc} | Duty Rates, Tariffs & Classification`,
    description: `US import duty rates and tariffs for HTS ${element.htsno}: ${truncDesc}.${dutySnippet}${specialSnippet}${chapterSnippet} Calculate landed costs, Section 301 tariffs, and trade program exemptions.`,
    keywords: [
      `HTS ${element.htsno}`,
      `HTS code ${element.htsno}`,
      `HTSUS ${element.htsno}`,
      codeWithoutDots,
      `${element.htsno} duty rate`,
      `${element.htsno} tariff`,
      `${element.htsno} tariff rate`,
      `${codeWithoutDots} tariff`,
      `${codeWithoutDots} duty rate`,
      `import duty ${element.htsno}`,
      `tariff for ${element.htsno}`,
      `US import duty ${element.htsno}`,
      `customs duty ${element.htsno}`,
      `${element.htsno} China tariff`,
      `Section 301 ${element.htsno}`,
      element.description,
      "harmonized tariff schedule",
      "US import duty",
      "tariff rate",
      "customs duty calculator",
    ],
    openGraph: {
      title: `HTS ${element.htsno} – Duty Rates & Tariff Details`,
      description: `US import duty for HTS ${element.htsno}: ${truncDesc}.${dutySnippet} Calculate full landed costs with HTS Hero.`,
      url: `https://${config.domainName}/hts/${element.htsno}`,
      siteName: "HTS Hero",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `HTS ${element.htsno} – Duty Rates & Tariffs`,
      description: `Import duty rates for ${element.htsno}: ${truncDesc}.${dutySnippet}`,
    },
    alternates: {
      canonical: `/hts/${element.htsno}`,
    },
  };
}

export default async function HtsCodePage({ params }: HtsCodePageProps) {
  const elements = await getHtsElementsServer();
  const sections = await getHtsSectionsServer();
  const element = getHtsElementByCode(params.code, elements);

  if (!element) {
    notFound();
  }

  const parents = getHtsElementParentsServer(element, elements);
  const children = getDirectChildren(element, elements);
  const sectionChapter = getSectionAndChapterForElement(
    sections,
    element.chapter
  );

  return (
    <main className="w-full min-h-screen bg-base-100">
      <HtsCodePageContent
        element={element}
        parents={parents}
        children={children}
        sectionChapter={sectionChapter}
      />
    </main>
  );
}

function getDirectChildren(
  element: HtsElement,
  allElements: HtsElement[]
): HtsElement[] {
  const parentIndex = allElements.findIndex((e) => e.uuid === element.uuid);
  if (parentIndex === -1) return [];

  const parentIndent = Number(element.indent);
  const childIndent = parentIndent + 1;
  const children: HtsElement[] = [];

  for (let i = parentIndex + 1; i < allElements.length; i++) {
    const currentIndent = Number(allElements[i].indent);
    if (currentIndent <= parentIndent) break;
    if (currentIndent === childIndent) {
      children.push(allElements[i]);
    }
  }

  return children;
}
