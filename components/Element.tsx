import { HtsElement, Navigatable } from "../interfaces/hts";
import { useEffect, useState } from "react";
import {
  getDirectChildrenElements,
  getBreadCrumbsForElement,
  isFullHTSCode,
  getTariffElement,
  getGeneralNoteFromSpecialTariffSymbol,
  getTemporaryTariffTextElement,
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
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { PDFProps } from "../interfaces/ui";
import { SupabaseBuckets } from "../constants/supabase";
import { CountrySelection } from "./CountrySelection";
import { Country } from "../constants/countries";
import { TertiaryText } from "./TertiaryText";
import { format } from "date-fns";
import { Tariffs } from "./Tariffs";
import {
  tariffIsApplicableToCode,
  TariffsList,
} from "../public/tariffs/tariffs";
import { PrimaryLabel } from "./PrimaryLabel";
import { ContentRequirements, TariffColumn } from "../enums/tariff";
import {
  getStringBeforeOpeningParenthesis,
  getStringBetweenParenthesis,
} from "../utilities/hts";
import { SecondaryText } from "./SecondaryText";
import Link from "next/link";

interface Props {
  summaryOnly?: boolean;
  element: HtsElement;
}

export interface ContentRequirementI<T> {
  name: T;
  value: number;
}

export const Element = ({ element, summaryOnly = false }: Props) => {
  const { description, chapter, htsno } = element;
  const [children, setChildren] = useState<HtsElement[]>([]);
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { htsElements } = useHts();
  const { sections } = useHtsSections();
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([
    { flag: "🇨🇳", name: "China", code: "CN" },
  ]);

  const codeBasedContentRequirements = Array.from(
    TariffsList.filter((t) => tariffIsApplicableToCode(t, htsno)).reduce(
      (acc, t) => {
        if (t.contentRequirement) {
          acc.add(t.contentRequirement.content);
        }
        return acc;
      },
      new Set<ContentRequirements>()
    )
  );

  const [codeBasedContentPercentages, setCodeBasedContentPercentages] =
    useState<ContentRequirementI<ContentRequirements>[]>(
      codeBasedContentRequirements.map((contentRequirement) => ({
        name: contentRequirement,
        value: 80,
      }))
    );

  useEffect(() => {
    const elementChildren = getDirectChildrenElements(element, htsElements);
    setChildren(elementChildren);
  }, [element]);

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

  // FIXME: what if the element only has additionalDuties? Shoul this be considered here?
  const elementHasTariffDetails =
    element.general ||
    element.special ||
    element.other ||
    element.additionalDuties;

  const shouldShowBaseTariffDetails =
    (!isFullHTSCode(htsno) && elementHasTariffDetails) ||
    (isFullHTSCode(htsno) && selectedCountries.length === 0);

  const tariffElement =
    getTariffElement(element, htsElements, breadcrumbs) || element;

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

          <h1 className="text-lg md:text-3xl lg:text-4xl text-white font-bold">
            {description}
          </h1>
        </div>
      </div>

      {!summaryOnly && (
        <>
          {/* If htsno is 10 digits, show the country selection */}
          {htsno && htsno.replaceAll(".", "").length === 10 && (
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <PrimaryLabel value="Tariff Explorer" color={Color.WHITE} />
                    <div className="bg-accent rounded-full">
                      <p className="text-neutral px-2 py-0.5 font-semibold text-xs">
                        Beta
                      </p>
                    </div>
                  </div>
                  <TertiaryText
                    value="This experimental tool allows you to easily explore and compare potential tariff values for any number of countries."
                    color={Color.NEUTRAL_CONTENT}
                  />
                </div>
                <div className="flex gap-6 w-full flex-col lg:grid grid-cols-2">
                  <div className="grow">
                    <div className="flex flex-col gap-1">
                      <SecondaryLabel
                        value="Country Selection"
                        color={Color.WHITE}
                      />
                      <TertiaryText
                        value={`Select the countries you want to see tariff simulations for`}
                        color={Color.NEUTRAL_CONTENT}
                      />
                      <CountrySelection
                        selectedCountries={selectedCountries}
                        setSelectedCountries={setSelectedCountries}
                      />
                    </div>
                  </div>
                  {/* Show inputs for any content requirements based */}
                  {codeBasedContentRequirements.length > 0 && (
                    <div className="grow w-full flex flex-col gap-4">
                      {codeBasedContentRequirements.map(
                        (contentRequirement) => (
                          <div
                            key={`${contentRequirement}-content-requirement`}
                            className="w-full flex flex-col gap-1"
                          >
                            <SecondaryLabel
                              value={`${contentRequirement} Value Percentage`}
                              color={Color.WHITE}
                            />
                            <TertiaryText
                              value={`Select the percetnage of the articles value that is ${contentRequirement}?`}
                              color={Color.NEUTRAL_CONTENT}
                            />
                            <div className="flex gap-2 items-center mt-3">
                              <input
                                type="range"
                                min={0}
                                max="100"
                                value={
                                  codeBasedContentPercentages?.find(
                                    (c) => c.name === contentRequirement
                                  )?.value || 0
                                }
                                className="range range-primary p-1"
                                onChange={(e) => {
                                  setCodeBasedContentPercentages((prev) =>
                                    prev.map((c) =>
                                      c.name === contentRequirement
                                        ? {
                                            ...c,
                                            value: parseInt(e.target.value),
                                          }
                                        : c
                                    )
                                  );
                                }}
                              />
                              <TertiaryLabel
                                value={`${
                                  codeBasedContentPercentages?.find(
                                    (c) => c.name === contentRequirement
                                  )?.value || 0
                                }%`}
                                color={Color.NEUTRAL_CONTENT}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* TODO: I think we can remove this check cause we already do similar above? */}
              {isFullHTSCode(htsno) && selectedCountries.length > 0 && (
                <div className="flex flex-col gap-4">
                  {/* <PrimaryLabel value="Tariffs" color={Color.WHITE} /> */}
                  <Tariffs
                    selectedCountries={selectedCountries}
                    htsElement={element}
                    tariffElement={getTariffElement(
                      element,
                      htsElements,
                      breadcrumbs
                    )}
                    setSelectedCountries={setSelectedCountries}
                    contentRequirements={codeBasedContentPercentages}
                  />
                  <p>
                    <sup>
                      Note: We can make mistakes and do not guarantee complete
                      nor correct calculations, especially while in beta. If you
                      see any issues please{" "}
                      <a
                        href="mailto:support@htshero.com"
                        className="text-primary"
                      >
                        notify us
                      </a>{" "}
                      and we will quickly correct them so everyone can benefit.
                      To see a full list of what we currently include in our
                      calculations, please{" "}
                      <Link href="/tariffs/coverage" className="text-primary">
                        click here
                      </Link>
                      .
                    </sup>
                  </p>
                </div>
              )}
            </div>
          )}

          {children.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <SecondaryLabel
                value="Options for Next Level"
                color={Color.WHITE}
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

          {shouldShowBaseTariffDetails && (
            <div className="w-full flex flex-col gap-4">
              <SecondaryLabel value="Base Tariff Details" color={Color.WHITE} />

              <div className="grid grid-cols-2 gap-2">
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
                      TariffColumn.GENERAL
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
                          getStringBeforeOpeningParenthesis(
                            tariffElement.special
                          ) || "-"
                        }
                        color={Color.WHITE}
                      />
                      {getStringBetweenParenthesis(tariffElement.special) &&
                        getStringBeforeOpeningParenthesis(
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
                      TariffColumn.SPECIAL
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
                      TariffColumn.OTHER
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

                {/* FIXME: I think there are cases where additional duties come from outside the element */}
                {tariffElement.additionalDuties && (
                  <div className="flex flex-col gap-1 p-3 bg-base-300 border border-base-content/10 rounded-md min-w-24">
                    <TertiaryLabel
                      value={`Additional Duties`}
                      color={Color.NEUTRAL_CONTENT}
                    />
                    <SecondaryText
                      value={tariffElement.additionalDuties || "-"}
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
