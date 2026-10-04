import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  MinusIcon,
} from "@heroicons/react/20/solid";
import { POPULAR_HTS_CODES } from "../../constants/popular-hts-codes";
import { DutyCalculatorContent, TariffMatrix } from "../../libs/duty-calculator-content";
import { formatDutyPct, formatSummaryDate } from "../../libs/hts-duty-summary";
import { CHANGELOG_PATH } from "./Changelog";
import { formatMoney, formatPct } from "./format";
import styles from "./theme.module.css";

// Below the calculator on /duty-calculator: today's rates for common imports, how a duty is
// worked out, popular lookups, where the data comes from and the FAQ. Server-rendered so
// search engines and AI crawlers can read it; the calculator itself runs in the browser.
// A band of its own, on a different surface from the calculator, so it reads as a guide.

const h2Class = "text-[24px] sm:text-[28px] font-semibold tracking-tight text-[var(--dc-text)]";
const bodyClass = "text-[15px] leading-relaxed text-[var(--dc-text-2)]";
const eyebrowClass =
  "text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dc-accent)]";

const SECTIONS = [
  { id: "tariff-rates-by-country", label: "Rates by country" },
  { id: "how-duty-is-calculated", label: "How duty is calculated" },
  { id: "popular-lookups", label: "Popular lookups" },
  { id: "sources", label: "Sources" },
  { id: "faq", label: "FAQ" },
];

// Example colors, in the calculator's chart order: base duty, then each program, then fees
const PROGRAM_COLORS = ["var(--dc-chart-2)", "var(--dc-chart-3)", "var(--dc-chart-4)", "var(--dc-chart-5)"];
const BASE_COLOR = "var(--dc-chart-1)";
const FEES_COLOR = "var(--dc-chart-6)";

// ── Rates by country ──

// "36.5%" -> 36.5; "Free" -> 0; per-unit rates ("6.3¢/liter + 25%") aren't a single number
const pctOf = (total: string) => {
  if (total === "Free") return 0;
  const match = total.match(/^(\d+(?:\.\d+)?)%$/);
  return match ? Number(match[1]) : null;
};

const HEAT = [
  { below: 10, mix: 8, label: "Under 10%" },
  { below: 25, mix: 16, label: "10–25%" },
  { below: 50, mix: 26, label: "25–50%" },
  { below: 100, mix: 36, label: "50–100%" },
  { below: Infinity, mix: 46, label: "100% or more" },
];

// The cell's tint: green when free, then deeper reds as the total climbs
const heat = (pct: number | null) => {
  if (pct === null) return undefined;
  if (pct === 0) return "color-mix(in srgb, var(--dc-positive) 14%, transparent)";
  const level = HEAT.find((h) => pct < h.below) ?? HEAT[HEAT.length - 1];
  return `color-mix(in srgb, var(--dc-negative) ${level.mix}%, transparent)`;
};

// One decimal is plenty for an average
const roundedPct = (pct: number) => formatDutyPct(Math.round(pct * 10) / 10);

// Headline facts from the table: the highest and lowest average rate, and the widest gap
const matrixFacts = (matrix: TariffMatrix) => {
  const averages = matrix.rows
    .map((row) => {
      const values = row.cells.map((c) => pctOf(c.total)).filter((v): v is number => v !== null);
      return { country: row.country, average: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null };
    })
    .filter((r): r is { country: (typeof r)["country"]; average: number } => r.average !== null);
  if (averages.length === 0) return null;
  const highest = averages.reduce((a, b) => (b.average > a.average ? b : a));
  const lowest = averages.reduce((a, b) => (b.average < a.average ? b : a));
  const spreads = matrix.products.map((product, i) => {
    const values = matrix.rows
      .map((row) => ({ country: row.country, pct: pctOf(row.cells[i].total) }))
      .filter((v): v is { country: (typeof v)["country"]; pct: number } => v.pct !== null);
    if (values.length < 2) return null;
    const min = values.reduce((a, b) => (b.pct < a.pct ? b : a));
    const max = values.reduce((a, b) => (b.pct > a.pct ? b : a));
    return { product, min, max, gap: max.pct - min.pct };
  });
  const widest = spreads.reduce<(typeof spreads)[number]>(
    (a, b) => (b && (!a || b.gap > a.gap) ? b : a),
    null,
  );
  return { highest, lowest, widest };
};

const Fact = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div className="rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-bg)] px-5 py-4">
    <div className="text-[12.5px] font-medium text-[var(--dc-text-3)]">{label}</div>
    <div className={`${styles.num} mt-1 text-[22px] font-semibold tracking-tight text-[var(--dc-text)]`}>
      {value}
    </div>
    <div className="mt-0.5 text-[13px] text-[var(--dc-text-2)]">{note}</div>
  </div>
);

const RatesByCountry = ({ content }: { content: DutyCalculatorContent }) => {
  const { matrix, asOf, revisionTitle } = content;
  const facts = matrixFacts(matrix);
  return (
    <section id="tariff-rates-by-country" className="scroll-mt-6 flex flex-col gap-6">
      <div className="flex flex-col gap-2 max-w-[80ch]">
        <span className={eyebrowClass}>Rates by country</span>
        <h2 className={h2Class}>US tariff rates by country: what common imports pay today</h2>
        <p className={bodyClass}>
          Total US import duty, base rate plus every additional tariff, on goods entered{" "}
          {formatSummaryDate(asOf)} from the {matrix.rows.length} largest sources of US imports.
          The same product can pay very different rates depending on where it&apos;s made.
        </p>
      </div>

      {facts && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Fact
            label="Highest average rate"
            value={roundedPct(facts.highest.average)}
            note={`${facts.highest.country.flag} ${facts.highest.country.name}, across these products`}
          />
          <Fact
            label="Lowest average rate"
            value={roundedPct(facts.lowest.average)}
            note={`${facts.lowest.country.flag} ${facts.lowest.country.name}, across these products`}
          />
          {facts.widest && (
            <Fact
              label="Widest gap for one product"
              value={`${formatDutyPct(facts.widest.min.pct)} – ${formatDutyPct(facts.widest.max.pct)}`}
              note={`${facts.widest.product.label}: ${facts.widest.min.country.name} vs ${facts.widest.max.country.name}`}
            />
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow)]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--dc-border)] px-5 sm:px-6 py-3 text-[12px] text-[var(--dc-text-2)]">
          <span className="font-semibold text-[var(--dc-text-3)]">Total duty</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ background: heat(0) }} aria-hidden />
            Free
          </span>
          {HEAT.map((h) => (
            <span key={h.label} className="inline-flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded"
                style={{ background: `color-mix(in srgb, var(--dc-negative) ${h.mix}%, transparent)` }}
                aria-hidden
              />
              {h.label}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full text-[14px] ${styles.num}`}>
            <thead>
              <tr className="text-left text-[12px] text-[var(--dc-text-3)]">
                <th scope="col" className="sticky left-0 z-10 bg-[var(--dc-surface)] px-5 sm:px-6 py-3 font-semibold uppercase tracking-wider">
                  Country of origin
                </th>
                {matrix.products.map((p) => (
                  <th key={p.code} scope="col" className="px-2 py-3 text-center align-bottom whitespace-nowrap">
                    <Link
                      href={`/hts/${p.code}`}
                      className="font-semibold text-[var(--dc-text)] hover:text-[var(--dc-accent)] hover:underline"
                    >
                      {p.label}
                    </Link>
                    <span className="block font-mono text-[11px] font-normal">{p.code}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row.country.code} className="border-t border-[var(--dc-border)]">
                  {/* Pinned so the country stays in view while the products scroll on small screens */}
                  <th scope="row" className="sticky left-0 z-10 bg-[var(--dc-surface)] px-5 sm:px-6 py-1.5 text-left font-medium text-[var(--dc-text)] whitespace-nowrap">
                    <span aria-hidden="true" className="mr-2">{row.country.flag}</span>
                    {row.country.name}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td key={matrix.products[i].code} className="px-1.5 py-1.5 text-center">
                      <span
                        className="block rounded-md px-2 py-1.5"
                        style={{ background: heat(pctOf(cell.total)) }}
                      >
                        <span className="font-semibold text-[var(--dc-text)] whitespace-nowrap">{cell.total}</span>
                        {cell.preference && (
                          <span className="mx-auto block max-w-[11rem] text-[11.5px] leading-tight text-[var(--dc-positive)]">
                            {cell.preference}
                          </span>
                        )}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-5 sm:px-6 py-4 border-t border-[var(--dc-border)] bg-[var(--dc-surface-2)] text-[12.5px] leading-relaxed text-[var(--dc-text-3)]">
          General rates (Column 2 where it applies), before customs fees and any antidumping or
          countervailing duties, with tariff data verified through {revisionTitle}. Green figures are
          the total when the goods qualify for that trade preference. Some tariffs and exemptions
          depend on details such as metal content, which the calculator asks about.
        </p>
      </div>
    </section>
  );
};

// ── How duty is calculated ──

const STEPS = [
  {
    title: "Find the HTS code.",
    text: "Every import is classified under a 10-digit code in the Harmonized Tariff Schedule.",
  },
  {
    title: "Apply the base rate.",
    text: "Column 1 General for most countries, a Special rate when the goods qualify for a trade agreement such as USMCA, or Column 2 for Cuba, North Korea, Russia and Belarus.",
  },
  {
    title: "Add the Chapter 99 tariffs.",
    text: "Section 232, 301, 122 and other additional duties stack on top, depending on the product, the country of origin and the entry date, unless an exemption applies.",
  },
  {
    title: "Add customs fees.",
    text: "The Merchandise Processing Fee on every formal entry, and the Harbor Maintenance Fee on ocean shipments.",
  },
];

const HowDutyIsCalculated = ({ content }: { content: DutyCalculatorContent }) => {
  const { example, asOf } = content;
  if (!example) return null;
  const parts = [
    { label: `Base rate (${example.baseRate})`, amount: example.baseAmount, color: BASE_COLOR, code: undefined as string | undefined },
    ...example.lines.map((l, i) => ({
      label: `${l.program} (${formatDutyPct(l.ratePct)})`,
      amount: l.amount,
      color: PROGRAM_COLORS[i % PROGRAM_COLORS.length],
      code: l.code,
    })),
  ];
  const total = example.totalDuty + example.totalFees;
  return (
    <section
      id="how-duty-is-calculated"
      className="scroll-mt-6 rounded-xl border border-[var(--dc-accent-border)] bg-[var(--dc-accent-soft)] p-5 sm:p-8 lg:p-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className={eyebrowClass}>The method</span>
          <h2 className={h2Class}>How US import duty is calculated</h2>
        </div>
        <ol className="flex flex-col">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
              {/* The line joining the steps */}
              {i < STEPS.length - 1 && (
                <span className="absolute left-[15px] top-9 bottom-0 w-px bg-[var(--dc-accent-border)]" aria-hidden />
              )}
              <span
                className={`${styles.num} relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--dc-accent)] text-[14px] font-semibold text-[var(--dc-accent-contrast)]`}
                aria-hidden
              >
                {i + 1}
              </span>
              <p className={`${bodyClass} pt-1`}>
                <strong className="text-[var(--dc-text)]">{step.title}</strong> {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* The worked example as a receipt */}
      <div className="self-start rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-surface)] p-5 sm:p-6 shadow-[var(--dc-shadow-pop)]">
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dc-text-3)]">
          Worked example
        </span>
        <h3 className="mt-1.5 text-[16px] font-semibold leading-snug text-[var(--dc-text)]">
          Example: {formatMoney(example.customsValue)} of {example.productName} (HTS {example.htsno})
          from {example.countryName}, entered {formatSummaryDate(asOf)} by ocean
        </h3>
        <div className={`${styles.num} mt-4 flex items-baseline justify-between gap-3`}>
          <span className="text-[13px] text-[var(--dc-text-3)]">Duty and fees</span>
          <span className="text-[30px] font-semibold tracking-tight leading-none text-[var(--dc-text)]">
            {formatMoney(total)}
          </span>
        </div>
        {/* Where the money goes */}
        <div className="mt-3 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-[var(--dc-surface-3)]" aria-hidden>
          {[...parts, { label: "Fees", amount: example.totalFees, color: FEES_COLOR, code: undefined }]
            .filter((p) => p.amount > 0)
            .map((p) => (
              <span key={p.label} style={{ width: `${(p.amount / total) * 100}%`, background: p.color }} />
            ))}
        </div>
        <table className={`mt-4 w-full text-[14px] ${styles.num}`}>
          <tbody>
            {parts.map((p) => (
              <tr key={p.label} className="border-t border-[var(--dc-border)]">
                <td className="py-2 pr-3 text-[var(--dc-text-2)]">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-[3px] align-middle" style={{ background: p.color }} aria-hidden />
                  {p.label}
                  {p.code && (
                    <>
                      {" "}
                      <span className="font-mono text-[12px] text-[var(--dc-text-3)]">{p.code}</span>
                    </>
                  )}
                </td>
                <td className="py-2 text-right">{formatMoney(p.amount)}</td>
              </tr>
            ))}
            <tr className="border-t border-[var(--dc-border-strong)] font-semibold">
              <td className="py-2 pr-3">Total duty</td>
              <td className="py-2 text-right">{formatMoney(example.totalDuty)}</td>
            </tr>
            {example.fees.map((f) => (
              <tr key={f.name} className="border-t border-[var(--dc-border)]">
                <td className="py-2 pr-3 text-[var(--dc-text-2)]">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-[3px] align-middle" style={{ background: FEES_COLOR }} aria-hidden />
                  {f.name} ({formatPct(f.ratePct)})
                </td>
                <td className="py-2 text-right">{formatMoney(f.amount)}</td>
              </tr>
            ))}
            <tr className="border-t border-[var(--dc-border-strong)] font-semibold">
              <td className="py-2 pr-3">Total duty and fees</td>
              <td className="py-2 text-right">{formatMoney(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ── Popular lookups ──

const PopularLookups = () => (
  <section id="popular-lookups" className="scroll-mt-6 flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <span className={eyebrowClass}>Browse</span>
      <h2 className={h2Class}>Popular duty lookups</h2>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {POPULAR_HTS_CODES.map((category) => (
        <div
          key={category.category}
          className="flex flex-col rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-bg)] p-4"
        >
          <h3 className="px-2 pb-2 text-[13px] font-semibold text-[var(--dc-text)]">{category.category}</h3>
          <ul className="flex flex-col">
            {category.codes.map((c) => (
              <li key={c.code}>
                <Link
                  href={`/hts/${c.code}`}
                  className="group flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-[14px] hover:bg-[var(--dc-surface)]"
                >
                  <span className="min-w-0 text-[var(--dc-text-2)] group-hover:text-[var(--dc-accent)]">
                    Duty on {c.label.charAt(0).toLowerCase()}
                    {c.label.slice(1)}
                  </span>
                  <span className="shrink-0 font-mono text-[11.5px] text-[var(--dc-text-3)]">{c.code}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

// ── Sources ──

const Sources = ({ revisionTitle }: { revisionTitle: string }) => (
  <section id="sources" className="scroll-mt-6 flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <span className={eyebrowClass}>Data</span>
      <h2 className={h2Class}>Where the rates come from</h2>
    </div>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-surface)] p-5 sm:p-6 shadow-[var(--dc-shadow)]">
        <p className={bodyClass}>
          Every rate comes from the official Harmonized Tariff Schedule of the United States published
          by the US International Trade Commission: the base rates in each HTS line, and the
          additional duties, exemptions and their interactions in Chapter 99 and its notes. Each HTS
          revision&apos;s changes are entered with the dates they take effect, so you can calculate
          any entry date, past or future. Tariff data is verified through {revisionTitle}, and every
          change is listed in the{" "}
          <Link href={CHANGELOG_PATH} className={styles.link}>calculator changelog</Link>.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-[14px] text-[var(--dc-text)]">
          {["Base rates from every HTS line", "Chapter 99 tariffs and exemptions", "Effective dates for every revision", `Verified through ${revisionTitle}`].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--dc-positive)]" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <Link
          href={CHANGELOG_PATH}
          className={`${styles.button} mt-5 inline-flex`}
        >
          View the changelog
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-bg)] p-5 sm:p-6">
        <h3 className="text-[15px] font-semibold text-[var(--dc-text)]">Not included</h3>
        <p className={`${bodyClass} mt-2`}>
          Antidumping and countervailing duties, which are set case by case for
          specific producers, and quota-related charges. Need an HTS code first?{" "}
          <Link href="/explore" className={styles.link}>Search the HTS</Link>.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-[14px] text-[var(--dc-text-2)]">
          {["Antidumping duties", "Countervailing duties", "Quota-related charges"].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <MinusIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--dc-text-3)]" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

// ── FAQ ──

const Faq = ({ faqs }: { faqs: { question: string; answer: string }[] }) => (
  <section id="faq" className="scroll-mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
    <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
      <span className={eyebrowClass}>Questions</span>
      <h2 className={h2Class}>Frequently asked questions</h2>
      <p className={bodyClass}>
        Something else? <a href="mailto:support@htshero.com" className={styles.link}>Ask us</a>.
      </p>
    </div>
    <div className="flex flex-col gap-3">
      {faqs.map(({ question, answer }) => (
        <details
          key={question}
          className="group rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-surface)] px-5 py-4 open:shadow-[var(--dc-shadow)] open:border-[var(--dc-accent-border)]"
        >
          <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-[15.5px] font-semibold text-[var(--dc-text)] [&::-webkit-details-marker]:hidden">
            <h3>{question}</h3>
            <ChevronDownIcon
              className="h-5 w-5 shrink-0 text-[var(--dc-text-3)] transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className={`${bodyClass} mt-3 max-w-[80ch]`}>{answer}</p>
        </details>
      ))}
    </div>
  </section>
);

export const TariffGuide = ({
  content,
  faqs,
}: {
  content: DutyCalculatorContent;
  faqs: { question: string; answer: string }[];
}) => (
  <div className="w-full border-t border-[var(--dc-border)] bg-[var(--dc-surface)]">
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 pt-14 pb-20 sm:pt-20 flex flex-col gap-16 sm:gap-20">
      {/* The guide's own intro, with links to each part */}
      <header className="flex flex-col gap-4 max-w-[72ch]">
        <span className={eyebrowClass}>Tariff guide · Updated {formatSummaryDate(content.asOf)}</span>
        <p className="text-[30px] sm:text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--dc-text)]">
          What US imports pay, and why.
        </p>
        <p className={`${bodyClass} text-[16px]`}>
          Today&apos;s rates for common products by country, how a duty is built up, and where every
          number comes from.
        </p>
        <nav aria-label="On this page" className="mt-2 flex flex-wrap gap-2">
          {SECTIONS.filter((s) => s.id !== "tariff-rates-by-country" || content.matrix.rows.length > 0)
            .filter((s) => s.id !== "how-duty-is-calculated" || content.example)
            .map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center rounded-full border border-[var(--dc-border)] bg-[var(--dc-bg)] px-3.5 py-1.5 text-[13.5px] font-medium text-[var(--dc-text-2)] hover:border-[var(--dc-accent-border)] hover:bg-[var(--dc-accent-soft)] hover:text-[var(--dc-accent)]"
              >
                {s.label}
              </a>
            ))}
        </nav>
      </header>

      {content.matrix.rows.length > 0 && <RatesByCountry content={content} />}
      <HowDutyIsCalculated content={content} />
      <PopularLookups />
      <Sources revisionTitle={content.revisionTitle} />
      <Faq faqs={faqs} />
    </div>
  </div>
);
