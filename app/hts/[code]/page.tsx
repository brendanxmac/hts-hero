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
import { HtsCodePageContent } from "@/components/HtsCodePageContent";
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

const GENERIC_DESC_RE = /^(other|parts|thereof|mixtures|the foregoing|articles|not elsewhere)/i;

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

  const descLower = element.description.toLowerCase();

  const dutySnippet = element.general
    ? ` General duty rate: ${element.general}.`
    : "";

  const chapterSnippet = sectionChapter
    ? ` Chapter ${element.chapter} (${sectionChapter.chapterDescription}).`
    : "";

  const codeWithoutDots = element.htsno.replace(/\./g, "");

  const shortName = element.description.length <= 40
    && !GENERIC_DESC_RE.test(element.description.trim());

  const title = shortName
    ? `HTS Code for ${element.description} – ${element.htsno} | HTS Hero`
    : `HTS ${element.htsno}: ${truncDesc} | US Tariff Classification`;

  const description = shortName
    ? `The HTS code for ${descLower} is ${element.htsno}.${chapterSnippet}${dutySnippet} Look up tariff classification, duty rates, and trade programs.`
    : `HTS code ${element.htsno} covers ${truncDesc.toLowerCase()}.${chapterSnippet}${dutySnippet} Look up tariff classification, duty rates, and trade programs.`;

  const ogTitle = shortName
    ? `HTS Code for ${element.description} – ${element.htsno}`
    : `HTS ${element.htsno}: ${truncDesc}`;

  return {
    title,
    description,
    keywords: [
      `HTS code for ${descLower}`,
      `${descLower} HTS code`,
      `${descLower} tariff code`,
      `${descLower} tariff classification`,
      `${descLower} import code`,
      `HTS ${element.htsno}`,
      `HTS code ${element.htsno}`,
      `HTSUS ${element.htsno}`,
      codeWithoutDots,
      `${element.htsno} classification`,
      element.description,
      "harmonized tariff schedule",
      "HTS classification",
      "US tariff code lookup",
    ],
    openGraph: {
      title: ogTitle,
      description: `Look up HTS code ${element.htsno}: ${truncDesc.toLowerCase()}.${dutySnippet} Find tariff classification and duty rates on HTS Hero.`,
      url: `https://${config.domainName}/hts/${element.htsno}`,
      siteName: "HTS Hero",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description: `Look up HTS ${element.htsno}: ${truncDesc.toLowerCase()}.${dutySnippet}`,
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
  const nearestParent = parents[parents.length - 1];
  const siblings = nearestParent
    ? getDirectChildren(nearestParent, elements).filter((e) => e.uuid !== element.uuid)
    : [];
  const sectionChapter = getSectionAndChapterForElement(
    sections,
    element.chapter
  );

  return (
    <main className="w-full min-h-screen bg-base-100">
      <HtsCodePageContent
        element={element}
        parentElements={parents}
        childrenElements={children}
        siblingElements={siblings}
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
