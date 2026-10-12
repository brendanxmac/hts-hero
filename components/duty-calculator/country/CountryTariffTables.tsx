import Link from "next/link";
import type { CountryTariffs } from "@/libs/country-pages/countryTariffs";
import { mono } from "@/components/ui/font";
import { PROGRAM } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 skin:text-base-content/60 first:pl-6 last:pr-6";
const td = "px-4 py-4 align-top first:pl-6 last:pr-6";

// A program's color, when its name starts with one of the marketing programs ("Section 301 ...")
const programColor = (name: string) =>
  (Object.entries(PROGRAM) as [string, string][]).find(([program]) => name.startsWith(program))?.[1];

const HeadingLinks = ({ codes }: { codes: string[] }) => (
  <span className="flex flex-wrap gap-1.5">
    {codes.map((code) => (
      <Link
        key={code}
        href={`/hts/${code}`}
        className={`${mono.className} rounded-md bg-slate-100 skin:bg-tt-soft px-1.5 py-0.5 text-xs font-medium text-slate-700 skin:text-base-content/80 transition-colors hover:bg-teal-50 skin:hover:bg-primary/10 hover:text-teal-700 skin:hover:text-primary`}
      >
        {code}
      </Link>
    ))}
  </span>
);

// The programs written for this country, then its own Section 232 rates
export function CountryTariffTables({ tariffs, countryName }: { tariffs: CountryTariffs; countryName: string }) {
  return (
    <div className="flex flex-col gap-6">
      {tariffs.programs.length > 0 && (
        <div className={`${mk.card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 skin:bg-tt-soft">
                <tr>
                  <th scope="col" className={th}>Program</th>
                  <th scope="col" className={th}>Rate</th>
                  <th scope="col" className={th}>Covers</th>
                  <th scope="col" className={th}>Chapter 99 headings</th>
                </tr>
              </thead>
              <tbody>
                {tariffs.programs.map((p) => {
                  const color = programColor(p.name);
                  return (
                    <tr key={p.id} className="border-t border-slate-100 skin:border-base-300 transition-colors hover:bg-slate-50/70 skin:hover:bg-tt-soft">
                      <th scope="row" className={`${td} text-left font-semibold text-slate-900 skin:text-base-content`}>
                        <span className="flex items-baseline gap-2.5">
                          {/* Program colors are data colors, set inline (DESIGN_SYSTEM §14) */}
                          {color && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />}
                          {p.name}
                        </span>
                      </th>
                      <td className={`${td} font-semibold tabular-nums text-slate-900 skin:text-base-content`}>{p.rates}</td>
                      <td className={`${td} text-slate-600 skin:text-base-content/70`}>{p.allProducts ? "All products" : "Listed products"}</td>
                      <td className={td}><HeadingLinks codes={p.headings} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tariffs.dealRates.length > 0 && (
        <div className={`${mk.card} overflow-hidden`}>
          <div className="border-b border-slate-200 skin:border-base-300 px-6 py-5">
            <h3 className={mk.h3}>Section 232 rates for goods from {countryName}</h3>
            <p className={`${mk.small} mt-1`}>These replace the standard Section 232 rate for the products they cover</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 skin:bg-tt-soft">
                <tr>
                  <th scope="col" className={th}>Heading</th>
                  <th scope="col" className={th}>Covers</th>
                  <th scope="col" className={th}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {tariffs.dealRates.map((d) => (
                  <tr key={d.code} className="border-t border-slate-100 skin:border-base-300 transition-colors hover:bg-slate-50/70 skin:hover:bg-tt-soft">
                    <td className={td}><HeadingLinks codes={[d.code]} /></td>
                    <th scope="row" className={`${td} text-left font-normal text-slate-700 skin:text-base-content/80`}>{d.name}</th>
                    <td className={`${td} whitespace-nowrap font-semibold tabular-nums text-slate-900 skin:text-base-content`}>{d.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-sm leading-relaxed text-slate-600 skin:text-base-content/70">
        Section 232 tariffs on steel, aluminum, copper, autos and parts, trucks, semiconductors, wood products,
        pharmaceuticals and drones apply to goods from every country, and some programs switch others off. See{" "}
        <Link href="/blog/us-tariff-stacking-rules" className={mk.link}>how US tariffs stack</Link>.
      </p>
    </div>
  );
}
