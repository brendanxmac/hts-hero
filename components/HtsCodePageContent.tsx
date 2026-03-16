import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.svg";
import { HtsElement } from "../interfaces/hts";
import config from "@/config";
import ThemeToggle from "./ThemeToggle";
import { CTABanner } from "./CTABanner";
import { getFirstChapterOfSection } from "@/libs/hts";
import { ClassificationCTA } from "./ClassificationCTA";
import { ClassificationHierarchy, HierarchyItem } from "./classification-detail/ClassificationHierarchy";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content`;

interface HtsCodePageContentProps {
  element: HtsElement;
  parentElements: HtsElement[];
  childrenElements: HtsElement[];
  siblingElements: HtsElement[];
  sectionChapter: {
    sectionNumber: number;
    sectionDescription: string;
    chapterDescription: string;
  } | null;
}

export function HtsCodePageContent({
  element,
  parentElements: parents,
  childrenElements: children,
  siblingElements: siblings,
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

  return (
    <>
      <StructuredData element={element} tariffElement={tariffElement} parentElements={parents} childrenElements={children} sectionChapter={sectionChapter} />

      {/* CTA banner + navigation */}
      <header className="">
        <CTABanner
          message={`Not sure if ${element.htsno} is the correct HTS code for your product?`}
          ctaText="Verify Your HTS Code"
          href="/classifications/new"
          subText="Produce an audit-ready classification in minutes"
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-6 flex flex-col gap-6">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
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
        {/* bg-gradient-to-br from-primary/[0.07] via-base-200/60 to-secondary/[0.05] */}
        <section className="relative rounded-2xl border border-primary/15 p-6 md:p-8">
          {/* <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" /> */}
          {/* <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" /> */}

          <div className="relative z-10 flex flex-col gap-3">
            <div>
              <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide">
                {element.htsno}
              </h1>
            </div>

            <h2 className="text-lg md:text-xl lg:text-2xl text-base-content font-semibold leading-snug">
              {element.description}
            </h2>


            <h3 className="text-sm text-base-content/80 leading-relaxed">
              {(() => {
                const ancestors: { key: string; node: React.ReactNode }[] = [];

                if (sectionChapter) {
                  ancestors.push({
                    key: "section",
                    node: (
                      <span className="text-base-content/80">
                        {sectionChapter.sectionDescription}
                      </span>
                    ),
                  });
                  ancestors.push({
                    key: "chapter",
                    node: (
                      <span className="text-base-content/80">
                        {sectionChapter.chapterDescription}
                      </span>
                    ),
                  });
                }

                parents.forEach((parent) => {
                  ancestors.push({
                    key: parent.uuid,
                    node: <span className="text-base-content/80">{parent.description}</span>
                    ,
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
                <h2 className="text-xs font-bold text-base-content/40 uppercase tracking-wider pt-0.5 mb-2">
                  Other HTS Codes at This Level:
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {siblings.map((sib) =>
                    sib.htsno ? (
                      <Link
                        key={sib.uuid}
                        href={`/hts/${sib.htsno}`}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-100/10 border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
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

            {/* <div className="mt-3 pt-4 border-t border-base-content/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-base-content">Need the correct HTS code for your product?</p>
                <p className="text-xs text-base-content/50">Generate an audit-ready classification in minutes with AI-powered candidate discovery, GRI and Legal Note analysis, and CROSS ruling validation</p>
              </div>
              <Link
                href="/classifications/new"
                className="btn btn-primary"
              >
                Classify Product <span aria-hidden="true">&rarr;</span>
              </Link>
            </div> */}
          </div>
        </section>

        {/* Interactive Classification CTA */}

        <ClassificationCTA
          title={`Need the Right HTS Code for Your Product?`}
          subtitle="Enter your product description and we'll help you find it."
          ctaButtonText="Find My HTS Code"
        // showWorkflowPreview={false}'
        // TODO: Fix this
        />



        {/* === Duty Rates & Details === */}
        {(hasDutyData || element.units.length > 0 || element.quotaQuantity || element.additionalDuties) && (
          <section className="rounded-2xl border border-base-content/20 bg-base-100 overflow-hidden shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-base-content/20">
              <h3 className="text-base font-bold text-base-content flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Base Duty Rates for {element.htsno}
              </h3>
            </div>

            {hasDutyData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <DutyRateRow label="General Rate of Duty" value={tariffElement.general} />
                <DutyRateRow label="Special Rate of Duty" value={tariffElement.special} />
                <DutyRateRow label="Column 2 (Non-NTR)" value={tariffElement.other} />
              </div>
            )}

            {(element.units.length > 0 || element.quotaQuantity || element.additionalDuties) && (
              <div className="border-t border-base-content/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <DutyRateRow label="Units of Quantity" value={element.units.join(", ")} />
                  <DutyRateRow label="Quota Quantity" value={element.quotaQuantity} />
                  <DutyRateRow label="Additional Duties" value={element.additionalDuties} />
                </div>
              </div>
            )}

            <div className="border-t border-base-content/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-base-content">Importing under {element.htsno}?</p>
                <p className="text-xs text-base-content/50">Calculate total import duties, tariffs, and trade agreement exemptions for your shipment.</p>
              </div>
              <Link
                href={element.htsno ? `/duty-calculator?code=${element.htsno}` : "/duty-calculator"}
                className="btn btn-primary"
              >
                Calculate Total Duty <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </section>
        )}


        {/* === CLASSIFICATION HIERARCHY (includes sub-classifications) === */}
        {(parents.length > 0 || children.length > 0 || sectionChapter) && (
          <section className="rounded-2xl border-2 border-base-content/10 bg-base-100 overflow-hidden shadow-sm mb-8">
            <div className="bg-base-200/40 px-6 py-4 border-b border-base-content/10 flex items-center gap-2">
              <h2 className="text-base font-bold text-base-content">
                Where {element.htsno || "This Code"} Appears in the Harmonized Tariff Schedule
              </h2>
              {children.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                  {children.length} sub-code{children.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="p-6">
              <ClassificationHierarchy
                continueLineAfterLast={children.length > 0}
                items={[
                  ...(sectionChapter
                    ? [
                        {
                          label: `Section ${sectionChapter.sectionNumber}`,
                          description: sectionChapter.sectionDescription,
                          href: `/section/${sectionChapter.sectionNumber}`,
                        },
                        {
                          label: `Chapter ${element.chapter}`,
                          description: sectionChapter.chapterDescription,
                          href: `/chapter/${element.chapter}`,
                        },
                      ]
                    : []),
                  ...parents.map((parent) => ({
                    label: parent.htsno || "—",
                    code: parent.htsno || undefined,
                    description: parent.description,
                    href: parent.htsno ? `/hts/${parent.htsno}` : undefined,
                  })),
                  {
                    label: element.htsno || "Current",
                    code: element.htsno || undefined,
                    description: element.description,
                    isCurrent: true,
                  },
                ] satisfies HierarchyItem[]}
              />

              {children.length > 0 && (
                <ol className="relative ml-3 border-l-2 border-base-content/10 flex flex-col gap-0 mt-0">
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
                </ol>
              )}
            </div>

            <div className="border-t border-base-content/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-base-content">Explore the Full Tariff Schedule</p>
                <p className="text-xs text-base-content/50">Easily navigate every part of the HTS with an interactive HTS explorer, and compare tariff rates for any country.</p>
              </div>
              <Link
                href="/explore"
                className="btn btn-primary"
              >
                Explore the HTS <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </section>
        )}

        {/* === Section & Chapter Notes === */}
        {sectionChapter && element.chapter && (
          <section className="rounded-2xl border-2 border-base-content/10 bg-base-100 overflow-hidden shadow-sm mb-8">
            <div className="bg-base-200/40 px-6 py-4 border-b border-base-content/10">
              <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                <svg className="w-5 h-5 text-base-content/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Section and Chapter Notes Affecting {element.htsno}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-base-content/60 mb-4">
                Official USITC notes that may affect the classification of goods under HTS {element.htsno}:
              </p>
              <div className="flex flex-col gap-3">
                {(() => {
                  const firstChapter = getFirstChapterOfSection(sectionChapter.sectionNumber);
                  const sectionNoteChapter = firstChapter ?? element.chapter;
                  const chapterNum = typeof element.chapter === "string" ? parseInt(element.chapter, 10) : element.chapter;
                  const showSeparateSection = sectionNoteChapter !== chapterNum;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                      {showSeparateSection && (
                        <a
                          href={`https://docs.google.com/gview?url=${encodeURIComponent(`https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%20${sectionNoteChapter}`)}&embedded=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grow group flex items-center gap-3 px-4 py-3 rounded-xl border border-base-content/10 hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                        >
                          <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-primary group-hover:underline">
                              Section {sectionChapter.sectionNumber} Notes
                            </span>
                            <span className="text-xs text-base-content/40">
                              {sectionChapter.sectionDescription}
                            </span>
                          </div>
                          <svg className="w-4 h-4 text-base-content/20 ml-auto group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}

                      <a
                        href={`https://docs.google.com/gview?url=${encodeURIComponent(`https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%20${chapterNum}`)}&embedded=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grow group flex items-center gap-3 px-4 py-3 rounded-xl border border-base-content/10 hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                      >
                        <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-primary group-hover:underline">
                            Chapter {chapterNum} Notes
                            {!showSeparateSection && <> (includes Section {sectionChapter.sectionNumber} Notes)</>}
                          </span>
                          <span className="text-xs text-base-content/40">
                            {sectionChapter.chapterDescription}
                          </span>
                        </div>
                        <svg className="w-4 h-4 text-base-content/20 ml-auto group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  );
                })()}
              </div>

            </div>

            <div className="border-t border-base-content/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-base-content">Unsure if Notes Affect your Classification?</p>
                <p className="text-xs text-base-content/50">HTS Hero automatically analyzes all relevant legal notes and explains how they affect your products classification.</p>
              </div>
              <Link
                href="/classifications/new"
                className="btn btn-primary"
              >
                Analyze Notes Automatically<span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </section>
        )}

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
      </div >

      {/* Footer */}
      <footer className="border-t border-base-content/10 bg-base-200/20" >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/40">
          <span>&copy; {new Date().getFullYear()} HTS Hero. Data sourced from the USITC Harmonized Tariff Schedule.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-base-content transition-colors">About</Link>
            <Link href="/blog" className="hover:text-base-content transition-colors">Blog</Link>
            <Link href="/privacy-policy" className="hover:text-base-content transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-base-content transition-colors">Terms</Link>
          </div>
        </div>
      </footer >
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
  parentElements: parents,
  childrenElements: children,
  sectionChapter,
}: {
  element: HtsElement;
  tariffElement: HtsElement;
  parentElements: HtsElement[];
  childrenElements: HtsElement[];
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
