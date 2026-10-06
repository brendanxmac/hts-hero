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
import { HtsCodePage as HtsCodePageContent } from "@/components/hts-code-page";
import config from "@/config";
import {
  describeTotal,
  findRateElement,
  formatSummaryDate,
  getHtsDutySummary,
  HtsDutySummary,
  htsProductName,
  inSentence,
} from "@/libs/hts-duty-summary";
import { microEstimate } from "@/libs/hts-micro-estimate";

interface HtsCodePageProps {
  params: { code: string };
}

export const revalidate = 86400;

export async function generateStaticParams(): Promise<{ code: string }[]> {
  return [];
}

// Everything the page and its metadata need, computed once per render
async function loadHtsPage(code: string) {
  const elements = await getHtsElementsServer();
  const element = getHtsElementByCode(code, elements);
  if (!element) return null;

  const sections = await getHtsSectionsServer();
  const parents = getHtsElementParentsServer(element, elements);
  const rateElement = findRateElement(element, parents);
  return {
    elements,
    element,
    parents,
    rateElement,
    sectionChapter: getSectionAndChapterForElement(sections, element.chapter),
    productName: htsProductName(element, parents),
    summary: getHtsDutySummary(element, rateElement),
  };
}

const SITE_SUFFIX = " | HTS Hero";

// "HTS 6109.10.00: T-shirts, singlets… of cotton – Duty Rates & Tariffs | HTS Hero",
// shortened to stay close to what search results show
function pageTitle(htsno: string, name: string, shortName: string) {
  const full = `HTS ${htsno}: ${name} – Duty Rates & Tariffs`;
  if (full.length + SITE_SUFFIX.length <= 70) return full + SITE_SUFFIX;
  if (full.length <= 75) return full;
  return `HTS ${htsno}: ${shortName} – Duty Rates & Tariffs`;
}

// The totals from the largest suppliers, trimmed to fit a search result snippet
function pageDescription(
  htsno: string,
  name: string,
  shortName: string,
  general: string | null,
  summary: HtsDutySummary | null,
) {
  // Chapter 99 lines carry sentences in the rate column, too long for a snippet
  const generalCtx = general && general.length <= 20 ? ` General rate ${general}.` : "";
  if (!summary) {
    for (const productName of [name, shortName]) {
      const text = `HTS code ${htsno} covers ${inSentence(productName)}.${generalCtx} Look up US duty rates, tariffs and trade programs for this code.`;
      if (text.length <= 160) return text;
    }
    return `HTS code ${htsno} covers ${inSentence(shortName)}.${generalCtx}`;
  }
  const totals = ["CN", "MX", "VN", "DE"]
    .map((code) => summary.rows.find((r) => r.country.code === code))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .map((r) => `${describeTotal(r)} from ${r.country.name}`);
  const updated = ` Updated ${formatSummaryDate(summary.asOf)}.`;
  for (const productName of [name, shortName]) {
    for (let n = totals.length; n >= 1; n--) {
      const text = `US duty on ${inSentence(productName)} (HTS ${htsno}): ${totals.slice(0, n).join(", ")}.${generalCtx}${updated}`;
      if (text.length <= 160) return text;
    }
  }
  return `US duty on HTS ${htsno}: ${totals[0]}.${updated}`;
}

export async function generateMetadata({
  params,
}: HtsCodePageProps): Promise<Metadata> {
  const page = await loadHtsPage(params.code);
  if (!page) {
    return { title: "HTS Code Not Found | HTS Hero" };
  }

  const { element, parents, rateElement, productName, summary } = page;
  const shortName = htsProductName(element, parents, 40);
  const title = pageTitle(element.htsno, productName, shortName);
  const description = pageDescription(element.htsno, productName, shortName, rateElement.general, summary);
  const nameLower = productName.toLowerCase();
  const codeWithoutDots = element.htsno.replace(/\./g, "");

  return {
    title,
    description,
    keywords: [
      `HTS ${element.htsno}`,
      `HTS code ${element.htsno}`,
      `${element.htsno} duty rate`,
      `${element.htsno} tariff`,
      codeWithoutDots,
      `${nameLower} HTS code`,
      `${nameLower} tariff`,
      `${nameLower} import duty`,
      "harmonized tariff schedule",
      "US tariff code lookup",
    ],
    openGraph: {
      title: title.replace(SITE_SUFFIX, ""),
      description,
      url: `https://${config.domainName}/hts/${element.htsno}`,
      siteName: "HTS Hero",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: title.replace(SITE_SUFFIX, ""),
      description,
    },
    alternates: {
      canonical: `/hts/${element.htsno}`,
    },
  };
}

export default async function HtsCodePage({ params }: HtsCodePageProps) {
  const page = await loadHtsPage(params.code);
  if (!page) {
    notFound();
  }

  const { elements, element, parents, rateElement, sectionChapter, productName, summary } = page;
  // The quick estimate opens on China, the most-looked-up country of origin
  const estimate = summary
    ? microEstimate({
      htsCode: element.htsno,
      baseRates: { general: rateElement.general, special: rateElement.special, other: rateElement.other },
      country: "CN",
      asOf: summary.asOf,
    })
    : null;
  const children = getDirectChildren(element, elements);
  const nearestParent = parents[parents.length - 1];
  const siblings = nearestParent
    ? getDirectChildren(nearestParent, elements).filter((e) => e.uuid !== element.uuid)
    : [];

  return (
    <main className="w-full min-h-screen">
      <HtsCodePageContent
        element={element}
        productName={productName}
        summary={summary}
        estimate={estimate}
        parentElements={parents}
        childrenElements={children}
        siblingElements={siblings}
        sectionChapter={sectionChapter}
      />
    </main>
  );
}

// The codes directly under a line. A descriptive line with no code of its own ("Men's or boys'")
// is looked through to the codes beneath it, so every 10-digit code is linked from its parent's
// page and crawlers can reach it without the sitemap.
function getDirectChildren(
  element: HtsElement,
  allElements: HtsElement[]
): HtsElement[] {
  const parentIndex = allElements.findIndex((e) => e.uuid === element.uuid);
  if (parentIndex === -1) return [];

  const parentIndent = Number(element.indent);
  const children: HtsElement[] = [];
  // Below a code already collected, its own sub-codes belong to its page, not this one
  let skipDeeperThan: number | null = null;

  for (let i = parentIndex + 1; i < allElements.length; i++) {
    const current = allElements[i];
    const currentIndent = Number(current.indent);
    if (currentIndent <= parentIndent) break;
    if (skipDeeperThan !== null && currentIndent > skipDeeperThan) continue;
    skipDeeperThan = null;
    if (current.htsno) {
      children.push(current);
      skipDeeperThan = currentIndent;
    }
  }

  return children;
}
