import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.svg";
import { HtsElement } from "../interfaces/hts";
import config from "@/config";
import ThemeToggle from "./ThemeToggle";
import { CheckIcon } from "@heroicons/react/16/solid";
import { CTABanner } from "./CTABanner";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content`;

interface HtsCodePageContentProps {
  element: HtsElement;
  parents: HtsElement[];
  children: HtsElement[];
  siblings: HtsElement[];
  sectionChapter: {
    sectionNumber: number;
    sectionDescription: string;
    chapterDescription: string;
  } | null;
}

function isFullHTSCode(code: string) {
  return /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/.test(code);
}

export function HtsCodePageContent({
  element,
  parents,
  children,
  siblings,
  sectionChapter,
}: HtsCodePageContentProps) {
  const tariffElement = (() => {
    if (element.general || element.special || element.other || element.additionalDuties) return element;
    for (let i = parents.length - 1; i >= 0; i--) {
      if (parents[i].general || parents[i].special || parents[i].other) return parents[i];
    }
    return element;
  })();
  const hasDutyData = tariffElement.general || tariffElement.special || tariffElement.other;
  const isTariffLevel = isFullHTSCode(element.htsno);

  return (
    <>
      <StructuredData element={element} tariffElement={tariffElement} parents={parents} children={children} sectionChapter={sectionChapter} />

      {/* CTA banner + navigation */}
      <header className="sticky top-0 z-50">
        <CTABanner
          message={`Not sure if ${element.htsno} is the right HTS code for your product?`}
          ctaText="Verify Your Classification"
          href="/classifications"
        />
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
                <li aria-hidden="true" className="mx-1 text-base-content/30">&rsaquo;</li>
                <li>
                  <Link href={`/section/${sectionChapter.sectionNumber}`} className="hover:text-primary transition-colors link link-primary">
                    Section {sectionChapter.sectionNumber}
                  </Link>
                </li>
                <li aria-hidden="true" className="mx-1 text-base-content/30">&rsaquo;</li>
                <li>
                  <Link href={`/chapter/${element.chapter}`} className="hover:text-primary transition-colors link link-primary">
                    Chapter {element.chapter}
                  </Link>
                </li>
              </>
            )}
            {parents.map((parent) => (
              <li key={parent.uuid} className="flex items-center">
                <span aria-hidden="true" className="mx-1 text-base-content/30">&rsaquo;</span>
                {parent.htsno ? (
                  <Link href={`/hts/${parent.htsno}`} className="hover:text-primary link link-primary transition-colors">
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
              <span aria-hidden="true" className="mx-1 text-base-content/30">&rsaquo;</span>
              <span className="font-semibold text-base-content">{element.htsno || "Current"}</span>
            </li>
          </ol>
        </nav>

        {/* === HERO SECTION === */}
        <section className="relative rounded-2xl bg-gradient-to-br from-primary/[0.07] via-base-200/60 to-secondary/[0.05] border border-primary/15 p-6 sm:p-8 md:p-10 mb-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3">
            <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide">
              {element.htsno}
            </h1>

            <h2 className="text-lg md:text-xl lg:text-2xl text-base-content font-semibold leading-snug max-w-4xl">
              {element.description}
            </h2>


            <h3 className="text-sm text-base-content/80 leading-relaxed max-w-4xl">
              {(() => {
                const ancestors: { key: string; node: React.ReactNode }[] = [];

                if (sectionChapter) {
                  ancestors.push({
                    key: "section",
                    node: (
                      <span className="text-base-content/80">
                        {/* Section {sectionChapter.sectionNumber} ({sectionChapter.sectionDescription}) */}
                        {sectionChapter.sectionDescription}
                      </span>
                    ),
                  });
                  ancestors.push({
                    key: "chapter",
                    node: (
                      <span className="text-base-content/80">
                        {/* Chapter {element.chapter} ({sectionChapter.chapterDescription}) */}
                        {sectionChapter.chapterDescription}
                      </span>
                    ),
                  });
                }

                parents.forEach((parent) => {
                  ancestors.push({
                    key: parent.uuid,
                    node: parent.htsno ? (
                      <span>
                        {/* <Link href={`/hts/${parent.htsno}`} className="text-primary/80 hover:text-primary hover:underline transition-colors">
                          HTS {parent.htsno}
                        </Link> */}
                        <span className="text-base-content/80"> {parent.description}</span>
                      </span>
                    ) : (
                      <span className="text-base-content/80">{parent.description}</span>
                    ),
                  });
                });

                return (
                  <> HTS Code {element.htsno} covers any article best defined as
                    {ancestors.length > 0 && (
                      <>
                        {" "}
                        {ancestors.map((a, i) => (
                          <span key={a.key}>
                            {i > 0 && <span className="text-primary mx-1.5 text-lg" aria-hidden="true">›</span>}
                            {a.node}
                          </span>
                        ))}
                      </>
                    )}
                    <span className="text-primary mx-1.5 text-lg" aria-hidden="true">›</span>
                    <span className="font-bold text-base-content">{element.description}</span>
                    {" "}in the Harmonized Tariff Schedule
                    {children.length > 0 && (
                      <> — covering {children.length} sub-classification{children.length !== 1 ? "s" : ""}</>
                    )}
                    .
                  </>
                );
              })()}
            </h3>

            {siblings.length > 0 && (
              <div className="mt-2">
                <h2 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2">
                  Related HTS Codes at This Level
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {siblings.map((sib) =>
                    sib.htsno ? (
                      <Link
                        key={sib.uuid}
                        href={`/hts/${sib.htsno}`}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-100/80 border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
                        title={sib.description}
                      >
                        <span className="text-xs font-bold text-primary group-hover:underline">{sib.htsno}</span>
                        <span className="text-xs text-base-content/40 max-w-[180px] truncate">{sib.description}</span>
                      </Link>
                    ) : (
                      <span
                        key={sib.uuid}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-base-100/50 border border-base-content/5 text-xs text-base-content/30"
                        title={sib.description}
                      >
                        {sib.description.length > 30 ? sib.description.slice(0, 27) + "..." : sib.description}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {/* <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={element.htsno ? `/duty-calculator?code=${element.htsno}` : "/duty-calculator"}
                target="_blank"
                rel="noopener noreferrer"
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
            </div> */}

            {/* <div className="mt-4 pt-5 border-t border-base-content/10">
              <h4 className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">
                About HTS Code {element.htsno}
              </h4>
              <div className="text-sm text-base-content/70 leading-relaxed space-y-3 max-w-5xl">
                <p>
                  The <strong>HTS code for {element.description.toLowerCase()}</strong> is <strong>{element.htsno}</strong>, {sectionChapter ? `found under ${sectionChapter.sectionDescription} (Section ${sectionChapter.sectionNumber}), ${sectionChapter.chapterDescription} (Chapter ${element.chapter})` : ""}.
                </p>
                {hasDutyData && (
                  <p>
                    The general rate of duty for goods classified under HTS {element.htsno} is{" "}
                    <strong>{tariffElement.general || "not specified"}</strong>.
                    {tariffElement.special && (
                      <> Special duty programs may apply, with rates of {tariffElement.special}.</>
                    )}
                    {tariffElement.other && (
                      <> The Column 2 (non-NTR) rate is {tariffElement.other}.</>
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
            </div> */}
          </div>
        </section>

        {/* === Duty Rates & Details === */}
        {(hasDutyData || element.units.length > 0 || element.quotaQuantity || element.additionalDuties) && (
          <section className="rounded-2xl border-2 border-primary/15 bg-base-100 overflow-hidden shadow-sm mb-8">
            <div className="bg-primary/[0.06] px-6 py-4 border-b border-primary/10">
              <h3 className="text-base font-bold text-base-content flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duty Rates for HTS {element.htsno}
              </h3>
            </div>

            {hasDutyData && (
              <div className="divide-y divide-base-content/5">
                <DutyRateRow label="General Rate of Duty" value={tariffElement.general} highlight />
                <DutyRateRow label="Special Rate of Duty" value={tariffElement.special} />
                <DutyRateRow label="Column 2 (Non-NTR)" value={tariffElement.other} />
              </div>
            )}

            {(element.units.length > 0 || element.quotaQuantity || element.additionalDuties) && (
              <div className="border-t border-base-content/8">
                <div className="px-6 py-3 bg-base-200/30">
                  <span className="text-xs font-bold uppercase tracking-wider text-base-content/40">
                    Additional Details
                  </span>
                </div>
                <div className="flex justify-between gap-2">

                  <div className="flex items-center justify-between px-6 py-3.5 gap-2">
                    <dt className="text-sm text-base-content/60 font-medium">Units of Quantity:</dt>
                    <dd className="text-sm font-bold text-base-content">{element.units.join(", ") || "-"}</dd>
                  </div>


                  <div className="flex items-center justify-between px-6 py-3.5 gap-2">
                    <dt className="text-sm text-base-content/60 font-medium">Quota Quantity:</dt>
                    <dd className="text-sm font-bold text-base-content">{element.quotaQuantity || "-"}</dd>
                  </div>


                  <div className="flex items-center justify-between px-6 py-3.5 gap-2">
                    <dt className="text-sm text-base-content/60 font-medium">Additional Duties:</dt>
                    <dd className="text-sm font-bold text-base-content">{element.additionalDuties || "-"}</dd>
                  </div>

                </div>
              </div>
            )}
          </section>
        )}

        {/* === Inline CTA: Duty Calculator === */}
        {/* {hasDutyData && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-primary/[0.04] px-5 py-4 mb-8">
            <p className="text-sm text-base-content/70">
              <strong className="text-base-content/90">Want the full landed cost?</strong>{" "}
              See duties, tariffs, and exemptions for HTS {element.htsno} from any country of origin.
            </p>
            <Link
              href={element.htsno ? `/duty-calculator?code=${element.htsno}` : "/duty-calculator"}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-content text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              See Landed Cost
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )} */}

        {/* === CLASSIFICATION HIERARCHY (includes sub-classifications) === */}
        {(parents.length > 0 || children.length > 0 || sectionChapter) && (
          <section className="rounded-2xl border-2 border-base-content/10 bg-base-100 overflow-hidden shadow-sm mb-8">
            <div className="bg-base-200/40 px-6 py-4 border-b border-base-content/10 flex items-center justify-between">
              <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                {/* <svg className="w-5 h-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg> */}
                Where {element.htsno || "This Code"} Appears in the Harmonized Tariff Schedule
              </h2>
              {children.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {children.length} sub-code{children.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="p-6">
              <ol className="relative ml-3 border-l-2 border-base-content/10 flex flex-col gap-0">
                {sectionChapter && (
                  <>
                    <li className="relative pl-8 pb-5">
                      <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-base-content border-2 border-base-300" />
                      <div className="flex flex-col gap-0.5">
                        <Link href={`/section/${sectionChapter.sectionNumber}`} className="text-xs font-bold uppercase tracking-wider link link-primary">
                          Section {sectionChapter.sectionNumber}
                        </Link>
                        <span className="text-sm text-base-content/60 leading-snug">
                          {sectionChapter.sectionDescription}
                        </span>
                      </div>
                    </li>
                    <li className="relative pl-8 pb-5">
                      <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-base-content border-2 border-base-300" />
                      <div className="flex flex-col gap-0.5">
                        <Link href={`/chapter/${element.chapter}`} className="text-xs font-bold uppercase tracking-wider link link-primary">
                          Chapter {element.chapter}
                        </Link>
                        <span className="text-sm text-base-content/60 leading-snug">
                          {sectionChapter.chapterDescription}
                        </span>
                      </div>
                    </li>
                  </>
                )}

                {parents.map((parent) => (
                  <li key={parent.uuid} className="relative pl-8 pb-5">
                    <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-base-content/80 border-2 border-base-300" />
                    <div className="flex flex-col gap-0.5">
                      {parent.htsno ? (
                        <Link href={`/hts/${parent.htsno}`} className="text-sm font-bold link link-primary">
                          {parent.htsno}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                          —
                        </span>
                      )}
                      <span className="text-sm text-base-content/60 leading-snug">
                        {parent.description}
                      </span>
                    </div>
                  </li>
                ))}

                <li className={`relative pl-8${children.length > 0 ? " pb-6" : ""}`}>
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

                {children.length > 0 && (
                  <>
                    <li className="relative pl-8 pb-3">
                      <h4 className="text-xs font-bold text-base-content/40 uppercase tracking-wider pt-0.5">
                        HTS Codes Under {element.htsno || "This Classification"}
                      </h4>
                    </li>
                    {children.map((child) => (
                      <li key={child.uuid} className="relative pl-8 pb-4 last:pb-0">
                        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-base-content/10 border-2 border-base-100" />
                        {child.htsno ? (
                          <Link href={`/hts/${child.htsno}`} className="group flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-primary group-hover:underline flex items-center gap-1.5">
                              {child.htsno}
                              <svg className="w-3 h-3 text-base-content/15 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                            <span className="text-sm text-base-content/60 group-hover:text-base-content/80 leading-snug transition-colors">
                              {child.description}
                            </span>
                          </Link>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                              —
                            </span>
                            <span className="text-sm text-base-content/60 leading-snug">
                              {child.description}
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                  </>
                )}
              </ol>
            </div>
          </section>
        )}

        {/* === Inline CTA: Classification Assistant === */}
        {/* {(parents.length > 0 || children.length > 0) && (
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
        )} */}

        {/* === Playbook Banner === */}
        <section className="relative rounded-2xl overflow-hidden border-2 border-secondary/20 bg-base-100 shadow-md mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.06] via-transparent to-secondary/[0.03] pointer-events-none" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: book cover + headline + CTA */}
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
              {/* Book cover */}
              <div className="relative w-32 sm:w-36 md:w-40 aspect-[2/3] rounded-xl overflow-hidden border-2 border-base-content/10 shadow-lg shrink-0">
                <Image
                  src={`${STORAGE_BASE}/book-cover.jpg`}
                  alt="The Audit-Ready Classifications Playbook"
                  fill
                  sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, 160px"
                  className="object-cover"
                />
              </div>
              {/* Text + CTA */}
              <div className="flex flex-col gap-3 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
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
                <p className="text-sm text-base-content/60 leading-relaxed">
                  Learn how to create HTS classifications that reduce import risk and defend profits — faster than ever.
                </p>
                <div>
                  <Link
                    href="/the-audit-ready-classifications-playbook"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-content font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/25"
                  >
                    Download Free Playbook
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            {/* Right: what's inside */}
            <div className="p-6 sm:p-8 lg:border-l border-t lg:border-t-0 border-secondary/10 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-4">
                What&apos;s inside
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "Step-by-step classification methodology",
                  "Audit defense strategies & documentation templates",
                  "Common classification mistakes to avoid",
                  "GRI application guide with real examples",
                  "7 FREE tools and templates to boost your classifications",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-base-content/70">
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

          {/* CTA 1: Classification Assistant */}
          <section className="relative rounded-2xl overflow-hidden border-2 border-secondary/20 bg-base-100 shadow-sm flex flex-col">
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/[0.03] px-6 py-5 border-b border-secondary/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-xl">
                  <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <h3 className="text-base font-bold text-base-content">Classification Assistant</h3>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-sm text-base-content/60 leading-relaxed mb-5 flex-1">
                Produce <strong className="text-base-content/80">audit-ready classifications</strong> in minutes — AI-powered candidate discovery, Legal Note & GRI analysis, CROSS
                validation, and one-click professional reports.
              </p>
              <Link
                href="/about"
                className="block text-center px-6 py-3 rounded-xl bg-secondary text-secondary-content font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/25"
              >
                Classify a Product Now
              </Link>
            </div>
          </section>

          {/* CTA 2: Duty Calculator */}
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
                See the <strong className="text-base-content/80">full import cost breakdown</strong> for
                HTS {element.htsno || "any code"} from any country — base duties, Section 122 / 232 / 301 tariffs,
                exemptions, and trade programs.
              </p>
              <Link
                href={element.htsno ? `/duty-calculator/${element.htsno}` : "/duty-calculator"}
                className="block text-center px-6 py-3 rounded-xl bg-primary text-primary-content font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25"
              >
                See Duty Rates for {element.htsno || "This Code"}
              </Link>
            </div>
          </section>

          {/* CTA 3: Tariff Impact Checker */}
          <section className="relative rounded-2xl overflow-hidden border-2 border-accent/20 bg-base-100 shadow-sm flex flex-col">
            <div className="bg-gradient-to-br from-accent/10 to-accent/[0.03] px-6 py-5 border-b border-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <CheckIcon className="text-accent w-5 h-5" />
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
                Instantly see if new tariffs or HTS updates affect your imports and get notified when they do!
              </p>
              <Link
                href={element.htsno ? `/tariffs/impact-checker?codes=${element.htsno}` : "/tariffs/impact-checker"}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-6 py-3 rounded-xl bg-accent text-accent-content font-bold text-sm hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/25"
              >
                Check {element.htsno || "Your Imports"}
              </Link>
            </div>
          </section>

        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-base-content/10 bg-base-200/20">
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

const GENERIC_DESC_RE = /^(other|parts|thereof|mixtures|the foregoing|articles|not elsewhere)/i;

function isShortProductName(description: string) {
  return description.length <= 40 && !GENERIC_DESC_RE.test(description.trim());
}

function StructuredData({
  element,
  tariffElement,
  parents,
  children,
  sectionChapter,
}: {
  element: HtsElement;
  tariffElement: HtsElement;
  parents: HtsElement[];
  children: HtsElement[];
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

  const descLower = element.description.toLowerCase();
  const chapterCtx = sectionChapter
    ? `, classified under Chapter ${element.chapter} (${sectionChapter.chapterDescription})`
    : "";
  const dutyCtx = tariffElement.general ? ` The general duty rate is ${tariffElement.general}.` : "";
  const shortName = isShortProductName(element.description);

  const faqQuestion = shortName
    ? `What is the HTS code for ${descLower}?`
    : `What does HTS code ${element.htsno} cover?`;

  const faqAnswer = shortName
    ? `The HTS code for ${descLower} is ${element.htsno}${chapterCtx} in the US Harmonized Tariff Schedule.${dutyCtx}${children.length > 0 ? ` There are ${children.length} more specific sub-classifications under this code.` : ""}`
    : `HTS code ${element.htsno} covers ${descLower}${chapterCtx} in the US Harmonized Tariff Schedule.${dutyCtx}${children.length > 0 ? ` There are ${children.length} more specific sub-classifications under this code.` : ""}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: faqQuestion,
        acceptedAnswer: {
          "@type": "Answer",
          text: faqAnswer,
        },
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: shortName
      ? `HTS Code for ${element.description} – ${element.htsno}`
      : `HTS ${element.htsno} – ${element.description}`,
    description: shortName
      ? `The HTS code for ${descLower} is ${element.htsno}.${dutyCtx}`
      : `HTS code ${element.htsno}: ${element.description}.${dutyCtx}`,
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
