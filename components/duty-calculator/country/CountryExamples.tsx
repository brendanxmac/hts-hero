import Link from "next/link";
import type { ExampleDuty } from "@/libs/country-pages/countryTariffs";
import { mono } from "@/components/ui/font";
import * as mk from "@/components/ui/marketing/styles";
import type { ExampleComparison } from "./countryCopy";
import { PRIMARY_MARK } from "@/components/ui/theme";
import { dutyTint } from "./dutyTint";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 skin:text-base-content/60 first:pl-6 last:pr-6";
const td = "px-4 py-4 align-top first:pl-6 last:pr-6";
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// What everyday products from this country pay, calculated for the page's date
// With `comparison`, a column for the same product from another country (China, or Vietnam on the
// China page), so the page answers "is it cheaper than China?" for each product
export function CountryExamples({
  examples,
  calculatorPath,
  countryName,
  comparison,
}: {
  examples: ExampleDuty[];
  calculatorPath: string;
  countryName: string;
  comparison: ExampleComparison | null;
}) {
  const other = (htsno: string) => comparison?.examples.find((x) => x.htsno === htsno);
  return (
    <div className={`${mk.card} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-slate-50 skin:bg-tt-soft">
            <tr>
              <th scope="col" className={th}>Product</th>
              <th scope="col" className={`${th} text-right`}>Duty on $10,000 from {countryName}</th>
              {comparison && <th scope="col" className={`${th} text-right`}>From {comparison.name}</th>}
              <th scope="col" className={th}>Tariffs charged</th>
            </tr>
          </thead>
          <tbody>
            {examples.map((e) => (
              <tr key={e.htsno} className="border-t border-slate-100 skin:border-base-300 transition-colors hover:bg-slate-50/70 skin:hover:bg-tt-soft">
                <th scope="row" className={`${td} text-left font-normal`}>
                  <Link href={`${calculatorPath}?code=${e.htsno}`} className="font-semibold text-slate-900 skin:text-base-content hover:text-teal-700 skin:hover:text-primary">
                    {e.label}
                  </Link>
                  <Link href={`/hts/${e.htsno}`} className={`${mono.className} mt-0.5 block text-xs text-slate-500 skin:text-base-content/60 hover:text-teal-700 skin:hover:text-primary`}>
                    HTS {e.htsno}
                  </Link>
                </th>
                {/* A duty total's tint is a runtime value, deeper as the rate climbs, in the theme's primary */}
                <td className={`${td} text-right`} style={{ background: dutyTint(e.totalPct, PRIMARY_MARK) }}>
                  <span className="text-base font-bold text-slate-900 skin:text-base-content">{usd(e.totalDuty)}</span>
                  {e.totalPct !== null && <span className="block text-xs text-slate-600 skin:text-base-content/70">{e.totalPct}%</span>}
                </td>
                {comparison && (
                  <td className={`${td} text-right text-slate-500 skin:text-base-content/60`}>
                    {other(e.htsno) ? (
                      <>
                        <span className="font-medium">{usd(other(e.htsno)!.totalDuty)}</span>
                        {other(e.htsno)!.totalPct !== null && <span className="block text-xs">{other(e.htsno)!.totalPct}%</span>}
                      </>
                    ) : (
                      "–"
                    )}
                  </td>
                )}
                <td className={`${td} text-slate-600 skin:text-base-content/70`}>
                  {e.tariffs.length === 0
                    ? "Base rate only"
                    : e.tariffs.map((t) => (
                        <span key={t.code} className="block py-0.5">
                          <span className={`${mono.className} text-xs text-slate-500 skin:text-base-content/60`}>{t.code}</span> {t.name}
                          {t.ratePct !== undefined && <span className="text-slate-400 skin:text-base-content/50"> · {t.ratePct}%</span>}
                        </span>
                      ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-200 skin:border-base-300 bg-slate-50 skin:bg-tt-soft px-6 py-4 text-sm text-slate-500 skin:text-base-content/60">
        Customs value $10,000, entered today by ocean, with no trade agreement claimed and no exemption questions
        answered. Fees not included. Open a product in the calculator to answer its questions.
      </p>
    </div>
  );
}
