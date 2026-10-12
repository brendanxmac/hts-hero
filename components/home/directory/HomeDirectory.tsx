import Link from "next/link";
import { POPULAR_HTS_CODES } from "@/constants/popular-hts-codes";
import { mono } from "@/components/ui/font";
import * as mk from "@/components/ui/marketing/styles";

// Duty rates for popular imports, server-rendered. The homepage is the page search engines crawl
// most, so these links are how they find the HTS code pages.
export const HomeDirectory = () => (
  <section
    className={`${mk.band} ${mk.bandMuted}`}
    aria-labelledby="directory-title"
  >
    <div className={mk.container}>
      <div>
        <p className={mk.eyebrow}>Look it up</p>
        <h2 id="directory-title" className={`${mk.h2} mt-4`}>
          Duty rates for popular imports
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_HTS_CODES.map(({ category, codes }) => (
            <div key={category} className={`${mk.card} p-6`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {category}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {codes.map((c) => (
                  <li key={c.code}>
                    <Link
                      href={`/hts/${c.code}`}
                      className="group flex items-baseline justify-between gap-3 text-sm"
                    >
                      <span className="text-slate-700 group-hover:text-teal-700 group-hover:underline">
                        {c.label}
                      </span>
                      <span
                        className={`${mono.className} shrink-0 text-xs text-slate-400`}
                      >
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
    </div>
  </section>
);
