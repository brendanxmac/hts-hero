import Link from "next/link";
import type { CountryTariffs } from "@/libs/country-pages/countryTariffs";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";

const th = `${ui.label} px-4 py-3 text-left first:pl-5 last:pr-5`;
const td = "px-4 py-3 align-top first:pl-5 last:pr-5";

const HeadingLinks = ({ codes }: { codes: string[] }) => (
  <span className="flex flex-wrap gap-x-2 gap-y-1">
    {codes.map((code) => (
      <Link key={code} href={`/hts/${code}`} className={`${mono.className} text-xs text-primary hover:underline`}>
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
        <div className={ui.card}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-base-200">
                <tr>
                  <th scope="col" className={th}>Program</th>
                  <th scope="col" className={th}>Rate</th>
                  <th scope="col" className={th}>Covers</th>
                  <th scope="col" className={th}>Chapter 99 headings</th>
                </tr>
              </thead>
              <tbody>
                {tariffs.programs.map((p) => (
                  <tr key={p.id} className="border-t border-base-300 hover:bg-base-200/60">
                    <th scope="row" className={`${td} text-left font-medium text-base-content`}>{p.name}</th>
                    <td className={`${td} tabular-nums text-base-content`}>{p.rates}</td>
                    <td className={`${td} text-base-content/70`}>{p.allProducts ? "All products" : "Listed products"}</td>
                    <td className={td}><HeadingLinks codes={p.headings} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tariffs.dealRates.length > 0 && (
        <div className={ui.card}>
          <div className={ui.cardHeader}>
            <div>
              <h3 className={ui.cardTitle}>Section 232 rates for goods from {countryName}</h3>
              <p className={ui.caption}>These replace the standard Section 232 rate for the products they cover</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-base-200">
                <tr>
                  <th scope="col" className={th}>Heading</th>
                  <th scope="col" className={th}>Covers</th>
                  <th scope="col" className={th}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {tariffs.dealRates.map((d) => (
                  <tr key={d.code} className="border-t border-base-300 hover:bg-base-200/60">
                    <td className={td}><HeadingLinks codes={[d.code]} /></td>
                    <th scope="row" className={`${td} text-left font-normal text-base-content`}>{d.name}</th>
                    <td className={`${td} whitespace-nowrap tabular-nums text-base-content`}>{d.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className={`${ui.bodySm} max-w-prose`}>
        Section 232 tariffs on steel, aluminum, copper, autos and parts, trucks, semiconductors, wood products,
        pharmaceuticals and drones apply to goods from every country, and some programs switch others off. See{" "}
        <Link href="/blog/us-tariff-stacking-rules" className={ui.link}>how US tariffs stack</Link>.
      </p>
    </div>
  );
}
