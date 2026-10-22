import Link from "next/link";
import type { ExampleDuty } from "@/libs/country-pages/countryTariffs";
import { mono } from "@/components/ui/font";
import * as mk from "@/components/ui/marketing/styles";
import type { ExampleComparison } from "./countryCopy";
import { PRIMARY_MARK } from "@/components/ui/theme";
import { dutyTint } from "./dutyTint";
import { RowHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table/Table";
import { ExcludesBase } from "@/components/duty-calculator/results/ExcludesBase";

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
      <Table framed={false} valign="top">
        <THead>
          <Tr>
            <Th>Product</Th>
            <Th align="right">Duty on $10,000 from {countryName}</Th>
            {comparison && <Th align="right">From {comparison.name}</Th>}
            <Th>Tariffs charged</Th>
          </Tr>
        </THead>
        <TBody>
          {examples.map((e) => (
            <Tr key={e.htsno}>
              <RowHeader>
                <Link href={`${calculatorPath}?code=${e.htsno}`} className="font-semibold text-slate-900 skin:text-base-content hover:text-teal-700 skin:hover:text-primary">
                  {e.label}
                </Link>
                <Link href={`/hts/${e.htsno}`} className={`${mono.className} mt-0.5 block text-xs text-slate-500 skin:text-base-content/60 hover:text-teal-700 skin:hover:text-primary`}>
                  HTS {e.htsno}
                </Link>
              </RowHeader>
              {/* A duty total's tint is a runtime value, deeper as the rate climbs, in the theme's primary
                  (a plain cell in the shared look, since Td takes no style) */}
              <Td align="right" style={{ background: dutyTint(e.totalPct, PRIMARY_MARK) }}>
                <span className="text-base font-bold text-slate-900 skin:text-base-content">{usd(e.totalDuty)}</span>
                {e.totalPct !== null && <span className="block text-xs text-slate-600 skin:text-base-content/70">{e.totalPct}%</span>}
                {e.baseNotCalculated && <ExcludesBase className="block" />}
              </Td>
              {comparison && (
                <Td align="right" className="text-slate-500 skin:text-base-content/60">
                  {other(e.htsno) ? (
                    <>
                      <span className="font-medium">{usd(other(e.htsno)!.totalDuty)}</span>
                      {other(e.htsno)!.totalPct !== null && <span className="block text-xs">{other(e.htsno)!.totalPct}%</span>}
                      {other(e.htsno)!.baseNotCalculated && <ExcludesBase className="block" />}
                    </>
                  ) : (
                    "–"
                  )}
                </Td>
              )}
              <Td className="text-slate-600 skin:text-base-content/70">
                {e.tariffs.length === 0
                  ? "Base rate only"
                  : e.tariffs.map((t) => (
                      <span key={t.code} className="block py-0.5">
                        <span className={`${mono.className} text-xs text-slate-500 skin:text-base-content/60`}>{t.code}</span> {t.name}
                        {t.ratePct !== undefined && <span className="text-slate-400 skin:text-base-content/60"> · {t.ratePct}%</span>}
                      </span>
                    ))}
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
      <p className="border-t border-slate-200 skin:border-base-300 bg-slate-50 skin:bg-tt-soft px-6 py-4 text-sm text-slate-500 skin:text-base-content/60">
        Customs value $10,000, entered today by ocean, with no trade agreement claimed and no exemption questions
        answered. Fees not included. Open a product in the calculator to answer its questions.
      </p>
    </div>
  );
}
