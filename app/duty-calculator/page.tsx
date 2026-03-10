import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { TariffFinderPage } from "../../components/TariffFinderPage";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import { renderSchemaJsonLd } from "@/libs/seo";
import config from "@/config";

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

const coverageItems = [
  "Section 301",
  "Section 232",
  "AD/CVD Duties",
  "USMCA",
  "GSP",
  "CAFTA-DR",
];

export default function DutyCalculatorPage() {
  return (
    <main className="w-screen h-full flex flex-col bg-base-100">
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
      <div className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200 border-b border-base-content/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-0 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex flex-col gap-3 max-w-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  US Import Duty Calculator
                </span>
              </h1>

              <p className="text-base-content/60 text-sm md:text-base leading-relaxed">
                Calculate your full duty breakdown by{" "}
                <Link
                  href="/explore"
                  className="text-primary hover:underline font-medium"
                >
                  HTS code
                </Link>{" "}
                and country of origin — including base rates, Section 122 / 232 /
                301 tariffs, and trade program savings like
                USMCA, GSP, and CAFTA-DR. Free and instant.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:items-end shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/80">
                <span className="hidden md:inline-block w-8 h-px bg-primary/40" />
                Trusted By Brokers, Importers &amp; Manufacturers
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success">
                  Updated: March 9th, 2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator */}
      <BreadcrumbsProvider>
        <Suspense
          fallback={
            <div className="w-full py-16 flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          }
        >
          <TariffFinderPage />
        </Suspense>
      </BreadcrumbsProvider>
    </main>
  );
}
