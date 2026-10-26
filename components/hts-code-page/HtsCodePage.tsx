import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { HtsElement } from "@/interfaces/hts";
import { dutyAnswerSentence, findRateElement, HtsDutySummary } from "@/libs/hts-duty-summary";
import { MICRO_CUSTOMS_VALUE, type MicroEstimate } from "@/libs/hts-micro-estimate";
import { Countries } from "@/constants/countries";
import { THEME } from "@/components/ui/theme";
import { trackerDisplay, trackerSans } from "@/components/ui/font";
import * as mk from "@/components/ui/marketing/styles";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { BaseRates } from "./BaseRates";
import { Breadcrumbs } from "./Breadcrumbs";
import { CalculatorPrompt } from "./CalculatorPrompt";
import { CodeHero } from "./CodeHero";
import { DutyByCountry } from "./DutyByCountry";
import { DutyHistory } from "./DutyHistory";
import type { CodeDutyHistory } from "@/libs/hts-duty-history";
import { ImportSources } from "./ImportSources";
import type { UsImports } from "@/components/duty-calculator/lib/usImportsData";
import { DutyPreview } from "./DutyPreview";
import { HtsFaq } from "./HtsFaq";
import { htsFaqs } from "./htsFaqs";
import { LegalNotes } from "./LegalNotes";
import { MicroCalculator } from "./MicroCalculator";
import { todayIsoDate } from "@/tariffs/engine-v2/dates";
import { WatchCodeBox } from "./WatchCodeBox";
import type { CodeRateChanges } from "@/libs/hts-rate-changes";
import { OnThisPage } from "./OnThisPage";
import { RelatedCodes } from "./RelatedCodes";
import { RelatedRulings } from "./RelatedRulings";
import { Sources } from "./Sources";
import { StructuredData } from "./StructuredData";
import { CodeUpdates } from "@/components/tariff-updates/CodeUpdates";
import { CodeCases } from "@/components/adcvd/CodeCases";
import type { CodeCase } from "@/libs/adcvd/public";
import { NewsAlertsBox } from "@/components/tariff-updates/NewsAlertsBox";
import { TrackerCtaFeature } from "@/components/tariff-updates/TrackerCta";
import type { PublicUpdate } from "@/libs/tariff-updates/public";
import type { SectionChapter } from "./types";
import type { HeadingProfile } from "@/libs/tariff-programs/heading";
import { HeadingDetails, HeadingFacts, headingFaqs } from "@/components/tariff-programs/HeadingSections";
import type { CodeInfo } from "@/libs/tariff-programs/codeLinks";

// The /hts/[code] page: what an HTS code covers, what it pays and where it sits in the
// schedule. Server-rendered for search engines, in the Tariff Tracker's look (DESIGN_SYSTEM.md
// §15, following light and dark): round panels on the soft ground, Sora headings, pill buttons.
// The hero and base rates, duties by country, related codes, then notes, rulings and questions.
// The header, footer and classification band come from the HTS pages' frame (app/hts/layout.tsx).

export interface HtsCodePageProps {
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
  // Where the US imports it from (Census), and the duty from each of those countries
  imports?: UsImports | null;
  importDuty?: HtsDutySummary | null;
  // The latest tariff updates naming the code or a heading above it
  tariffUpdates?: PublicUpdate[];
  // Live AD/CVD cases whose scope lists the code
  adcvdCases?: CodeCase[];
  // A Chapter 99 heading the tariff engine models: what it is, from the engine's records, with the
  // answer sentence the page leads with and the descriptions of the codes it covers
  heading?: { profile: HeadingProfile; answer: string; codeInfo: Record<string, CodeInfo> } | null;
  // How often the estimate's duty (from its country) has changed, for the last-changed sentence
  rateChanges?: CodeRateChanges | null;
  // How the duty from the largest sources of imports has changed, for the Duty History section
  dutyHistory?: CodeDutyHistory | null;
}

// "China" for "CN": the estimate's country, in the example alert
const countryName = (code: string) => Countries.find((c) => c.code === code)?.name ?? code;

export function HtsCodePage({
  element,
  productName,
  summary,
  estimate,
  parentElements: parents,
  childrenElements: children,
  siblingElements: siblings,
  sectionChapter,
  imports,
  importDuty,
  tariffUpdates = [],
  adcvdCases = [],
  heading = null,
  rateChanges = null,
  dutyHistory = null,
}: HtsCodePageProps) {
  const tariffElement = findRateElement(element, parents);
  const hasDutyData = !!(tariffElement.general || tariffElement.special || tariffElement.other);
  const hasRateDetails = hasDutyData || element.units.length > 0 || !!element.quotaQuantity || !!element.additionalDuties;
  const offerCalculator = !summary && !hasDutyData && !!element.htsno && !element.htsno.startsWith("99");
  const hasRelated = children.length > 0 || siblings.length > 0;
  const importNames = Object.fromEntries((importDuty?.rows ?? []).map((r) => [r.country.code, r.country.name]));
  // The code's own questions (as production has them), then a modeled heading's, without repeats
  const baseFaqs = htsFaqs({ element, productName, summary, tariffElement, children, sectionChapter, imports, importNames, adcvdCases, dutyHistory });
  const faqs = heading
    ? [...baseFaqs, ...headingFaqs(heading.profile, heading.answer).filter(([q]) => !baseFaqs.some(([b]) => b === q))]
    : baseFaqs;

  // China's answer sentence (the visitor's default origin), also in Duty by Country, up top
  const chinaRow = summary ? summary.rows.find((r) => r.country.code === "CN") ?? summary.rows[0] : null;
  const answer = summary && chinaRow ? dutyAnswerSentence({ productName, htsno: element.htsno, row: chinaRow, asOf: summary.asOf }) : null;

  const sections = [
    { id: "covered-codes", label: "Codes Covered", show: !!heading?.profile.coverage.codes.length },
    { id: "refunds", label: "Refunds", show: !!heading?.profile.refund },
    { id: "history", label: "History", show: !!heading?.profile.history.length },
    { id: "duty-by-country", label: "Duty by Country", show: !!summary },
    { id: "duty-history", label: "Duty History", show: !!dutyHistory },
    { id: "us-imports", label: "Top Origins", show: !!imports },
    { id: "related-codes", label: "Related Codes", show: hasRelated },
    { id: "notes", label: "Relevant Notes", show: !!(sectionChapter && element.chapter) },
    { id: "rulings", label: "Related CROSS Rulings", show: !!element.htsno && !heading },
    { id: "faq", label: "FAQ", show: true },
    { id: "sources", label: "Sources", show: !!element.htsno },
  ].filter((s) => s.show);

  return (
    // Anything jumped to (#notes, a country's row) keeps a little room above it
    <div className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} w-full flex-1 flex flex-col bg-base-200 **:[[id]]:scroll-mt-6`}>
      <StructuredData element={element} productName={productName} summary={summary} tariffElement={tariffElement} parentElements={parents} sectionChapter={sectionChapter} faqs={faqs} modifiedOn={heading ? todayIsoDate() : undefined} />

      {/* === Hero: the code, a quick estimate, and a rail with its base rates === */}
      <div className="w-full">
        <div className={`${mk.container} pt-6 pb-4`}>
          <Breadcrumbs element={element} parents={parents} sectionChapter={sectionChapter} />

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="min-w-0 flex flex-col gap-5">
              {/* On a Chapter 99 page the card takes up whatever height the rail leaves: the heading's
                  facts, a tinted band under the lead, grow to fill it */}
              <div className={`${tt.panel} ${heading ? "flex flex-1 flex-col overflow-hidden" : "p-6 lg:p-7"}`}>
                <div className={heading ? "p-6 lg:p-7" : ""}>
                <CodeHero
                  element={element}
                  productName={productName}
                  summary={summary}
                  parents={parents}
                  sectionChapter={sectionChapter}
                  subCodeCount={children.length}
                  lead={heading?.answer}
                  alternateFormats
                  answer={answer}
                  updatedOn={heading ? todayIsoDate() : undefined}
                  rateChanges={estimate && rateChanges ? { country: countryName(estimate.country), changes: rateChanges } : null}
                />
                </div>
                {heading && (
                  <div className="flex flex-1 flex-col border-t border-base-300 bg-tt-soft">
                    <HeadingFacts profile={heading.profile} inset />
                  </div>
                )}
              </div>

              {/* On a Chapter 99 page the news sign-up sits under the hero, wide and short, so the
                  two columns come out about level */}
              {heading && !estimate && <NewsAlertsBox source="hts-code-page" wide />}

              {estimate ? (
                <MicroCalculator
                  htsno={element.htsno}
                  baseRates={{ general: tariffElement.general, special: tariffElement.special, other: tariffElement.other }}
                  initial={estimate}
                  showLines
                />
              ) : (
                element.htsno && !element.htsno.startsWith("99") && (
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/duty-calculator?code=${element.htsno}`} className={ui.button({ variant: "primary" })}>
                      Calculate Total Duty
                      <ArrowRightIcon className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link href="/explore" className={ui.button({ variant: "secondary" })}>
                      Explore the HTS
                    </Link>
                  </div>
                )
              )}
            </div>

            {/* The rail: the Watch box, base rates, then the code's news and cases. On a Chapter 99
                page its last card stretches, so the rail ends level with the hero column */}
            <div className={`flex flex-col gap-4 min-w-0 ${heading ? "lg:[&>*:last-child]:flex-1" : ""}`}>
              {estimate && <WatchCodeBox htsno={element.htsno} country={estimate.country} />}
              {hasRateDetails && (
                <BaseRates element={element} tariffElement={tariffElement} hasDutyData={hasDutyData} showCalculatorLink={!estimate} />
              )}
              {offerCalculator && <CalculatorPrompt htsno={element.htsno} />}
              {summary && <DutyPreview summary={summary} />}
              <CodeUpdates updates={tariffUpdates} htsno={element.htsno} />
              <CodeCases cases={adcvdCases} htsno={element.htsno} />
              {/* With a duty to watch, the Watch box is the sign-up */}
              {!estimate && !heading && <NewsAlertsBox source="hts-code-page" />}
            </div>
          </div>

          {/* Jump to each part of the page, across the page under the hero */}
          {sections.length > 1 && <OnThisPage sections={sections} />}
        </div>
      </div>

      {/* === Every section, one card each, the same gap between them all === */}
      <div className={`${mk.container} flex flex-col gap-6 pt-2 pb-16 sm:pb-20`}>
        {heading && <HeadingDetails profile={heading.profile} codeInfo={heading.codeInfo} />}

        {summary && <DutyByCountry htsno={element.htsno} productName={productName} summary={summary} linkCodes />}

        {dutyHistory && <DutyHistory htsno={element.htsno} history={dutyHistory} />}

        {/* Alerts when a tariff action hits this code, in the Tariff Tracker */}
        {element.htsno && !element.htsno.startsWith("99") && (
          <TrackerCtaFeature
            htsno={element.htsno}
            today={estimate ? { pct: (estimate.totalDuty / MICRO_CUSTOMS_VALUE) * 100, country: countryName(estimate.country) } : null}
          />
        )}

        {imports && <ImportSources htsno={element.htsno} productName={productName} imports={imports} duty={importDuty ?? null} />}

        {hasRelated && <RelatedCodes element={element} subCodes={children} siblings={siblings} />}

          {sectionChapter && element.chapter && (
            <LegalNotes sectionChapter={sectionChapter} htsno={element.htsno} chapter={element.chapter} />
          )}

          {element.htsno && !heading && <RelatedRulings htsno={element.htsno} />}

          <HtsFaq htsno={element.htsno} faqs={faqs} />

          {element.htsno && (
            <Sources
              htsno={element.htsno}
              chapter={element.chapter}
              sectionNumber={sectionChapter?.sectionNumber}
              summaries={[summary, importDuty]}
              hasImports={!!imports}
            />
          )}
      </div>
    </div>
  );
}
