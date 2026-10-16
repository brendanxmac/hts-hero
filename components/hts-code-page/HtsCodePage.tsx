import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { HtsElement } from "@/interfaces/hts";
import { findRateElement, HtsDutySummary } from "@/libs/hts-duty-summary";
import type { MicroEstimate } from "@/libs/hts-micro-estimate";
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
import { ImportSources } from "./ImportSources";
import type { UsImports } from "@/components/duty-calculator/lib/usImportsData";
import { DutyPreview } from "./DutyPreview";
import { HtsFaq } from "./HtsFaq";
import { htsFaqs } from "./htsFaqs";
import { LegalNotes } from "./LegalNotes";
import { MicroCalculator } from "./MicroCalculator";
import { OnThisPage } from "./OnThisPage";
import { PlaybookCard } from "./PlaybookCard";
import { RelatedCodes } from "./RelatedCodes";
import { RelatedRulings } from "./RelatedRulings";
import { StructuredData } from "./StructuredData";
import { CodeUpdates } from "@/components/tariff-updates/CodeUpdates";
import { NewsAlertsBox } from "@/components/tariff-updates/NewsAlertsBox";
import { TrackerCtaFeature } from "@/components/tariff-updates/TrackerCta";
import type { PublicUpdate } from "@/libs/tariff-updates/public";
import type { SectionChapter } from "./types";

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
}

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
}: HtsCodePageProps) {
  const tariffElement = findRateElement(element, parents);
  const hasDutyData = !!(tariffElement.general || tariffElement.special || tariffElement.other);
  const hasRateDetails = hasDutyData || element.units.length > 0 || !!element.quotaQuantity || !!element.additionalDuties;
  const offerCalculator = !summary && !hasDutyData && !!element.htsno && !element.htsno.startsWith("99");
  const hasRelated = children.length > 0 || siblings.length > 0;
  const importNames = Object.fromEntries((importDuty?.rows ?? []).map((r) => [r.country.code, r.country.name]));
  const faqs = htsFaqs({ element, productName, summary, tariffElement, children, sectionChapter, imports, importNames });

  const sections = [
    { id: "duty-by-country", label: "Duty by Country", show: !!summary },
    { id: "us-imports", label: "Top Origins", show: !!imports },
    { id: "related-codes", label: "Related Codes", show: hasRelated },
    { id: "notes", label: "Relevant Notes", show: !!(sectionChapter && element.chapter) },
    { id: "rulings", label: "Related CROSS Rulings", show: !!element.htsno },
    { id: "faq", label: "FAQ", show: true },
  ].filter((s) => s.show);

  return (
    // Anything jumped to (#notes, a country's row) clears the site's sticky header (65px) with room to spare
    <div className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} w-full flex-1 flex flex-col bg-base-200 [&_[id]]:scroll-mt-24`}>
      <StructuredData element={element} productName={productName} summary={summary} tariffElement={tariffElement} parentElements={parents} sectionChapter={sectionChapter} faqs={faqs} />

      {/* === Hero: the code, a quick estimate, and a rail with its base rates === */}
      <div className="w-full">
        <div className={`${mk.container} pt-6 pb-4`}>
          <Breadcrumbs element={element} parents={parents} sectionChapter={sectionChapter} />

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="min-w-0 flex flex-col gap-5">
              <div className={`${tt.panel} p-6 lg:p-7`}>
                <CodeHero
                  element={element}
                  productName={productName}
                  summary={summary}
                  parents={parents}
                  sectionChapter={sectionChapter}
                  subCodeCount={children.length}
                />
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

            {/* The rail: base rates, then links to each part of the page */}
            <div className="flex flex-col gap-4 min-w-0">
              {hasRateDetails && (
                <BaseRates element={element} tariffElement={tariffElement} hasDutyData={hasDutyData} showCalculatorLink={!estimate} />
              )}
              {offerCalculator && <CalculatorPrompt htsno={element.htsno} />}
              {summary && <DutyPreview summary={summary} />}
              <CodeUpdates updates={tariffUpdates} htsno={element.htsno} />
              <NewsAlertsBox source="hts-code-page" />
            </div>
          </div>

          {/* Jump to each part of the page, across the page under the hero */}
          {sections.length > 1 && <OnThisPage sections={sections} />}
        </div>
      </div>

      {/* === Duties and related codes === */}
      <div className={`${mk.container} py-12 sm:py-16 flex flex-col gap-16 sm:gap-20`}>
        {summary && <DutyByCountry htsno={element.htsno} productName={productName} summary={summary} />}

        {/* Alerts when a tariff action hits this code, in the free Tariff Tracker */}
        {element.htsno && !element.htsno.startsWith("99") && <TrackerCtaFeature htsno={element.htsno} />}

        {imports && <ImportSources htsno={element.htsno} productName={productName} imports={imports} duty={importDuty ?? null} />}

        {hasRelated && <RelatedCodes element={element} subCodes={children} siblings={siblings} />}
      </div>

      {/* === Notes, rulings and questions: reference material, on a band of its own === */}
      <div className="w-full">
        <div className={`${mk.container} pb-12 sm:pb-16 flex flex-col gap-16 sm:gap-20`}>
          {sectionChapter && element.chapter && (
            <LegalNotes sectionChapter={sectionChapter} htsno={element.htsno} chapter={element.chapter} />
          )}

          {element.htsno && <RelatedRulings htsno={element.htsno} />}

          <HtsFaq htsno={element.htsno} faqs={faqs} />
        </div>
      </div>

      {/* === Playbook === */}
      <div className="w-full">
        <div className={`${mk.container} pb-16 sm:pb-20`}>
          <PlaybookCard />
        </div>
      </div>
    </div>
  );
}
