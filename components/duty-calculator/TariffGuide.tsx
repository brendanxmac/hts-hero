import Link from "next/link";
import { POPULAR_HTS_CODES } from "../../constants/popular-hts-codes";
import { DutyCalculatorContent } from "../../libs/duty-calculator-content";
import { formatDutyPct, formatSummaryDate } from "../../libs/hts-duty-summary";
import { CHANGELOG_PATH } from "./Changelog";
import { formatMoney, formatPct } from "./format";
import styles from "./theme.module.css";

// Below the calculator on /duty-calculator: today's rates for common imports, how a duty is
// worked out, popular lookups, where the data comes from and the FAQ. Server-rendered so
// search engines and AI crawlers can read it; the calculator itself runs in the browser.

const sectionClass =
  "rounded-2xl border border-[var(--dc-border)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow)]";
const h2Class = "text-[20px] sm:text-[22px] font-semibold tracking-tight text-[var(--dc-text)]";
const bodyClass = "text-[15px] leading-relaxed text-[var(--dc-text-2)]";

// The first few products from each category
const POPULAR_LOOKUPS = POPULAR_HTS_CODES.flatMap((c) => c.codes.slice(0, 3));

export const TariffGuide = ({
  content,
  faqs,
}: {
  content: DutyCalculatorContent;
  faqs: { question: string; answer: string }[];
}) => {
  const { matrix, example, asOf, revisionTitle } = content;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 pb-20 flex flex-col gap-8">
      {matrix.rows.length > 0 && (
        <section id="tariff-rates-by-country" className={`${sectionClass} overflow-hidden`}>
          <div className="p-5 sm:p-6 flex flex-col gap-2 border-b border-[var(--dc-border)]">
            <h2 className={h2Class}>US tariff rates by country: what common imports pay today</h2>
            <p className={`${bodyClass} max-w-[80ch]`}>
              Total US import duty, base rate plus every additional tariff, on goods entered{" "}
              {formatSummaryDate(asOf)} from the {matrix.rows.length} largest sources of US imports.
              The same product can pay very different rates depending on where it&apos;s made.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className={`w-full text-[14px] ${styles.num}`}>
              <thead>
                <tr className="bg-[var(--dc-surface-2)] text-left text-[12px] uppercase tracking-wider text-[var(--dc-text-3)]">
                  <th scope="col" className="sticky left-0 z-10 bg-[var(--dc-surface-2)] px-5 sm:px-6 py-3 font-semibold">Country of origin</th>
                  {matrix.products.map((p) => (
                    <th key={p.code} scope="col" className="px-3 py-3 font-semibold text-right whitespace-nowrap">
                      <Link href={`/hts/${p.code}`} className="hover:text-[var(--dc-accent)] hover:underline">
                        {p.label}
                      </Link>
                      <span className="block font-mono text-[11px] normal-case tracking-normal font-normal">
                        {p.code}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.rows.map((row) => (
                  <tr key={row.country.code} className="border-t border-[var(--dc-border)]">
                    {/* Pinned so the country stays in view while the products scroll on small screens */}
                    <th scope="row" className="sticky left-0 z-10 bg-[var(--dc-surface)] px-5 sm:px-6 py-2.5 text-left font-medium text-[var(--dc-text)] whitespace-nowrap">
                      <span aria-hidden="true" className="mr-2">{row.country.flag}</span>
                      {row.country.name}
                    </th>
                    {row.cells.map((cell, i) => (
                      <td key={matrix.products[i].code} className="px-3 py-2.5 text-right whitespace-nowrap">
                        <span className="font-semibold text-[var(--dc-text)]">{cell.total}</span>
                        {cell.preference && (
                          <span className="block text-[11.5px] text-[var(--dc-positive)]">{cell.preference}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 sm:px-6 py-4 border-t border-[var(--dc-border)] text-[12.5px] leading-relaxed text-[var(--dc-text-3)]">
            General rates (Column 2 where it applies), before customs fees and any antidumping or
            countervailing duties, with tariff data verified through {revisionTitle}. Green figures are
            the total when the goods qualify for that trade preference. Some tariffs and exemptions
            depend on details such as metal content, which the calculator asks about.
          </p>
        </section>
      )}

      {example && (
        <section id="how-duty-is-calculated" className={`${sectionClass} p-5 sm:p-6 grid gap-6 lg:grid-cols-2 lg:gap-10`}>
          <div className="flex flex-col gap-3">
            <h2 className={h2Class}>How US import duty is calculated</h2>
            <ol className={`${bodyClass} list-decimal pl-5 flex flex-col gap-2`}>
              <li>
                <strong className="text-[var(--dc-text)]">Find the HTS code.</strong> Every import is
                classified under a 10-digit code in the Harmonized Tariff Schedule.
              </li>
              <li>
                <strong className="text-[var(--dc-text)]">Apply the base rate.</strong> Column 1 General
                for most countries, a Special rate when the goods qualify for a trade agreement such as
                USMCA, or Column 2 for Cuba, North Korea, Russia and Belarus.
              </li>
              <li>
                <strong className="text-[var(--dc-text)]">Add the Chapter 99 tariffs.</strong> Section
                232, 301, 122 and other additional duties stack on top, depending on the product, the
                country of origin and the entry date, unless an exemption applies.
              </li>
              <li>
                <strong className="text-[var(--dc-text)]">Add customs fees.</strong> The Merchandise
                Processing Fee on every formal entry, and the Harbor Maintenance Fee on ocean shipments.
              </li>
            </ol>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[15px] font-semibold text-[var(--dc-text)]">
              Example: {formatMoney(example.customsValue)} of {example.productName} (HTS {example.htsno})
              from {example.countryName}, entered {formatSummaryDate(asOf)} by ocean
            </h3>
            <table className={`w-full text-[14px] ${styles.num}`}>
              <tbody>
                <tr className="border-t border-[var(--dc-border)]">
                  <td className="py-2 pr-3 text-[var(--dc-text-2)]">Base rate ({example.baseRate})</td>
                  <td className="py-2 text-right">{formatMoney(example.baseAmount)}</td>
                </tr>
                {example.lines.map((l) => (
                  <tr key={l.code} className="border-t border-[var(--dc-border)]">
                    <td className="py-2 pr-3 text-[var(--dc-text-2)]">
                      {l.program} ({formatDutyPct(l.ratePct)}){" "}
                      <span className="font-mono text-[12px] text-[var(--dc-text-3)]">{l.code}</span>
                    </td>
                    <td className="py-2 text-right">{formatMoney(l.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t border-[var(--dc-border-strong)] font-semibold">
                  <td className="py-2 pr-3">Total duty</td>
                  <td className="py-2 text-right">{formatMoney(example.totalDuty)}</td>
                </tr>
                {example.fees.map((f) => (
                  <tr key={f.name} className="border-t border-[var(--dc-border)]">
                    <td className="py-2 pr-3 text-[var(--dc-text-2)]">
                      {f.name} ({formatPct(f.ratePct)})
                    </td>
                    <td className="py-2 text-right">{formatMoney(f.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t border-[var(--dc-border-strong)] font-semibold">
                  <td className="py-2 pr-3">Total duty and fees</td>
                  <td className="py-2 text-right">{formatMoney(example.totalDuty + example.totalFees)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section id="popular-lookups" className={`${sectionClass} p-5 sm:p-6 flex flex-col gap-4`}>
        <h2 className={h2Class}>Popular duty lookups</h2>
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {POPULAR_LOOKUPS.map((c) => (
            <li key={c.code}>
              <Link href={`/hts/${c.code}`} className="group flex items-baseline gap-2 text-[14.5px]">
                <span className="text-[var(--dc-text)] group-hover:text-[var(--dc-accent)] group-hover:underline">
                  Duty on {c.label.charAt(0).toLowerCase()}{c.label.slice(1)}
                </span>
                <span className="font-mono text-[12px] text-[var(--dc-text-3)]">{c.code}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="sources" className={`${sectionClass} p-5 sm:p-6 flex flex-col gap-3`}>
        <h2 className={h2Class}>Where the rates come from</h2>
        <p className={`${bodyClass} max-w-[80ch]`}>
          Every rate comes from the official Harmonized Tariff Schedule of the United States published
          by the US International Trade Commission: the base rates in each HTS line, and the
          additional duties, exemptions and their interactions in Chapter 99 and its notes. Each HTS
          revision&apos;s changes are entered with the dates they take effect, so you can calculate
          any entry date, past or future. Tariff data is verified through {revisionTitle}, and every
          change is listed in the{" "}
          <Link href={CHANGELOG_PATH} className={styles.link}>calculator changelog</Link>.
        </p>
        <p className={`${bodyClass} max-w-[80ch]`}>
          Not included: antidumping and countervailing duties, which are set case by case for
          specific producers, and quota-related charges. Need an HTS code first?{" "}
          <Link href="/explore" className={styles.link}>Search the HTS</Link>.
        </p>
      </section>

      <section id="faq" className={`${sectionClass} p-5 sm:p-6 flex flex-col gap-2`}>
        <h2 className={`${h2Class} mb-2`}>Frequently asked questions</h2>
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group border-t border-[var(--dc-border)] py-3 first-of-type:border-t-0">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-[15.5px] font-semibold text-[var(--dc-text)]">
              <h3>{question}</h3>
              <span aria-hidden="true" className="text-[var(--dc-text-3)] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className={`${bodyClass} mt-2 max-w-[80ch]`}>{answer}</p>
          </details>
        ))}
      </section>
    </div>
  );
};
