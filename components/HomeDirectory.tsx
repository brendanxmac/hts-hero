import Link from "next/link";
import { toRoman } from "@javascript-packages/roman-numerals";
import { getHtsSectionsServer } from "../libs/hts-server";
import { POPULAR_HTS_CODES } from "../constants/popular-hts-codes";

// The free tools, the HTS sections and popular HTS codes, server-rendered at the bottom of
// the homepage. The homepage is the page search engines crawl most, so these links are how
// they find the calculator and the HTS pages.

const TOOLS = [
  {
    href: "/duty-calculator",
    title: "US Tariff & Duty Calculator",
    text: "Every duty on an import from any country: base rate, Section 232, 301 and 122 tariffs, exemptions and fees.",
  },
  {
    href: "/explore",
    title: "HTS Code Lookup",
    text: "Search the Harmonized Tariff Schedule by code or description, with duty rates and notes.",
  },
  {
    href: "/classify",
    title: "HTS Classification",
    text: "Find the right HTS code for a product, with the evidence to back it up.",
  },
];

export const HomeDirectory = async () => {
  const sections = await getHtsSectionsServer();

  return (
    <section className="bg-base-100 border-t border-base-content/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20 flex flex-col gap-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Free tariff tools
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="group flex h-full flex-col gap-1 p-4 rounded-xl border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <span className="font-semibold text-base-content group-hover:text-primary">
                    {t.title}
                  </span>
                  <span className="text-sm text-base-content/60 leading-snug">
                    {t.text}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Duty rates for popular imports
          </h2>
          <div className="mt-5 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_HTS_CODES.map(({ category, codes }) => (
              <div key={category}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                  {category}
                </h3>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {codes.map((c) => (
                    <li key={c.code}>
                      <Link
                        href={`/hts/${c.code}`}
                        className="group flex items-baseline gap-2 text-sm"
                      >
                        <span className="text-base-content/80 group-hover:text-primary group-hover:underline">
                          {c.label}
                        </span>
                        <span className="font-mono text-xs text-base-content/40">
                          {c.code}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Browse the Harmonized Tariff Schedule
          </h2>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => (
              <li key={s.number}>
                <Link
                  href={`/section/${s.number}`}
                  className="group flex h-full flex-col gap-0.5 px-3 py-2 rounded-lg border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
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
        </div>
      </div>
    </section>
  );
};
