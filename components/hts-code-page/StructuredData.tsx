import type { HtsElement } from "@/interfaces/hts";
import config from "@/config";
import type { HtsDutySummary } from "@/libs/hts-duty-summary";
import type { FaqEntry, SectionChapter } from "./types";

// The page's JSON-LD for search engines: its breadcrumb trail, its questions and the page itself
export function StructuredData({
  element,
  productName,
  summary,
  tariffElement,
  parentElements: parents,
  sectionChapter,
  faqs,
}: {
  element: HtsElement;
  productName: string;
  summary: HtsDutySummary | null;
  tariffElement: HtsElement;
  parentElements: HtsElement[];
  sectionChapter: SectionChapter;
  faqs: FaqEntry[];
}) {
  const breadcrumbItems = [
    { name: "HTS Explorer", url: `https://${config.domainName}/explore` },
    ...(sectionChapter
      ? [
        {
          name: `Section ${sectionChapter.sectionNumber}: ${sectionChapter.sectionDescription}`,
          url: `https://${config.domainName}/section/${sectionChapter.sectionNumber}`,
        },
        {
          name: `Chapter ${element.chapter}: ${sectionChapter.chapterDescription}`,
          url: `https://${config.domainName}/chapter/${element.chapter}`,
        },
      ]
      : []),
    ...parents
      .filter((p) => p.htsno)
      .map((p) => ({
        name: `HTS ${p.htsno} – ${p.description}`,
        url: `https://${config.domainName}/hts/${p.htsno}`,
      })),
    {
      name: element.htsno ? `HTS ${element.htsno} – ${element.description}` : element.description.slice(0, 60),
      url: `https://${config.domainName}/hts/${element.htsno}`,
    },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };

  const dutyCtx = tariffElement.general ? ` The general duty rate is ${tariffElement.general}.` : "";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `HTS ${element.htsno}: ${productName} – Duty Rates & Tariffs`,
    ...(summary ? { dateModified: summary.asOf } : {}),
    description: `HTS code ${element.htsno}: ${productName}.${dutyCtx}`,
    url: `https://${config.domainName}/hts/${element.htsno}`,
    isPartOf: {
      "@type": "WebSite",
      name: "HTS Hero",
      url: `https://${config.domainName}`,
    },
    about: {
      "@type": "Thing",
      name: element.htsno ? `HTS ${element.htsno}` : element.description,
      description: element.description,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
