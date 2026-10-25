import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import {
  describeTotal,
  dutyAnswerSentence,
  formatDutyPct,
  formatSummaryDate,
  HtsDutySummary,
  lowestTotal,
} from "@/libs/hts-duty-summary";
import { mono } from "@/components/ui/font";
import { heat } from "@/components/ui/theme";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { countryPageByCode } from "@/libs/country-pages/countries";
import { RowHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table/Table";

// What an import under an HTS code pays from the largest sources of US imports, on the
// /hts/[code] page. Server-rendered from the Tariff Calculator's engine.

const calculatorHref = (htsno: string, country?: string) =>
  `/duty-calculator?code=${htsno}${country ? `&country=${country}` : ""}`;

// A row's anchor, so answers and links can point at one country: #from-vietnam
export const countryAnchor = (name: string) =>
  `from-${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

const Fact = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div className={`${tt.panel} px-6 py-5`}>
    <div className={tt.eyebrow()}>{label}</div>
    <div className={`${tt.metric} mt-2`}>{value}</div>
    <div className={`${ui.bodySm} mt-1.5`}>{note}</div>
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
    <section id="duty-by-country" className={ui.section}>
      <SectionHeader wide
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

      <div className="grid gap-4 sm:grid-cols-3">
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
          note="Section 232, 301 and other Chapter 99 duties"
        />
      </div>

      <div className={`${tt.panel} overflow-hidden`}>
        <Table framed={false} valign="top">
          <THead>
            <Tr>
              <Th>Country of origin</Th>
              <Th>Base rate</Th>
              <Th>Additional tariffs</Th>
              <Th align="right">Total duty</Th>
            </Tr>
          </THead>
          <TBody>
            {summary.rows.map((row) => (
              // The row itself is the anchor (#from-vietnam)
              <Tr key={row.country.code} id={countryAnchor(row.country.name)} className="scroll-mt-6 transition-colors hover:bg-tt-soft">
                <RowHeader className="whitespace-nowrap">
                  {/* A country with its own calculator page links there (a link search engines
                      follow); others open the calculator with the code, which canonicalizes to
                      /duty-calculator, so nofollow */}
                  {countryPageByCode(row.country.code) ? (
                    <Link
                      href={`/duty-calculator/${countryPageByCode(row.country.code)!.slug}`}
                      title={`${row.country.name} to US tariff calculator`}
                      className="font-medium text-base-content hover:underline hover:text-primary"
                    >
                      <span aria-hidden="true" className="mr-2">{row.country.flag}</span>
                      {row.country.name}
                    </Link>
                  ) : (
                    <Link
                      href={calculatorHref(htsno, row.country.code)}
                      rel="nofollow"
                      className="font-medium text-base-content hover:underline hover:text-primary"
                    >
                      <span aria-hidden="true" className="mr-2">{row.country.flag}</span>
                      {row.country.name}
                    </Link>
                  )}
                </RowHeader>
                <Td muted className="whitespace-nowrap">
                  {row.baseRate}
                  {row.baseNotCalculated && <span className={`${ui.caption} block`}>Not calculated</span>}
                  {row.column === "column2" && (
                    <span className={`${ui.caption} block`}>Column 2</span>
                  )}
                </Td>
                <Td muted>
                  {row.additional.length ? (
                    <ul className="flex flex-col gap-1">
                      {row.additional.map((a) => (
                        <li key={a.code} className="flex flex-wrap items-baseline gap-x-2">
                          <span>{a.program}</span>
                          <span className="font-semibold text-base-content">{formatDutyPct(a.ratePct)}</span>
                          <span className={`${mono.className} ${ui.caption}`}>{a.code}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-base-content/60">None</span>
                  )}
                </Td>
                {/* A step less padding than the other cells, so the pill's text lines up with theirs */}
                <Td align="right" className="whitespace-nowrap py-2.5!">
                  {/* The total opens this code from this country in the calculator */}
                  <Link
                    href={calculatorHref(htsno, row.country.code)}
                    rel="nofollow"
                    title={`Calculate HTS ${htsno} from ${row.country.name}`}
                    className="inline-block rounded-full px-3 py-1 font-semibold text-base-content hover:ring-1 hover:ring-primary/40"
                    style={{ background: heat(row.totalPct) }}
                  >
                    {describeTotal(row)}
                  </Link>
                  {row.preference && (
                    <span className="block mt-1 text-xs font-medium text-success">
                      {row.preference.totalPct !== null
                        ? `${formatDutyPct(row.preference.totalPct)} with ${row.preference.name}`
                        : `Lower with ${row.preference.name}`}
                    </span>
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>

        {/* The same rates as sentences, one per country: what an answer engine can quote whole
            for "the tariff on X from Vietnam", not only China */}
        <details className="border-t border-base-300 px-5 sm:px-6 py-3 group">
          <summary className={`${tt.eyebrow()} cursor-pointer select-none`}>Duty from each country, in words</summary>
          <ul className={`${ui.bodySm} mt-3 flex flex-col gap-2`}>
            {summary.rows.map((row) => (
              <li key={row.country.code}>
                {dutyAnswerSentence({ productName, htsno, row, asOf: summary.asOf })}
                {row.preference && row.preference.totalPct !== null
                  ? ` With ${row.preference.name}, qualifying goods pay ${formatDutyPct(row.preference.totalPct)}.`
                  : ""}
              </li>
            ))}
          </ul>
        </details>

        <div className={`border-t border-base-300 bg-tt-soft px-6 py-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4`}>
          <p className={`${ui.caption} leading-relaxed`}>
            Duties on goods entered {formatSummaryDate(summary.asOf)} at the general rate (Column 2 where it
            applies), with tariff data verified through {summary.revision.title.replace(/^Revision (\d+) \((\d{4})\)$/, "$2 HTS Revision $1")}.
            Totals are before customs fees (MPF, HMF) and any antidumping or countervailing duties
            (AD/CVD); with a free account, the calculator checks the AD/CVD cases that may cover your import.
            Some tariffs and exemptions depend on details such as metal content or end use, which the
            calculator asks about.{" "}
            <Link href="/duty-calculator/countries" className={ui.link}>
              See US tariffs for every country
            </Link>
            .
          </p>
          <Link href={calculatorHref(htsno)} className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`}>
            Calculate Duty for Your Shipment
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
