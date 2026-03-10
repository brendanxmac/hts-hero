import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.svg";
import { HtsElement } from "../interfaces/hts";
import config from "@/config";
import ThemeToggle from "./ThemeToggle";
import { CheckIcon } from "@heroicons/react/16/solid";


interface HtsCodePageContentProps {
  element: HtsElement;
  parents: HtsElement[];
  children: HtsElement[];
  sectionChapter: {
    sectionNumber: number;
    sectionDescription: string;
    chapterDescription: string;
  } | null;
}

function isFullHTSCode(code: string) {
  return /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/.test(code);
}

function getIndentLabel(indent: string): string {
  const level = Number(indent);
  if (level === 0) return "Heading";
  if (level === 1) return "Subheading";
  return `Indent ${level}`;
}

function getDigitCount(htsno: string): number {
  return htsno.replace(/\./g, "").length;
}

function getCodeDepthLabel(htsno: string): string {
  const digits = getDigitCount(htsno);
  if (digits <= 4) return "Heading";
  if (digits <= 6) return "Subheading";
  if (digits <= 8) return "Tariff Line";
  return "Statistical Suffix";
}

export function HtsCodePageContent({
  element,
  parents,
  children,
  sectionChapter,
}: HtsCodePageContentProps) {
  const hasDutyData = element.general || element.special || element.other;
  const isTariffLevel = isFullHTSCode(element.htsno);

  return (
    <>
      <StructuredData element={element} parents={parents} sectionChapter={sectionChapter} />

      {/* CTA banner + navigation */}
      <header className="sticky top-0 z-50">
        {/* Full-width CTA banner */}
        <div className="bg-gradient-to-r from-primary via-primary to-primary/90 shadow-md shadow-primary/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
            <p className="text-primary-content text-xs sm:text-sm lg:text-base font-medium text-center sm:text-left">
              Using this HTS code for your product?
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href={element.htsno ? `/duty-calculator/${element.htsno}` : "/duty-calculator"}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-lg bg-primary-content/10 hover:bg-primary-content/25 border border-primary-content/20 text-primary-content text-xs sm:text-sm font-bold transition-all"
              >
                See Your Duty Costs
              </Link>
              <Link
                href="/classifications"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-lg bg-primary-content text-primary text-xs sm:text-sm font-bold hover:bg-primary-content/90 transition-all shadow-sm"
              >
                Verify Your Classification
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
        {/* Logo bar */}
        <div className="bg-base-100/80 backdrop-blur-lg border-b border-base-content/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-5"
                priority
                width={24}
                height={24}
              />
              <span className="font-bold text-base-content text-base">
                {config.appName}
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-base-content/50">
            <li>
              <Link href="/explore" className="hover:text-primary transition-colors">
                HTS
              </Link>
            </li>
            {sectionChapter && (
              <>
                <li aria-hidden="true" className="mx-0.5 text-base-content/30">&rsaquo;</li>
                <li>Section {sectionChapter.sectionNumber}</li>
                <li aria-hidden="true" className="mx-0.5 text-base-content/30">&rsaquo;</li>
                <li>Ch. {element.chapter}</li>
              </>
            )}
            {parents.map((parent) => (
              <li key={parent.uuid} className="flex items-center">
                <span aria-hidden="true" className="mx-0.5 text-base-content/30">&rsaquo;</span>
                {parent.htsno ? (
                  <Link href={`/hts/${parent.htsno}`} className="hover:text-primary transition-colors">
                    {parent.htsno}
                  </Link>
                ) : (
                  <span className="max-w-[150px] truncate" title={parent.description}>
                    {parent.description.split(" ").slice(0, 3).join(" ")}...
                  </span>
                )}
              </li>
            ))}
            <li className="flex items-center">
              <span aria-hidden="true" className="mx-0.5 text-base-content/30">&rsaquo;</span>
              <span className="font-semibold text-base-content">{element.htsno || "Current"}</span>
            </li>
          </ol>
        </nav>

        {/* === HERO SECTION === */}
        <section className="relative rounded-2xl bg-gradient-to-br from-primary/[0.07] via-base-200/60 to-secondary/[0.05] border border-primary/15 p-6 sm:p-8 md:p-10 mb-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3">
            {/* Code badge + depth label */}
            <div className="flex flex-wrap items-center gap-3">
              {element.htsno && (
                <h1 className="py-2.5 text-primary text-2xl md:text-2xl lg:text-3xl font-bold tracking-wide">
                  {element.htsno}
                </h1>
              )}
            </div>

            {/* Description as SEO-rich heading */}
            <h2 className="text-lg md:text-xl lg:text-2xl text-base-content font-semibold leading-relaxed max-w-4xl">
              {element.description}
            </h2>

            {/* Section & Chapter tags */}
            {sectionChapter && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-100 border border-base-content/10 text-base-content/60">
                  <span className="shrink-0 w-2 h-2 rounded-full bg-primary/40" />
                  Section {sectionChapter.sectionNumber}: {sectionChapter.sectionDescription}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-100 border border-base-content/10 text-base-content/60">
                  <span className="shrink-0 w-2 h-2 rounded-full bg-secondary/40" />
                  Chapter {element.chapter}: {sectionChapter.chapterDescription}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={element.htsno ? `/duty-calculator/${element.htsno}` : "/duty-calculator"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-content font-semibold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                See Duty &amp; Tariff Rates
              </Link>
              {element.htsno && (
                <a
                  href={`https://rulings.cbp.gov/search?term=${encodeURIComponent(
                    isTariffLevel ? element.htsno.slice(0, -3) : element.htsno
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-base-100 border border-base-content/15 text-sm font-semibold hover:border-secondary/30 hover:bg-secondary/5 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  See CROSS Rulings
                </a>
              )}
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-base-100 border border-base-content/15 text-sm font-semibold hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Browse HTS
              </Link>
            </div>
          </div>
        </section>

        {/* === TWO-COLUMN GRID: Duty Rates + Details === */}
        {(hasDutyData || element.units.length > 0 || element.quotaQuantity || element.additionalDuties) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Duty Rates Card */}
            {hasDutyData && (
              <section className="rounded-2xl border-2 border-primary/15 bg-base-100 overflow-hidden shadow-sm">
                <div className="bg-primary/[0.06] px-6 py-4 border-b border-primary/10">
                  <h3 className="text-base font-bold text-base-content flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Duty Rates for HTS {element.htsno}
                  </h3>
                </div>
                <div className="divide-y divide-base-content/5">
                  <DutyRateRow label="General Rate of Duty" value={element.general} highlight />
                  <DutyRateRow label="Special Rate of Duty" value={element.special} />
                  <DutyRateRow label="Column 2 (Non-NTR)" value={element.other} />
                </div>
              </section>
            )}

            {/* Additional Details Card */}
            {(element.units.length > 0 || element.quotaQuantity || element.additionalDuties) && (
              <section className="rounded-2xl border-2 border-base-content/10 bg-base-100 overflow-hidden shadow-sm">
                <div className="bg-base-200/40 px-6 py-4 border-b border-base-content/8">
                  <h3 className="text-base font-bold text-base-content flex items-center gap-2">
                    <svg className="w-5 h-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Additional Details
                  </h3>
                </div>
                <div className="p-6 flex flex-col gap-5">
                  {element.units.length > 0 && (
                    <dl>
                      <dt className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-1">
                        Units of Quantity
                      </dt>
                      <dd className="text-sm text-base-content font-medium">
                        {element.units.join(", ")}
                      </dd>
                    </dl>
                  )}
                  {element.quotaQuantity && (
                    <dl>
                      <dt className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-1">
                        Quota Quantity
                      </dt>
                      <dd className="text-sm text-base-content font-medium">
                        {element.quotaQuantity}
                      </dd>
                    </dl>
                  )}
                  {element.additionalDuties && (
                    <dl>
                      <dt className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-1">
                        Additional Duties
                      </dt>
                      <dd className="text-sm text-base-content font-medium">
                        {element.additionalDuties}
                      </dd>
                    </dl>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* === Inline CTA: Duty Calculator === */}
        {hasDutyData && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-primary/[0.04] px-5 py-4 mb-8">
            <p className="text-sm text-base-content/70">
              <strong className="text-base-content/90">Want the full landed cost?</strong>{" "}
              See duties, tariffs, and exemptions for HTS {element.htsno} from any country of origin.
            </p>
            <Link
              href={element.htsno ? `/duty-calculator/${element.htsno}` : "/duty-calculator"}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-content text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              See Duty Rates
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* === CLASSIFICATION HIERARCHY === */}
        {parents.length > 0 && (
          <section className="rounded-2xl border-2 border-base-content/10 bg-base-100 overflow-hidden shadow-sm mb-8">
            <div className="bg-base-200/40 px-6 py-4 border-b border-base-content/8">
              <h3 className="text-base font-bold text-base-content flex items-center gap-2">
                <svg className="w-5 h-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Where {element.htsno} fits in the HTS
              </h3>
            </div>
            <div className="p-6">
              <ol className="relative ml-3 border-l-2 border-base-content/10 flex flex-col gap-0">
                {parents.map((parent, i) => (
                  <li key={parent.uuid} className="relative pl-8 pb-5 last:pb-0">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-base-content/10 border-2 border-base-100" />
                    <div className="flex flex-col gap-0.5">
                      {parent.htsno ? (
                        <Link href={`/hts/${parent.htsno}`} className="text-sm font-bold text-primary hover:underline">
                          {parent.htsno}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                          {getIndentLabel(parent.indent)}
                        </span>
                      )}
                      <span className="text-sm text-base-content/60 leading-snug">
                        {parent.description}
                      </span>
                    </div>
                  </li>
                ))}
                {/* Current element - highlighted */}
                <li className="relative pl-8">
                  <span className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-primary border-2 border-base-100 shadow-md shadow-primary/30" />
                  <div className="flex flex-col gap-0.5 bg-primary/[0.06] -ml-2 px-4 py-3 rounded-xl border border-primary/15">
                    {element.htsno && (
                      <span className="text-sm font-bold text-primary">{element.htsno}</span>
                    )}
                    <span className="text-sm text-base-content font-medium leading-snug">
                      {element.description}
                    </span>
                  </div>
                </li>
              </ol>
            </div>
          </section>
        )}

        {/* === Inline CTA: Classification Assistant === */}
        {parents.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-accent/[0.05] border border-accent/10 px-5 py-4 mb-8">
            <div className="flex items-start sm:items-center gap-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mt-0.5 sm:mt-0">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <p className="text-sm text-base-content/70">
                <strong className="text-base-content/90">Need to classify a product?</strong>{" "}
                Get an audit-ready HTS classification in minutes with AI-powered analysis, GRI reasoning, and CROSS validation.
              </p>
            </div>
            <Link
              href="/classifications"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-accent-content text-sm font-bold hover:bg-accent/90 transition-all shadow-sm"
            >
              Try Classification Assistant
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* === SUB-CLASSIFICATIONS === */}
        {children.length > 0 && (
          <section className="rounded-2xl border-2 border-base-content/10 bg-base-100 overflow-hidden shadow-sm mb-8">
            <div className="bg-base-200/40 px-6 py-4 border-b border-base-content/8 flex items-center justify-between">
              <h3 className="text-base font-bold text-base-content flex items-center gap-2">
                <svg className="w-5 h-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                HTS Codes Under {element.htsno || "This Classification"}
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary">
                {children.length}
              </span>
            </div>
            <div className="divide-y divide-base-content/8">
              {children.map((child) => {
                const row = (
                  <div className="flex items-center gap-4 px-6 py-4">
                    {child.htsno ? (
                      <span className="shrink-0 min-w-[100px] px-3 py-1.5 rounded-lg bg-primary/[0.07] border border-primary/10 text-sm font-mono font-bold text-primary text-center group-hover:bg-primary/15 transition-colors">
                        {child.htsno}
                      </span>
                    ) : (
                      <span className="shrink-0 min-w-[100px] px-3 py-1.5 rounded-lg bg-base-content/5 text-xs font-semibold text-base-content/40 text-center uppercase tracking-wider">
                        {getIndentLabel(child.indent)}
                      </span>
                    )}
                    <span className="text-sm text-base-content/70 group-hover:text-base-content transition-colors leading-snug flex-1">
                      {child.description}
                    </span>
                    {child.htsno && (
                      <svg
                        className="shrink-0 w-4 h-4 text-base-content/15 group-hover:text-primary transition-colors"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                );

                return child.htsno ? (
                  <Link
                    key={child.uuid}
                    href={`/hts/${child.htsno}`}
                    className="block hover:bg-primary/[0.04] transition-colors group"
                  >
                    {row}
                  </Link>
                ) : (
                  <div key={child.uuid} className="group">
                    {row}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* === Playbook Banner === */}
        <section className="relative rounded-2xl overflow-hidden border-2 border-secondary/20 bg-base-100 shadow-md mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.06] via-transparent to-secondary/[0.03] pointer-events-none" />
          <div className="relative grid grid-cols-1 md:grid-cols-5 gap-0">
            {/* Left: headline + CTA */}
            <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-center gap-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-secondary text-secondary-content text-[10px] font-extrabold uppercase tracking-widest">
                  Free
                </span>
                <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                  Playbook + 7 Bonuses
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-base-content leading-tight">
                The Audit-Ready Classifications Playbook
              </h3>
              <p className="text-sm text-base-content/60 leading-relaxed max-w-md">
                Learn how to create HTS classifications that reduce import risk and defend profits — faster than ever.
              </p>
              <Link
                href="/the-audit-ready-classifications-playbook"
                className="self-start inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-content font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/25"
              >
                Download Free Playbook
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </Link>
            </div>
            {/* Right: what's inside */}
            <div className="md:col-span-2 p-6 sm:p-8 md:border-l border-t md:border-t-0 border-secondary/10 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-3">
                What&apos;s inside
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  "Step-by-step classification methodology",
                  "Audit defense strategies & documentation templates",
                  "Common classification mistakes to avoid",
                  "GRI application guide with real examples",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-base-content/70">
                    <svg className="shrink-0 w-4 h-4 text-secondary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* === SEO-RICH PROSE SECTION === */}
        <section className="rounded-2xl bg-base-200/30 border border-base-content/8 p-6 sm:p-8 mb-8">
          <h3 className="text-lg font-bold text-base-content mb-3">
            About HTS Code {element.htsno}
          </h3>
          <div className="text-sm text-base-content/70 leading-relaxed space-y-3 max-w-5xl">
            <p>
              <strong>HTS {element.htsno}</strong> is a classification code within the United States
              Harmonized Tariff Schedule (HTSUS){sectionChapter ? `, found under Section ${sectionChapter.sectionNumber} (${sectionChapter.sectionDescription}), Chapter ${element.chapter} (${sectionChapter.chapterDescription})` : ""}.
              It covers: <em>{element.description.toLowerCase()}</em>.
            </p>
            {hasDutyData && (
              <p>
                The general rate of duty for goods classified under HTS {element.htsno} is{" "}
                <strong>{element.general || "not specified"}</strong>.
                {element.special && (
                  <> Special duty programs may apply, with rates of {element.special}.</>
                )}
                {element.other && (
                  <> The Column 2 (non-NTR) rate is {element.other}.</>
                )}
              </p>
            )}
            {parents.length > 0 && (
              <p>
                This code falls under the broader classification of{" "}
                {parents
                  .filter((p) => p.htsno)
                  .map((p, i, arr) => (
                    <span key={p.uuid}>
                      <Link href={`/hts/${p.htsno}`} className="text-primary hover:underline font-medium">
                        HTS {p.htsno}
                      </Link>
                      {i < arr.length - 1 ? (i === arr.length - 2 ? " and " : ", ") : ""}
                    </span>
                  ))}
                {" "}in the harmonized tariff schedule.
              </p>
            )}
            {children.length > 0 && (
              <p>
                HTS {element.htsno} has {children.length} sub-classification{children.length !== 1 ? "s" : ""} for
                more specific product categorization.
              </p>
            )}
            <p>
              Use the <Link href={`/duty-calculator?code=${element.htsno || ""}`} className="text-primary hover:underline font-medium">Duty Calculator</Link> to
              find the total landed cost including all applicable tariffs, or
              the <Link href="/explore" className="text-primary hover:underline font-medium">HTS Explorer</Link> to
              browse the full tariff schedule.
            </p>
            <p>
              Importers who need to classify products under HTS {element.htsno} or related codes can
              use HTS Hero&apos;s{" "}
              <Link href="/classifications" className="text-primary hover:underline font-medium">Classification Assistant</Link> to
              produce audit-ready classification reports in minutes — complete with GRI analysis and
              CROSS rulings validation. For a deeper understanding of how to build defensible
              classifications, download{" "}
              <Link href="/the-audit-ready-classifications-playbook" className="text-secondary hover:underline font-medium">
                The Audit-Ready Classifications Playbook
              </Link>{" "}
              for FREE.
            </p>
          </div>
        </section>

        {/* === CTA GRID === */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-base-content">
            Tools for Importers & Brokers Working with HTS {element.htsno || "Codes"}
          </h3>
          <p className="text-sm text-base-content/50 mt-1">
            Everything you need to classify, calculate duties, and stay compliant.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* CTA 1: Duty Calculator */}
          <section className="relative rounded-2xl overflow-hidden border-2 border-primary/20 bg-base-100 shadow-sm flex flex-col">
            <div className="bg-gradient-to-br from-primary/10 to-primary/[0.03] px-6 py-5 border-b border-primary/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <h3 className="text-base font-bold text-base-content">Duty & Tariff Calculator</h3>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-sm text-base-content/60 leading-relaxed mb-5 flex-1">
                See the <strong className="text-base-content/80">full cost breakdown</strong> for
                HTS {element.htsno || "any code"} from any country — base duties, Section 301 tariffs,
                anti-dumping duties, exemptions, and trade programs.
              </p>
              <Link
                href={element.htsno ? `/duty-calculator/${element.htsno}` : "/duty-calculator"}
                className="block text-center px-6 py-3 rounded-xl bg-primary text-primary-content font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25"
              >
                See Duty Rates for {element.htsno || "This Code"}
              </Link>
            </div>
          </section>

          {/* CTA 2: Tariff Impact Checker */}
          <section className="relative rounded-2xl overflow-hidden border-2 border-secondary/20 bg-base-100 shadow-sm flex flex-col">
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/[0.03] px-6 py-5 border-b border-secondary/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center">
                  <CheckIcon className="text-secondary w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-base-content">Tariff Impact Checker</h3>
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              {/* <h4 className="text-sm font-bold text-base-content mb-1.5">
                The Audit-Ready Classifications Playbook
              </h4> */}
              <p className="text-sm text-base-content/60 leading-relaxed mb-5 flex-1">
                Instantly see if new tariffs or HTS updates will affect your imports and get notified when they do!
              </p>
              <Link
                href={element.htsno ? `/tariffs/impact-checker?codes=${element.htsno}` : "/tariffs/impact-checker"}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-6 py-3 rounded-xl bg-secondary text-secondary-content font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/25"
              >
                Check {element.htsno || "Your Imports"} Now!
              </Link>
            </div>
          </section>

          {/* CTA 3: Classification Assistant */}
          <section className="relative rounded-2xl overflow-hidden border-2 border-accent/20 bg-base-100 shadow-sm flex flex-col">
            <div className="bg-gradient-to-br from-accent/10 to-accent/[0.03] px-6 py-5 border-b border-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-xl">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <h3 className="text-base font-bold text-base-content">Classification Assistant</h3>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-sm text-base-content/60 leading-relaxed mb-5 flex-1">
                Produce an <strong className="text-base-content/80">audit-ready HTS classification</strong> for
                any product in minutes — AI-powered candidate discovery, Legal Note & GRI analysis, CROSS
                validation, and one-click professional reports.
              </p>
              <Link
                href="/about"
                className="block text-center px-6 py-3 rounded-xl bg-accent text-accent-content font-bold text-sm hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/25"
              >
                Classify a Product Now
              </Link>
            </div>
          </section>

        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-base-content/8 bg-base-200/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/40">
          <span>&copy; {new Date().getFullYear()} HTS Hero. Data sourced from the USITC Harmonized Tariff Schedule.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-base-content transition-colors">About</Link>
            <Link href="/blog" className="hover:text-base-content transition-colors">Blog</Link>
            <Link href="/privacy-policy" className="hover:text-base-content transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-base-content transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

function DutyRateRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | null;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 ${highlight ? "bg-primary/[0.03]" : ""}`}>
      <dt className="text-sm text-base-content/60 font-medium">{label}</dt>
      <dd className={`text-sm font-bold ${value ? "text-base-content" : "text-base-content/30"}`}>
        {value || "—"}
      </dd>
    </div>
  );
}

function StructuredData({
  element,
  parents,
  sectionChapter,
}: {
  element: HtsElement;
  parents: HtsElement[];
  sectionChapter: HtsCodePageContentProps["sectionChapter"];
}) {
  const breadcrumbItems = [
    { name: "HTS Explorer", url: `https://${config.domainName}/explore` },
    ...(sectionChapter
      ? [
        { name: `Section ${sectionChapter.sectionNumber}: ${sectionChapter.sectionDescription}`, url: "" },
        { name: `Chapter ${element.chapter}: ${sectionChapter.chapterDescription}`, url: "" },
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

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `HTS ${element.htsno} – ${element.description}`,
    description: `Look up HTS code ${element.htsno}: ${element.description}${element.general ? `. General duty rate: ${element.general}.` : ""}`,
    url: `https://${config.domainName}/hts/${element.htsno}`,
    isPartOf: {
      "@type": "WebSite",
      name: "HTS Hero",
      url: `https://${config.domainName}`,
    },
    ...(sectionChapter
      ? {
        about: {
          "@type": "Thing",
          name: `HTS ${element.htsno}`,
          description: element.description,
        },
      }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
