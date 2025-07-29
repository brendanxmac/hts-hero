import { HtsElement, Navigatable } from "../interfaces/hts";
import { useEffect, useState } from "react";
import {
  getDirectChildrenElements,
  getBreadCrumbsForElement,
  getTariffDetails,
  getTemporaryTariffTextElement,
  getGeneralNoteFromSpecialTariffSymbol,
  isFullHTSCode,
  isHTSCode,
  getTemporaryTariffText,
} from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
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
import { CountrySelection } from "./CountrySelection";
import { Country } from "../constants/countries";
import { TertiaryText } from "./TertiaryText";
import { format } from "date-fns";
import {
  getTariffsByCode,
  getTariffsForCountryAndCode,
} from "../public/tariffs/tariffs";
import { PrimaryLabel } from "./PrimaryLabel";

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
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);

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
      return `›`;
    }

    return "-";
  };

  return (
    <div className="card bg-base-100 p-4 rounded-xl border border-base-content/10 w-full flex flex-col items-start justify-between gap-8 pt-2 sm:pt-6">
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex flex-col gap-2 text-xs">
            {getBreadCrumbsForElement(element, sections, htsElements).map(
              (breadcrumb, i) => (
                <div
                  key={`breadcrumb-${i}`}
                  style={{
                    marginLeft: !breadcrumb.label && i > 0 ? `1rem` : "0",
                  }}
                >
                  {breadcrumb.label && (
                    <b className="text-accent">{breadcrumb.label} </b>
                  )}
                  <span
                    className={`${!breadcrumb.label ? "font-bold italic" : "text-white"}`}
                  >
                    {breadcrumb.value}
                  </span>
                  <span className="text-white mx-2">›</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="w-full h-[1px] bg-base-content/10" />

        <div className="flex flex-col gap-3">
          <div className="w-full flex justify-between items-start gap-2">
            <SecondaryLabel value={getHtsnoLabel()} color={Color.ACCENT} />

            <div className="flex gap-2">
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
              {(chapter == 98 || chapter == 99) && (
                <ButtonWithIcon
                  icon={<DocumentTextIcon className="h-4 w-4" />}
                  label={`Subchapter ${htsno.slice(2, 4).replace(/^0+/, "")} Notes`}
                  onClick={() => {
                    setShowPDF({
                      title: `Chapter ${chapter} - Subchapter ${htsno.slice(2, 4).replace(/^0+/, "")} Notes`,
                      bucket: SupabaseBuckets.NOTES,
                      filePath: `/chapters/Chapter ${chapter}-${htsno.slice(2, 4).replace(/^0+/, "")}.pdf`,
                    });
                  }}
                />
              )}
              {htsno && (
                <button
                  className="btn btn-xs btn-primary"
                  onClick={() => {
                    const htsCode = isFullHTSCode(htsno)
                      ? htsno.slice(0, -3)
                      : htsno;
                    window.open(
                      `https://rulings.cbp.gov/search?term=${encodeURIComponent(
                        htsCode
                      )}`,
                      "_blank"
                    );
                  }}
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Search CROSS
                </button>
              )}
            </div>
          </div>

          <h1 className="text-lg md:text-3xl text-white font-bold">
            {description}
          </h1>
        </div>
      </div>

      {!summaryOnly && (
        <>
          {/* If htsno is 10 digits, show the country selection */}
          {htsno && htsno.replaceAll(".", "").length === 10 && (
            <div className="w-full flex flex-col gap-2">
              <div className="flex flex-col">
                <SecondaryLabel value="Tariff Simulator" color={Color.WHITE} />
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
                  className="btn btn-sm btn-primary"
                  disabled={selectedCountries.length === 0}
                  onClick={() => {
                    selectedCountries.map((country) =>
                      window.open(
                        `https://tariffs.flexport.com/?entryDate=${format(new Date(), "yyyy-MM-dd")}&country=${country.code}&value=10000&advanced=true&code=${htsno}`,
                        "_blank"
                      )
                    );
                  }}
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Search
                </button>
              </div>

              {isFullHTSCode(htsno) && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedCountries.map((country) => (
                    <div
                      key={`${country.code}-${htsno}`}
                      className="flex flex-col p-3 border-2 border-base-content/50 bg-base-300 rounded-md gap-4"
                    >
                      <PrimaryLabel value={country.name} color={Color.WHITE} />

                      {getTariffsForCountryAndCode(
                        country.code,
                        htsno,
                        getTemporaryTariffText(element, TariffType.GENERAL)[0]
                      ).map((tariff) => (
                        <div className="w-full flex flex-col gap-4">
                          <div
                            key={tariff.code}
                            className="w-full text-white font-bold flex gap-2 justify-between items-center"
                          >
                            <div>
                              <span className="text-secondary">
                                {" "}
                                {tariff.code}{" "}
                              </span>
                              <span> - </span>
                              <span className="font-normal">{tariff.name}</span>
                            </div>
                            <p className="shrink-0 text-2xl lg:text-3xl text-secondary">
                              {tariff.general}%
                            </p>
                          </div>

                          {/* <div className="flex gap-2 ml-4">
                              <p>G: {tariff.general}</p>
                              <p>S: {tariff.special}</p>
                              <p>O: {tariff.other}</p>
                            </div> */}

                          {tariff.exceptions?.length > 0 &&
                            getTariffsByCode(tariff.exceptions).map(
                              (exceptionTariff) =>
                                // If there's an exception without a matching tariff record
                                // we will get null / undefined here, so we need to check for that
                                exceptionTariff?.inclusions?.codes?.includes(
                                  htsno
                                ) ||
                                (exceptionTariff?.inclusions?.countries?.includes(
                                  country.code
                                ) && (
                                  <div
                                    key={exceptionTariff.code}
                                    className="flex ml-4 justify-between items-center"
                                  >
                                    <div className="flex gap-2 text-white">
                                      <span className="text-accent font-bold">
                                        {exceptionTariff.code}
                                      </span>
                                      <span>-</span>
                                      <span className="font-normal">
                                        {" "}
                                        {exceptionTariff.name}
                                      </span>
                                    </div>
                                    <p className="shrink-0 text-lg lg:text-xl text-accent font-bold">
                                      {exceptionTariff.general}%
                                    </p>
                                  </div>
                                ))
                            )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {children.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <SecondaryLabel
                value="Options for Next Level"
                color={Color.NEUTRAL_CONTENT}
              />
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

          {(tariffElement || element.additionalDuties) && (
            <div className="w-full flex flex-col gap-4">
              <SecondaryLabel value="Base Tariff Details" color={Color.WHITE} />

              <div className="grid grid-cols-2 gap-2">
                {tariffElement && (
                  <>
                    <div className="flex flex-col gap-3 p-3 bg-base-300 border border-base-content/10 rounded-md min-w-24">
                      <div>
                        <TertiaryLabel
                          value={"General Rate"}
                          color={Color.NEUTRAL_CONTENT}
                        />
                        <SecondaryText
                          value={tariffElement.general || "-"}
                          color={Color.WHITE}
                        />
                      </div>
                      {getTemporaryTariffTextElement(
                        tariffElement,
                        TariffType.GENERAL
                      )}
                    </div>

                    <div className="flex flex-col p-3 bg-base-300 border border-base-content/10 rounded-md min-w-24 gap-3">
                      <TertiaryLabel
                        value={"Special Rate"}
                        color={Color.NEUTRAL_CONTENT}
                      />
                      <div className="flex flex-col">
                        <SecondaryText
                          value={
                            getTextBeforeOpeningParenthesis(
                              tariffElement.special
                            ) || "-"
                          }
                          color={Color.WHITE}
                        />
                        {getStringBetweenParenthesis(tariffElement.special) &&
                          getTextBeforeOpeningParenthesis(
                            tariffElement.special
                          ) && (
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
                      {getTemporaryTariffTextElement(
                        tariffElement,
                        TariffType.SPECIAL
                      )}
                    </div>

                    <div className="flex flex-col gap-3 p-3 bg-base-300 border border-base-content/10 rounded-md min-w-24">
                      <div>
                        <TertiaryLabel
                          value={"Other Rate"}
                          color={Color.NEUTRAL_CONTENT}
                        />
                        <SecondaryText
                          value={tariffElement.other || "-"}
                          color={Color.WHITE}
                        />
                      </div>
                      {getTemporaryTariffTextElement(
                        tariffElement,
                        TariffType.OTHER
                      )}
                    </div>

                    <div className="flex flex-col gap-1 p-3 bg-base-300 border border-base-content/10 rounded-md min-w-24">
                      <TertiaryLabel
                        value={`Units`}
                        color={Color.NEUTRAL_CONTENT}
                      />
                      <SecondaryText
                        value={tariffElement.units.join(", ") || "-"}
                        color={Color.WHITE}
                      />
                    </div>
                  </>
                )}
                {element.additionalDuties && (
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
