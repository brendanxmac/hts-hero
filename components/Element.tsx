import { HtsElement, Navigatable } from "../interfaces/hts";
import { useEffect, useState } from "react";
import {
  getDirectChildrenElements,
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
import { PDFProps } from "../interfaces/ui";
import { SupabaseBuckets } from "../constants/supabase";
import { Tariffs } from "./Tariffs";
import { TariffColumn } from "../enums/tariff";
import {
  getStringBeforeOpeningParenthesis,
  getStringBetweenParenthesis,
} from "../utilities/hts";
import { useUser } from "../contexts/UserContext";
import { userHasActivePurchase } from "../libs/supabase/purchase";
import { PrimaryLabel } from "./PrimaryLabel";
import Link from "next/link";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { fetchUser, updateUserProfile } from "../libs/supabase/user";

interface Props {
  summaryOnly?: boolean;
  element: HtsElement;
}

export interface ContentRequirementI<T> {
  name: T;
  value: number;
}

export const Element = ({ element, summaryOnly = false }: Props) => {
  const { user } = useUser();
  const { description, chapter, htsno } = element;
  const [children, setChildren] = useState<HtsElement[]>([]);
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { htsElements } = useHts();
  const [isPayingUser, setIsPayingUser] = useState<boolean>(false);
  const [isTariffImpactTrialUser, setIsTariffImpactTrialUser] =
    useState<boolean>(false);
  // const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);

  useEffect(() => {
    const fetchIsPayingUser = async () => {
      if (user) {
        const isPayingUser = await userHasActivePurchase(user.id);
        setIsPayingUser(isPayingUser);
      }
    };

    const fetchIsTariffImpactTrialUser = async () => {
      if (user) {
        const userProfile = await fetchUser(user.id);
        const userTrialStartDate = userProfile?.tariff_impact_trial_started_at;

        if (userTrialStartDate) {
          // if the trial started more than 10 days ago, set isTrialUser to false
          const trialStartedMoreThan7DaysAgo =
            new Date(userTrialStartDate) <
            new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

          if (trialStartedMoreThan7DaysAgo) {
            setIsTariffImpactTrialUser(false);
          } else {
            setIsTariffImpactTrialUser(true);
          }
        } else {
          // Update user profile setting tariff_impact_trial_started_at to now
          await updateUserProfile(user.id, {
            tariff_impact_trial_started_at: new Date().toISOString(),
          });
          setIsTariffImpactTrialUser(true);
        }
      }
    };

    const fetchUserData = async () => {
      await Promise.all([fetchIsPayingUser(), fetchIsTariffImpactTrialUser()]);
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

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
  // const elementHasTariffDetails =
  //   element.general ||
  //   element.special ||
  //   element.other ||
  //   element.additionalDuties;

  const shouldShowBasicDutyRates =
    element.chapter == 98 || element.chapter == 99;

  const tariffElement =
    getTariffElement(element, htsElements, breadcrumbs) || element;

  return (
    <div className="card w-full flex flex-col items-start justify-between gap-4">
      <div className="w-full flex flex-col gap-4">
        {/* <div className="flex flex-col gap-3 text-sm">
          <div className="flex flex-wrap gap-y-2">
            {getBreadCrumbsForElement(element, sections, htsElements).map(
              (breadcrumb, i) => (
                <div key={`breadcrumb-${i}`}>
                  {breadcrumb.label && (
                    <b className="text-primary">{breadcrumb.label} </b>
                  )}
                  <span
                    className={`${!breadcrumb.label ? "font-bold italic" : "text-base-content"}`}
                  >
                    {breadcrumb.value}
                  </span>
                  <span className="mx-2">›</span>
                </div>
              )
            )}
          </div>
        </div> */}

        {/* <div className="w-full h-[1px] bg-base-content/10" /> */}

        <div className="flex flex-col gap-1">
          <div className="w-full flex flex-col-reverse sm:flex-row justify-between items-start gap-2">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
              {getHtsnoLabel()}
            </h1>

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
                  className="btn btn-xs btn-neutral"
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

          <PrimaryLabel value={description} />
        </div>
      </div>

      {!summaryOnly && (
        <div className="w-full flex flex-col gap-8">
          {children.length > 0 && (
            <div className="w-full flex flex-col gap-2">
              <SecondaryLabel value="Options for Next Level" />
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

          {/* FIXME: I think there are cases where additional duties come from outside the element */}
          {shouldShowBasicDutyRates && (
            <div className="w-full flex flex-col gap-2">
              <SecondaryLabel value="Basic Duty Rates" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col gap-3 p-3 bg-base-100 border border-base-content/30 rounded-md min-w-24">
                  <div>
                    <TertiaryLabel value={"General Rate"} />
                    <h2>{tariffElement.general || "-"}</h2>
                  </div>
                  {getTemporaryTariffTextElement(
                    tariffElement,
                    TariffColumn.GENERAL
                  )}
                </div>

                <div className="flex flex-col p-3 bg-base-100 border border-base-content/30 rounded-md min-w-24 gap-3">
                  <TertiaryLabel value={"Special Rate"} />
                  <div className="flex flex-col">
                    <h2>
                      {getStringBeforeOpeningParenthesis(
                        tariffElement.special
                      ) || "-"}
                    </h2>
                    {getStringBetweenParenthesis(tariffElement.special) &&
                      getStringBeforeOpeningParenthesis(
                        tariffElement.special
                      ) && (
                        <span className="text-xs italic">
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

                <div className="flex flex-col gap-3 p-3 bg-base-100 border border-base-content/30 rounded-md min-w-24">
                  <div>
                    <TertiaryLabel value={"Other Rate"} />
                    <h2>{tariffElement.other || "-"}</h2>
                  </div>
                  {getTemporaryTariffTextElement(
                    tariffElement,
                    TariffColumn.OTHER
                  )}
                </div>

                <div className="flex flex-col gap-1 p-3 bg-base-100 border border-base-content/30 rounded-md min-w-24">
                  <TertiaryLabel value={`Units`} />
                  <h2>{tariffElement.units.join(", ") || "-"}</h2>
                </div>

                {tariffElement.additionalDuties && (
                  <div className="flex flex-col gap-1 p-3 bg-base-100 border border-base-content/30 rounded-md min-w-24">
                    <TertiaryLabel value={`Additional Duties`} />
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
                      {tariffElement.additionalDuties || "-"}
                    </h2>
                  </div>
                )}
              </div>
            </div>
          )}

          {htsno && htsno.replaceAll(".", "").length === 10 && (
            <div className="w-full flex flex-col gap-4 p-4 sm:p-6 bg-base-200/50 border-2 border-base-content/20 rounded-xl">
              <div className="w-full flex justify-between flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 items-center">
                    <PrimaryLabel value="📊 Tariff Finder" />
                  </div>

                  <Link
                    href="/tariffs/coverage"
                    target="_blank"
                    className="link"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-base-content" />
                  </Link>
                </div>
                <p className="text-sm text-base-content/70">
                  Simulate tariff scenarios for any country of origin and find
                  potential exemptions
                </p>
              </div>
              <Tariffs
                isPayingUser={isPayingUser}
                isTariffImpactTrialUser={isTariffImpactTrialUser}
                htsElement={element}
                tariffElement={getTariffElement(
                  element,
                  htsElements,
                  breadcrumbs
                )}
              />
              <p className="text-sm text-base-content/60">
                <sup>
                  We can make mistakes and do not guarantee complete nor correct
                  calculations. If you see any issues please{" "}
                  <a href="mailto:support@htshero.com" className="text-primary">
                    notify us
                  </a>{" "}
                  and we will quickly correct them for everyone&apos;s benefit.
                </sup>
              </p>
            </div>
          )}
        </div>
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
