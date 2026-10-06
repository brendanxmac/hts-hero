import config from "@/config";
import type { Faq } from "@/libs/blog/types";
import type { Tool } from "@/libs/compare/types";

const SITE = `https://${config.domainName}`;

// A comparison page's JSON-LD: the page and its breadcrumb, its questions, and for ranked
// pages the list of tools in order
export function CompareStructuredData({
  slug,
  title,
  description,
  dateModified,
  faqs,
  ranked,
}: {
  slug: string;
  title: string;
  description: string;
  dateModified: string;
  faqs: Faq[];
  ranked?: Tool[];
}) {
  const url = `${SITE}/compare/${slug}`;
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url,
      dateModified,
      publisher: { "@type": "Organization", name: config.appName, url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "Compare", item: `${SITE}/compare` },
        { name: title, item: url },
      ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
    },
  ];
  if (ranked) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: title,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: ranked.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareApplication",
          name: tool.name,
          applicationCategory: "BusinessApplication",
          url: tool.slug === "hts-hero" ? `${SITE}/duty-calculator` : tool.url,
          description: tool.summary,
        },
      })),
    });
  }
  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }
  return (
    <>
      {schemas.map((schema) => (
        <script
          key={String(schema["@type"])}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
