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
  ChevronRightIcon,
} from "@heroicons/react/16/solid";
import PDF from "./PDF";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
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
import Link from "next/link";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { fetchUser, updateUserProfile } from "../libs/supabase/user";

interface Props {
  summaryOnly?: boolean;
  element: HtsElement;
  isModal?: boolean;
}

export interface ContentRequirementI<T> {
  name: T;
  value: number;
}

export const Element = ({
  element,
  summaryOnly = false,
  isModal = false,
}: Props) => {
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
    <div className="w-full flex flex-col gap-6">
      {/* Element Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10 p-5">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* HTS Code Badge and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-lg md:text-xl font-bold text-primary">
                  {getHtsnoLabel()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-base-content/5 hover:bg-primary/10 border border-base-content/10 hover:border-primary/20 transition-all duration-200"
                onClick={() =>
                  setShowPDF({
                    title: `Chapter ${chapter} Notes`,
                    bucket: SupabaseBuckets.NOTES,
                    filePath: `/chapters/Chapter ${chapter}.pdf`,
                  })
                }
              >
                <DocumentTextIcon className="h-4 w-4 text-primary/70" />
                <span className="text-xs font-medium">Ch. {chapter} Notes</span>
              </button>

              {(chapter == 98 || chapter == 99) && (
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-base-content/5 hover:bg-primary/10 border border-base-content/10 hover:border-primary/20 transition-all duration-200"
                  onClick={() => {
                    setShowPDF({
                      title: `Chapter ${chapter} - Subchapter ${htsno.slice(2, 4).replace(/^0+/, "")} Notes`,
                      bucket: SupabaseBuckets.NOTES,
                      filePath: `/chapters/Chapter ${chapter}-${htsno.slice(2, 4).replace(/^0+/, "")}.pdf`,
                    });
                  }}
                >
                  <DocumentTextIcon className="h-4 w-4 text-primary/70" />
                  <span className="text-xs font-medium">
                    Subch. {htsno.slice(2, 4).replace(/^0+/, "")} Notes
                  </span>
                </button>
              )}

              {htsno && (
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-base-content/5 hover:bg-secondary/10 border border-base-content/10 hover:border-secondary/20 transition-all duration-200"
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
                  <MagnifyingGlassIcon className="w-4 h-4 text-secondary/70" />
                  <span className="text-xs font-medium">Search CROSS</span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-base-content leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {!summaryOnly && (
        <div className="w-full flex flex-col gap-6">
          {/* Children Elements */}
          {children.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <ChevronRightIcon className="w-4 h-4 text-primary/60" />
                <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                  Next Level
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-base-content/5 text-xs font-bold text-base-content/60">
                  {children.length}
                </span>
              </div>
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

          {/* Basic Duty Rates */}
          {shouldShowBasicDutyRates && (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                Basic Duty Rates
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* General Rate */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    General Rate
                  </span>
                  <span className="text-lg font-bold text-base-content">
                    {tariffElement.general || "-"}
                  </span>
                  {getTemporaryTariffTextElement(
                    tariffElement,
                    TariffColumn.GENERAL
                  )}
                </div>

                {/* Special Rate */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Special Rate
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-base-content">
                      {getStringBeforeOpeningParenthesis(
                        tariffElement.special
                      ) || "-"}
                    </span>
                    {getStringBetweenParenthesis(tariffElement.special) &&
                      getStringBeforeOpeningParenthesis(
                        tariffElement.special
                      ) && (
                        <span className="text-xs text-base-content/50 italic">
                          If qualified based on the acts/agreements below
                        </span>
                      )}
                  </div>

                  {getStringBetweenParenthesis(tariffElement.special) && (
                    <div className="flex flex-wrap gap-1 mt-1">
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
                                className="px-2 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
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
                  )}
                  {getTemporaryTariffTextElement(
                    tariffElement,
                    TariffColumn.SPECIAL
                  )}
                </div>

                {/* Other Rate */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Other Rate
                  </span>
                  <span className="text-lg font-bold text-base-content">
                    {tariffElement.other || "-"}
                  </span>
                  {getTemporaryTariffTextElement(
                    tariffElement,
                    TariffColumn.OTHER
                  )}
                </div>

                {/* Units */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Units
                  </span>
                  <span className="text-lg font-bold text-base-content">
                    {tariffElement.units.join(", ") || "-"}
                  </span>
                </div>

                {/* Additional Duties */}
                {tariffElement.additionalDuties && (
                  <div className="sm:col-span-2 flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-warning/5 via-base-100 to-base-200/30 border border-warning/20">
                    <span className="text-xs font-semibold uppercase tracking-widest text-warning/70">
                      Additional Duties
                    </span>
                    <span className="text-xl font-bold text-base-content">
                      {tariffElement.additionalDuties || "-"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tariff Finder Section - hidden when in modal */}
          {!isModal && htsno && htsno.replaceAll(".", "").length === 10 && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-200/50 via-base-100 to-base-200/30 border border-base-content/10 p-5 sm:p-6">
              {/* Background decoration */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📊</span>
                      <span className="text-lg font-bold text-base-content">
                        Tariff Finder
                      </span>
                      <Link
                        href="/tariffs/coverage"
                        target="_blank"
                        className="hover:opacity-70 transition-opacity"
                      >
                        <QuestionMarkCircleIcon className="w-5 h-5 text-base-content/40" />
                      </Link>
                    </div>
                    <p className="text-sm text-base-content/60">
                      Simulate tariff scenarios for any country of origin and
                      find potential exemptions
                    </p>
                  </div>
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

                <p className="text-xs text-base-content/40">
                  We can make mistakes and do not guarantee complete nor correct
                  calculations. If you see any issues please{" "}
                  <a
                    href="mailto:support@htshero.com"
                    className="text-primary hover:underline"
                  >
                    notify us
                  </a>{" "}
                  and we will quickly correct them for everyone&apos;s benefit.
                </p>
              </div>
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
