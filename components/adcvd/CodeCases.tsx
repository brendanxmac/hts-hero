import { Countries } from "@/constants/countries"
import * as tt from "@/components/ui/styles/tracker"
import type { CodeCase } from "@/libs/adcvd/public"
import { frDocUrl } from "@/libs/adcvd/types"

// On an HTS code page: the antidumping and countervailing duty cases whose scope lists the code
// (or a heading above it), by product, with the countries each covers. A heads-up, not a ruling:
// the scope's written description decides, and only goods from the named countries.

const MAX = 6

const countryList = (codes: string[]) => {
  const names = codes.map((c) => Countries.find((x) => x.code === c)?.name ?? c)
  return names.length <= 3 ? names.join(", ") : `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`
}

export function CodeCases({ cases, htsno }: { cases: CodeCase[]; htsno: string }) {
  if (!cases.length) return null
  return (
    <section aria-labelledby="code-adcvd" className={`${tt.panel} flex flex-col gap-4 p-6`}>
      <div className="flex flex-col gap-1">
        <h2 id="code-adcvd" className={tt.eyebrow("warning")}>
          AD/CVD Cases
        </h2>
        <p className="text-xs text-base-content/60">
          Antidumping or countervailing duty orders and investigations whose scope lists {htsno} or a related code. They apply only to goods from the countries named, and
          only if the product fits the scope&apos;s description.
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {cases.slice(0, MAX).map((c) => (
          <li key={c.cases.join()} className="flex flex-col gap-0.5">
            <span className="text-sm font-medium leading-snug text-base-content">
              {c.product}
              {c.investigation && <span className="ml-2 text-xs font-normal text-warning">Investigation</span>}
            </span>
            <span className="text-xs text-base-content/60">From {countryList(c.countries)}</span>
            {c.scope_doc && (
              <a href={frDocUrl(c.scope_doc)} target="_blank" rel="noopener" className="text-xs text-primary underline-offset-4 hover:underline">
                Scope in the Federal Register
              </a>
            )}
          </li>
        ))}
      </ul>
      {cases.length > MAX && <p className="text-xs text-base-content/60">And {cases.length - MAX} more. The duty calculator flags the ones for your country of origin.</p>}
    </section>
  )
}
