import { useEffect, useState } from "react";
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
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/16/solid";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "../enums/classify";
import SquareIconButton from "./SqaureIconButton";
import { Square2StackIcon } from "@heroicons/react/24/solid";
import { copyToClipboard } from "../utilities/data";
import { useUser } from "../contexts/UserContext";
import { fetchUser } from "../libs/supabase/user";
import { LoadingIndicator } from "./LoadingIndicator";

interface Props {
  setWorkflowStep: (step: WorkflowStep) => void;
  setClassificationLevel: (level: number) => void;
}

export const ClassificationResultPage = ({
  setWorkflowStep,
  setClassificationLevel,
}: Props) => {
  const { user } = useUser();
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
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  // const { user } = useUser();
  // const [latestPurchase, setLatestPurchase] = useState<Purchase | null>(null);

  // useEffect(() => {
  //   if (user) {
  //     getLatestPurchase(user.id).then((purchase) => {
  //       setLatestPurchase(purchase);
  //     });
  //   }
  // }, [user]);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    }
  }, [copied]);

  return (
    <div className="h-full pt-8 w-full max-w-3xl mx-auto flex flex-col">
      <div className="px-8 pb-6 flex-1 flex flex-col gap-8 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <PrimaryLabel value="Result" color={Color.WHITE} />
            <button
              className="btn btn-xs btn-secondary"
              onClick={async () => {
                setLoading(true);
                const userProfile = await fetchUser(user.id);
                await downloadClassificationReport(classification, userProfile);
                setLoading(false);
              }}
            >
              {loading ? (
                <LoadingIndicator text="Downloading" />
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download Report
                </>
              )}
            </button>
          </div>
          <div className="flex flex-col">
            <TertiaryText value="You have classified the item and can download a full report of the classification for your records." />
          </div>
        </div>
        <div className=" flex flex-col gap-2">
          <SecondaryLabel value="HTS Code" color={Color.WHITE} />
          <div className="flex gap-3 items-center">
            <h2 className="text-3xl md:text-5xl lg:text-6xl text-white font-extrabold">
              {classification.levels[levels.length - 1].selection?.htsno}
            </h2>
            <div className="flex flex-col gap-1">
              <SquareIconButton
                transparent
                tooltip="Copy"
                icon={
                  copied ? (
                    <CheckCircleIcon className="w-4 h-4 text-WHITE" />
                  ) : (
                    <Square2StackIcon className="w-4 h-4" />
                  )
                }
                onClick={() => {
                  copyToClipboard(
                    classification.levels[levels.length - 1].selection?.htsno
                  );
                  setCopied(true);
                }}
              />
              <SquareIconButton
                transparent
                tooltip="View in Explorer"
                icon={<MagnifyingGlassIcon className="w-4 h-4" />}
                onClick={() => {
                  clearBreadcrumbs();
                  const sectionAndChapter =
                    getSectionAndChapterFromChapterNumber(
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
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <SecondaryLabel value="Full Description" color={Color.WHITE} />
          <div className="flex flex-col gap-2">
            {getProgressionDescriptions(classification).map(
              (description, index) => (
                <div key={`description-${index}`} className="flex gap-1">
                  {index > 0 && (
                    <div className="shrink-0">
                      <SecondaryText
                        value={`${"  ".repeat(index)}`}
                        color={Color.WHITE}
                      />
                    </div>
                  )}

                  <div
                    className={`${index > 0 ? "border-l-2 border-neutral-content/50 pl-2" : ""}`}
                  >
                    <SecondaryText
                      value={`${description}`}
                      color={Color.WHITE}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        <>
          {tariffElement && (
            <div className="w-full flex flex-col gap-4">
              <SecondaryLabel value="Tariff Details" color={Color.WHITE} />

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
