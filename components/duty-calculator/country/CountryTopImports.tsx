import Link from "next/link";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as mk from "@/components/ui/marketing/styles";
import { CENSUS_NOTICE } from "../lib/census";
import { formatImportValue } from "../lib/usImportsData";
import type { TopImport } from "@/libs/country-pages/topImports";

// What the US imports most from the page's country (Census, by HTS code), each with its share of
// everything the US imports from there, the change on the year before, and the duty it pays
// today. Each product opens the calculator on this page; its code links to the HTS page.

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 skin:text-base-content/60 first:pl-6 last:pr-6";
const td = "px-4 py-4 align-top first:pl-6 last:pr-6";

export function CountryTopImports({
  rows,
  countryName,
  calculatorPath,
  year,
  prior,
}: {
  rows: TopImport[];
  countryName: string;
  calculatorPath: string;
  year: number;
  prior: number;
}) {
  return (
    <div className={`${mk.card} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-slate-50 skin:bg-tt-soft">
            <tr>
              <th scope="col" className={th}>Product</th>
              <th scope="col" className={`${th} text-right`}>US imports, {year}</th>
              <th scope="col" className={`${th} text-right`}>Share</th>
              <th scope="col" className={`${th} text-right`}>vs {prior}</th>
              <th scope="col" className={`${th} text-right`}>Duty today</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const trend = r.prior > 0 ? (r.value - r.prior) / r.prior : null;
              return (
                <tr key={r.htsno} className="border-t border-slate-100 skin:border-base-300 transition-colors hover:bg-slate-50/70 skin:hover:bg-tt-soft">
                  <th scope="row" className={`${td} text-left font-normal`}>
                    <Link href={`${calculatorPath}?code=${r.htsno}`} className="font-semibold text-slate-900 skin:text-base-content hover:text-teal-700 skin:hover:text-primary">
                      {r.label}
                    </Link>
                    <Link href={`/hts/${r.htsno}`} className={`${mono.className} mt-0.5 block text-xs text-slate-500 skin:text-base-content/60 hover:text-teal-700 skin:hover:text-primary`}>
                      HTS {r.htsno}
                    </Link>
                  </th>
                  <td className={`${td} text-right font-semibold text-slate-900 skin:text-base-content`}>{formatImportValue(r.value)}</td>
                  <td className={`${td} text-right text-slate-600 skin:text-base-content/70`}>{r.sharePct === null ? "—" : `${r.sharePct}%`}</td>
                  <td className={`${td} text-right`}>
                    {trend === null ? (
                      <span className="text-xs text-slate-500 skin:text-base-content/60">New</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-700 skin:text-success" : "text-slate-500 skin:text-base-content/60"}`}>
                        {trend >= 0 ? <ArrowTrendingUpIcon className="h-3.5 w-3.5" aria-hidden /> : <ArrowTrendingDownIcon className="h-3.5 w-3.5" aria-hidden />}
                        {Math.abs(Math.round(trend * 100))}%
                      </span>
                    )}
                  </td>
                  <td className={`${td} text-right`}>
                    <span className="text-base font-bold text-slate-900 skin:text-base-content">{r.total}</span>
                    {r.preference && <span className="block text-xs text-slate-600 skin:text-base-content/70">{r.preference.total} with {r.preference.name}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-200 skin:border-base-300 bg-slate-50 skin:bg-tt-soft px-6 py-4 text-sm text-slate-500 skin:text-base-content/60">
        US general imports from {countryName} by HTS code, from the U.S. Census Bureau, without fuels and precious metals. Share is of all US imports from
        {" "}{countryName}. Duty on a $10,000 ocean shipment entered today. {CENSUS_NOTICE}
      </p>
    </div>
  );
}
