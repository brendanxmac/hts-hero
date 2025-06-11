import { useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { TariffType, WorkflowStep } from "../enums/hts";
import { Color } from "../enums/style";
import {
  downloadClassificationReport,
  generateBreadcrumbsForHtsElement,
  getChapterFromHtsElement,
  getGeneralNoteFromSpecialTariffSymbol,
  getHtsElementParents,
  getProgressionDescriptions,
  getSectionAndChapterFromChapterNumber,
  getTariffDetails,
  getTemporaryTariffText,
} from "../libs/hts";
import {
  getTextBeforeOpeningParenthesis,
  getStringBetweenParenthesis,
} from "../utilities/hts";
import { PrimaryLabel } from "./PrimaryLabel";
import { SecondaryLabel } from "./SecondaryLabel";
import { SecondaryText } from "./SecondaryText";
import { TertiaryLabel } from "./TertiaryLabel";
import { PDFProps } from "../interfaces/ui";
import PDF from "./PDF";
import { StepNavigation } from "./workflow/StepNavigation";
import { TertiaryText } from "./TertiaryText";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/16/solid";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "../enums/classify";

interface Props {
  setWorkflowStep: (step: WorkflowStep) => void;
  setClassificationLevel: (level: number) => void;
}

export const ClassificationResultPage = ({
  setWorkflowStep,
  setClassificationLevel,
}: Props) => {
  const { classification } = useClassification();
  const { htsElements } = useHts();
  const { levels } = classification;
  const tariffElement = getTariffDetails(
    classification.levels[levels.length - 1].selection,
    htsElements
  );
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const element = classification.levels[levels.length - 1].selection;
  const { sections } = useHtsSections();
  const { clearBreadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { setActiveTab } = useClassifyTab();

  return (
    <div className="h-full px-4 pt-8 w-full max-w-3xl mx-auto flex flex-col">
      <div className="flex-1 overflow-hidden flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <PrimaryLabel
              value="🎉 Classification Complete!"
              color={Color.WHITE}
            />
            <button
              className="btn btn-xs btn-secondary"
              onClick={() => {
                downloadClassificationReport(classification);
              }}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download Report
            </button>
          </div>
          <TertiaryText value="You have successfully classified your product and can see the tariff details below or download a full report of the classification for your records." />
        </div>
        <div className=" flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <TertiaryLabel value="HTS Code" />
            <button
              className="btn btn-xs btn-primary"
              onClick={() => {
                clearBreadcrumbs();
                const sectionAndChapter = getSectionAndChapterFromChapterNumber(
                  sections,
                  Number(getChapterFromHtsElement(element, htsElements))
                );

                const parents = getHtsElementParents(element, htsElements);
                const breadcrumbs = generateBreadcrumbsForHtsElement(
                  sections,
                  sectionAndChapter.chapter,
                  [...parents, element]
                );

                setBreadcrumbs(breadcrumbs);

                setActiveTab(ClassifyTab.EXPLORE);
              }}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              View in Explorer
            </button>
          </div>
          <h2 className="text-3xl md:text-5xl text-white font-extrabold">
            {classification.levels[levels.length - 1].selection?.htsno}
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          <TertiaryLabel value="HTS Description" />
          <div className="flex flex-col gap-2">
            {getProgressionDescriptions(classification).map(
              (description, index) => (
                <div className="flex gap-1">
                  {index > 0 && (
                    <div className="shrink-0">
                      <SecondaryText
                        value={`${"-".repeat(index)}`}
                        color={Color.WHITE}
                      />
                    </div>
                  )}
                  <SecondaryText value={description} color={Color.WHITE} />
                </div>
              )
            )}
          </div>
        </div>
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
                                      file: note?.pdfURL || "",
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
        </>
      </div>
      {/* Horizontal line */}
      <div className="w-full border-t-2 border-base-100" />
      {/* Navigation */}
      <div className="w-full max-w-3xl mx-auto px-8">
        <StepNavigation
          previous={{
            label: "Back",
            onClick: () => {
              setWorkflowStep(WorkflowStep.CLASSIFICATION);
              setClassificationLevel(levels.length - 1);
            },
          }}
        />
      </div>
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
