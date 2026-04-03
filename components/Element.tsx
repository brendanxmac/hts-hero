import { HtsElement } from "../interfaces/hts";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getDirectChildrenElements,
  getTariffElement,
  getGeneralNoteFromSpecialTariffSymbol,
  getTemporaryTariffTextElement,
} from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import {
  normalizeUsitcHtsFileName,
  openUsitcHtsFileInNewTab,
} from "@/libs/usitc-hts-file-url";
import { DutyTariffExplorerSection } from "./DutyTariffExplorerSection";
import { TariffColumn } from "../enums/tariff";
import {
  getStringBeforeOpeningParenthesis,
  getStringBetweenParenthesis,
} from "../utilities/hts";
import { trackExplorerNavigatedToLevel } from "../libs/explorer-navigation";
import { getSectionAndChapterForElement } from "../libs/hts-section-chapter";
import { SectionChapterNotesSection } from "./SectionChapterNotesSection";
import { RelatedCrossRulingsSection } from "./RelatedCrossRulingsSection";

interface Props {
  summaryOnly?: boolean;
  element: HtsElement;
  isModal?: boolean;
}

export interface ContentRequirementI<T> {
  name: T;
  value: number;
}

export const Element = ({
  element,
  summaryOnly = false,
  isModal = false,
}: Props) => {
  const pathname = usePathname();
  const { chapter, htsno } = element;
  const [children, setChildren] = useState<HtsElement[]>([]);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { htsElements } = useHts();
  const { sections } = useHtsSections();
  useEffect(() => {
    const elementChildren = getDirectChildrenElements(element, htsElements);
    setChildren(elementChildren);
  }, [element]);

  const shouldShowBasicDutyRates =
    element.chapter == 98 || element.chapter == 99;

  const tariffElement =
    getTariffElement(element, htsElements, breadcrumbs) || element;

  const sectionChapter = useMemo(
    () => getSectionAndChapterForElement(sections, chapter),
    [sections, chapter]
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Element Header Card */}
      <div className="relative overflow-hidden py-4 ">

        <div className="relative z-10 flex flex-col gap-4 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-base-content/50">
              HTS Code
            </label>
            <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide">
              {element.htsno || "—"}
            </h1>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-base-content/50">
              Description
            </label>
            <h2 className="text-lg md:text-xl lg:text-2xl text-base-content font-semibold leading-snug">
              {element.description}
            </h2>
          </div>

        </div>

        {/* Children Elements */}
        {children.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ChevronRightIcon className="w-4 h-4 text-primary/60" />
              <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                Children
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-base-content/5 text-xs font-bold text-base-content/60">
                {children.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {children.map((child, i) => {
                return (
                  <ElementSummary
                    key={`${i}-${child.htsno}`}
                    element={child}
                    onClick={() => {
                      trackExplorerNavigatedToLevel({
                        pathname,
                        navigation_kind: "deeper_child",
                        from_depth: breadcrumbs.length,
                        to_depth: breadcrumbs.length + 1,
                        hts_code: child.htsno || null,
                        chapter_number: Number(chapter) || null,
                      });
                      setBreadcrumbs([
                        ...breadcrumbs,
                        {
                          title: `${child.htsno || child.description.split(" ").slice(0, 2).join(" ") + "..."}`,
                          element: {
                            ...child,
                            chapter,
                          },
                        },
                      ]);
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

      </div>

      {!summaryOnly && (
        <div className="w-full flex flex-col gap-6">
          {/* Basic Duty Rates */}
          {shouldShowBasicDutyRates && (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                Basic Duty Rates
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* General Rate */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    General Rate
                  </span>
                  <span className="text-lg font-bold text-base-content">
                    {tariffElement.general || "-"}
                  </span>
                  {getTemporaryTariffTextElement(
                    tariffElement,
                    TariffColumn.GENERAL
                  )}
                </div>

                {/* Special Rate */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Special Rate
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-base-content">
                      {getStringBeforeOpeningParenthesis(
                        tariffElement.special
                      ) || "-"}
                    </span>
                    {getStringBetweenParenthesis(tariffElement.special) &&
                      getStringBeforeOpeningParenthesis(
                        tariffElement.special
                      ) && (
                        <span className="text-xs text-base-content/50 italic">
                          If qualified based on the acts/agreements below
                        </span>
                      )}
                  </div>

                  {getStringBetweenParenthesis(tariffElement.special) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getStringBetweenParenthesis(tariffElement.special)
                        .split(",")
                        .map((specialTariffSymbol, index) => {
                          const note = getGeneralNoteFromSpecialTariffSymbol(
                            specialTariffSymbol.trim()
                          );
                          return (
                            <div
                              key={`${specialTariffSymbol}-${index}`}
                              className="tooltip tooltip-primary tooltip-bottom"
                              data-tip={
                                note?.description || note?.title || null
                              }
                            >
                              <button
                                type="button"
                                className="px-2 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                                onClick={() => {
                                  const note =
                                    getGeneralNoteFromSpecialTariffSymbol(
                                      specialTariffSymbol.trim()
                                    );
                                  const resolved = normalizeUsitcHtsFileName(
                                    note?.fileName || ""
                                  );
                                  if (resolved) {
                                    openUsitcHtsFileInNewTab(resolved);
                                  }
                                }}
                              >
                                {specialTariffSymbol}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                  {getTemporaryTariffTextElement(
                    tariffElement,
                    TariffColumn.SPECIAL
                  )}
                </div>

                {/* Other Rate */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Other Rate
                  </span>
                  <span className="text-lg font-bold text-base-content">
                    {tariffElement.other || "-"}
                  </span>
                  {getTemporaryTariffTextElement(
                    tariffElement,
                    TariffColumn.OTHER
                  )}
                </div>

                {/* Units */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Units
                  </span>
                  <span className="text-lg font-bold text-base-content">
                    {tariffElement.units.join(", ") || "-"}
                  </span>
                </div>

                {/* Additional Duties */}
                {tariffElement.additionalDuties && (
                  <div className="sm:col-span-2 flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-warning/5 via-base-100 to-base-200/30 border border-warning/20">
                    <span className="text-xs font-semibold uppercase tracking-widest text-warning/70">
                      Additional Duties
                    </span>
                    <span className="text-xl font-bold text-base-content">
                      {tariffElement.additionalDuties || "-"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Duty Calculator Section - hidden when in modal */}
          {!isModal && htsno && htsno.replaceAll(".", "").length >= 8 && (
            <DutyTariffExplorerSection
              element={element}
              tariffElement={tariffElement}
              htsElements={htsElements}
            />
          )}

          {sectionChapter && (
            <SectionChapterNotesSection
              sectionChapter={sectionChapter}
              htsno={htsno}
              chapter={chapter}
            />
          )}

          {htsno ? <RelatedCrossRulingsSection htsno={htsno} /> : null}
        </div>
      )}
    </div>
  );
};
