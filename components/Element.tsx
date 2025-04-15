import { HtsElement, Navigatable } from "../interfaces/hts";
import { NavigatableElement } from "./Elements";
import { useEffect, useState } from "react";
import { PrimaryInformation } from "./PrimaryInformation";
import { LoadingIndicator } from "./LoadingIndicator";
import { getDirectChildrenElements } from "../libs/hts";
import { ElementSum } from "./ElementSum";
import { SecondaryInformation } from "./SecondaryInformation";
import { TertiaryInformation } from "./TertiaryInformation";
import SquareIconButton from "./SqaureIconButton";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import PDF from "./PDF";
import { notes } from "../public/notes/notes";
import { useChapters } from "../contexts/ChaptersContext";

interface Props {
  summaryOnly?: boolean;
  element: HtsElement;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export interface PDFProps {
  title: string;
  file: string;
}

export const Element = ({
  element,
  breadcrumbs,
  setBreadcrumbs,
  summaryOnly = false,
}: Props) => {
  const { htsno, description, chapter, units, general, special, other } =
    element;
  const [children, setChildren] = useState<HtsElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const { fetchChapter, getChapterElements } = useChapters();

  useEffect(() => {
    const loadChapterData = async () => {
      const chapterElements = getChapterElements(chapter);

      if (!chapterElements) {
        setLoading(true);
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
      setLoading(false);
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

  const getParentDescriptionsFromBreadcrumbs = (element: HtsElement) => {
    let descriptions = "";
    breadcrumbs.forEach((breadcrumb, index) => {
      // Skip if this is the current element
      const isLastBreadCrumb = breadcrumbs.length - 1 === index;
      if (isLastBreadCrumb) {
        return;
      }

      // Only process chapters and other elements
      if (
        breadcrumb.element.type === Navigatable.CHAPTER ||
        breadcrumb.element.type === Navigatable.ELEMENT
      ) {
        let description = breadcrumb.element.description;
        if (description.endsWith(":")) {
          description = description.replace(/:$/, "");
        }

        const isLastVisibleBreadCrumb = breadcrumbs.length - 2 === index;

        descriptions += description + (isLastVisibleBreadCrumb ? "" : " > ");
      }
    });
    return descriptions;
  };

  return (
    <div className="card border border-base-300 dark:border-base-content/20 w-full flex flex-col items-start justify-between gap-6 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="flex flex-col gap-5">
          <div className="shrink-0">
            {htsno && (
              <PrimaryInformation
                label={htsno ? `${htsno} ` : ``}
                value={``}
                copyable={false}
              />
            )}
          </div>
          <div className="flex flex-col gap-1 mb-4">
            {getParentDescriptionsFromBreadcrumbs(element).length > 0 && (
              <TertiaryInformation
                key={description}
                value={getParentDescriptionsFromBreadcrumbs(element)}
              />
            )}
            {htsno ? (
              <PrimaryInformation value={description} />
            ) : (
              <PrimaryInformation label={description} value="" />
            )}
          </div>
        </div>
        <SquareIconButton
          icon={<DocumentTextIcon className="h-4 w-4" />}
          onClick={() =>
            setShowPDF({
              title: `Chapter ${chapter} Notes`,
              file: `/notes/chapter/Chapter ${chapter}.pdf`,
            })
          }
        />
      </div>

      {!summaryOnly && (
        <>
          {(general || special || other) && (
            <div className="w-full flex flex-col gap-2">
              <TertiaryInformation value="" label="Tariff Rates:" />

              <div className="grid grid-cols-2 gap-2">
                {units &&
                  units.map((unit, i) => (
                    <div
                      key={`${i}-${unit}`}
                      className="flex flex-col gap-1 p-3 bg-base-300 rounded-md min-w-24"
                    >
                      <TertiaryInformation value={`Unit`} />
                      <SecondaryInformation label={unit || "-"} value={""} />
                    </div>
                  ))}

                <div className="flex flex-col gap-1 p-3 bg-base-300 rounded-md min-w-24">
                  <TertiaryInformation value={"General"} />
                  <SecondaryInformation label={general || "-"} value={""} />
                </div>

                <div className="flex flex-col gap-1 p-3 bg-base-300 rounded-md min-w-24">
                  <TertiaryInformation value={"Special"} />
                  <SecondaryInformation
                    label={getPrefixFromSpecial(special) || "-"}
                    value={""}
                  />

                  {getDetailsFromSpecial(special) && (
                    <div className="flex gap-x-1 flex-wrap">
                      {getDetailsFromSpecial(special)
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
                </div>

                <div className="flex flex-col gap-1 p-3 bg-base-300 rounded-md min-w-24">
                  <TertiaryInformation value={"Other"} />
                  <SecondaryInformation label={other || "-"} value={""} />
                </div>
              </div>
            </div>
          )}
          {children.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <TertiaryInformation value="" label="Elements:" />
              <div className="flex flex-col rounded-md p-4 gap-2">
                {children.map((child, i) => {
                  return (
                    <ElementSum
                      key={`${i}-${child.htsno}`}
                      element={child}
                      chapter={chapter}
                      breadcrumbs={breadcrumbs}
                      setBreadcrumbs={setBreadcrumbs}
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
