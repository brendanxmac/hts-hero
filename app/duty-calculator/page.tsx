import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { TariffFinderPage } from "../../components/TariffFinderPage";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { renderSchemaJsonLd } from "@/libs/seo";
import config from "@/config";
import { getLatestVerifiedRevision } from "../../tariffs/engine-v2/revisions";
import styles from "../../components/duty-calculator/theme.module.css";

export const metadata: Metadata = {
  title:
    "US Import Duty & Tariff Calculator — Free HTS Code Lookup | HTS Hero",
  description:
    "Free US import duty calculator. Enter any HTS code and country of origin to see the full tariff breakdown — base rates, Section 301, Section 232, AD/CVD duties, Trump tariffs, and trade program savings like USMCA and GSP. Estimate landed costs instantly.",
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
    "GSP tariff",
    "HTSUS duty rates",
    "customs duty rates USA",
    "import duty rate calculator",
    "harmonized tariff schedule calculator",
    "u.s. tariff calculator shipping",
  ],
  openGraph: {
    title: "Free US Import Duty & Tariff Calculator | HTS Hero",
    description:
      "Calculate US import duties and tariffs for any HTS code by country of origin. Includes Section 301, Section 232, AD/CVD, and trade program savings.",
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
      "Enter any HTS code and country to see the full duty breakdown — base rates, Section 301, AD/CVD, and trade program savings.",
    images: [`https://${config.domainName}/hero-tariffs.png`],
  },
  alternates: {
    canonical: "/duty-calculator",
  },
};

export default function DutyCalculatorPage() {
  const latestVerified = getLatestVerifiedRevision();
  return (
    <main className={`${styles.root} w-full min-h-full flex flex-col`}>
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
          "Free calculator for US import duties and tariffs. Enter any HTS code and country of origin to see base rates, Section 301, Section 232, AD/CVD duties, and trade program savings under USMCA, GSP, and CAFTA-DR.",
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
              text: "US import duties are calculated based on the product's HTS (Harmonized Tariff Schedule) classification code and the country of origin. The base ad-valorem duty rate is applied to the customs value, then additional tariffs may apply — such as Section 301 tariffs on Chinese goods and Section 232 tariffs on steel and aluminum. Trade program exemptions like USMCA, GSP, and CAFTA-DR can reduce or eliminate duties for qualifying goods.",
            },
          },
          {
            "@type": "Question",
            name: "What are Section 301 tariffs?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Section 301 tariffs are additional duties imposed on goods imported from China, ranging from 7.5% to 100% depending on the product category. These tariffs are applied on top of the standard HTS duty rate and were enacted to address unfair trade practices. The HTS Hero duty calculator automatically includes applicable Section 301 tariffs in its calculations.",
            },
          },
          {
            "@type": "Question",
            name: "Is this US tariff calculator free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, the HTS Hero duty and tariff calculator is completely free. Enter any HTS code and select a country of origin to see the full duty breakdown including base rates, Section 122 / 301 / 232 tariffs, and trade program savings — no sign-up required.",
            },
          },
          {
            "@type": "Question",
            name: "How do I find the tariff rate for imports from a specific country?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Enter the product's HTS code in the calculator, then select the country of origin from the dropdown. The calculator will show the applicable duty rate for that specific country, including any additional tariffs (like Section 301 for China) or preferential rates (like USMCA for Mexico and Canada). Different countries may qualify for different trade programs that reduce or eliminate duties.",
            },
          },
        ],
      })}

      {/* Hero — server-rendered, immediately visible to crawlers */}
      <header className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 pt-10 pb-8 md:pt-14 md:pb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--dc-border)] bg-[var(--dc-surface)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--dc-text-2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--dc-positive)]" aria-hidden />
          Tariff data verified through HTS {latestVerified.title}
        </div>
        <h1 className="mt-5 max-w-3xl text-[34px] leading-[1.1] sm:text-[44px] md:text-[52px] font-semibold tracking-[-0.025em] text-[var(--dc-text)]">
          Every U.S. import duty, calculated and explained.
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] sm:text-[17px] leading-relaxed text-[var(--dc-text-2)]">
          Enter an{" "}
          <Link href="/explore" className="font-semibold text-[var(--dc-accent)] underline-offset-4 hover:underline">
            HTS code
          </Link>{" "}
          and country of origin. We apply the base rate, every Section 232, 301 and 122 tariff and exemption in effect on
          your entry date, and customs fees, then show you why each line applies.
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-[var(--dc-text-2)]">
          {["Line-by-line reasons", "Dated to your entry", "Legal sources cited", "Free, no sign-up"].map((point) => (
            <li key={point} className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-[var(--dc-accent)]" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                  clipRule="evenodd"
                />
              </svg>
              {point}
            </li>
          ))}
        </ul>
      </header>

      {/* Calculator */}
      <BreadcrumbsProvider>
        <Suspense
          fallback={<div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6"><div className="h-64 rounded-2xl border border-[var(--dc-border)] bg-[var(--dc-surface)]" /></div>}
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
