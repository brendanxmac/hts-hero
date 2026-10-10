import Link from "next/link";
import { COUNTRY_PAGES } from "@/libs/country-pages/countries";
import { Countries } from "@/constants/countries";
import * as ui from "@/components/ui/styles";
import { titleName } from "./countryCopy";

// Links to every country page, so each is a click from the calculator and from the others, then
// the hub with every country (left off on the hub itself)
export function CountryLinks({ current, showAll = true }: { current?: string; showAll?: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {COUNTRY_PAGES.filter((c) => c.slug !== current).map((c) => (
        <li key={c.slug}>
          <Link
            href={`/duty-calculator/${c.slug}`}
            className={`${ui.card} flex items-center gap-2 px-3 py-2 text-sm font-medium text-base-content/70 transition-colors hover:border-primary/40 hover:text-primary`}
          >
            {/* Flags next to country names are data */}
            <span aria-hidden>{Countries.find((x) => x.code === c.code)?.flag}</span>
            {titleName(c)} to US
          </Link>
        </li>
      ))}
      {showAll && (
        <li>
          <Link
            href="/duty-calculator/countries"
            className={`${ui.card} flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/40`}
          >
            All countries: US tariffs by country →
          </Link>
        </li>
      )}
    </ul>
  );
}
