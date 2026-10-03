import { Suspense } from "react";
import { Metadata } from "next";
import { TariffFinderPage } from "../../components/TariffFinderPage";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { renderSchemaJsonLd } from "@/libs/seo";
import config from "@/config";
import { getLatestVerifiedRevision } from "../../tariffs/engine-v2/revisions";
import styles from "../../components/duty-calculator/theme.module.css";
import { Hero } from "../../components/duty-calculator/Hero";
import { createClient } from "@/app/api/supabase/server";
import { getChangelogEntries } from "@/libs/supabase/tariff-changelog";

export const metadata: Metadata = {
  title:
    "US Import Duty & Tariff Calculator — Free HTS Code Lookup | HTS Hero",
  description:
    "Free US import duty calculator. Enter an HTS code, country of origin and entry date to see every duty that applies: the base rate, Section 232, 301 and 122 tariffs and their exemptions, trade preferences like USMCA, and MPF and HMF fees, with the reason for each line.",
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
      "Calculate US import duties for any HTS code, country of origin and entry date, including Section 232, 301 and 122 tariffs, exemptions, USMCA and other trade preferences, and customs fees.",
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
      "Enter an HTS code, country of origin and entry date to see the full duty breakdown: base rate, Section 232, 301 and 122 tariffs, exemptions and customs fees.",
    images: [`https://${config.domainName}/hero-tariffs.png`],
  },
  alternates: {
    canonical: "/duty-calculator",
  },
};

export default async function DutyCalculatorPage() {
  const latestVerified = getLatestVerifiedRevision();
  const latestUpdates = await getChangelogEntries(createClient(), { limit: 2 });
  // <main> grows with its content and fills the rest of the window (flex-1, no shrinking), so
  // the layout's scroll container, which has a different background, never shows around the page
  return (
    <main className={`${styles.root} w-full flex-1 shrink-0 flex flex-col`}>
      {renderSchemaJsonLd({
        "@type": "WebApplication",
        name: "US Import Duty & Tariff Calculator",
        url: `https://${config.domainName}/duty-calculator`,
        applicationCategory: "BusinessApplication",
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
        mainEntity: [
          {
            "@type": "Question",
            name: "How are US import duties calculated?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "US import duties depend on the product's HTS (Harmonized Tariff Schedule) code, its country of origin and the date it's entered. The base rate comes from the HTS: Column 1 General for most countries, Column 1 Special when the goods qualify for a trade agreement or preference program such as USMCA, and Column 2 for Cuba, North Korea, Russia and Belarus. Additional Chapter 99 duties are then added, such as Section 232 tariffs on steel, aluminum, copper, autos and wood, and Section 301 tariffs on goods from China, unless an exemption applies. Duties are applied to the customs value (or per unit for specific rates), and customs fees are added: the Merchandise Processing Fee (0.3464%, with a minimum and maximum) and, for ocean shipments, the Harbor Maintenance Fee (0.125%). Antidumping and countervailing duties are set case by case and aren't included in this calculator.",
            },
          },
          {
            "@type": "Question",
            name: "What are Section 301 tariffs?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Section 301 tariffs are additional duties on goods from China, ranging from 7.5% to 100% depending on the product and, for recent increases, the entry date. They're applied on top of the standard HTS duty rate and were imposed to address China's trade practices. The HTS Hero duty calculator applies the Section 301 lists and product exclusions in effect on your entry date.",
            },
          },
          {
            "@type": "Question",
            name: "Is this US tariff calculator free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, the HTS Hero duty and tariff calculator is completely free, with no sign-up required. Enter an HTS code, country of origin and entry date to see the full duty breakdown, including the base rate, Section 232, 301 and 122 tariffs, trade preferences, and customs fees.",
            },
          },
          {
            "@type": "Question",
            name: "How do I find the tariff rate for imports from a specific country?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Enter the product's HTS code, then select the country of origin. The calculator shows the rates that apply to goods from that country on your entry date, including additional tariffs (like Section 301 for China) and preferential rates you can claim (like USMCA for goods from Mexico and Canada that meet its rules of origin).",
            },
          },
          {
            "@type": "Question",
            name: "Does the calculator include antidumping and countervailing duties?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Antidumping and countervailing duties (AD/CVD) are set case by case for specific producers and exporters, so they aren't included. If your product is covered by an AD/CVD order, check the order's rates with CBP or your customs broker and add them to the estimate.",
            },
          },
        ],
      })}

      {/* Hero — server-rendered, immediately visible to crawlers */}
      <Hero latestVerified={latestVerified} latestUpdates={latestUpdates} />

      {/* Calculator */}
      <BreadcrumbsProvider>
        <Suspense
          fallback={<div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 pt-8"><div className="h-64 rounded-2xl border border-[var(--dc-border)] bg-[var(--dc-surface)]" /></div>}
        >
          <TariffFinderPage />
        </Suspense>
      </BreadcrumbsProvider>

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
