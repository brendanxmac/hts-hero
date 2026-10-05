import Link from "next/link";
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { DutyCalculatorContent, TariffMatrix } from "../../libs/duty-calculator-content";
import { formatDutyPct, formatSummaryDate } from "../../libs/hts-duty-summary";
import { CHANGELOG_PATH } from "./Changelog";
import { CountryRateCharts } from "./CountryRateCharts";
import { formatMoney, formatPct } from "./format";
import { FaqList } from "../ui/FaqList";
import { SectionHeader } from "../ui/SectionHeader";
import { mono } from "../ui/font";
import * as ui from "../ui/styles";

// Below the calculator on /duty-calculator: today's rates for common imports, how a duty is
// worked out, where the data comes from and the FAQ. Server-rendered so
// search engines and AI crawlers can read it; the calculator itself runs in the browser.
// A band of its own, on a different surface from the calculator, so it reads as a guide.

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- for the commented-out section links
const SECTIONS = [
  { id: "tariff-rates-by-country", label: "Rates by country" },
  { id: "how-duty-is-calculated", label: "How duty is calculated" },
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
  <div className="rounded-lg border border-base-300 bg-base-200 px-5 py-4">
    <div className="text-sm font-medium text-base-content/60">{label}</div>
    <div className="mt-1.5 text-2xl font-semibold leading-none tracking-tight tabular-nums text-base-content">
      {value}
    </div>
    <div className="mt-1.5 text-sm text-base-content/70">{note}</div>
  </div>
);

const RatesByCountry = ({ content }: { content: DutyCalculatorContent }) => {
  const { matrix, asOf, revisionTitle } = content;
  const facts = matrixFacts(matrix);
  return (
    <section id="tariff-rates-by-country" className="scroll-mt-6 flex flex-col gap-6">
      <SectionHeader kicker="Rates by country" title="US Tariff Rates by Country">
        Total US import duty, base rate plus every additional tariff, on goods entered{" "}
        {formatSummaryDate(asOf)} from the {matrix.rows.length} largest sources of US imports.
        The same product can pay very different rates depending on where it&apos;s made.
      </SectionHeader>

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

      <CountryRateCharts
        products={matrix.products}
        rows={matrix.rows.map((row) => ({
          code: row.country.code,
          name: row.country.name,
          flag: row.country.flag,
          values: row.cells.map((c) => pctOf(c.total)),
          labels: row.cells.map((c) => c.total),
          preferences: row.cells.map((c) => c.preference),
        }))}
        footnote={
          <>
            General rates (Column 2 where it applies), before customs fees and any antidumping or
            countervailing duties, with tariff data verified through {revisionTitle}. Green figures
            are the total when the goods qualify for that trade preference. Some tariffs and
            exemptions depend on details such as metal content, which the calculator asks about.
          </>
        }
      />
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
    text: "Section 122, 232, 301, 338 and other additional duties stack on top, depending on the product, the country of origin and the entry date, unless an exemption applies.",
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
      className={`${ui.card} scroll-mt-6 p-5 sm:p-8 lg:p-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12`}
    >
      <div className="flex flex-col gap-5">
        <SectionHeader kicker="The method" title="How US import duty is calculated" />
        <ol className="flex flex-col">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
              {/* The line joining the steps */}
              {i < STEPS.length - 1 && (
                <span className="absolute left-4 -ml-px top-9 bottom-0 w-px bg-base-300" aria-hidden />
              )}
              <span
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold tabular-nums text-primary-content"
                aria-hidden
              >
                {i + 1}
              </span>
              <p className="pt-1 text-base leading-relaxed text-base-content/70">
                <strong className="font-semibold text-base-content">{step.title}</strong> {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* The worked example as a receipt */}
      <div className="self-start rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">Worked example</span>
        <h3 className="mt-1.5 text-base font-semibold text-base-content">
          Example: {formatMoney(example.customsValue)} of {example.productName} (HTS {example.htsno})
          from {example.countryName}, entered {formatSummaryDate(asOf)} by ocean
        </h3>
        <div className="mt-4 flex items-baseline justify-between gap-3 tabular-nums">
          <span className="text-sm text-base-content/60">Duty and fees</span>
          <span className="text-3xl font-semibold tracking-tight leading-none text-base-content">
            {formatMoney(total)}
          </span>
        </div>
        {/* Where the money goes */}
        <div className="mt-3 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-base-300" aria-hidden>
          {[...parts, { label: "Fees", amount: example.totalFees, color: FEES_COLOR, code: undefined }]
            .filter((p) => p.amount > 0)
            .map((p) => (
              <span key={p.label} style={{ width: `${(p.amount / total) * 100}%`, background: p.color }} />
            ))}
        </div>
        <table className="mt-4 w-full text-sm tabular-nums text-base-content">
          <tbody>
            {parts.map((p) => (
              <tr key={p.label} className="border-t border-base-300">
                <td className="py-2 pr-3 text-base-content/70">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded align-middle" style={{ background: p.color }} aria-hidden />
                  {p.label}
                  {p.code && (
                    <>
                      {" "}
                      <span className={`${mono.className} text-xs text-base-content/60`}>{p.code}</span>
                    </>
                  )}
                </td>
                <td className="py-2 text-right">{formatMoney(p.amount)}</td>
              </tr>
            ))}
            <tr className="border-t border-base-content/20 font-semibold">
              <td className="py-2 pr-3">Total duty</td>
              <td className="py-2 text-right">{formatMoney(example.totalDuty)}</td>
            </tr>
            {example.fees.map((f) => (
              <tr key={f.name} className="border-t border-base-300">
                <td className="py-2 pr-3 text-base-content/70">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded align-middle" style={{ background: FEES_COLOR }} aria-hidden />
                  {f.name} ({formatPct(f.ratePct)})
                </td>
                <td className="py-2 text-right">{formatMoney(f.amount)}</td>
              </tr>
            ))}
            <tr className="border-t border-base-content/20 font-semibold">
              <td className="py-2 pr-3">Total duty and fees</td>
              <td className="py-2 text-right">{formatMoney(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ── Sources ──

// What the calculator is built from
const INCLUDED: { title: string; text: string; items?: string[] }[] = [
  {
    title: "Base rates",
    text: "The General, Special and Column 2 rates in each line of the current Harmonized Tariff Schedule, published by the US International Trade Commission. The current rates are used for every entry date.",
  },
  {
    title: "Trade preferences",
    text: "Free trade agreements and preference programs such as USMCA, from each line's Special rate, when you claim one.",
  },
  {
    title: "Customs fees",
    text: "The Merchandise Processing Fee (0.3464%, within the minimum and maximum CBP sets each fiscal year) on formal entries, and the Harbor Maintenance Fee (0.125%) on ocean shipments.",
  },
  {
    title: "Chapter 99 tariffs",
    text: "Every additional duty and exemption in Chapter 99 and its notes, including which ones stack and which replace each other:",
    items: [
      "Section 122 (Now Expired)",
      "Section 201 Safeguards",
      "Section 232: steel, aluminum and copper",
      "Section 232: autos, trucks and parts",
      "Section 232: wood, pharmaceuticals, semiconductors, drones",
      "Section 301: China, Brazil",
      "Section 301: Forced Labor",
      "Section 338: Canada",
      "Country trade deals and quotas",
    ],
  },
];

// What it leaves out, and why
const EXCLUDED: { title: string; text: string }[] = [
  {
    title: "Antidumping and countervailing duties",
    text: "Set case by case by the Commerce Department for specific producers and exporters.",
  },
  {
    title: "Federal excise taxes",
    text: "Such as those on alcohol, tobacco and fuel, which CBP collects at entry.",
  },
  {
    title: "Other agency fees and assessments",
    text: "Including commodity research and promotion assessments, and the MPF on informal entries under $2,500.",
  },
  {
    title: "Import adjustment offsets",
    text: "Set per manufacturer for some auto and truck parts. The calculator charges the full rate and asks before applying it.",
  },
  {
    title: "Chapter 98 claims",
    text: "Special treatment such as American goods returned or articles repaired abroad.",
  },
  {
    title: "Freight, insurance, brokerage and state taxes",
    text: "Landed cost here is the customs value plus duty and fees.",
  },
];

const Sources = ({ revisionTitle, asOf }: { revisionTitle: string; asOf: string }) => (
  <section id="sources" className="scroll-mt-6 flex flex-col gap-6">
    <SectionHeader kicker="Data" title="Where the rates come from">
      Every rate comes from the official Harmonized Tariff Schedule of the United States published
      by the US International Trade Commission. Each HTS revision&apos;s changes are entered with
      the dates they take effect, so you can calculate past and future entry dates. Tariff data is
      verified from Revision 5 (April 8, 2026) through {revisionTitle}, and every change is listed
      in the <Link href={CHANGELOG_PATH} className={ui.link}>calculator changelog</Link>.
    </SectionHeader>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      {/* Included */}
      <div className="rounded-lg border border-base-300 bg-base-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-base-content">What&apos;s included</h3>
          <span className="text-xs text-base-content/60">
            Updated {formatSummaryDate(asOf)}
          </span>
        </div>
        {/* Three short sources in a row, then the Chapter 99 programs across the full width */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {INCLUDED.map((item) => (
            <div
              key={item.title}
              className={`rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm ${item.items ? "sm:col-span-3" : ""}`}
            >
              <h4 className="flex items-center gap-2 text-sm font-semibold text-base-content">
                <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
                {item.title}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-base-content/70">{item.text}</p>
              {item.items && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {item.items.map((program) => (
                    <li
                      key={program}
                      className="rounded-md border border-base-300 bg-base-200 px-2 py-1 text-xs text-base-content"
                    >
                      {program}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <Link href={CHANGELOG_PATH} className={`${ui.button({ size: "sm" })} mt-5`}>
          View the changelog
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {/* Not included */}
      <div className={`${ui.card} p-5 sm:p-6`}>
        <h3 className="flex items-center gap-2 text-base font-semibold text-base-content">
          <ExclamationTriangleIcon className="h-4 w-4 text-warning" aria-hidden />
          Not included
        </h3>
        <p className="mt-0.5 text-sm text-base-content/70">
          Charges an entry can owe that this estimate leaves out.
        </p>
        <ul className="mt-4 flex flex-col divide-y divide-base-300">
          {EXCLUDED.map((item) => (
            <li key={item.title} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/60"
                aria-hidden
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-base-content">{item.title}</span>
                <span className="block text-sm leading-snug text-base-content/70">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

// ── Find your HTS code ──

const FindHtsCode = () => (
  <section
    id="find-hts-code"
    aria-labelledby="find-hts-code-title"
    className={`${ui.card} scroll-mt-6 px-6 py-8 sm:px-10 sm:py-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center`}
  >
    <SectionHeader kicker="Classification" title="Find the right HTS code for your products" titleId="find-hts-code-title">
      Every rate on this page depends on the 10-digit classification. The wrong code can mean the
      wrong tariffs, missed exemptions, and penalties.
    </SectionHeader>
    <div className="flex flex-wrap gap-3">
      <Link href="/explore" className={ui.button({ size: "lg" })}>
        <MagnifyingGlassIcon className="h-4 w-4" aria-hidden />
        Search the HTS
      </Link>
      <Link href="/classify" className={ui.button({ variant: "primary", size: "lg" })}>
        Classify a product
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  </section>
);

// ── FAQ ──

const Faq = ({ faqs }: { faqs: { question: string; answer: string }[] }) => (
  <section id="faq" className="scroll-mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
    <SectionHeader kicker="Questions" title="Frequently asked questions" className="lg:sticky lg:top-6 lg:self-start">
      Something else? <a href="mailto:support@htshero.com" className={ui.link}>Ask us</a>.
    </SectionHeader>
    <FaqList faqs={faqs} />
  </section>
);

export const TariffGuide = ({
  content,
  faqs,
}: {
  content: DutyCalculatorContent;
  faqs: { question: string; answer: string }[];
}) => (
  <div className="w-full border-t border-base-300">
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pt-20 flex flex-col gap-6 sm:gap-10">
      {/* The guide's own intro, with links to each part */}
      <header className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Tariff guide · Updated {formatSummaryDate(content.asOf)}</span>
        <div className="flex flex-col gap-2">

          <p className="text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-base-content">
            The US Import Tariff Guide
          </p>
          <p className="max-w-3xl text-lg leading-relaxed text-base-content/70">
            See how a duty is calculated, where every number comes from, and find current rates on popular products.
          </p>
        </div>
        {/* <nav aria-label="On this page" className="mt-2 flex flex-wrap gap-2">
          {SECTIONS.filter((s) => s.id !== "tariff-rates-by-country" || content.matrix.rows.length > 0)
            .filter((s) => s.id !== "how-duty-is-calculated" || content.example)
            .map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center rounded-full border border-[var(--dc-border)] bg-[var(--dc-bg)] px-3.5 py-1.5 text-[14px] font-medium text-[var(--dc-text-2)] hover:border-[var(--dc-accent-border)] hover:bg-[var(--dc-accent-soft)] hover:text-[var(--dc-accent)]"
              >
                {s.label}
              </a>
            ))}
        </nav> */}
      </header>

      <HowDutyIsCalculated content={content} />
      <Sources revisionTitle={content.revisionTitle} asOf={content.asOf} />
      <FindHtsCode />
      {content.matrix.rows.length > 0 && <RatesByCountry content={content} />}
      <Faq faqs={faqs} />
    </div>
  </div>
);
