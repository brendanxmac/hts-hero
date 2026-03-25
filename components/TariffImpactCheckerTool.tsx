"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useHts } from "../contexts/HtsContext";
import { LoadingIndicator } from "./LoadingIndicator";
import Link from "next/link";
import Modal from "./Modal";
import { TariffImpactInputHelp } from "./TariffImpactInputHelp";
import TariffUpdateDropdown from "./TariffUpdateDropdown";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import {
  fetchHtsCodeSetsForUser,
  getHtsCodesFromString,
  getValidHtsCodesFromSet,
} from "../libs/hts-code-set";
import toast from "react-hot-toast";
import { useUser } from "../contexts/UserContext";
import { HtsCodeSet } from "../interfaces/hts";
import HtsCodeSetDropdown from "./HtsCodeSetDropdown";
import { TariffCodeSet } from "../tariffs/announcements/announcements";
import {
  checkTariffImpactsForCodes,
  createTariffImpactCheck,
  TariffImpactResult,
} from "../libs/tariff-impact-check";
import {
  getActivePriorityTariffPurchase,
  Purchase,
} from "../libs/supabase/purchase";
import { PricingPlan } from "../types";
import { ManageCodeListModal } from "./ManageCodesListModal";
import { codeSetMatchesString } from "../utilities/hts";
import { fetchTariffCodeSets } from "../libs/tariff-code-set";
import {
  ArrowRightIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  BookmarkIcon,
} from "@heroicons/react/16/solid";
import TariffImpactCodesInput from "./TariffImpactCodesInput";
import { fetchUser } from "../libs/supabase/user";
import TariffImpactPricing from "./TariffImpactPricing";
import apiClient from "../libs/api";
import { discontinuedCodes2026 } from "../discontinued-codes-2026";

export default function TariffImpactCheckerTool() {
  const CHARACTER_LIMIT = 3000;
  const searchParams = useSearchParams();

  const { user } = useUser();
  const { fetchElements, htsElements } = useHts();

  const [loadingPage, setLoadingPage] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<TariffImpactResult[]>([]);
  const [selectedTariffAnnouncementIndex, setSelectedTariffAnnouncementIndex] =
    useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [saveCodesModal, setSaveCodesModal] = useState<{
    show: boolean;
    codes: string[];
  }>({ show: false, codes: [] });
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [htsCodeSets, setHtsCodeSets] = useState<HtsCodeSet[]>([]);
  const [selectedHtsCodeSetId, setSelectedHtsCodeSetId] = useState<
    string | null
  >(null);
  const [lastActionWasSubmit, setLastActionWasSubmit] = useState(false);
  const [activeTariffImpactPurchase, setActiveTariffPurchase] =
    useState<Purchase | null>(null);
  const [tariffCodeSets, setTariffCodeSets] = useState<TariffCodeSet[]>([]);
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);
  const [checkingTariffImpacts, setCheckingTariffImpacts] = useState(false);
  const [heroCta, setHeroCta] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHeroCta(document.getElementById("tariff-hero-cta"));
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoadingPage(true);
        await Promise.all([
          loadElements(),
          loadTariffCodeSets(),
          fetchHtsCodeSetsData(),
          fetchPurchases(),
          loadUserProfile(),
        ]);
      } catch (e) {
        console.error(e);
        toast.error(
          "Error loading data. Reload the page or contact support if this continues"
        );
      } finally {
        setLoadingPage(false);
      }
    };

    const fetchHtsCodeSetsData = async () => {
      if (user) {
        try {
          const htsCodeSets = await fetchHtsCodeSetsForUser();
          setHtsCodeSets(htsCodeSets);
          setSelectedHtsCodeSetId(null);
        } catch {
          toast.error("Error fetching hts code sets");
        }
      }
    };

    const fetchPurchases = async () => {
      if (user) {
        try {
          const activeTariffImpactPurchase =
            await getActivePriorityTariffPurchase(user.id);
          setActiveTariffPurchase(activeTariffImpactPurchase);
        } catch {
          toast.error("Error fetching purchases");
        }
      }
    };

    const loadElements = async () => {
      await fetchElements("latest");
    };

    const loadTariffCodeSets = async () => {
      const tariffCodeSets = await fetchTariffCodeSets();
      setTariffCodeSets(tariffCodeSets);
    };

    const loadUserProfile = async () => {
      if (user) {
        try {
          const userProfile = await fetchUser(user.id);
          const userTrialStartDate =
            userProfile?.tariff_impact_trial_started_at;

          if (!userTrialStartDate) {
            await apiClient.post("/tariff-impact-check/trial-started", {
              email: user.email,
            });
            trackEvent(MixpanelEvent.TARIFF_IMPACT_TRIAL_STARTED);
          }
        } catch {
          toast.error("Error fetching user profile");
        }
      }
    };

    loadAllData();
  }, [user]);

  useEffect(() => {
    if (tariffCodeSets.length > 0 && !urlParamsProcessed) {
      setSelectedTariffAnnouncementIndex(0);
    }
  }, [tariffCodeSets, urlParamsProcessed]);

  useEffect(() => {
    handleInputChange(inputValue);
  }, [selectedTariffAnnouncementIndex]);

  useEffect(() => {
    if (
      urlParamsProcessed &&
      selectedHtsCodeSetId &&
      selectedTariffAnnouncementIndex
    ) {
      handleSubmit();
    }
  }, [urlParamsProcessed]);

  useEffect(() => {
    if (!urlParamsProcessed && !loadingPage && tariffCodeSets.length > 0) {
      const tariffAnnouncementId = searchParams.get("tariffAnnouncement");
      const htsCodeSetId = searchParams.get("htsCodeSet");

      if (tariffAnnouncementId) {
        const matchingTariffIndex = tariffCodeSets.findIndex(
          (set) => set.id === tariffAnnouncementId
        );
        if (matchingTariffIndex !== -1) {
          setSelectedTariffAnnouncementIndex(matchingTariffIndex);
        }
      }

      if (htsCodeSetId && htsCodeSets.length > 0) {
        const matchingHtsCodeSet = htsCodeSets.find(
          (set) => set.id === htsCodeSetId
        );
        if (matchingHtsCodeSet) {
          setSelectedHtsCodeSetId(htsCodeSetId);
          const codesString = matchingHtsCodeSet.codes.join(", ");
          setInputValue(codesString);
        }
      }

      const codesParam = searchParams.get("codes");
      if (codesParam && !htsCodeSetId) {
        const parsed = getHtsCodesFromString(codesParam);
        if (parsed.length > 0) {
          setInputValue(parsed.join(", "));
        }
      }

      setUrlParamsProcessed(true);
    }
  }, [
    urlParamsProcessed,
    loadingPage,
    tariffCodeSets,
    htsCodeSets,
    searchParams,
  ]);

  const htsCodeExists = (str: string) => {
    return htsElements.some((element) => element.htsno === str);
  };

  const getNotes = (result: TariffImpactResult, note?: string) => {
    const { impacted, code, error } = result;
    const codeExists = htsCodeExists(code);

    if (impacted === null) {
      return (
        <td className="hidden sm:table-cell">
          <span className="text-xs text-base-content/50">
            {error || "Code Unsupported"}
          </span>
        </td>
      );
    }

    if (!codeExists && !(code in discontinuedCodes2026)) {
      return (
        <td className="hidden sm:table-cell">
          <span className="text-xs text-base-content/50">
            Code Does Not Exist
          </span>
        </td>
      );
    }

    const resultNote = result.code in discontinuedCodes2026 ? discontinuedCodes2026[result.code] : note;

    return (
      <td className="hidden sm:table-cell text-sm text-base-content/70">
        {resultNote || "-"}
      </td>
    );
  };

  const getImpactIndicator = (result: TariffImpactResult) => {
    const { impacted, code } = result;
    const codeExists = htsCodeExists(code);

    let indicator = "";
    let tooltip = "";

    if (impacted === null) {
      indicator = "⚠️";
      tooltip = "Code Issue";
    } else if (codeExists || (code in discontinuedCodes2026)) {
      if (impacted) {
        indicator = "✅";
        tooltip = "Code is impacted";
      } else {
        indicator = "❌";
        tooltip = "Code is not impacted";
      }
    } else {
      indicator = "⚠️";
      tooltip = "Code Issue";
    }

    return (
      <td className="text-xl tooltip tooltip-left" data-tip={tooltip}>
        {indicator}
      </td>
    );
  };

  const getHtsCodesToCheck = () => {
    const selectedCodeSet = htsCodeSets.find(
      (set) => set.id === selectedHtsCodeSetId
    );

    if (selectedCodeSet) {
      return selectedCodeSet.codes;
    } else {
      const characterLimitedInput =
        inputValue.length >= CHARACTER_LIMIT
          ? inputValue.slice(0, CHARACTER_LIMIT)
          : inputValue;
      return getHtsCodesFromString(characterLimitedInput);
    }
  };

  const handleSubmit = async () => {
    try {
      setResults([]);
      setCheckingTariffImpacts(true);

      const htsCodes = getHtsCodesToCheck();

      if (htsCodes.length === 0) {
        toast.error(
          "Please select a code set or enter at least 1 valid HTS code"
        );
        return;
      }

      const tariffUpdateToCheckAgainst =
        tariffCodeSets[selectedTariffAnnouncementIndex];

      if (!tariffUpdateToCheckAgainst) {
        toast.error("Please select a tariff announcement");
        return;
      }

      const results = checkTariffImpactsForCodes(
        htsCodes,
        tariffUpdateToCheckAgainst
      );

      const validCodesToCheck = getValidHtsCodesFromSet(htsCodes);

      if (user) {
        try {
          createTariffImpactCheck(
            tariffUpdateToCheckAgainst.id,
            validCodesToCheck,
            selectedHtsCodeSetId,
            activeTariffImpactPurchase?.product_name || "Trial"
          );
        } catch (e) {
          console.error("Error creating tariff impact check:", e);
        }
      }

      trackEvent(MixpanelEvent.TARIFF_IMPACT_CHECK, {
        numCodes: validCodesToCheck.length,
        changeList: tariffUpdateToCheckAgainst.name,
      });

      setResults(results);
      setLastActionWasSubmit(true);
    } catch (e) {
      console.log(e);
      toast.error(`Error creating tariff impact check: ${e.message}`, {
        duration: 5000,
      });
    } finally {
      setCheckingTariffImpacts(false);
    }
  };

  const handleInputChange = (
    inputValue: string,
    clearSelectedSet?: boolean
  ) => {
    const characterLimitedInput =
      inputValue.length >= CHARACTER_LIMIT
        ? inputValue.slice(0, CHARACTER_LIMIT)
        : inputValue;
    setInputValue(characterLimitedInput);
    setLastActionWasSubmit(false);

    const codeSetThatMatchesInput = htsCodeSets.find((set) =>
      codeSetMatchesString(inputValue, set.codes)
    );

    if (clearSelectedSet) {
      setSelectedHtsCodeSetId(null);
    } else {
      if (codeSetThatMatchesInput) {
        setSelectedHtsCodeSetId(codeSetThatMatchesInput.id);
      } else {
        setSelectedHtsCodeSetId(null);
      }
    }
  };

  const handleHtsCodeSetSelection = (htsCodeSetId: string | null) => {
    if (htsCodeSetId === null) {
      setSelectedHtsCodeSetId(null);
      setInputValue("");
      setLastActionWasSubmit(false);
      return;
    }

    const selectedSet = htsCodeSets.find((set) => set.id === htsCodeSetId);
    if (selectedSet) {
      const codesString = selectedSet.codes.join(", ");
      setInputValue(codesString);
      setSelectedHtsCodeSetId(htsCodeSetId);
    }
  };

  if (loadingPage) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  const showUpgradeCta =
    !activeTariffImpactPurchase ||
    activeTariffImpactPurchase.product_name !== PricingPlan.TARIFF_IMPACT_PRO;

  const upgradeCta = showUpgradeCta ? (
    <button
      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-content font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
      onClick={() => {
        setShowPricingModal(true);
        try {
          trackEvent(MixpanelEvent.CLICKED_TARIFF_IMPACT_UPGRADE);
        } catch (e) {
          console.error("Error tracking tariff impact upgrade");
          console.error(e);
        }
      }}
    >
      <SparklesIcon className="w-4 h-4" />
      Master Tariffs & Discover Savings
      <ArrowRightIcon className="w-4 h-4" />
    </button>
  ) : null;

  return (
    <>
      {/* Portal the upgrade CTA into the hero's right side */}
      {heroCta && upgradeCta && createPortal(upgradeCta, heroCta)}

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-6 pt-0">
        <div className="flex flex-col gap-6">
          {/* Tariff Announcement Selection Card */}
          <div className="relative rounded-2xl bg-base-100 border-2 border-base-content/15 shadow-md p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-base md:text-lg font-bold text-base-content tracking-tight">
                  Select Tariff Announcement
                </span>
              </div>

              <TariffUpdateDropdown
                tariffCodeSets={tariffCodeSets}
                selectedIndex={selectedTariffAnnouncementIndex}
                onSelectionChange={setSelectedTariffAnnouncementIndex}
              />

              {tariffCodeSets.length > 0 &&
                tariffCodeSets[selectedTariffAnnouncementIndex].note && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
                    <span className="text-xs font-medium text-warning">
                      Note:{" "}
                      {tariffCodeSets[selectedTariffAnnouncementIndex].note}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* HTS Code Selection Card */}
          <div className="relative rounded-2xl bg-base-100 border-2 border-base-content/15 shadow-md p-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base md:text-lg font-bold text-base-content tracking-tight">
                      Enter HTS Codes
                    </span>
                    <button
                      className="w-5 h-5 rounded-full bg-base-content/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                      onClick={() => setShowHelpModal(true)}
                      title="Help with HTS code formats"
                    >
                      <QuestionMarkCircleIcon className="w-4 h-4 text-base-content/50" />
                    </button>
                  </div>
                </div>
              </div>

              <HtsCodeSetDropdown
                htsCodeSets={htsCodeSets}
                onCreateSelected={() =>
                  setSaveCodesModal({ show: true, codes: [] })
                }
                selectedIndex={
                  selectedHtsCodeSetId
                    ? htsCodeSets.findIndex(
                      (set) => set.id === selectedHtsCodeSetId
                    )
                    : null
                }
                onSelectionChange={(index) => {
                  setLastActionWasSubmit(false);

                  if (index === null) {
                    handleHtsCodeSetSelection(null);
                  } else {
                    handleHtsCodeSetSelection(htsCodeSets[index].id);
                  }
                }}
              />

              <TariffImpactCodesInput
                value={inputValue}
                placeholder="3808.94.10.00, 0202.20.80.00, 9701.21.00.00, 2825.80.00.00, etc..."
                onChange={handleInputChange}
                isValid={inputValue.length >= 8}
              />
            </div>
          </div>


          {/* Check Button */}
          {!lastActionWasSubmit && (
            <button
              className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${checkingTariffImpacts
                ? "bg-base-content/10 text-base-content/50"
                : "bg-gradient-to-r from-primary to-primary/90 text-primary-content shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                }`}
              disabled={
                lastActionWasSubmit ||
                loadingPage ||
                (!inputValue &&
                  (selectedHtsCodeSetId === null ||
                    selectedTariffAnnouncementIndex === null))
              }
              onClick={() => handleSubmit()}
            >
              {checkingTariffImpacts ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Check Impacts"
              )}
            </button>
          )}

          {/* Results */}
          {results && results.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-base-100 border-2 border-base-content/15 shadow-md">
              {/* Results Header */}
              <div className="flex items-center justify-between p-5 border-b border-base-content/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                    Impact Check Results
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                    {results.length}
                  </span>
                </div>

                {results.length > 0 &&
                  (!htsCodeSets.length ||
                    !htsCodeSets.some((set) =>
                      codeSetMatchesString(
                        results.map((result) => result.code).join(", "),
                        set.codes
                      )
                    )) && (
                    <button
                      className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-sm font-semibold text-primary transition-colors"
                      onClick={async () => {
                        if (user) {
                          setSaveCodesModal({
                            show: true,
                            codes: results.map((result) => result.code),
                          });
                        } else {
                          window.location.href = `/signin?redirect=/tariffs/impact-checker&sign-up=true`;
                        }
                      }}
                    >
                      <BookmarkIcon className="w-4 h-4" />
                      {user ? "Save Codes" : "Sign Up to Save"}
                    </button>
                  )}
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-b border-base-content/10">
                      <th className="w-12 text-xs font-semibold uppercase tracking-widest text-base-content/50 bg-base-200/30">
                        #
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-widest text-base-content/50 bg-base-200/30">
                        HTS Code
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-widest text-base-content/50 bg-base-200/30">
                        Impacted
                      </th>
                      <th className="hidden sm:table-cell text-xs font-semibold uppercase tracking-widest text-base-content/50 bg-base-200/30">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, i) => {
                      const htsElementForCode = htsElements.find(
                        (element) => element.htsno === result.code
                      );
                      const impactIndicator = getImpactIndicator(result);

                      const notes = getNotes(
                        result,
                        tariffCodeSets[selectedTariffAnnouncementIndex]?.note
                      );

                      return (
                        <tr
                          key={`${result.code}-${i}`}
                          className="border-b border-base-content/5 hover:bg-base-200/30 transition-colors"
                        >
                          <td className="text-base-content/50 font-medium">
                            {i + 1}
                          </td>
                          {htsElementForCode ? (
                            <td className="min-w-32 lg:min-w-64">
                              <Link
                                href={`/explore?code=${result.code}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/30 hover:decoration-primary/60 transition-all"
                              >
                                {result.code}
                                <svg
                                  className="w-3.5 h-3.5 opacity-60"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </Link>
                            </td>
                          ) : (
                            <td className="min-w-32 lg:min-w-64">
                              <span className="inline-flex px-2.5 py-1 rounded-lg bg-base-content/5 border border-base-content/10 text-xs font-medium text-base-content/60">
                                {result.code}
                              </span>
                            </td>
                          )}
                          {impactIndicator}
                          {notes}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showHelpModal} setIsOpen={setShowHelpModal}>
        <TariffImpactInputHelp />
      </Modal>
      <ManageCodeListModal
        user={user}
        usersCodeSets={htsCodeSets}
        codes={saveCodesModal.codes}
        isOpen={saveCodesModal.show}
        setIsOpen={(show) =>
          setSaveCodesModal({ show, codes: saveCodesModal.codes })
        }
        onSetCreated={(set: HtsCodeSet) => {
          setHtsCodeSets([...htsCodeSets, set]);
          setSelectedHtsCodeSetId(set.id);
          setInputValue(set.codes.join(", "));
        }}
      />
      <Modal isOpen={showPricingModal} setIsOpen={setShowPricingModal}>
        <TariffImpactPricing />
      </Modal>
    </>
  );
}
