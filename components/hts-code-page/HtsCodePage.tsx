import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { HtsElement } from "@/interfaces/hts";
import { findRateElement, HtsDutySummary } from "@/libs/hts-duty-summary";
import type { MicroEstimate } from "@/libs/hts-micro-estimate";
import { THEME } from "@/components/ui/theme";
import * as ui from "@/components/ui/styles";
import { BaseRates } from "./BaseRates";
import { Breadcrumbs } from "./Breadcrumbs";
import { CalculatorPrompt } from "./CalculatorPrompt";
import { CodeHero } from "./CodeHero";
import { DutyByCountry } from "./DutyByCountry";
import { DutyPreview } from "./DutyPreview";
import { HtsFaq } from "./HtsFaq";
import { htsFaqs } from "./htsFaqs";
import { LegalNotes } from "./LegalNotes";
import { MicroCalculator } from "./MicroCalculator";
import { OnThisPage } from "./OnThisPage";
import { PageFooter } from "@/components/ui/PageFooter";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlaybookCard } from "./PlaybookCard";
import { RelatedCodes } from "./RelatedCodes";
import { RelatedRulings } from "./RelatedRulings";
import { StructuredData } from "./StructuredData";
import type { SectionChapter } from "./types";

// The /hts/[code] page: what an HTS code covers, what it pays and where it sits in the
// schedule. Server-rendered for search engines, on the analytical theme (DESIGN_SYSTEM.md).
// Each part sits on its own surface so the page scans: the hero and base rates, duties by
// country, related codes, then notes, rulings and questions on a band of their own.

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
}: HtsCodePageProps) {
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
    <div className={`${THEME} w-full min-h-screen flex flex-col`}>
      <StructuredData element={element} productName={productName} summary={summary} tariffElement={tariffElement} parentElements={parents} sectionChapter={sectionChapter} faqs={faqs} />

      <PageHeader />

      {/* === Hero: the code, a quick estimate, and a rail with its base rates === */}
      <div className="w-full border-b border-base-300">
        <div className={`${ui.container} pt-5 pb-8`}>
          <Breadcrumbs element={element} parents={parents} sectionChapter={sectionChapter} />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
            <div className="min-w-0 flex flex-col gap-5">
              <CodeHero
                element={element}
                productName={productName}
                summary={summary}
                parents={parents}
                sectionChapter={sectionChapter}
                subCodeCount={children.length}
              />

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
              {offerCalculator && <CalculatorPrompt htsno={element.htsno} />}
              {summary && <DutyPreview summary={summary} />}
              {sections.length > 1 && <OnThisPage sections={sections} />}
            </div>
          </div>
        </div>
      </div>

      {/* === Duties and related codes === */}
      <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
        {summary && <DutyByCountry htsno={element.htsno} productName={productName} summary={summary} />}

        {hasRelated && <RelatedCodes element={element} subCodes={children} siblings={siblings} />}
      </div>

      {/* === Notes, rulings and questions: reference material, on a band of its own === */}
      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
          {sectionChapter && element.chapter && (
            <LegalNotes sectionChapter={sectionChapter} htsno={element.htsno} chapter={element.chapter} />
          )}

          {element.htsno && <RelatedRulings htsno={element.htsno} />}

          <HtsFaq htsno={element.htsno} faqs={faqs} />
        </div>
      </div>

      {/* === Playbook === */}
      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
          <PlaybookCard />
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
