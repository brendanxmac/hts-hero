import { Metadata } from "next";
import config from "@/config";
import { FaqPage } from "@/components/duty-calculator/faq";
import { dutyCalculatorFaqSections } from "@/components/duty-calculator/guide";
import { THEME } from "@/components/ui/theme";
import { renderSchemaJsonLd } from "@/libs/seo";
import { getLatestVerifiedRevision } from "@/tariffs/engine-v2/revisions";

export const metadata: Metadata = {
  title: "US Import Duty & Tariff Calculator FAQ (2026) | HTS Hero",
  description:
    "Answers to common questions about US import duty: how it's calculated, Section 232 and 301 tariffs, trade agreements, fees, what's included and how current the rates are.",
  alternates: { canonical: "/duty-calculator/faq" },
  openGraph: {
    title: "US Import Duty & Tariff Calculator FAQ (2026)",
    description: "How US import duty is calculated, which tariffs apply in 2026, and what the HTS Hero calculator includes.",
    url: `https://${config.domainName}/duty-calculator/faq`,
    siteName: "HTS Hero",
    type: "website",
  },
};

// "2026HTSRev20" → "2026 HTS Revision 20"
const revisionTitle = (name: string) => name.replace(/^(\d{4})HTSRev(\d+)$/, "$1 HTS Revision $2");

export default function DutyCalculatorFaqPage() {
  const sections = dutyCalculatorFaqSections(revisionTitle(getLatestVerifiedRevision().name));
  return (
    <main className={`${THEME} w-full flex-1 shrink-0 flex flex-col`}>
      {renderSchemaJsonLd({
        "@type": "FAQPage",
        mainEntity: sections
          .flatMap((s) => s.faqs)
          .map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Duty Calculator", item: `https://${config.domainName}/duty-calculator` },
          { name: "FAQ", item: `https://${config.domainName}/duty-calculator/faq` },
        ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
      })}
      <FaqPage sections={sections} />
    </main>
  );
}
