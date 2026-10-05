import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import {
  describeTotal,
  dutyAnswerSentence,
  formatDutyPct,
  formatSummaryDate,
  HtsDutySummary,
  lowestTotal,
} from "../../libs/hts-duty-summary";
import { mono } from "../ui/font";
import { heat } from "../ui/heat";
import { SectionHeader } from "../ui/SectionHeader";
import styles from "../ui/theme.module.css";

// What an import under an HTS code pays from the largest sources of US imports, on the
// /hts/[code] page. Server-rendered from the Tariff Calculator's engine.

const calculatorHref = (htsno: string, country?: string) =>
  `/duty-calculator?code=${htsno}${country ? `&country=${country}` : ""}`;

const Fact = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div className={`${styles.card} px-5 py-4`}>
    <div className={styles.eyebrow}>{label}</div>
    <div className={`${styles.num} mt-1.5 text-[24px] font-semibold tracking-tight text-[var(--dc-text)]`}>
      {value}
    </div>
    <div className="mt-0.5 text-[13px] leading-snug text-[var(--dc-text-2)]">{note}</div>
  </div>
);

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
  const withTariffs = summary.rows.filter((r) => r.additional.length > 0).length;

  return (
    <section id="duty-by-country" className="scroll-mt-6 flex flex-col gap-6">
      <SectionHeader
        kicker={`Tariffs by country · ${formatSummaryDate(summary.asOf)}`}
        title={`US Import Duty on HTS ${htsno} by Country of Origin`}
      >
        {china && (
          <>
            {dutyAnswerSentence({ productName, htsno, row: china, asOf: summary.asOf })}
            {lowest && summary.rows.length > 1 && (
              <>
                {" "}
                Of the {summary.rows.length} largest sources of US imports, the lowest total is{" "}
                {lowest.label}.
              </>
            )}
          </>
        )}
      </SectionHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        {china && (
          <Fact
            label={`Total duty from ${china.country.name}`}
            value={describeTotal(china)}
            note={china.additional.length ? `Base rate plus ${china.additional.length} additional tariff${china.additional.length === 1 ? "" : "s"}` : "Base rate only"}
          />
        )}
        {lowest && (
          <Fact
            label="Lowest total duty"
            value={formatDutyPct(lowest.pct)}
            note={lowest.label.replace(/^[^,]+, from/, "From")}
          />
        )}
        <Fact
          label="Countries with additional tariffs"
          value={`${withTariffs} of ${summary.rows.length}`}
          note="Section 232, 301, 122 and other Chapter 99 duties"
        />
      </div>

      <div className={`${styles.card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className={`w-full text-[14px] ${styles.num}`}>
            <thead>
              <tr className={`${styles.eyebrow} text-left bg-[var(--dc-surface-2)]`}>
                <th scope="col" className="px-5 sm:px-6 py-3">Country of origin</th>
                <th scope="col" className="px-4 py-3">Base rate</th>
                <th scope="col" className="px-4 py-3">Additional tariffs</th>
                <th scope="col" className="px-5 sm:px-6 py-3 text-right">Total duty</th>
              </tr>
            </thead>
            <tbody>
              {summary.rows.map((row) => (
                <tr key={row.country.code} className="border-t border-[var(--dc-border)] align-top hover:bg-[var(--dc-surface-2)]/60">
                  <th scope="row" className="px-5 sm:px-6 py-3 text-left font-medium text-[var(--dc-text)] whitespace-nowrap">
                    {/* nofollow: calculator links with parameters all canonicalize to /duty-calculator */}
                    <Link
                      href={calculatorHref(htsno, row.country.code)}
                      rel="nofollow"
                      className="hover:text-[var(--dc-accent)] hover:underline underline-offset-4"
                    >
                      <span aria-hidden="true" className="mr-2">{row.country.flag}</span>
                      {row.country.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-[var(--dc-text-2)] whitespace-nowrap">
                    {row.baseRate}
                    {row.column === "column2" && (
                      <span className="block text-[12px] text-[var(--dc-text-3)]">Column 2</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--dc-text-2)]">
                    {row.additional.length ? (
                      <ul className="flex flex-col gap-1">
                        {row.additional.map((a) => (
                          <li key={a.code} className="flex flex-wrap items-baseline gap-x-2">
                            <span>{a.program}</span>
                            <span className="font-semibold text-[var(--dc-text)]">{formatDutyPct(a.ratePct)}</span>
                            <span className={`${mono.className} text-[11px] text-[var(--dc-text-3)]`}>{a.code}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[var(--dc-text-3)]">None</span>
                    )}
                  </td>
                  <td className="px-5 sm:px-6 py-2 text-right whitespace-nowrap">
                    <span
                      className="inline-block rounded px-2.5 py-1 font-semibold text-[var(--dc-text)]"
                      style={{ background: heat(row.totalPct) }}
                    >
                      {describeTotal(row)}
                    </span>
                    {row.preference && (
                      <span className="block mt-0.5 text-[12px] text-[var(--dc-positive)]">
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

        <div className="border-t border-[var(--dc-border)] bg-[var(--dc-surface-2)] px-5 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <p className={`${styles.caption} max-w-3xl`}>
            Duties on goods entered {formatSummaryDate(summary.asOf)} at the general rate (Column 2 where it
            applies), with tariff data verified through {summary.revision.title.replace(/^Revision (\d+) \((\d{4})\)$/, "$2 HTS Revision $1")}.
            Totals are before customs fees (MPF, HMF) and any antidumping or countervailing duties.
            Some tariffs and exemptions depend on details such as metal content or end use, which the
            calculator asks about.
          </p>
          <Link href={calculatorHref(htsno)} className={`${styles.buttonPrimary} shrink-0 justify-center`}>
            Calculate Duty for Your Shipment
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
