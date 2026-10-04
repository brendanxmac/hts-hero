import Link from "next/link";
import {
  describeTotal,
  dutyAnswerSentence,
  formatDutyPct,
  formatSummaryDate,
  HtsDutySummary,
  lowestTotal,
} from "../../libs/hts-duty-summary";

// What an import under an HTS code pays from the largest sources of US imports, on the
// /hts/[code] page. Server-rendered from the Tariff Calculator's engine.

const calculatorHref = (htsno: string, country?: string) =>
  `/duty-calculator?code=${htsno}${country ? `&country=${country}` : ""}`;

export function DutyByCountry({
  htsno,
  productName,
  summary,
}: {
  htsno: string;
  productName: string;
  summary: HtsDutySummary;
}) {
  const china = summary.rows.find((r) => r.country.code === "CN") ?? summary.rows[0];
  const lowest = lowestTotal(summary.rows);

  return (
    <section
      id="duty-by-country"
      className="rounded-2xl border border-base-content/20 bg-base-100 overflow-hidden shadow-sm"
    >
      <div className="px-6 py-5 border-b border-base-content/20 flex flex-col gap-3">
        <h2 className="text-base md:text-lg font-bold text-base-content">
          US Import Duty on HTS {htsno} by Country of Origin
        </h2>
        {china && (
          <p className="text-sm md:text-base text-base-content/80 leading-relaxed max-w-4xl">
            {dutyAnswerSentence({ productName, htsno, row: china, asOf: summary.asOf })}
            {lowest && summary.rows.length > 1 && (
              <>
                {" "}
                Of the {summary.rows.length} largest sources of US imports, the lowest total is{" "}
                {lowest.label}.
              </>
            )}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-base-content/50 bg-base-200/40">
              <th scope="col" className="px-6 py-3 font-semibold">Country of origin</th>
              <th scope="col" className="px-4 py-3 font-semibold">Base rate</th>
              <th scope="col" className="px-4 py-3 font-semibold">Additional tariffs</th>
              <th scope="col" className="px-6 py-3 font-semibold text-right">Total duty</th>
            </tr>
          </thead>
          <tbody>
            {summary.rows.map((row) => (
              <tr key={row.country.code} className="border-t border-base-content/10 align-top">
                <th scope="row" className="px-6 py-3 font-semibold text-base-content whitespace-nowrap">
                  {/* nofollow: calculator links with parameters all canonicalize to /duty-calculator */}
                  <Link
                    href={calculatorHref(htsno, row.country.code)}
                    rel="nofollow"
                    className="hover:text-primary hover:underline"
                  >
                    <span aria-hidden="true" className="mr-2">{row.country.flag}</span>
                    {row.country.name}
                  </Link>
                </th>
                <td className="px-4 py-3 text-base-content/70 whitespace-nowrap">
                  {row.baseRate}
                  {row.column === "column2" && (
                    <span className="block text-xs text-base-content/40">Column 2</span>
                  )}
                </td>
                <td className="px-4 py-3 text-base-content/70">
                  {row.additional.length ? (
                    <ul className="flex flex-col gap-0.5">
                      {row.additional.map((a) => (
                        <li key={a.code}>
                          {a.program}{" "}
                          <span className="font-semibold text-base-content">{formatDutyPct(a.ratePct)}</span>{" "}
                          <span className="font-mono text-xs text-base-content/40">{a.code}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-base-content/40">None</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right whitespace-nowrap">
                  <span className="font-bold text-base-content">{describeTotal(row)}</span>
                  {row.preference && (
                    <span className="block text-xs text-success">
                      {row.preference.totalPct !== null
                        ? `${formatDutyPct(row.preference.totalPct)} with ${row.preference.name}`
                        : `Lower with ${row.preference.name}`}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-base-content/10 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <p className="text-xs text-base-content/50 leading-relaxed max-w-3xl">
          Duties on goods entered {formatSummaryDate(summary.asOf)} at the general rate (Column 2 where it
          applies), with tariff data verified through {summary.revision.title.replace(/^Revision (\d+) \((\d{4})\)$/, "$2 HTS Revision $1")}.
          Totals are before customs fees (MPF, HMF) and any antidumping or countervailing duties.
          Some tariffs and exemptions depend on details such as metal content or end use, which the
          calculator asks about.
        </p>
        <Link href={calculatorHref(htsno)} className="btn btn-primary shrink-0">
          Calculate Duty for Your Shipment <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </section>
  );
}
