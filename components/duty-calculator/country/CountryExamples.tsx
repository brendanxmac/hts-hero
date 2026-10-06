import Link from "next/link";
import type { ExampleDuty } from "@/libs/country-pages/countryTariffs";
import { heat } from "@/components/ui/theme";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";

const th = `${ui.label} px-4 py-3 text-left first:pl-5 last:pr-5`;
const td = "px-4 py-3 align-top first:pl-5 last:pr-5";
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// What everyday products from this country pay, calculated for the page's date
export function CountryExamples({ examples, calculatorPath }: { examples: ExampleDuty[]; calculatorPath: string }) {
  return (
    <div className={ui.card}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-base-200">
            <tr>
              <th scope="col" className={th}>Product</th>
              <th scope="col" className={`${th} text-right`}>Duty on $10,000</th>
              <th scope="col" className={th}>Tariffs charged</th>
            </tr>
          </thead>
          <tbody>
            {examples.map((e) => (
              <tr key={e.htsno} className="border-t border-base-300 hover:bg-base-200/60">
                <th scope="row" className={`${td} text-left font-normal`}>
                  <Link href={`${calculatorPath}?code=${e.htsno}`} className="font-medium text-base-content hover:text-primary">
                    {e.label}
                  </Link>
                  <Link href={`/hts/${e.htsno}`} className={`${mono.className} block text-xs text-base-content/60 hover:text-primary`}>
                    HTS {e.htsno}
                  </Link>
                </th>
                {/* A duty total's tint is a runtime value from the theme's heat scale */}
                <td className={`${td} text-right`} style={{ background: heat(e.totalPct) }}>
                  <span className="font-semibold text-base-content">{usd(e.totalDuty)}</span>
                  {e.totalPct !== null && <span className="block text-xs text-base-content/60">{e.totalPct}%</span>}
                </td>
                <td className={`${td} text-base-content/70`}>
                  {e.tariffs.length === 0
                    ? "Base rate only"
                    : e.tariffs.map((t) => (
                        <span key={t.code} className="block">
                          <span className={`${mono.className} text-xs`}>{t.code}</span> {t.name}
                          {t.ratePct !== undefined && <span className="text-base-content/60"> · {t.ratePct}%</span>}
                        </span>
                      ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`${ui.cardFooter} ${ui.caption}`}>
        Customs value $10,000, entered today by ocean, with no trade agreement claimed and no exemption questions
        answered. Fees not included. Open a product in the calculator to answer its questions.
      </p>
    </div>
  );
}
