import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ChevronRightIcon,
  DocumentTextIcon,
} from "@heroicons/react/20/solid";
import logo from "@/app/logo.svg";
import { HtsElement } from "../interfaces/hts";
import config from "@/config";
import { getFirstChapterOfSection } from "@/libs/hts";
import { usitcHtsFileViewerTabUrl } from "@/libs/usitc-hts-file-url";
import ThemeToggle from "./ThemeToggle";
import { RelatedCrossRulingsSection } from "./RelatedCrossRulingsSection";
import { DutyByCountry } from "./hts-page/DutyByCountry";
import { MicroCalculator } from "./hts-page/MicroCalculator";
import type { MicroEstimate } from "../libs/hts-micro-estimate";
import { mono } from "./ui/font";
import { heat } from "./ui/heat";
import { FaqList } from "./ui/FaqList";
import { SectionHeader } from "./ui/SectionHeader";
import styles from "./ui/theme.module.css";
import {
  describeTotal,
  dutyAnswerSentence,
  findRateElement,
  formatSummaryDate,
  HtsDutySummary,
  inSentence,
  lowestTotal,
} from "../libs/hts-duty-summary";
import * as ui from "./ui/styles";

// The /hts/[code] page: what an HTS code covers, what it pays and where it sits in the
// schedule. Server-rendered for search engines, on the analytical theme (DESIGN_SYSTEM.md).
// Each part sits on its own surface so the page scans: the hero and base rates, duties by
// country, related codes, then notes, rulings and questions on a band of their own.

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content`;

// Page width: every band uses it, so edges line up from header to footer
const CONTAINER = "mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8";

type SectionChapter = {
  sectionNumber: number;
  sectionDescription: string;
  chapterDescription: string;
} | null;

interface HtsCodePageContentProps {
  element: HtsElement;
  // Readable name for the line, from its parents when its own description is a fragment
  productName: string;
  // Duties from the largest sources of US imports; null when the line has no rates
  summary: HtsDutySummary | null;
  // A quick estimate for one country, which the visitor can change
  estimate: MicroEstimate | null;
  parentElements: HtsElement[];
  childrenElements: HtsElement[];
  siblingElements: HtsElement[];
  sectionChapter: SectionChapter;
}

export function HtsCodePageContent({
  element,
  productName,
  summary,
  estimate,
  parentElements: parents,
  childrenElements: children,
  siblingElements: siblings,
  sectionChapter,
}: HtsCodePageContentProps) {
  const tariffElement = findRateElement(element, parents);
  const hasDutyData = !!(tariffElement.general || tariffElement.special || tariffElement.other);
  const hasRateDetails = hasDutyData || element.units.length > 0 || !!element.quotaQuantity || !!element.additionalDuties;
  const offerCalculator = !summary && !hasDutyData && !!element.htsno && !element.htsno.startsWith("99");
  const hasRelated = children.length > 0 || siblings.length > 0;
  const faqs = htsFaqs({ element, productName, summary, tariffElement, children, sectionChapter });

  const sections = [
    { id: "duty-by-country", label: "Duty by Country", show: !!summary },
    { id: "related-codes", label: "Related Codes", show: hasRelated },
    { id: "notes", label: "Relevant Notes", show: !!(sectionChapter && element.chapter) },
    { id: "rulings", label: "Related CROSS Rulings", show: !!element.htsno },
    { id: "faq", label: "FAQ", show: true },
  ].filter((s) => s.show);

  return (
    <div className={`${styles.root} w-full min-h-screen flex flex-col`}>
      <StructuredData element={element} productName={productName} summary={summary} tariffElement={tariffElement} parentElements={parents} sectionChapter={sectionChapter} faqs={faqs} />

      <PageHeader />

      {/* === Hero: the code, a quick estimate, and a rail with its base rates === */}
      <div className="w-full border-b border-base-300">
        <div className={`${CONTAINER} pt-5 pb-8`}>
          <Breadcrumbs element={element} parents={parents} sectionChapter={sectionChapter} />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
            <div className="min-w-0 flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  HTS Code{element.chapter ? ` · Chapter ${element.chapter}` : ""}
                  {summary && <> · Updated {formatSummaryDate(summary.asOf)}</>}
                </span>
                <h1 className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className={`${mono.className} text-3xl sm:text-4xl font-semibold leading-none tracking-tight text-primary`}>
                    {element.htsno}
                  </span>
                  <span className="text-2xl lg:text-3xl font-semibold leading-tight tracking-tight text-base-content">
                    {productName}
                  </span>
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-base-content/70">
                  HTS Code {element.htsno} covers any article best defined as{" "}
                  {[
                    ...(sectionChapter ? [sectionChapter.sectionDescription, sectionChapter.chapterDescription] : []),
                    ...parents.map((p) => p.description),
                  ].map((text, i) => (
                    <span key={i}>
                      {i > 0 && <Chevron />}
                      {text}
                    </span>
                  ))}
                  <Chevron />
                  <strong className="font-semibold text-base-content">{element.description}</strong>
                  {" "}in the Harmonized Tariff Schedule
                  {children.length > 0 && (
                    <> — covering {children.length} sub-classification{children.length !== 1 ? "s" : ""}</>
                  )}
                  .
                </p>
              </div>

              {estimate ? (
                <MicroCalculator
                  htsno={element.htsno}
                  baseRates={{ general: tariffElement.general, special: tariffElement.special, other: tariffElement.other }}
                  initial={estimate}
                />
              ) : (
                element.htsno && !element.htsno.startsWith("99") && (
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/duty-calculator?code=${element.htsno}`} className={ui.button({ variant: "primary", size: "lg" })}>
                      Calculate Total Duty
                      <ArrowRightIcon className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link href="/explore" className={ui.button({ size: "lg" })}>
                      Explore the HTS
                    </Link>
                  </div>
                )
              )}
            </div>

            {/* The rail: base rates, then links to each part of the page */}
            <div className="flex flex-col gap-4 min-w-0">
              {hasRateDetails && (
                <BaseRates element={element} tariffElement={tariffElement} hasDutyData={hasDutyData} showCalculatorLink={!estimate} />
              )}

              {/* No rates on this line (e.g. a heading above the rate lines): still offer the calculator */}
              {offerCalculator && (
                <aside className="rounded-lg border border-base-300 bg-base-100 shadow-sm p-5 flex flex-col gap-3">
                  <p className="text-base font-semibold text-base-content">Importing under {element.htsno}?</p>
                  <p className="text-sm leading-relaxed text-base-content/70">
                    Pick the full HTS code in the calculator to see every duty, tariff and exemption for your country of origin.
                  </p>
                  <Link href={`/duty-calculator?code=${element.htsno}`} className={ui.button({ variant: "primary", size: "sm" })}>
                    Calculate Total Duty
                    <ArrowRightIcon className="h-4 w-4" aria-hidden />
                  </Link>
                </aside>
              )}

              {summary && (
                <a
                  href="#duty-by-country"
                  className="rounded-lg border border-base-300 bg-base-100 shadow-sm group block px-4 py-3 transition-colors hover:border-primary/40"
                >
                  <span className="text-base font-semibold text-base-content flex items-center justify-between">
                    Total duty by country
                    <span className="text-xs font-medium text-primary group-hover:underline">
                      All {summary.rows.length} →
                    </span>
                  </span>
                  <ul className="mt-2 flex flex-col gap-1 text-sm tabular-nums">
                    {summary.rows.slice(0, 5).map((row) => (
                      <li key={row.country.code} className="flex items-center justify-between gap-3">
                        <span className="text-base-content/70">
                          <span aria-hidden="true" className="mr-1.5">{row.country.flag}</span>
                          {row.country.name}
                        </span>
                        <span className="rounded px-1.5 py-0.5 font-semibold text-base-content" style={{ background: heat(row.totalPct) }}>
                          {describeTotal(row)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </a>
              )}

              {sections.length > 1 && (
                <nav aria-label="Also on this page" className="rounded-lg border border-base-300 bg-base-100 shadow-sm p-2">
                  <span className="block px-3 pt-1.5 pb-1 text-xs font-semibold uppercase tracking-wider text-base-content/60">
                    Also on this page
                  </span>
                  <ul>
                    {sections.map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="group flex items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-200 hover:text-primary"
                        >
                          {s.label}
                          <ChevronRightIcon className="h-4 w-4 text-base-content/60 group-hover:text-primary" aria-hidden />
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === Duties and related codes === */}
      <div className={`${CONTAINER} py-12 sm:py-16 flex flex-col gap-16 sm:gap-20`}>
        {summary && <DutyByCountry htsno={element.htsno} productName={productName} summary={summary} />}

        {hasRelated && <RelatedCodes element={element} subCodes={children} siblings={siblings} />}
      </div>

      {/* === Notes, rulings and questions: reference material, on a band of its own === */}
      <div className="w-full border-t border-base-300">
        <div className={`${CONTAINER} py-12 sm:py-16 flex flex-col gap-16 sm:gap-20`}>
          {sectionChapter && element.chapter && (
            <Notes sectionChapter={sectionChapter} htsno={element.htsno} chapter={element.chapter} />
          )}

          {element.htsno && (
            <section id="rulings" className="scroll-mt-6 flex flex-col gap-6">
              <SectionHeader kicker="CBP rulings" title={`Related CROSS Rulings for HTS ${element.htsno}`}>
                CBP classification rulings related to{" "}
                <span className={`${mono.className} font-medium text-base-content`}>{element.htsno}</span>.
                Open a ruling to read how Customs classified a similar product.
              </SectionHeader>
              <RelatedCrossRulingsSection htsno={element.htsno} bare initialCount={6} />
            </section>
          )}

          <Faq htsno={element.htsno} faqs={faqs} />
        </div>
      </div>

      {/* === Playbook === */}
      <div className="w-full border-t border-base-300">
        <div className={`${CONTAINER} py-12 sm:py-16`}>
          <PlaybookBanner />
        </div>
      </div>

      <PageFooter />
    </div>
  );
}

const Chevron = () => (
  <span className="mx-1.5 text-base-content/60" aria-hidden="true">›</span>
);

// ── Header and footer ──

function PageHeader() {
  return (
    <header>
      <div className="bg-neutral text-neutral-content">
        <div className={`${CONTAINER} py-2.5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-6`}>
          <p className="text-sm text-center sm:text-left">
            <span className="font-semibold">Want audit-ready HTS Codes for all your Imports?</span>{" "}
            <span className="text-neutral-content/80">And get all the evidence you need to defend them!</span>
          </p>
          <Link
            href="/classify"
            className={`${ui.button({ size: "sm" })} shrink-0`}
          >
            Find your codes, fast!
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
      <div className="border-b border-base-300 bg-base-100">
        <div className={`${CONTAINER} h-14 flex items-center justify-between gap-4`}>
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src={logo} alt={`${config.appName} logo`} className="w-5" priority width={24} height={24} />
            <span className="text-base font-semibold text-base-content">{config.appName}</span>
          </Link>
          <nav aria-label="Tools" className="flex items-center gap-1 sm:gap-2">
            <Link href="/duty-calculator" className={ui.button({ variant: "ghost", size: "sm" })}>
              Duty Calculator
            </Link>
            <Link href="/explore" className={`${ui.button({ variant: "ghost", size: "sm" })} hidden sm:inline-flex`}>
              HTS Explorer
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}

function PageFooter() {
  return (
    <footer className="mt-auto border-t border-base-300 bg-base-100">
      <div className={`${CONTAINER} py-8 text-xs text-base-content/60 flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <span>&copy; {new Date().getFullYear()} HTS Hero. Data sourced from the USITC Harmonized Tariff Schedule.</span>
        <div className="flex gap-4">
          <Link href="/" className="hover:text-base-content">About</Link>
          <Link href="/blog" className="hover:text-base-content">Blog</Link>
          <Link href="/privacy-policy" className="hover:text-base-content">Privacy</Link>
          <Link href="/tos" className="hover:text-base-content">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

function Breadcrumbs({
  element,
  parents,
  sectionChapter,
}: {
  element: HtsElement;
  parents: HtsElement[];
  sectionChapter: SectionChapter;
}) {
  const sep = <span aria-hidden="true" className="mx-1.5 text-base-content/60">/</span>;
  const linkClass = "hover:underline text-base-content/70 underline-offset-4 hover:text-primary";
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-y-1 text-sm text-base-content/60">
        <li>
          <Link href="/explore" className={linkClass}>HTS</Link>
        </li>
        {sectionChapter && (
          <>
            <li className="flex items-center">
              {sep}
              <Link href={`/section/${sectionChapter.sectionNumber}`} className={linkClass}>
                Section {sectionChapter.sectionNumber}
              </Link>
            </li>
            <li className="flex items-center">
              {sep}
              <Link href={`/chapter/${element.chapter}`} className={linkClass}>
                Chapter {element.chapter}
              </Link>
            </li>
          </>
        )}
        {parents.map((parent) => (
          <li key={parent.uuid} className="flex items-center">
            {sep}
            {parent.htsno ? (
              <Link href={`/hts/${parent.htsno}`} className={`${mono.className} ${linkClass}`}>
                {parent.htsno}
              </Link>
            ) : (
              <span className="max-w-36 truncate" title={parent.description}>
                {parent.description.split(" ").slice(0, 3).join(" ")}...
              </span>
            )}
          </li>
        ))}
        <li className="flex items-center">
          {sep}
          <span className={`${mono.className} font-semibold text-base-content`} aria-current="page">
            {element.htsno || "Current"}
          </span>
        </li>
      </ol>
    </nav>
  );
}

// ── Base rates ──

// "Free (A,AU,BH) 3.5% (JP)" -> [{ rate: "Free", programs: ["A", "AU", "BH"] }, { rate: "3.5%", programs: ["JP"] }];
// null when the text isn't in that shape
const specialRates = (special: string) => {
  const groups = Array.from(special.matchAll(/([^()]+?)\s*\(([^)]+)\)/g));
  if (!groups.length || groups.map((g) => g[0]).join("").replace(/\s/g, "") !== special.replace(/\s/g, "")) return null;
  return groups.map((g) => ({ rate: g[1].trim(), programs: g[2].split(",").map((p) => p.trim()).filter(Boolean) }));
};

function RateRow({ label, value, strong = false }: { label: string; value: string | null; strong?: boolean }) {
  // Chapter 99 lines carry sentences in the rate columns
  const long = (value?.length ?? 0) > 24;
  return (
    <div className={`px-4 py-2.5 ${long ? "" : "flex items-baseline justify-between gap-3"}`}>
      <dt className="text-base-content/70">{label}</dt>
      <dd className={`font-semibold ${long ? "mt-1" : "text-right"} ${strong && !long ? "text-lg leading-none" : ""}`}>
        <RateValue value={value} />
      </dd>
    </div>
  );
}

function RateValue({ value }: { value: string | null }) {
  return value ? (
    <span className="text-base-content">{value}</span>
  ) : (
    <span className="text-base-content/60">—</span>
  );
}

function BaseRates({
  element,
  tariffElement,
  hasDutyData,
  showCalculatorLink,
}: {
  element: HtsElement;
  tariffElement: HtsElement;
  hasDutyData: boolean;
  showCalculatorLink: boolean;
}) {
  const special = tariffElement.special ? specialRates(tariffElement.special) : null;
  const details = [
    { label: "Units of Quantity", value: element.units.join(", ") || null },
    { label: "Quota Quantity", value: element.quotaQuantity },
    { label: "Additional Duties", value: element.additionalDuties },
  ].filter((d) => d.value);
  const inherited = tariffElement !== element && tariffElement.htsno;

  return (
    <section id="base-rates" aria-labelledby="base-rates-title" className="rounded-lg border border-base-300 bg-base-100 shadow-sm scroll-mt-6 overflow-hidden">
      <div className="px-4 pt-3.5 pb-3 border-b border-base-300">
        <h2 id="base-rates-title" className="text-base font-semibold text-base-content">
          Base Duty Rates for {element.htsno}
        </h2>
        <p className="mt-0.5 text-xs text-base-content/60">
          {inherited ? (
            <>
              Set at{" "}
              <Link href={`/hts/${tariffElement.htsno}`} className={`${mono.className} hover:underline hover:text-primary`}>
                {tariffElement.htsno}
              </Link>{" "}
              in the Harmonized Tariff Schedule
            </>
          ) : (
            "From the Harmonized Tariff Schedule"
          )}
        </p>
      </div>

      {/* One row per rate: label on the left, rate on the right; long rates (Chapter 99 sentences) wrap below */}
      <dl className="divide-y divide-base-300 text-sm tabular-nums">
        {hasDutyData && (
          <>
            <RateRow label="General Rate of Duty" value={tariffElement.general} strong />
            <div className="px-4 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-base-content/70">Special Rate of Duty</dt>
                <dd className="font-semibold text-right">
                  {special ? (
                    <span className="text-success">{special.map((s) => s.rate).join(" / ")}</span>
                  ) : (
                    <RateValue value={tariffElement.special} />
                  )}
                </dd>
              </div>
              {special && (
                <dd className="mt-1.5 flex flex-wrap gap-1">
                  {special.flatMap((s) => s.programs).map((p, i) => (
                    <span
                      key={`${p}-${i}`}
                      className={`${ui.badge("neutral")} ${mono.className}`}
                    >
                      {p}
                    </span>
                  ))}
                </dd>
              )}
            </div>
            <RateRow label="Column 2 (Non-NTR)" value={tariffElement.other} />
          </>
        )}
        {details.map((d) => (
          <RateRow key={d.label} label={d.label} value={d.value} />
        ))}
      </dl>

      {showCalculatorLink && element.htsno && !element.htsno.startsWith("99") && (
        <div className="border-t border-base-300 px-5 py-4 flex flex-col gap-1">
          <p className="text-base font-semibold text-base-content">Importing under {element.htsno}?</p>
          <p className="text-sm leading-snug text-base-content/70">
            Calculate total import duties, tariffs, and trade agreement exemptions for your shipment.
          </p>
          <Link href={`/duty-calculator?code=${element.htsno}`} className={`${ui.link} mt-1 inline-flex items-center gap-1 text-sm`}>
            Calculate Total Duty
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}

// ── Related codes ──

// The codes under this one and beside it. Plain links, so crawlers reach every line of the schedule
function RelatedCodes({
  element,
  subCodes: children,
  siblings,
}: {
  element: HtsElement;
  subCodes: HtsElement[];
  siblings: HtsElement[];
}) {
  return (
    <section id="related-codes" className="scroll-mt-6 flex flex-col gap-6">
      <SectionHeader
        kicker="Related codes"
        title={children.length > 0 ? `HTS Codes Under ${element.htsno || "This Classification"}` : "Other HTS Codes at This Level"}
      />

      {children.length > 0 && (
        <ul className="rounded-lg border border-base-300 bg-base-100 shadow-sm grid overflow-hidden md:grid-cols-2">
          {children.map((child) => {
            const rate = child.general && child.general.length <= 20 ? child.general : null;
            const body = (
              <>
                <span className="min-w-0 flex-1">
                  <span className={`${mono.className} block text-sm font-semibold ${child.htsno ? "text-primary" : "text-base-content/60"}`}>
                    {child.htsno || "—"}
                  </span>
                  <span className="block text-sm leading-snug text-base-content/70">{child.description}</span>
                </span>
                {rate && (
                  <span className="shrink-0 rounded bg-base-200 px-2 py-0.5 text-xs font-semibold tabular-nums text-base-content">
                    {rate}
                  </span>
                )}
                {child.htsno && (
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-base-content/60 group-hover:text-primary" aria-hidden />
                )}
              </>
            );
            return (
              <li key={child.uuid} className="-mb-px border-b border-base-300 md:odd:border-r">
                {child.htsno ? (
                  <Link href={`/hts/${child.htsno}`} className="group flex h-full items-center gap-3 px-5 py-3 transition-colors hover:bg-base-200">
                    {body}
                  </Link>
                ) : (
                  <div className="flex h-full items-center gap-3 px-5 py-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {siblings.length > 0 && (
        <div className="flex flex-col gap-3">
          {children.length > 0 && (
            <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Other HTS Codes at This Level
            </h3>
          )}
          <div className="flex flex-wrap gap-2">
            {siblings.map((sib) =>
              sib.htsno ? (
                <Link
                  key={sib.uuid}
                  href={`/hts/${sib.htsno}`}
                  title={sib.description}
                  className="group inline-flex max-w-full items-center gap-2 rounded-md border border-base-300 bg-base-100 px-3 py-1.5 transition-colors hover:border-primary/40"
                >
                  <span className={`${mono.className} text-sm font-semibold text-primary`}>{sib.htsno}</span>
                  <span className="max-w-60 truncate text-sm text-base-content/70 group-hover:text-base-content">{sib.description}</span>
                </Link>
              ) : (
                <span
                  key={sib.uuid}
                  title={sib.description}
                  className="inline-flex items-center rounded-md border border-base-300 px-3 py-1.5 text-sm text-base-content/60"
                >
                  {sib.description.length > 30 ? sib.description.slice(0, 27) + "..." : sib.description}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Notes ──

function Notes({
  sectionChapter,
  htsno,
  chapter,
}: {
  sectionChapter: NonNullable<SectionChapter>;
  htsno: string;
  chapter: number;
}) {
  // Section notes are printed with the section's first chapter
  const sectionNoteChapter = getFirstChapterOfSection(sectionChapter.sectionNumber) ?? chapter;
  const links = [
    ...(sectionNoteChapter !== chapter
      ? [{ title: `Section ${sectionChapter.sectionNumber} Notes`, description: sectionChapter.sectionDescription, file: `Chapter ${sectionNoteChapter}` }]
      : []),
    {
      title: `Chapter ${chapter} Notes${sectionNoteChapter === chapter ? ` (includes Section ${sectionChapter.sectionNumber} Notes)` : ""}`,
      description: sectionChapter.chapterDescription,
      file: `Chapter ${chapter}`,
    },
  ];

  return (
    <section id="notes" className="scroll-mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center lg:gap-12">
      <SectionHeader kicker="Legal notes" title="Relevant HTS Notes">
        Official USITC notes that may affect classification under HTS{" "}
        {htsno ? <span className={`${mono.className} font-medium text-base-content`}>{htsno}</span> : "this code"}.
      </SectionHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.title}
            href={usitcHtsFileViewerTabUrl(link.file)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-base-300 bg-base-100 shadow-sm group flex items-start gap-3 p-4 transition-colors hover:border-primary/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden>
              <DocumentTextIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-base-content group-hover:text-primary">{link.title}</span>
              <span className="mt-0.5 block text-sm leading-snug text-base-content/70 line-clamp-2">{link.description}</span>
            </span>
            <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0 text-base-content/60 group-hover:text-primary" aria-hidden />
          </a>
        ))}
      </div>
    </section>
  );
}

// ── FAQ ──

function Faq({ htsno, faqs }: { htsno: string; faqs: [string, string][] }) {
  return (
    <section id="faq" className="scroll-mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
      <SectionHeader kicker="Questions" title={`HTS ${htsno} FAQ`} className="lg:sticky lg:top-6 lg:self-start">
        Something else? <a href="mailto:support@htshero.com" className={ui.link}>Ask us</a>.
      </SectionHeader>
      <FaqList faqs={faqs.map(([question, answer]) => ({ question, answer }))} openFirst />
    </section>
  );
}

// ── Playbook ──

function PlaybookBanner() {
  return (
    <section className="rounded-lg border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative w-32 sm:w-36 aspect-[2/3] rounded-md overflow-hidden border border-base-300 shrink-0">
            <Image
              src={`${STORAGE_BASE}/book-cover.jpg`}
              alt="The Audit-Ready Classifications Playbook"
              fill
              sizes="(max-width: 640px) 128px, 144px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Free · Playbook + 7 Bonuses</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-base-content">The Audit-Ready Classifications Playbook</h2>
            <p className="text-base leading-relaxed text-base-content/70">
              Learn how to create HTS classifications that reduce import risk and defend profits — faster than ever.
            </p>
            <div>
              <Link
                href="/the-audit-ready-classifications-playbook"
                className={`${ui.button({ variant: "primary", size: "lg" })} mt-1`}
              >
                Download Free Playbook
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-base-300 bg-base-200 flex flex-col justify-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-base-content/60">What&apos;s inside</p>
          <ul className="flex flex-col gap-3">
            {[
              "Step-by-step classification methodology",
              "Audit defense strategies & documentation templates",
              "Common classification mistakes to avoid",
              "GRI application guide with real examples",
              "7 FREE tools and templates to boost your classifications",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-base text-base-content">
                <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ── Questions and structured data ──

// The page's questions, shown in the FAQ and in its FAQPage schema (which must match what's visible)
function htsFaqs({
  element,
  productName,
  summary,
  tariffElement,
  children,
  sectionChapter,
}: {
  element: HtsElement;
  productName: string;
  summary: HtsDutySummary | null;
  tariffElement: HtsElement;
  children: HtsElement[];
  sectionChapter: SectionChapter;
}): [string, string][] {
  const chapterCtx = sectionChapter
    ? `, classified under Chapter ${element.chapter} (${sectionChapter.chapterDescription})`
    : "";
  const dutyCtx = tariffElement.general ? ` The general duty rate is ${tariffElement.general}.` : "";
  const subCodesCtx = children.length > 0
    ? ` There are ${children.length} more specific sub-classifications under this code.`
    : "";

  const china = summary?.rows.find((r) => r.country.code === "CN");
  const lowest = summary ? lowestTotal(summary.rows) : null;
  // Chapter 99 lines carry sentences in the rate columns
  const general = tariffElement.general && tariffElement.general.length <= 40 && !element.htsno.startsWith("99")
    ? tariffElement.general
    : null;

  return [
    [
      `What does HTS code ${element.htsno} cover?`,
      `HTS code ${element.htsno} covers ${inSentence(productName)}${productName === element.description ? "" : ` (${element.description})`}${chapterCtx} in the US Harmonized Tariff Schedule.${dutyCtx}${subCodesCtx}`,
    ],
    ...(general
      ? [[
        `What is the duty rate for HTS ${element.htsno}?`,
        `The general (Column 1) rate of duty for HTS ${element.htsno} is ${general}.` +
        (tariffElement.special ? ` Goods that qualify for a trade program can enter at the special rate: ${tariffElement.special}.` : "") +
        (tariffElement.other ? ` The Column 2 rate, for countries without normal trade relations, is ${tariffElement.other}.` : "") +
        (summary ? " Additional Chapter 99 tariffs, such as Section 301 and Section 232, can apply on top depending on the country of origin." : ""),
      ] as [string, string]]
      : []),
    ...(summary && china
      ? [[
        `What is the US tariff on ${inSentence(productName)} (HTS ${element.htsno}) from China?`,
        dutyAnswerSentence({ productName, htsno: element.htsno, row: china, asOf: summary.asOf }),
      ] as [string, string]]
      : []),
    ...(summary && lowest
      ? [[
        `Which country has the lowest US duty on HTS ${element.htsno}?`,
        `Of the ${summary.rows.length} largest sources of US imports, the lowest total duty on HTS ${element.htsno} is ${lowest.label}, as of the tariffs in effect on ${summary.asOf}.`,
      ] as [string, string]]
      : []),
  ];
}

function StructuredData({
  element,
  productName,
  summary,
  tariffElement,
  parentElements: parents,
  sectionChapter,
  faqs,
}: {
  element: HtsElement;
  productName: string;
  summary: HtsDutySummary | null;
  tariffElement: HtsElement;
  parentElements: HtsElement[];
  sectionChapter: SectionChapter;
  faqs: [string, string][];
}) {
  const breadcrumbItems = [
    { name: "HTS Explorer", url: `https://${config.domainName}/explore` },
    ...(sectionChapter
      ? [
        {
          name: `Section ${sectionChapter.sectionNumber}: ${sectionChapter.sectionDescription}`,
          url: `https://${config.domainName}/section/${sectionChapter.sectionNumber}`,
        },
        {
          name: `Chapter ${element.chapter}: ${sectionChapter.chapterDescription}`,
          url: `https://${config.domainName}/chapter/${element.chapter}`,
        },
      ]
      : []),
    ...parents
      .filter((p) => p.htsno)
      .map((p) => ({
        name: `HTS ${p.htsno} – ${p.description}`,
        url: `https://${config.domainName}/hts/${p.htsno}`,
      })),
    {
      name: element.htsno ? `HTS ${element.htsno} – ${element.description}` : element.description.slice(0, 60),
      url: `https://${config.domainName}/hts/${element.htsno}`,
    },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };

  const dutyCtx = tariffElement.general ? ` The general duty rate is ${tariffElement.general}.` : "";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `HTS ${element.htsno}: ${productName} – Duty Rates & Tariffs`,
    ...(summary ? { dateModified: summary.asOf } : {}),
    description: `HTS code ${element.htsno}: ${productName}.${dutyCtx}`,
    url: `https://${config.domainName}/hts/${element.htsno}`,
    isPartOf: {
      "@type": "WebSite",
      name: "HTS Hero",
      url: `https://${config.domainName}`,
    },
    about: {
      "@type": "Thing",
      name: element.htsno ? `HTS ${element.htsno}` : element.description,
      description: element.description,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
