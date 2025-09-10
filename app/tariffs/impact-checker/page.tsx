"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useHts } from "../../../contexts/HtsContext";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import Link from "next/link";
import Modal from "../../../components/Modal";
import { TariffImpactInputHelp } from "../../../components/TariffImpactInputHelp";
import { TertiaryText } from "../../../components/TertiaryText";
import TariffUpdateDropdown from "../../../components/TariffUpdateDropdown";
import { PrimaryLabel } from "../../../components/PrimaryLabel";
import { MixpanelEvent, trackEvent } from "../../../libs/mixpanel";
import {
  fetchHtsCodeSetsForUser,
  getHtsCodesFromString,
  getValidHtsCodesFromSet,
} from "../../../libs/hts-code-set";
import toast from "react-hot-toast";
import { useUser } from "../../../contexts/UserContext";
import { HtsCodeSet } from "../../../interfaces/hts";
import HtsCodeSetDropdown from "../../../components/HtsCodeSetDropdown";
import { TariffCodeSet } from "../../../tariffs/announcements/announcements";
import { TariffImpactCheck } from "../../../interfaces/tariffs";
import {
  checkTariffImpactsForCodes,
  createTariffImpactCheck,
  fetchTariffImpactChecksForUser,
  TariffImpactResult,
} from "../../../libs/tariff-impact-check";
import {
  getActivePriorityTariffImpactPurchase,
  Purchase,
} from "../../../libs/supabase/purchase";
import { PricingPlan } from "../../../types";
import { classNames } from "../../../utilities/style";
import { ManageCodeListModal } from "../../../components/ManageCodesListModal";
import { codeSetMatchesString } from "../../../utilities/hts";
import TariffConversionPricing from "../../../components/TariffConversionPricing";
import { fetchTariffCodeSets } from "../../../libs/tariff-code-set";
import { ArrowRightIcon } from "@heroicons/react/16/solid";
import { SecondaryText } from "../../../components/SecondaryText";
import TariffImpactCodesInput from "../../../components/TariffImpactCodesInput";

export default function Home() {
  const CHARACTER_LIMIT = 3000;
  const searchParams = useSearchParams();

  // Context
  const { user } = useUser();
  const { fetchElements, htsElements } = useHts();

  // State
  const [loadingPage, setLoadingPage] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<TariffImpactResult[]>([]);
  const [fetchingTariffImpactChecks, setFetchingTariffImpactChecks] =
    useState(true);
  const [tariffImpactChecks, setTariffImpactChecks] = useState<
    TariffImpactCheck[]
  >([]);
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
  const [activeTariffImpactPurchase, setActiveTariffImpactPurchase] =
    useState<Purchase | null>(null);
  const [tariffCodeSets, setTariffCodeSets] = useState<TariffCodeSet[]>([]);
  const [fetchingPurchases, setFetchingPurchases] = useState(true);
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);
  const [checkingTariffImpacts, setCheckingTariffImpacts] = useState(false);

  useEffect(() => {
    const fetchTariffImpactChecks = async () => {
      try {
        setFetchingTariffImpactChecks(true);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const tariffImpactChecksLast30Days =
          await fetchTariffImpactChecksForUser(thirtyDaysAgo);
        setTariffImpactChecks(tariffImpactChecksLast30Days);
      } catch {
        toast.error("Error fetching tariff impact checks");
      } finally {
        setFetchingTariffImpactChecks(false);
      }
    };

    if (results.length > 0) {
      fetchTariffImpactChecks();
    }
    // Refetch tariff impact checks when results change
  }, [results]);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoadingPage(true);
        await Promise.all([
          loadElements(),
          loadTariffCodeSets(),
          fetchHtsCodeSets(),
          fetchTariffImpactChecks(),
          fetchPurchases(),
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

    const fetchTariffImpactChecks = async () => {
      try {
        setFetchingTariffImpactChecks(true);
        const sinceThirtyDaysAgo = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        );
        const tariffImpactChecksLast30Days =
          await fetchTariffImpactChecksForUser(sinceThirtyDaysAgo);
        setTariffImpactChecks(tariffImpactChecksLast30Days);
        setFetchingTariffImpactChecks(false);
      } catch {
        toast.error("Error fetching tariff impact checks");
      } finally {
        setFetchingTariffImpactChecks(false);
      }
    };

    const fetchHtsCodeSets = async () => {
      try {
        const htsCodeSets = await fetchHtsCodeSetsForUser();
        setHtsCodeSets(htsCodeSets);
        setSelectedHtsCodeSetId(null);
      } catch {
        toast.error("Error fetching hts code sets");
      }
    };

    const fetchPurchases = async () => {
      setFetchingPurchases(true);
      const activeTariffImpactPurchase =
        await getActivePriorityTariffImpactPurchase(user.id);

      setActiveTariffImpactPurchase(activeTariffImpactPurchase);
      setFetchingPurchases(false);
    };

    const loadElements = async () => {
      await fetchElements("latest");
    };

    const loadTariffCodeSets = async () => {
      const tariffCodeSets = await fetchTariffCodeSets();
      setTariffCodeSets(tariffCodeSets);
    };

    if (user) {
      loadAllData();
    }
  }, [user]);

  useEffect(() => {
    // Initialize with the first changeList when component mounts
    // Only do this if we haven't processed URL parameters yet
    if (tariffCodeSets.length > 0 && !urlParamsProcessed) {
      setSelectedTariffAnnouncementIndex(0);
    }
  }, [tariffCodeSets, urlParamsProcessed]);

  useEffect(() => {
    handleInputChange(inputValue);
  }, [selectedTariffAnnouncementIndex]);

  // Will automatically check results if url params both processed & set
  useEffect(() => {
    if (
      urlParamsProcessed &&
      selectedHtsCodeSetId &&
      selectedTariffAnnouncementIndex
    ) {
      handleSubmit();
    }
  }, [urlParamsProcessed]);

  // Process URL parameters after all data is loaded
  useEffect(() => {
    if (!urlParamsProcessed && !loadingPage && tariffCodeSets.length > 0) {
      const tariffAnnouncementId = searchParams.get("tariffAnnouncement");
      const htsCodeSetId = searchParams.get("htsCodeSet");

      // Process tariff announcement parameter
      if (tariffAnnouncementId) {
        const matchingTariffIndex = tariffCodeSets.findIndex(
          (set) => set.id === tariffAnnouncementId
        );
        if (matchingTariffIndex !== -1) {
          setSelectedTariffAnnouncementIndex(matchingTariffIndex);
        }
      }

      // Process HTS code set parameter
      if (htsCodeSetId && htsCodeSets.length > 0) {
        const matchingHtsCodeSet = htsCodeSets.find(
          (set) => set.id === htsCodeSetId
        );
        if (matchingHtsCodeSet) {
          setSelectedHtsCodeSetId(htsCodeSetId);
          // Also populate the input with the codes from the selected set
          const codesString = matchingHtsCodeSet.codes.join(", ");
          setInputValue(codesString);
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

  const getNotes = (result: TariffImpactResult) => {
    const { impacted, code, error } = result;
    const codeExists = htsCodeExists(code);

    if (impacted === null) {
      return (
        <td className="hidden sm:table-cell">
          <TertiaryText value={error || "Code Unsupported"} />
        </td>
      );
    }

    if (!codeExists) {
      return (
        <td className="hidden sm:table-cell">
          <TertiaryText value="Code Does Not Exist" />
        </td>
      );
    }

    return <td className="hidden sm:table-cell">-</td>;
  };

  const getImpactIndicator = (result: TariffImpactResult) => {
    const { impacted, code } = result;
    const codeExists = htsCodeExists(code);

    let indicator = "";
    let tooltip = "";

    if (impacted === null) {
      indicator = "⚠️";
      tooltip = "Code Issue";
    } else if (codeExists) {
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

      // // Check if the user has hit the limit based on their plan
      const totalChecksThisMonth = tariffImpactChecks.reduce(
        (acc, check) => acc + check.num_codes,
        0
      );

      if (totalChecksThisMonth >= checkLimit) {
        // Show popup instead to get them to convert
        toast.error(
          `You have reached your limit of ${checkLimit} checks this month. Upgrade to get more checks.`,
          { duration: 6000 }
        );
        return;
      }

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

      const numChecksForSubmit = results.length;

      if (totalChecksThisMonth + numChecksForSubmit > checkLimit) {
        toast.error(
          `You're trying to check ${numChecksForSubmit} codes but only have ${checkLimit - totalChecksThisMonth} left this month. Enter less codes or upgrade to get more checks`,
          { duration: 10000 }
        );
        return;
      }

      const validCodesToCheck = getValidHtsCodesFromSet(htsCodes);

      try {
        // Don't want to await this and don't want to error if it fails
        await createTariffImpactCheck(
          tariffUpdateToCheckAgainst.id,
          validCodesToCheck,
          selectedHtsCodeSetId
        );
      } catch (e) {
        console.error("Error creating tariff impact check:", e);
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
    // Preserve the user's input format as-is
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
      // Update the selected code set if we found a match
      if (codeSetThatMatchesInput) {
        setSelectedHtsCodeSetId(codeSetThatMatchesInput.id);
      } else {
        setSelectedHtsCodeSetId(null);
      }
    }
  };

  const handleHtsCodeSetSelection = (htsCodeSetId: string | null) => {
    if (htsCodeSetId === null) {
      // Clear selection
      setSelectedHtsCodeSetId(null);
      setInputValue("");
      setLastActionWasSubmit(false);
      return;
    }

    const selectedSet = htsCodeSets.find((set) => set.id === htsCodeSetId);
    if (selectedSet) {
      // Join the codes with commas and spaces for readability
      const codesString = selectedSet.codes.join(", ");
      setInputValue(codesString);
      setSelectedHtsCodeSetId(htsCodeSetId);
    }
  };

  const numChecksThisMonth = tariffImpactChecks.reduce(
    (acc, check) => acc + check.num_codes,
    0
  );

  const getCheckLimitForUser = (purchase: Purchase | null) => {
    if (purchase === null) {
      return 20;
    }

    if (purchase.product_name === PricingPlan.TARIFF_IMPACT_STARTER) {
      return 40;
    }

    if (purchase.product_name === PricingPlan.TARIFF_IMPACT_STANDARD) {
      return 400;
    }

    if (purchase.product_name === PricingPlan.TARIFF_IMPACT_PRO) {
      return Infinity;
    }
  };

  const checkLimit = getCheckLimitForUser(activeTariffImpactPurchase);

  if (loadingPage) {
    return (
      <main className="w-screen h-screen flex items-center justify-center bg-base-300">
        <LoadingIndicator />
      </main>
    );
  }

  return (
    <main className="w-screen h-full flex flex-col bg-base-300 py-6">
      <div className="w-full max-w-5xl mx-auto flex flex-col px-4 sm:px-6 gap-6 pb-6">
        {/* Header */}
        <div className="flex justify-between md:items-center flex-col-reverse md:flex-row gap-4">
          <div className="w-full flex flex-col">
            <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-4 items-center">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100">
                  Tariff Impact Checker
                </h1>

                {!fetchingPurchases && (
                  <div className="flex items-center gap-4">
                    <span
                      className={classNames(
                        "h-fit px-2 py-0.5 rounded-md font-semibold text-xs border",
                        activeTariffImpactPurchase &&
                          activeTariffImpactPurchase.product_name ===
                            PricingPlan.TARIFF_IMPACT_PRO &&
                          "text-secondary border-secondary",
                        activeTariffImpactPurchase &&
                          activeTariffImpactPurchase.product_name ===
                            PricingPlan.TARIFF_IMPACT_STANDARD &&
                          "text-primary border-primary",
                        !activeTariffImpactPurchase &&
                          "text-warning border-warning"
                      )}
                    >
                      {activeTariffImpactPurchase
                        ? activeTariffImpactPurchase.product_name.split(" ")[2]
                        : "Free Plan"}
                    </span>
                  </div>
                )}
              </div>

              {checkLimit !== Infinity &&
                (fetchingTariffImpactChecks ? (
                  <LoadingIndicator spinnerOnly />
                ) : (
                  <div className="w-full sm:w-auto justify-between sm:justify-normal flex items-center gap-4 px-4 sm:px-0 p-2 bg-base-100 border sm:border-none sm:bg-inherit border-base-content/20 rounded-md">
                    <div className="flex flex-col">
                      <p
                        className={classNames(
                          "text-sm font-bold",
                          numChecksThisMonth >= checkLimit
                            ? "text-error"
                            : checkLimit - numChecksThisMonth < 20
                              ? "text-warning"
                              : "text-gray-400"
                        )}
                      >
                        {checkLimit - numChecksThisMonth} Check
                        {checkLimit - numChecksThisMonth === 1 ? "" : "s"} Left
                      </p>
                      <p className="text-xs">{`Limit: ${checkLimit}/month`}</p>
                    </div>

                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setShowPricingModal(true);
                        try {
                          trackEvent(
                            MixpanelEvent.CLICKED_TARIFF_IMPACT_UPGRADE
                          );
                        } catch (e) {
                          console.error("Error tracking tariff impact upgrade");
                          console.error(e);
                        }
                      }}
                    >
                      Upgrade <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4 sm:gap-8">
          {/* Tariff Announcement Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <PrimaryLabel value="Tariff Announcement" />
              <SecondaryText value="Select the tariff announcement you want to see the impacts of" />
            </div>

            <TariffUpdateDropdown
              tariffCodeSets={tariffCodeSets}
              selectedIndex={selectedTariffAnnouncementIndex}
              onSelectionChange={setSelectedTariffAnnouncementIndex}
            />

            {tariffCodeSets.length > 0 &&
              tariffCodeSets[selectedTariffAnnouncementIndex].note && (
                <p className="text-xs text-neutral-content font-bold">
                  Note: {tariffCodeSets[selectedTariffAnnouncementIndex].note}
                </p>
              )}
          </div>

          {/* HTS Code Selection */}

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <PrimaryLabel value="HTS Codes" />
                    <button
                      className="btn btn-circle btn-xs bg-base-content/30 hover:bg-base-content/70 text-white ml-2 text-sm flex items-center justify-center"
                      onClick={() => setShowHelpModal(true)}
                      title="Help with HTS code formats"
                    >
                      ?
                    </button>
                  </div>
                </div>
                <SecondaryText
                  value={`${htsCodeSets.length > 0 ? "Select or enter" : "Enter"} the HTS codes you want to check`}
                />
              </div>

              {htsCodeSets.length > 0 && (
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
              )}
            </div>
            <TariffImpactCodesInput
              value={inputValue}
              placeholder="3808.94.10.00, 0202.20.80.00, 9701.21.00.00, 2825.80.00.00, etc..."
              onChange={handleInputChange}
              isValid={inputValue.length >= 8}
            />
          </div>
        </div>

        {!lastActionWasSubmit && (
          <button
            className={classNames(
              "w-full btn",
              checkingTariffImpacts ? "btn-neutral" : "btn-primary"
            )}
            disabled={
              lastActionWasSubmit ||
              loadingPage ||
              fetchingTariffImpactChecks ||
              (!inputValue &&
                (selectedHtsCodeSetId === null ||
                  selectedTariffAnnouncementIndex === null))
            }
            onClick={() => handleSubmit()}
          >
            {checkingTariffImpacts ? (
              <LoadingIndicator spinnerOnly />
            ) : (
              "Check Impacts"
            )}
          </button>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div>
            <div className="flex flex-col gap-2 bg-base-100 bg-transparent">
              <div className="w-full flex justify-between items-end sm:items-end gap-2">
                <PrimaryLabel value="Impact Check Results" />

                {results.length > 0 &&
                  (!htsCodeSets.length ||
                    !htsCodeSets.some((set) =>
                      codeSetMatchesString(
                        results.map((result) => result.code).join(", "),
                        set.codes
                      )
                    )) && (
                    <button
                      className="hidden sm:block btn btn-sm btn-secondary"
                      onClick={() => {
                        setSaveCodesModal({
                          show: true,
                          codes: results.map((result) => result.code),
                        });
                      }}
                    >
                      Get Notifications for These Codes
                    </button>
                  )}
              </div>
              <div
                className={`border border-base-content/20 rounded-md ${
                  results.length > 0 ? "p-0" : "p-4"
                }`}
              >
                {results.length > 0 ? (
                  <div className="overflow-x-auto rounded-md">
                    <table className="table table-zebra table-sm table-pin-cols w-full">
                      <thead>
                        <tr>
                          <th className="w-4"></th>
                          <th>HTS Code</th>
                          <th>Impacted</th>
                          <th className="hidden sm:table-cell">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result, i) => {
                          const htsElementForCode = htsElements.find(
                            (element) => element.htsno === result.code
                          );
                          const impactIndicator = getImpactIndicator(result);
                          const notes = getNotes(result);

                          return (
                            <tr key={`${result.code}-${i}`} className="py-1">
                              <td>{i + 1}</td>
                              {htsElementForCode ? (
                                <td className="truncate min-w-32 lg:min-w-64">
                                  <Link
                                    href={`/explore?code=${result.code}`}
                                    target="_blank"
                                    className="link link-primary font-bold"
                                  >
                                    {result.code}
                                  </Link>
                                </td>
                              ) : (
                                <td className="truncate min-w-32 lg:min-w-64">
                                  {result.code}
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
                ) : (
                  <p className="text-sm text-gray-500">
                    No results yet, enter code(s) to see if they are impacted by
                    the selected tariff change list.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
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
        <TariffConversionPricing
          currentPlan={activeTariffImpactPurchase?.product_name}
        />
      </Modal>
    </main>
  );
}

{
  /* <div className="flex gap-2 items-center">
              <div className="flex flex-wrap items-center">
                <p className="text-xs font-bold text-gray-500">Try Me!</p>
                {exampleLists.map((example) => (
                  <button
                    key={`${example.name}-example`}
                    className="btn btn-xs text-base-content/80 hover:text-primary btn-link"
                    onClick={() => {
                      handleInputChange(example.list);
                    }}
                  >
                    {example.name}
                  </button>
                ))}
              </div>
            </div> */
}
