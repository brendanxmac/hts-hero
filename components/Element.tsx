import { HtsElement, Navigatable } from "../interfaces/hts";
import { useEffect, useState } from "react";
import { getDirectChildrenElements } from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import { TertiaryText } from "./TertiaryText";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import PDF from "./PDF";
import { notes } from "../public/notes/notes";
import { useChapters } from "../contexts/ChaptersContext";
import { Loader } from "../interfaces/ui";
import { LoadingIndicator } from "./LoadingIndicator";
import { SecondaryLabel } from "./SecondaryLabel";
import { Color } from "../enums/style";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { ButtonWithIcon } from "./ButtonWithIcon";
import { TertiaryLabel } from "./TertiaryLabel";

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
  const [loading, setLoading] = useState<Loader>({
    isLoading: false,
    text: "",
  });
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const { fetchChapter, getChapterElements } = useChapters();
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();

  const getElementWithTariffDetails = () => {
    if (element.general || element.special || element.other) {
      console.log("GOT IT");
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

  useEffect(() => {
    const loadChapterData = async () => {
      const chapterElements = getChapterElements(chapter);

      if (!chapterElements) {
        setLoading({ isLoading: true, text: "Loading..." });
        await fetchChapter(chapter);
        const updatedChapterElements = getChapterElements(chapter);
        if (updatedChapterElements) {
          const directChildrenElements = getDirectChildrenElements(
            element,
            updatedChapterElements
          );
          setChildren(directChildrenElements);
        }
      } else {
        const directChildrenElements = getDirectChildrenElements(
          element,
          chapterElements
        );
        setChildren(directChildrenElements);
      }
      setLoading({ isLoading: false, text: "" });
    };
    loadChapterData();
  }, [chapter, fetchChapter, getChapterElements, element]);

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

  const getParentDescriptionsFromBreadcrumbs = () => {
    let descriptions = "";
    breadcrumbs.forEach((breadcrumb, index) => {
      // Skip if this is the current element
      // const isLastBreadCrumb = breadcrumbs.length - 1 === index;
      // if (isLastBreadCrumb) {
      //   return;
      // }

      // Only process chapters and other elements
      if (
        breadcrumb.element.type === Navigatable.CHAPTER ||
        breadcrumb.element.type === Navigatable.ELEMENT
      ) {
        let description = breadcrumb.element.description;
        if (description.endsWith(":")) {
          description = description.replace(/:$/, "");
        }

        const isLastVisibleBreadCrumb = breadcrumbs.length - 1 === index;

        descriptions += description + (isLastVisibleBreadCrumb ? "" : " > ");
      }
    });

    return descriptions;
  };

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

  const extractHTSCodes = (input: string): string[] => {
    const regex = /\b\d{4}\.\d{2}\.\d{2}\b/g;
    const matches = input.match(regex);
    if (!matches) return [];

    return matches.map((code) => code.replace(/\.$/, ""));
  };

  const getTemporaryTairffModifications = (
    element: HtsElement,
    tariffType: TariffType
  ): string | string[] => {
    const footnote = element.footnotes?.find((footnote) =>
      footnote.columns.includes(tariffType)
    );

    if (footnote) {
      const htsCodes = extractHTSCodes(footnote.value);

      if (htsCodes.length > 0) {
        return htsCodes;
      }

      return footnote.value;
    }

    return null;
  };

  return (
    <div className="card bg-base-100 p-4 rounded-xl border border-base-content/10 w-full flex flex-col items-start justify-between gap-8 pt-2 sm:pt-4 overflow-y-auto">
      <div className="w-full flex flex-col gap-1">
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
        {getParentDescriptionsFromBreadcrumbs().length > 0 && (
          <TertiaryText
            key={description}
            value={getParentDescriptionsFromBreadcrumbs()}
          />
        )}
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
                      <TertiaryText value={`Unit`} />
                      <SecondaryLabel value={unit || "-"} color={Color.WHITE} />
                    </div>
                  ))}

                <div className="flex flex-col gap-1 p-3 bg-base-300 rounded-md min-w-24">
                  <TertiaryText value={"General"} />
                  <SecondaryLabel
                    value={tariffElement.general || "-"}
                    color={Color.WHITE}
                  />
                  {getTemporaryTairffModifications(
                    tariffElement,
                    TariffType.GENERAL
                  ) &&
                  typeof getTemporaryTairffModifications(
                    tariffElement,
                    TariffType.GENERAL
                  ) === "string" ? (
                    <>
                      <TertiaryText value={"Temporary Modifications"} />
                      <SecondaryLabel
                        value={
                          getTemporaryTairffModifications(
                            tariffElement,
                            TariffType.GENERAL
                          ) as string
                        }
                        color={Color.WHITE}
                      />
                    </>
                  ) : (
                    (
                      getTemporaryTairffModifications(
                        tariffElement,
                        TariffType.GENERAL
                      ) as string[]
                    ).map((htsCode) => (
                      <button
                        key={htsCode}
                        className="btn btn-link btn-xs text-xs p-0 hover:text-secondary hover:scale-110"
                        onClick={() => {
                          setBreadcrumbs([
                            ...breadcrumbs,
                            {
                              title: htsCode,
                              element: { ...tariffElement, htsno: htsCode },
                            },
                          ]);
                        }}
                      >
                        {htsCode}
                      </button>
                    ))
                  )}
                </div>

                <div className="flex flex-col gap-1 p-3 bg-base-300 rounded-md min-w-24">
                  <TertiaryText value={"Special"} />
                  <SecondaryLabel
                    value={getPrefixFromSpecial(tariffElement.special) || "-"}
                    color={Color.WHITE}
                  />

                  {getDetailsFromSpecial(tariffElement.special) && (
                    <div className="flex gap-x-1 flex-wrap">
                      {getDetailsFromSpecial(tariffElement.special)
                        .split(",")
                        .map((specialTariffSymbol, index) => (
                          <div key={`${specialTariffSymbol}-${index}`}>
                            <button
                              className="btn btn-link btn-xs text-xs p-0 hover:text-secondary hover:scale-110"
                              onClick={() => {
                                const note =
                                  getGeneralNoteFromSpecialTariffSymbol(
                                    specialTariffSymbol.trim()
                                  );
                                setShowPDF({
                                  title: note?.title || "",
                                  file: note?.pdfURL || "",
                                });
                              }}
                            >
                              {specialTariffSymbol}
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  {getTemporaryTairffModifications(
                    tariffElement,
                    TariffType.SPECIAL
                  ) && (
                    <>
                      <TertiaryText value={"Temporary Modifications"} />
                      <SecondaryLabel
                        value={
                          getTemporaryTairffModifications(
                            tariffElement,
                            TariffType.SPECIAL
                          ) as string
                        }
                        color={Color.WHITE}
                      />
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-1 p-3 bg-base-300 rounded-md min-w-24">
                  <TertiaryText value={"Other"} />
                  <SecondaryLabel
                    value={tariffElement.other || "-"}
                    color={Color.WHITE}
                  />
                  {getTemporaryTairffModifications(
                    tariffElement,
                    TariffType.OTHER
                  ) && (
                    <>
                      <TertiaryText value={"Temporary Modifications"} />
                      <SecondaryLabel
                        value={
                          getTemporaryTairffModifications(
                            tariffElement,
                            TariffType.OTHER
                          ) as string
                        }
                        color={Color.WHITE}
                      />
                    </>
                  )}
                </div>

                {/* {tariffElement.footnotes && (
                  <div className="flex flex-col gap-1 p-3 bg-base-300 rounded-md min-w-24">
                    <TertiaryText value={"Temporary Modifications"} />
                    {tariffElement.footnotes.map((footnote, index) => (
                      <SecondaryLabel
                        key={`${index}-${footnote}`}
                        value={`For ${footnote.columns.map((column) => column.replace(/^[A-Z]/, (char) => char.toLowerCase())).join(", ")}: ${footnote.value || "-"}`}
                        color={Color.WHITE}
                      />
                    ))}
                  </div>
                )} */}
              </div>
            </div>
          )}
          {children.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              {loading.isLoading && (
                <div className="flex items-center justify-center">
                  <LoadingIndicator text={loading.text} />
                </div>
              )}

              <div className="flex flex-col gap-4">
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
