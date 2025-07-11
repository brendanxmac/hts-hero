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
import { TertiaryText } from "./TertiaryText";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/16/solid";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useClassifyTab } from "../contexts/ClassifyTabContext";
import { ClassifyTab } from "../enums/classify";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { copyToClipboard } from "../utilities/data";
import { useUser } from "../contexts/UserContext";
import { fetchUser } from "../libs/supabase/user";
import { LoadingIndicator } from "./LoadingIndicator";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { PrimaryText } from "./PrimaryText";

export const ClassificationResultPage = () => {
  const { user } = useUser();
  const { classification, setClassification } = useClassification();
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
  const [showNotes, setShowNotes] = useState(Boolean(classification.notes));

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    }
  }, [copied]);

  return (
    <div className="h-full w-full max-w-4xl mx-auto flex flex-col">
      <div className="px-8 py-6 flex-1 flex flex-col gap-8 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Your Classification Result
            </h2>
            <div className="flex gap-2">
              <button
                className="btn btn-xs btn-primary"
                onClick={async () => {
                  setLoading(true);
                  const userProfile = await fetchUser(user.id);
                  await downloadClassificationReport(
                    classification,
                    userProfile
                  );
                  setLoading(false);
                }}
              >
                {loading ? (
                  <LoadingIndicator text="Downloading" color={Color.WHITE} />
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download Report
                  </>
                )}
              </button>
              {!showNotes && (
                <button
                  className="mx-auto btn btn-xs btn-primary"
                  onClick={() => {
                    setShowNotes(true);
                  }}
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Add Notes
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <TertiaryText value="Below are the results of your classification for the item. Download the full report of your classification for your records as the results will not be saved after you close this page." />
          </div>
        </div>

        {/* <div className="flex flex-col gap-2">
          <TertiaryLabel
            value="Item Description"
            color={Color.NEUTRAL_CONTENT}
          />
          <PrimaryText
            value={classification.articleDescription || ""}
            color={Color.WHITE}
          />
        </div>
        <div className="flex flex-col gap-2">
          <TertiaryLabel
            value="Classification Selections"
            color={Color.NEUTRAL_CONTENT}
          />
          <div className="flex flex-col gap-2">
            {getProgressionDescriptions(classification).map(
              (description, index, array) => (
                <div key={`description-${index}`} className="flex gap-1">
                  <div className="flex items-center">
                    <SecondaryText
                      value={`${"  ".repeat(index)}`}
                      color={Color.WHITE}
                    />
                    {index < array.length - 1 && (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                    {index === array.length - 1 && (
                      <SecondaryText
                        value={`${" ".repeat(index)}`}
                        color={Color.WHITE}
                      />
                    )}
                  </div>

                  <PrimaryText value={`${description}`} color={Color.WHITE} />
                </div>
              )
            )}
          </div>
        </div> */}

        <div className=" flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <PrimaryLabel value="HTS Code" color={Color.WHITE} />
            <div className="flex gap-2">
              <button
                className="btn btn-xs btn-primary"
                onClick={() => {
                  copyToClipboard(
                    classification.levels[levels.length - 1].selection?.htsno
                  );
                  setCopied(true);
                }}
              >
                {copied ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  <Square2StackIcon className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                className="btn btn-xs btn-primary"
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
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Show in Explorer
              </button>
              <button
                className="btn btn-xs btn-primary"
                onClick={() => {
                  const htsCode =
                    classification.levels[levels.length - 1].selection?.htsno;
                  const htsCodeWithoutStatSuffix = htsCode?.slice(0, -3);
                  window.open(
                    `https://rulings.cbp.gov/search?term=${encodeURIComponent(
                      htsCodeWithoutStatSuffix
                    )}`,
                    "_blank"
                  );
                }}
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Search CROSS
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl md:text-5xl lg:text-6xl text-white font-extrabold">
              {classification.levels[levels.length - 1].selection?.htsno}
            </h2>
          </div>
        </div>
        <>
          {tariffElement && (
            <div className="w-full flex flex-col gap-4">
              <PrimaryLabel value="Tariff Details" color={Color.WHITE} />

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col p-3 bg-primary/20 border border-base-content/10 rounded-md min-w-24 gap-3">
                  <TertiaryLabel
                    value={"General Rate"}
                    color={Color.NEUTRAL_CONTENT}
                  />
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    {tariffElement.general || "-"}
                  </h2>

                  {getTemporaryTariffText(tariffElement, TariffType.GENERAL)}
                </div>
                <div className="flex flex-col p-3 bg-primary/20 border border-base-content/10 rounded-md min-w-24 gap-3">
                  <TertiaryLabel
                    value={"Special Rate"}
                    color={Color.NEUTRAL_CONTENT}
                  />
                  <div className="flex flex-col">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                      {getTextBeforeOpeningParenthesis(tariffElement.special) ||
                        "-"}
                    </h2>
                    {getTextBeforeOpeningParenthesis(tariffElement.special) && (
                      <span className="mt-2 text-xs italic text-white">
                        If qualified based on the following acts/agreemnts:
                      </span>
                    )}
                    {getStringBetweenParenthesis(tariffElement.special) && (
                      <div className="flex flex-col">
                        <div className="flex flex-wrap gap-x-1">
                          {getStringBetweenParenthesis(tariffElement.special)
                            .split(",")
                            .map((specialTariffSymbol, index) => {
                              const note =
                                getGeneralNoteFromSpecialTariffSymbol(
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
                  </div>
                  {getTemporaryTariffText(tariffElement, TariffType.SPECIAL)}
                </div>

                <div className="flex flex-col p-3 bg-primary/20 border border-base-content/10 rounded-md min-w-24 gap-3">
                  <TertiaryLabel
                    value={"Other Rate"}
                    color={Color.NEUTRAL_CONTENT}
                  />
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    {tariffElement.other || "-"}
                  </h2>

                  {getTemporaryTariffText(tariffElement, TariffType.OTHER)}
                </div>

                <div className="flex flex-col p-3 bg-primary/20 border border-base-content/10 rounded-md min-w-24 gap-3">
                  <TertiaryLabel
                    value={`Units`}
                    color={Color.NEUTRAL_CONTENT}
                  />
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    {tariffElement.units.join(", ") || "-"}
                  </h2>
                </div>
              </div>
            </div>
          )}
        </>
        {/* NOTES */}
        {showNotes && (
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-1">
                <SecondaryLabel value="Final Notes" color={Color.WHITE} />
                <button
                  className="btn btn-xs btn-primary"
                  onClick={() => {
                    setShowNotes(false);
                    setClassification({
                      ...classification,
                      notes: "",
                    });
                  }}
                >
                  <XMarkIcon className="w-4 h-4" />
                  Remove Notes
                </button>
              </div>
            </div>

            <textarea
              className="min-h-36 textarea textarea-bordered border-2 focus:outline-none text-white placeholder:text-white/20 placeholder:italic text-base w-full"
              placeholder="Add any final notes here. These notes will be included in your classification report."
              value={classification.notes || ""}
              onChange={(e) => {
                setClassification({
                  ...classification,
                  notes: e.target.value,
                });
              }}
            />
          </div>
        )}
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
