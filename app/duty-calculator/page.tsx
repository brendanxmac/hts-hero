import { Suspense } from "react";
import { Metadata } from "next";
import { TariffFinderPage } from "../../components/duty-calculator/calculator";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { renderSchemaJsonLd } from "@/libs/seo";
import config from "@/config";
import { THEME } from "../../components/ui/theme";
import { Hero } from "@/components/duty-calculator/hero";
import { createClient } from "@/app/api/supabase/server";
import { getChangelogEntries } from "@/libs/supabase/tariff-changelog";
import { getDutyCalculatorContent } from "@/libs/duty-calculator-content";
import { TariffGuide } from "@/components/duty-calculator/guide";
import { dutyCalculatorFaqs } from "@/components/duty-calculator/guide/faqs";
import { TariffPricing } from "@/components/pricing-calculator";
import * as ui from "../../components/ui/styles";

export const metadata: Metadata = {
  title:
    "US Import Duty & Tariff Calculator — Free HTS Code Lookup | HTS Hero",
  description:
    "Free US tariff calculator. Enter an HTS code and country of origin to see every import duty: base rate, Section 232, 301 and 122 tariffs, exemptions and fees.",
  keywords: [
    "US import duty calculator",
    "usa import duty calculator",
    "tariff calculator",
    "US tariff calculator",
    "us tariff calculator by country",
    "free tariff calculator",
    "us import duty calculator free",
    "trump tariff calculator",
    "tariff calculator india to usa",
    "customs duty calculator",
    "import tariff lookup",
    "HTS duty rate",
    "HTS code duty",
    "landed cost calculator",
    "Section 301 tariff",
    "Section 232 tariff",
    "trade program exemptions",
    "USMCA tariff",
    "HTSUS duty rates",
    "customs duty rates USA",
    "import duty rate calculator",
    "harmonized tariff schedule calculator",
    "u.s. tariff calculator shipping",
  ],
  openGraph: {
    title: "Free US Import Duty & Tariff Calculator | HTS Hero",
    description:
      "Calculate US import duty for any HTS code and country of origin: base rate, Section 232, 301 and 122 tariffs, exemptions, trade preferences and fees.",
    url: `https://${config.domainName}/duty-calculator`,
    siteName: "HTS Hero",
    type: "website",
    images: [
      {
        url: `https://${config.domainName}/hero-tariffs.png`,
        width: 1200,
        height: 630,
        alt: "HTS Hero US Import Duty & Tariff Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free US Import Duty & Tariff Calculator | HTS Hero",
    description:
      "Enter an HTS code and country of origin to see the full duty breakdown: base rate, Section 232, 301 and 122 tariffs, exemptions and customs fees.",
    images: [`https://${config.domainName}/hero-tariffs.png`],
  },
  alternates: {
    canonical: "/duty-calculator",
  },
};

export default async function DutyCalculatorPage() {
  const [latestUpdates, content] = await Promise.all([
    getChangelogEntries(createClient(), { limit: 2 }),
    getDutyCalculatorContent(),
  ]);
  const faqs = dutyCalculatorFaqs(content.revisionTitle);
  // <main> grows with its content and fills the rest of the window (flex-1, no shrinking), so
  // the layout's scroll container, which has a different background, never shows around the page
  return (
    <main className={`${THEME} w-full flex-1 shrink-0 flex flex-col`}>
      {renderSchemaJsonLd({
        "@type": "WebApplication",
        name: "US Import Duty & Tariff Calculator",
        url: `https://${config.domainName}/duty-calculator`,
        applicationCategory: "BusinessApplication",
        dateModified: content.asOf,
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Free calculator for US import duties. Enter an HTS code, country of origin and entry date to see the base rate, Section 232, 301 and 122 tariffs and exemptions, trade preferences such as USMCA and CAFTA-DR, and MPF and HMF fees, line by line.",
        provider: {
          "@type": "Organization",
          name: "HTS Hero",
          url: `https://${config.domainName}`,
        },
      })}

      {renderSchemaJsonLd({
        "@type": "FAQPage",
        mainEntity: faqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      })}

      {/* Hero — server-rendered, immediately visible to crawlers */}
      <Hero latestUpdates={latestUpdates} />

      {/* Calculator */}
      <BreadcrumbsProvider>
        <Suspense
          fallback={<div className={`${ui.container} pt-8`}><div className={`${ui.card} h-64`} /></div>}
        >
          <TariffFinderPage />
        </Suspense>
      </BreadcrumbsProvider>

      {/* Plans: Free, Starter (the calculator) and Pro (the Tariff Tracker) */}
      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
          <TariffPricing />
        </div>
      </div>

      {/* Rates, a worked example, lookups, sources and FAQ — server-rendered for crawlers */}
      <TariffGuide content={content} faqs={faqs} />

      {/* Interactive Classification CTA */}
      {/* <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <ClassificationCTA
          title="Your duty rate depends on the right HTS code"
          subtitle="Not sure your HTS code is correct? Enter your product description and verify your classification in minutes."
        />
      </div> */}
    </main>
  );
}
