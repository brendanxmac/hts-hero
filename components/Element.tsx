import { HtsElement } from "../interfaces/hts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  generateBreadcrumbsForHtsElement,
  getDirectChildrenElements,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
  getTariffElement,
  getGeneralNoteFromSpecialTariffSymbol,
  getTemporaryTariffTextElement,
} from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import {
  CheckCircleIcon,
  HashtagIcon,
  ListBulletIcon,
  MapPinIcon,
  PercentBadgeIcon,
} from "@heroicons/react/16/solid";
import { LinkIcon } from "@heroicons/react/24/solid";
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
import { ExplorerDetailSection } from "./ExplorerDetailSection";
import {
  ClassificationHierarchy,
  type HierarchyItem,
} from "./classification-detail/ClassificationHierarchy";
import { copyToClipboard } from "../utilities/data";
import { classNames } from "../utilities/style";

interface Props {
  summaryOnly?: boolean;
  element: HtsElement;
  isModal?: boolean;
}

export interface ContentRequirementI<T> {
  name: T;
  value: number;
}

function pathIndexToTrailSliceLength(pathIndex: number): number {
  if (pathIndex === 0) return 1;
  if (pathIndex <= 2) return 2;
  return pathIndex;
}

export const Element = ({
  element,
  summaryOnly = false,
  isModal = false,
}: Props) => {
  const pathname = usePathname();
  const { chapter, htsno } = element;
  const [children, setChildren] = useState<HtsElement[]>([]);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { htsElements } = useHts();
  const { sections } = useHtsSections();

  useEffect(() => {
    const elementChildren = getDirectChildrenElements(element, htsElements);
    setChildren(elementChildren);
  }, [element, htsElements]);

  const shouldShowBasicDutyRates =
    element.chapter == 98 || element.chapter == 99;

  const tariffElement =
    getTariffElement(element, htsElements, breadcrumbs) || element;

  const sectionChapter = useMemo(
    () => getSectionAndChapterForElement(sections, chapter),
    [sections, chapter]
  );

  const fullTrail = useMemo(() => {
    const secCh = getSectionAndChapterFromChapterNumber(
      sections,
      Number(chapter)
    );
    if (!secCh) return null;
    const parents = getHtsElementParents(element, htsElements);
    return generateBreadcrumbsForHtsElement(sections, secCh.chapter, [
      ...parents,
      element,
    ]);
  }, [sections, chapter, element, htsElements]);

  const htsPathItems = useMemo((): HierarchyItem[] => {
    if (!fullTrail || !sectionChapter) return [];
    const parents = getHtsElementParents(element, htsElements);
    const items: HierarchyItem[] = [
      {
        label: `Section ${sectionChapter.sectionNumber}`,
        code: `Section ${sectionChapter.sectionNumber}`,
        description: sectionChapter.sectionDescription,
        navId: "hts-path-1",
      },
      {
        label: `Chapter ${chapter}`,
        code: String(chapter),
        description: sectionChapter.chapterDescription,
        navId: "hts-path-2",
      },
    ];
    [...parents, element].forEach((ht, i) => {
      const isLast = i === parents.length;
      items.push({
        label: ht.htsno?.trim() || "Subheading",
        code: ht.htsno,
        description: ht.description,
        isCurrent: isLast,
        navId: `hts-path-${3 + i}`,
      });
    });
    return items;
  }, [fullTrail, sectionChapter, chapter, element, htsElements]);

  const onHtsPathItemClick = useCallback(
    (navId: string) => {
      if (!fullTrail) return;
      const match = /^hts-path-(\d+)$/.exec(navId);
      if (!match) return;
      const pathIndex = Number(match[1]);
      const sliceLen = pathIndexToTrailSliceLength(pathIndex);
      if (sliceLen < 1 || sliceLen > fullTrail.length) return;
      trackExplorerNavigatedToLevel({
        pathname,
        navigation_kind: "hts_path",
        from_depth: breadcrumbs.length,
        to_depth: sliceLen,
        hts_path_index: pathIndex,
        hts_code: element.htsno || null,
        chapter_number: Number(chapter) || null,
      });
      setBreadcrumbs(fullTrail.slice(0, sliceLen));
    },
    [
      fullTrail,
      breadcrumbs.length,
      chapter,
      element.htsno,
      pathname,
      setBreadcrumbs,
    ]
  );

  const canShareExploreLink = Boolean(htsno?.trim());

  const generateExploreShareLink = () => {
    const code = element.htsno?.trim();
    if (!code) return "";
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({ code });
    return `${baseUrl}/explore?${params.toString()}`;
  };

  const handleExploreShareClick = async () => {
    if (!canShareExploreLink) return;
    const copied = await copyToClipboard(generateExploreShareLink());
    if (copied) {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2500);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 py-4">
        <div className="w-full flex gap-2 items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold tracking-wide text-primary md:text-3xl lg:text-4xl">
              {element.htsno || "—"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className={classNames(
                "btn btn-sm gap-1.5",
                isLinkCopied ? "btn-success text-white" : "btn-primary",
                !canShareExploreLink && "btn-disabled"
              )}
              disabled={!canShareExploreLink}
              onClick={handleExploreShareClick}
            >
              {isLinkCopied ? (
                <CheckCircleIcon className="h-4 w-4" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
              <span>{isLinkCopied ? "Link Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold leading-snug text-base-content md:text-xl lg:text-2xl">
            {element.description}
          </h2>
        </div>
      </div>

      {children.length > 0 ? (
        <ExplorerDetailSection
          title="Children"
          icon={<ListBulletIcon className="h-4 w-4" />}
          action={
            <span className="rounded-lg bg-base-content/5 px-2 py-0.5 text-xs font-bold text-base-content/60">
              {children.length}
            </span>
          }
        >
          <div className="flex flex-col gap-2">
            {children.map((child, i) => (
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
            ))}
          </div>
        </ExplorerDetailSection>
      ) : null}

      {!summaryOnly && (
        <div className="flex w-full flex-col gap-6">
          {shouldShowBasicDutyRates && (
            <ExplorerDetailSection
              title="Basic duty rates"
              icon={<PercentBadgeIcon className="h-4 w-4" />}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2 rounded-xl border border-base-content/10 bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 p-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    General rate
                  </span>
                  <span className="text-lg font-bold text-base-content">
                    {tariffElement.general || "-"}
                  </span>
                  {getTemporaryTariffTextElement(
                    tariffElement,
                    TariffColumn.GENERAL
                  )}
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-base-content/10 bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 p-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Special rate
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
                        <span className="text-xs italic text-base-content/50">
                          If qualified based on the acts/agreements below
                        </span>
                      )}
                  </div>

                  {getStringBetweenParenthesis(tariffElement.special) && (
                    <div className="mt-1 flex flex-wrap gap-1">
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
                                className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                                onClick={() => {
                                  const n = getGeneralNoteFromSpecialTariffSymbol(
                                    specialTariffSymbol.trim()
                                  );
                                  const resolved = normalizeUsitcHtsFileName(
                                    n?.fileName || ""
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

                <div className="flex flex-col gap-2 rounded-xl border border-base-content/10 bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 p-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Other rate
                  </span>
                  <span className="text-lg font-bold text-base-content">
                    {tariffElement.other || "-"}
                  </span>
                  {getTemporaryTariffTextElement(
                    tariffElement,
                    TariffColumn.OTHER
                  )}
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-base-content/10 bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 p-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Units
                  </span>
                  <span className="text-lg font-bold text-base-content">
                    {tariffElement.units.join(", ") || "-"}
                  </span>
                </div>

                {tariffElement.additionalDuties && (
                  <div className="flex flex-col gap-2 rounded-xl border border-warning/20 bg-gradient-to-br from-warning/5 via-base-100 to-base-200/30 p-4 sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-warning/70">
                      Additional duties
                    </span>
                    <span className="text-xl font-bold text-base-content">
                      {tariffElement.additionalDuties || "-"}
                    </span>
                  </div>
                )}
              </div>
            </ExplorerDetailSection>
          )}



          {htsPathItems.length > 0 && (
            <ExplorerDetailSection
              className="min-w-0 md:flex-1"
              title="Path"
              description={`The path through the HTS that leads to ${element.htsno || "this code"}`}
              icon={<MapPinIcon className="h-4 w-4" />}
            >
              <ClassificationHierarchy
                items={htsPathItems}
                onItemClick={onHtsPathItemClick}
              />
            </ExplorerDetailSection>
          )}
          {sectionChapter && (
            <SectionChapterNotesSection
              sectionChapter={sectionChapter}
              htsno={htsno}
              chapter={chapter}
            />
          )}



          {!isModal && htsno && htsno.replaceAll(".", "").length >= 8 && (
            <DutyTariffExplorerSection
              element={element}
              tariffElement={tariffElement}
              htsElements={htsElements}
            />
          )}

          {htsno ? <RelatedCrossRulingsSection htsno={htsno} /> : null}
        </div>
      )}
    </div>
  );
};
