import { useEffect, useState } from "react";
import { useClassification } from "../contexts/ClassificationContext";
import { useHts } from "../contexts/HtsContext";
import { TariffType } from "../enums/hts";
import { Color } from "../enums/style";
import {
  downloadClassificationReport,
  generateBreadcrumbsForHtsElement,
  getChapterFromHtsElement,
  getGeneralNoteFromSpecialTariffSymbol,
  getHtsElementParents,
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
import { TertiaryLabel } from "./TertiaryLabel";
import { PDFProps } from "../interfaces/ui";
import PDF from "./PDF";
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
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { copyToClipboard } from "../utilities/data";
import { useUser } from "../contexts/UserContext";
import { fetchUser } from "../libs/supabase/user";
import { LoadingIndicator } from "./LoadingIndicator";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { SupabaseBuckets } from "../constants/supabase";
import { CountrySelection } from "./CountrySelection";
import { Country } from "../constants/countries";
import { format } from "date-fns";
import { SecondaryText } from "./SecondaryText";

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
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);

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
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">Result</h2>
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
            <TertiaryText value="Below are the US HTS details for the code you found during your classification." />
          </div>
        </div>

        {/* <div className="flex flex-col gap-2">
          <TertiaryLabel
            value="Item Description"
            color={Color.NEUTRAL_CONTENT}
          />
          <PrimaryLabel
            value={classification.articleDescription || ""}
            color={Color.WHITE}
          />
        </div> */}
        {/* <div className="flex flex-col gap-2">
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

        <div className=" flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2 md:gap-0">
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
                View
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

        <div className="w-full flex flex-col gap-2">
          <div className="flex flex-col">
            <PrimaryLabel value="Tariff Simulator" color={Color.WHITE} />
            <TertiaryText
              value="Select countries then click seach to launch Flexports Tariff Simulator"
              color={Color.NEUTRAL_CONTENT}
            />
          </div>
          <div className="flex gap-2 items-center w-full max-w-2xl">
            <div className="grow">
              <CountrySelection
                selectedCountries={selectedCountries}
                setSelectedCountries={setSelectedCountries}
              />
            </div>

            <button
              className="btn btn-primary btn-sm"
              disabled={selectedCountries.length === 0}
              onClick={() => {
                const htsCode =
                  classification.levels[levels.length - 1].selection?.htsno;
                selectedCountries.map((country) =>
                  window.open(
                    `https://tariffs.flexport.com/?entryDate=${format(new Date(), "yyyy-MM-dd")}&country=${country.code}&value=10000&advanced=true&code=${htsCode}`,
                    "_blank"
                  )
                );
              }}
            >
              Search
            </button>
          </div>
        </div>

        {(tariffElement || (element && element.additionalDuties)) && (
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <PrimaryLabel value="Tariff Base Rates" color={Color.WHITE} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tariffElement && (
                <>
                  <div className="flex flex-col p-3 bg-base-100 border border-base-content/10 rounded-md min-w-24 gap-3">
                    <TertiaryLabel
                      value={"General Rate"}
                      color={Color.NEUTRAL_CONTENT}
                    />
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      {tariffElement.general || "-"}
                    </h2>

                    {getTemporaryTariffText(tariffElement, TariffType.GENERAL)}
                  </div>
                  <div className="flex flex-col p-3 bg-base-100 border border-base-content/10 rounded-md min-w-24 gap-3">
                    <TertiaryLabel
                      value={"Special Rate"}
                      color={Color.NEUTRAL_CONTENT}
                    />
                    <div className="flex flex-col">
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                        {getTextBeforeOpeningParenthesis(
                          tariffElement.special
                        ) || "-"}
                      </h2>
                      {getTextBeforeOpeningParenthesis(
                        tariffElement.special
                      ) && (
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
                                      className="btn btn-link btn-xs text-xs p-0 hover:text-secondary"
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
                    </div>
                    {getTemporaryTariffText(tariffElement, TariffType.SPECIAL)}
                  </div>

                  <div className="flex flex-col p-3 bg-base-100 border border-base-content/10 rounded-md min-w-24 gap-3">
                    <TertiaryLabel
                      value={"Other Rate"}
                      color={Color.NEUTRAL_CONTENT}
                    />
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      {tariffElement.other || "-"}
                    </h2>

                    {getTemporaryTariffText(tariffElement, TariffType.OTHER)}
                  </div>

                  <div className="flex flex-col p-3 bg-base-100 border border-base-content/10 rounded-md min-w-24 gap-3">
                    <TertiaryLabel
                      value={`Units`}
                      color={Color.NEUTRAL_CONTENT}
                    />
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      {tariffElement.units.join(", ") || "-"}
                    </h2>
                  </div>
                </>
              )}
              {element && element.additionalDuties && (
                <div className="flex flex-col gap-1 p-3 bg-base-300 border border-base-content/10 rounded-md min-w-24">
                  <TertiaryLabel
                    value={`Additional Duties`}
                    color={Color.NEUTRAL_CONTENT}
                  />
                  <SecondaryText
                    value={element.additionalDuties || "-"}
                    color={Color.WHITE}
                  />
                </div>
              )}
            </div>
          </div>
        )}

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
