import Link from "next/link";
import { COUNTRY_PAGES } from "@/libs/country-pages/countries";
import { Countries } from "@/constants/countries";
import { titleName } from "./countryCopy";

// Links to every country page, so each is a click from the calculator and from the others, then
// the hub with every country (left off on the hub itself). White cards, so they read on white and
// slate-50 bands alike.
const tile =
  "flex h-full min-w-0 items-center gap-2.5 rounded-xl border bg-white skin:bg-base-100 px-3.5 py-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 skin:focus-visible:ring-primary/40";

export function CountryLinks({ current, showAll = true }: { current?: string; showAll?: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {COUNTRY_PAGES.filter((c) => c.slug !== current).map((c) => (
        <li key={c.slug} className="min-w-0">
          <Link
            href={`/duty-calculator/${c.slug}`}
            className={`${tile} border-slate-200 skin:border-base-300 font-medium text-slate-700 skin:text-base-content/80 hover:border-teal-300 skin:hover:border-primary/30 skin:hover:border-primary/40 hover:text-teal-700 skin:hover:text-primary skin:hover:text-primary`}
          >
            {/* Flags next to country names are data */}
            <span aria-hidden className="shrink-0">{Countries.find((x) => x.code === c.code)?.flag}</span>
            <span className="min-w-0 break-words">{titleName(c)} to US</span>
          </Link>
        </li>
      ))}
      {showAll && (
        <li className="min-w-0">
          <Link
            href="/duty-calculator/countries"
            className={`${tile} group border-teal-200 skin:border-primary/30 skin:border-primary/30 font-semibold text-teal-700 skin:text-primary skin:text-primary hover:border-teal-400 skin:hover:border-primary/40 hover:bg-teal-50 skin:hover:bg-primary/10 skin:hover:bg-primary/10`}
          >
            <span className="min-w-0 break-words">
              All countries: US tariffs by country{" "}
              <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        </li>
      )}
    </ul>
  );
}
