import { HtsElement, HtsSection, Navigatable } from "../interfaces/hts";
import { useEffect, useState } from "react";
import {
  generateBreadcrumbsForHtsElement,
  getDirectChildrenElements,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import PDF from "./PDF";
import { notes } from "../public/notes/notes";
import { SecondaryLabel } from "./SecondaryLabel";
import { Color } from "../enums/style";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { ButtonWithIcon } from "./ButtonWithIcon";
import { TertiaryLabel } from "./TertiaryLabel";
import { SecondaryText } from "./SecondaryText";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";

interface Props {
  summaryOnly?: boolean;
  element: HtsElement;
}

export interface PDFProps {
  title: string;
  file: string;
}

export const Element = ({ element, summaryOnly = false }: Props) => {
  const { description, chapter, htsno } = element;
  const [children, setChildren] = useState<HtsElement[]>([]);
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { htsElements } = useHts();
  const { sections } = useHtsSections();

  useEffect(() => {
    const elementChildren = getDirectChildrenElements(element, htsElements);
    setChildren(elementChildren);
  }, [element]);

  const getElementWithTariffDetails = () => {
    if (element.general || element.special || element.other) {
      return element;
    }

    // Starting at the end of the breadcrumbs list, find the first element that has tariff details using a reverseing for loop
    for (let i = breadcrumbs.length - 1; i >= 0; i--) {
      const breadcrumb = breadcrumbs[i];

      if (
        breadcrumb.element.type === Navigatable.ELEMENT &&
        (breadcrumb.element.general ||
          breadcrumb.element.special ||
          breadcrumb.element.other)
      ) {
        return breadcrumb.element;
      }
    }

    return undefined;
  };

  const [tariffElement, setTariffElement] = useState<HtsElement | null>(
    getElementWithTariffDetails()
  );

  useEffect(() => {
    setTariffElement(getElementWithTariffDetails());
  }, [breadcrumbs]);

  // Regex that gets the prefix of the special text
  const getPrefixFromSpecial = (special: string) => {
    const regex = /^[^(]+/;
    const match = special.match(regex);
    return match ? match[0].trim() : special;
  };

  // Regex that gets whatever is inside the parentheses of special text, if exists
  const getDetailsFromSpecial = (special: string) => {
    const regex = /\(([^)]+)\)/;
    const match = special.match(regex);
    return match ? match[1].replace(/,/g, ", ") : null;
  };

  const getGeneralNoteFromSpecialTariffSymbol = (
    specialTariffSymbol: string
  ) => {
    const note = notes.find((note) =>
      note.specialTariffTreatmentCodes?.includes(specialTariffSymbol)
    );
    return note;
  };

  const getBreadCrumbsForElement = (
    element: HtsElement,
    sections: HtsSection[]
  ): { label: string; value: string }[] => {
    const { chapter, section } = getSectionAndChapterFromChapterNumber(
      sections,
      Number(element.chapter)
    );

    const parentElements = getHtsElementParents(element, htsElements);

    return [
      {
        label: `Section ${section.number}:`,
        value: section.description,
      },
      {
        label: `Chapter ${chapter.number}:`,
        value: chapter.description,
      },
      ...parentElements.map((parent) => ({
        label: parent.htsno && `${parent.htsno}:`,
        value: parent.description,
      })),
    ];
  };

  // const getParentDescriptionsFromBreadcrumbs = () => {
  //   let descriptions = "";
  //   breadcrumbs.forEach((breadcrumb, index) => {
  //     // Only process chapters and other elements
  //     if (
  //       breadcrumb.element.type === Navigatable.CHAPTER ||
  //       breadcrumb.element.type === Navigatable.ELEMENT
  //     ) {
  //       let description = breadcrumb.element.description;
  //       if (description.endsWith(":")) {
  //         description = description.replace(/:$/, "");
  //       }

  //       const isLastVisibleBreadCrumb = breadcrumbs.length - 1 === index;

  //       descriptions += description + (isLastVisibleBreadCrumb ? "" : " > ");
  //     }
  //   });

  //   return descriptions;
  // };

  // const getFullHtsDescription = (
  //   classificationProgression: ClassificationProgression[]
  // ) => {
  //   let fullDescription = "";
  //   classificationProgression.forEach((progression, index) => {
  //     if (progression.selection) {
  //       // if the string has a : at the end, strip it off
  //       const desc = progression.selection.description.endsWith(":")
  //         ? progression.selection.description.slice(0, -1)
  //         : progression.selection.description;

  //       fullDescription += index === 0 ? `${desc}` : ` > ${desc}`;
  //     }
  //   });

  //   return fullDescription;
  // };

  // const getBestCandidate = async () => {
  //   setLoading({
  //     isLoading: true,
  //     text: "Getting Best Candidate",
  //   });

  //   const simplifiedCandidates = children.map((e) => ({
  //     code: e.htsno,
  //     description: e.description,
  //   }));

  //   const bestProgressionResponse = await getBestClassificationProgression(
  //     simplifiedCandidates,
  //     classification.progressionDescription,
  //     classification.articleDescription
  //   );

  //   console.log("bestProgressionResponse", bestProgressionResponse);

  //   const bestCandidate = children[bestProgressionResponse.index];

  //   console.log("bestCandidate", bestCandidate);

  //   // Update this classification progressions candidates to mark the bestCandidate element as suggested
  //   const updatedCandidates = children.map((e) => {
  //     if (e.uuid === bestCandidate.uuid) {
  //       return {
  //         ...e,
  //         suggested: true,
  //         suggestedReasoning: bestProgressionResponse.logic,
  //       };
  //     }
  //     return { ...e, suggested: false, suggestedReasoning: "" };
  //   });

  //   updateProgressionLevel(classification.levels.length - 1, {
  //     candidates: updatedCandidates,
  //   });

  //   setLoading({ isLoading: false, text: "" });
  // };

  const getHtsnoLabel = () => {
    if (htsno) {
      return htsno;
    }

    // Find parent breadcrumb, if it's of type ELEMENT, then return the htsno
    const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2];

    if (parentBreadcrumb.element.type === Navigatable.ELEMENT) {
      return `${parentBreadcrumb.element.htsno} /`;
    }

    return "Missing HTS Number";
  };

  enum TariffType {
    GENERAL = "general",
    SPECIAL = "special",
    OTHER = "other",
  }

  const getFootnotesForTariffType = (
    element: HtsElement,
    tariffType: TariffType
  ) => {
    return element.footnotes?.filter((footnote) =>
      footnote.columns.includes(tariffType)
    );
  };

  const getTemporaryTariffText = (
    element: HtsElement,
    tariffType: TariffType
  ): JSX.Element | null => {
    const footnotes = getFootnotesForTariffType(element, tariffType);

    if (!footnotes.length) {
      return null;
    }

    return (
      <div className="flex flex-col gap-1">
        <TertiaryLabel value={"Temporary or Special Adjustments"} />
        <SecondaryText
          key={`${tariffType}-tariff-footnotes`}
          value={footnotes
            .map((footnote) => footnote.value.trim().replace(/\.*$/g, ""))
            .join(", ")}
          color={Color.WHITE}
        />
      </div>
    );
  };

  return (
    <div className="card bg-base-100 p-4 rounded-xl border border-base-content/10 w-full flex flex-col items-start justify-between gap-8 pt-2 sm:pt-4 overflow-y-auto">
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-3 breadcrumbs text-sm py-0 overflow-hidden">
          <div className="text-xs">
            {getBreadCrumbsForElement(element, sections).map(
              (breadcrumb, i) => (
                <span key={`breadcrumb-${i}`}>
                  {breadcrumb.label && <b>{breadcrumb.label} </b>}
                  <span className="text-white">{breadcrumb.value}</span>
                  <span className="text-white mx-2">›</span>
                </span>
              )
            )}
          </div>
        </div>

        {/* {getParentDescriptionsFromBreadcrumbs().length > 0 && (
          <TertiaryText
            key={description}
            value={getParentDescriptionsFromBreadcrumbs()}
          />
        )} */}
        <div className="flex flex-col gap-1">
          <div className="w-full flex justify-between items-center">
            <TertiaryLabel value={getHtsnoLabel()} />
            <ButtonWithIcon
              icon={<DocumentTextIcon className="h-4 w-4" />}
              label="Notes"
              onClick={() =>
                setShowPDF({
                  title: `Chapter ${chapter} Notes`,
                  file: `/notes/chapter/Chapter ${chapter}.pdf`,
                })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white">{description}</h2>
          </div>
        </div>
      </div>

      {!summaryOnly && (
        <>
          {tariffElement && (
            <div className="w-full flex flex-col gap-4">
              <SecondaryLabel value="Tariff Details" />

              <div className="grid grid-cols-2 gap-2">
                {tariffElement.units &&
                  tariffElement.units.map((unit, i) => (
                    <div
                      key={`${i}-${unit}`}
                      className="flex flex-col gap-1 p-3 bg-base-300 rounded-md min-w-24"
                    >
                      <TertiaryLabel value={`Unit`} />
                      <SecondaryText value={unit || "-"} color={Color.WHITE} />
                    </div>
                  ))}

                <div className="flex flex-col gap-3 p-3 bg-base-300 rounded-md min-w-24">
                  <div>
                    <TertiaryLabel value={"General"} />
                    <SecondaryText
                      value={tariffElement.general || "-"}
                      color={Color.WHITE}
                    />
                  </div>
                  {getTemporaryTariffText(tariffElement, TariffType.GENERAL)}
                </div>

                <div className="flex flex-col gap-3 p-3 bg-base-300 rounded-md min-w-24">
                  <div>
                    <TertiaryLabel value={"Special"} />
                    <SecondaryText
                      value={getPrefixFromSpecial(tariffElement.special) || "-"}
                      color={Color.WHITE}
                    />
                  </div>
                  {getTemporaryTariffText(tariffElement, TariffType.SPECIAL)}
                </div>

                <div className="flex flex-col gap-3 p-3 bg-base-300 rounded-md min-w-24">
                  <div>
                    <TertiaryLabel value={"Other"} />
                    <SecondaryText
                      value={tariffElement.other || "-"}
                      color={Color.WHITE}
                    />
                  </div>
                  {getTemporaryTariffText(tariffElement, TariffType.OTHER)}
                </div>
              </div>
            </div>
          )}
          {children.length > 0 && (
            <div className="w-full flex flex-col gap-4">
              <SecondaryLabel value="Next Level" />
              <div className="flex flex-col gap-2">
                {children.map((child, i) => {
                  return (
                    <ElementSummary
                      key={`${i}-${child.htsno}`}
                      element={child}
                      onClick={() => {
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
        </>
      )}
      {showPDF && (
        <PDF
          title={showPDF.title}
          file={showPDF.file}
          isOpen={showPDF !== null}
          setIsOpen={(isOpen) => {
            if (!isOpen) {
              setShowPDF(null);
            }
          }}
        />
      )}
    </div>
  );
};
