import Link from "next/link";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";
import { Countries } from "@/constants/countries";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { CENSUS_NOTICE } from "@/components/duty-calculator/lib/census";
import { formatImportValue } from "@/components/duty-calculator/lib/usImportsData";
import { countryPageByCode } from "@/libs/country-pages/countries";
import { countryTopImports, TOP_IMPORTS_PRIOR, TOP_IMPORTS_YEAR } from "@/libs/country-pages/topImports";
import { getHtsElementsServer } from "@/libs/hts-server";

// What the US imports most from a country (Census, by HTS code), with the duty each pays today:
// the same figures as the country's calculator page, for a post about that country's tariffs.
// In MDX: <CountryImports country="IN" />, optionally limit={5}
export async function CountryImports({ country, limit = 10 }: { country: string; limit?: number }) {
  const elements = await getHtsElementsServer();
  const rows = countryTopImports(country, elements, limit);
  if (!rows.length) return null;
  const name = Countries.find((c) => c.code === country)?.name ?? country;
  const page = countryPageByCode(country);
  const calculatorPath = page ? `/duty-calculator/${page.slug}` : "/duty-calculator";

  return (
    <div className={ui.card}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-base-200">
            <tr>
              <th scope="col" className={`${ui.label} px-4 py-3 pl-5 text-left`}>Product</th>
              <th scope="col" className={`${ui.label} px-4 py-3 text-right`}>US imports, {TOP_IMPORTS_YEAR}</th>
              <th scope="col" className={`${ui.label} px-4 py-3 text-right`}>vs {TOP_IMPORTS_PRIOR}</th>
              <th scope="col" className={`${ui.label} px-4 py-3 pr-5 text-right`}>Duty today</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const trend = r.prior > 0 ? (r.value - r.prior) / r.prior : null;
              return (
                <tr key={r.htsno} className="border-t border-base-300 hover:bg-base-200/60">
                  <th scope="row" className="px-4 py-3 pl-5 text-left font-normal">
                    <Link href={`${calculatorPath}?code=${r.htsno}`} className="font-medium text-base-content hover:text-primary">
                      {r.label}
                    </Link>
                    <Link href={`/hts/${r.htsno}`} className={`${mono.className} mt-0.5 block text-xs text-base-content/60 hover:text-primary`}>
                      HTS {r.htsno}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-right font-medium text-base-content">
                    {formatImportValue(r.value)}
                    {r.sharePct !== null && <span className="block text-xs font-normal text-base-content/60">{r.sharePct}% of all</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {trend === null ? (
                      <span className="text-xs text-base-content/60">New</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-success" : "text-base-content/60"}`}>
                        {trend >= 0 ? <ArrowTrendingUpIcon className="h-3.5 w-3.5" aria-hidden /> : <ArrowTrendingDownIcon className="h-3.5 w-3.5" aria-hidden />}
                        {Math.abs(Math.round(trend * 100))}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 pr-5 text-right">
                    <span className="font-semibold text-base-content">{r.total}</span>
                    {r.preference && (
                      <span className="block text-xs text-base-content/60">
                        {r.preference.total} with {r.preference.name}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={`${ui.cardFooter} ${ui.caption}`}>
        US general imports from {name} by HTS code, from the U.S. Census Bureau, without fuels and precious metals.
        Duty on a $10,000 ocean shipment entered today, worked out by the{" "}
        <Link href={calculatorPath} className={ui.link}>
          {page ? `${name} tariff calculator` : "Tariff Calculator"}
        </Link>
        . {CENSUS_NOTICE}
      </p>
    </div>
  );
}
