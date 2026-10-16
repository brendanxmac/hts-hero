import { Metadata } from "next";
import Link from "next/link";
import { toRoman } from "@javascript-packages/roman-numerals";
import { Explore } from "@/components/hts-explorer/Explore";
import { NewsAlertsBox } from "@/components/tariff-updates/NewsAlertsBox";
import { BreadcrumbsProvider } from "../../contexts/BreadcrumbsContext";
import config from "@/config";
import { getHtsSectionsServer } from "../../libs/hts-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse the Harmonized Tariff Schedule (HTS) — Free Lookup | HTS Hero",
  description:
    "Search the full US Harmonized Tariff Schedule by HTS code or product description. Free HTS code lookup with duty rates, notes and trade program eligibility.",
  keywords: [
    "HTS code lookup",
    "harmonized tariff schedule",
    "HTS search",
    "HTSUS browse",
    "tariff schedule lookup",
    "HTS code search",
    "US tariff code",
    "import classification",
  ],
  openGraph: {
    title: "Browse the Harmonized Tariff Schedule | HTS Hero",
    description:
      "Search the complete US Harmonized Tariff Schedule by code or description.",
    url: `https://${config.domainName}/explore`,
    siteName: "HTS Hero",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Browse the Harmonized Tariff Schedule | HTS Hero",
    description:
      "Search and browse the complete US HTS. Find any tariff code by number or description.",
  },
  alternates: {
    canonical: "/explore",
  },
};

export default async function Home() {
  const sections = await getHtsSectionsServer();

  // The heading, intro and section links are server-rendered so crawlers see them;
  // the explorer itself loads the HTS in the browser
  return (
    <main className="w-full flex-1 min-h-0 flex flex-col bg-base-200">
      <div className="mx-auto w-full max-w-screen-xl px-6 lg:px-8 pt-8 md:pt-10 pb-16 sm:pb-20">
        <BreadcrumbsProvider>
          <Explore
            explorerSurface="explore_page"
            heading={
              <>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-base-content [font-family:var(--font-tracker-display)]">
                  HTS Code Lookup
                </h1>
                <p className="mt-2 max-w-2xl text-sm md:text-base text-base-content/70 leading-relaxed">
                  Search the US Harmonized Tariff Schedule (HTSUS) by code or product
                  description, then open any HTS code to see its duty rates and notes,
                  or{" "}
                  <Link href="/duty-calculator" className="text-primary hover:underline">
                    calculate the full duty
                  </Link>{" "}
                  for a country of origin.
                </p>
                <div className="mt-5">
                  <NewsAlertsBox source="explore" slim />
                </div>
              </>
            }
          />
        </BreadcrumbsProvider>
      </div>

      {/* <section className="mx-auto w-full max-w-screen-xl px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-base-content [font-family:var(--font-tracker-display)]">Browse the HTS by section</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <li key={s.number}>
              <Link
                href={`/section/${s.number}`}
                className="group flex h-full flex-col gap-1 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 transition-colors hover:border-primary/40"
              >
                <span className="text-xs font-bold text-primary group-hover:underline">
                  Section {toRoman(s.number)}
                </span>
                <span className="text-sm text-base-content/70 leading-snug">
                  {s.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section> */}
    </main>
  );
}
