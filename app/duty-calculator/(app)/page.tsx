import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { TariffFinderPage } from "../../../components/TariffFinderPage";
import { BreadcrumbsProvider } from "../../../contexts/BreadcrumbsContext";
import config from "@/config";

export const metadata: Metadata = {
  title:
    "US Import Duty & Tariff Calculator — Free HTS Code Lookup | HTS Hero",
  description:
    "Calculate US import duties, tariffs, and landed costs for any HTS code from any country of origin. See Section 301 tariffs, anti-dumping duties, trade program exemptions, and more — free and instant.",
  keywords: [
    "US import duty calculator",
    "tariff calculator",
    "HTS duty rate",
    "customs duty calculator",
    "import tariff lookup",
    "US tariff calculator",
    "HTS code duty",
    "landed cost calculator",
    "Section 301 tariff",
    "trade program exemptions",
    "HTSUS duty rates",
    "customs duty rates USA",
    "import duty rate calculator",
    "harmonized tariff schedule calculator",
  ],
  openGraph: {
    title: "US Import Duty & Tariff Calculator — Free | HTS Hero",
    description:
      "Instantly calculate US import duties, tariffs, and landed costs for any HTS code. Includes Section 301, AD/CVD, and trade program savings.",
    url: `https://${config.domainName}/duty-calculator`,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "US Import Duty & Tariff Calculator | HTS Hero",
    description:
      "Free duty calculator for US imports. Enter any HTS code and country to see the full tariff breakdown.",
  },
  alternates: {
    canonical: "/duty-calculator",
  },
};

const coveragePills = [
  "Section 122",
  "Section 301",
  "Section 232",
  "Trade Agreements",
  "USMCA",
  "GSP",
];

export default function DutyCalculatorPage() {
  return (
    <main className="w-screen h-full flex flex-col bg-base-100">
      {/* Static hero — server-rendered, immediately visible to crawlers */}
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

              <p className="text-base-content/70 text-sm md:text-base leading-relaxed">
                Enter any{" "}
                <Link
                  href="/explore"
                  className="text-primary hover:underline font-medium"
                >
                  HTS code
                </Link>{" "}
                and country of origin to calculate the full duty breakdown for
                your US import, including the base rate, Section 301 tariffs, Section 232 tariffs, and trade program savings such as USMCA, GSP, and CAFTA-DR.
              </p>

              {/* <p className="text-base-content/50 text-xs md:text-sm leading-relaxed">
                Every product imported into the United States is classified under
                the Harmonized Tariff Schedule, which sets the duty rate. Your
                actual cost depends on the classification, the country of
                origin, and any additional tariffs or exemptions that apply. This
                calculator computes the complete picture so you can estimate
                landed costs before you ship.
              </p> */}

              <div className="flex flex-wrap gap-1.5 mt-1">
                {coveragePills.map((label) => (
                  <span
                    key={label}
                    className="px-2.5 py-1 rounded-full bg-success/10 border border-success/30 text-[11px] font-medium text-success"
                  >
                    {label}
                  </span>
                ))}
              </div>
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

      {/* Calculator — client component, loads below the static hero */}
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
