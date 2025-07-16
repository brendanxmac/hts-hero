import { HtsElement, Navigatable } from "../interfaces/hts";
import { useEffect, useState } from "react";
import {
  getDirectChildrenElements,
  getBreadCrumbsForElement,
  getTariffDetails,
  getTemporaryTariffText,
  getGeneralNoteFromSpecialTariffSymbol,
} from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import PDF from "./PDF";
import { SecondaryLabel } from "./SecondaryLabel";
import { Color } from "../enums/style";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { ButtonWithIcon } from "./ButtonWithIcon";
import { TertiaryLabel } from "./TertiaryLabel";
import { SecondaryText } from "./SecondaryText";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { TariffType } from "../enums/hts";
import {
  getStringBetweenParenthesis,
  getTextBeforeOpeningParenthesis,
} from "../utilities/hts";
import { PDFProps } from "../interfaces/ui";
import { SupabaseBuckets } from "../constants/supabase";

interface Props {
  summaryOnly?: boolean;
  element: HtsElement;
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

  const [tariffElement, setTariffElement] = useState<HtsElement | null>(
    getTariffDetails(element, htsElements, breadcrumbs)
  );

  useEffect(() => {
    setTariffElement(getTariffDetails(element, htsElements, breadcrumbs));
  }, [breadcrumbs]);

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

  return (
    <div className="card bg-base-100 p-4 rounded-xl border border-base-content/10 w-full flex flex-col items-start justify-between gap-8 pt-2 sm:pt-4 overflow-y-auto">
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-3 breadcrumbs text-sm py-0 overflow-hidden">
          <div className="text-xs">
            {getBreadCrumbsForElement(element, sections, htsElements).map(
              (breadcrumb, i) => (
                <span key={`breadcrumb-${i}`}>
                  {breadcrumb.label && <b>{breadcrumb.label} </b>}
                  <span
                    className={`${!breadcrumb.value ? "font-bold" : "text-white"}`}
                  >
                    {breadcrumb.value}
                  </span>
                  <span className="text-white mx-2">›</span>
                </span>
              )
            )}
          </div>
        </div>

        <div className="w-full h-[1px] bg-base-content/10" />

        <div className="flex flex-col gap-3">
          <div className="w-full flex justify-between items-start gap-2">
            <SecondaryLabel value={getHtsnoLabel()} />

            <ButtonWithIcon
              icon={<DocumentTextIcon className="h-4 w-4" />}
              label={`Chapter ${chapter} Notes`}
              onClick={() =>
                setShowPDF({
                  title: `Chapter ${chapter} Notes`,
                  bucket: SupabaseBuckets.NOTES,
                  filePath: `/chapters/Chapter ${chapter}.pdf`,
                })
              }
            />
          </div>
          <h2 className="text-2xl font-bold text-white">{description}</h2>
        </div>
      </div>

      {!summaryOnly && (
        <>
          {tariffElement && (
            <div className="w-full flex flex-col gap-4">
              <SecondaryLabel value="Tariff Details" />

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-3 p-3 bg-primary/20 border border-base-content/10 rounded-md min-w-24">
                  <div>
                    <TertiaryLabel
                      value={"General Rate"}
                      color={Color.PRIMARY}
                    />
                    <SecondaryText
                      value={tariffElement.general || "-"}
                      color={Color.WHITE}
                    />
                  </div>
                  {getTemporaryTariffText(tariffElement, TariffType.GENERAL)}
                </div>

                <div className="flex flex-col p-3 bg-primary/20 border border-base-content/10 rounded-md min-w-24 gap-3">
                  <TertiaryLabel value={"Special Rate"} color={Color.PRIMARY} />
                  <div className="flex flex-col">
                    <SecondaryText
                      value={
                        getTextBeforeOpeningParenthesis(
                          tariffElement.special
                        ) || "-"
                      }
                      color={Color.WHITE}
                    />
                    {getTextBeforeOpeningParenthesis(tariffElement.special) && (
                      <span className="text-xs italic text-white">
                        If qualified based on the acts/agreemnts below
                      </span>
                    )}
                  </div>

                  {getStringBetweenParenthesis(tariffElement.special) && (
                    <div className="flex flex-col">
                      <div className="flex flex-wrap gap-x-1">
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
                                  className="btn btn-link btn-xs text-xs p-0 hover:text-secondary hover:scale-110"
                                  onClick={() => {
                                    const note =
                                      getGeneralNoteFromSpecialTariffSymbol(
                                        specialTariffSymbol.trim()
                                      );
                                    setShowPDF({
                                      title: note?.title || "",
                                      bucket: SupabaseBuckets.NOTES,
                                      filePath: note?.filePath || "",
                                    });
                                  }}
                                >
                                  {specialTariffSymbol}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  {getTemporaryTariffText(tariffElement, TariffType.SPECIAL)}
                </div>

                <div className="flex flex-col gap-3 p-3 bg-primary/20 border border-base-content/10 rounded-md min-w-24">
                  <div>
                    <TertiaryLabel value={"Other Rate"} color={Color.PRIMARY} />
                    <SecondaryText
                      value={tariffElement.other || "-"}
                      color={Color.WHITE}
                    />
                  </div>
                  {getTemporaryTariffText(tariffElement, TariffType.OTHER)}
                </div>

                <div className="flex flex-col gap-1 p-3 bg-primary/20 border border-base-content/10 rounded-md min-w-24">
                  <TertiaryLabel value={`Units`} color={Color.PRIMARY} />
                  <SecondaryText
                    value={tariffElement.units.join(", ") || "-"}
                    color={Color.WHITE}
                  />
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
          bucket={showPDF.bucket}
          filePath={showPDF.filePath}
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
