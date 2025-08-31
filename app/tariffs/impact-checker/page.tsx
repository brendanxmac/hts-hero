"use client";

import { useEffect, useState } from "react";
import { useHts } from "../../../contexts/HtsContext";
import { validateTariffableHtsCode } from "../../../libs/hts";
import TariffImpactCodesInput from "../../../components/TariffImpactCodesInput";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import Link from "next/link";
import { SecondaryText } from "../../../components/SecondaryText";
import Modal from "../../../components/Modal";
import { TariffImpactInputHelp } from "../../../components/TariffImpactInputHelp";
import { TertiaryText } from "../../../components/TertiaryText";
import TariffAnnouncementDropdown from "../../../components/TariffUpdateDropdown";
import { PrimaryLabel } from "../../../components/PrimaryLabel";
import { MixpanelEvent, trackEvent } from "../../../libs/mixpanel";
import {
  createHtsCodeSet,
  fetchHtsCodeSetsForUser,
  formatHtsCodeWithPeriods,
  parseHtsCodeSet,
  updateHtsCodeSet,
} from "../../../libs/hts-code-set";
import toast from "react-hot-toast";
import { useUser } from "../../../contexts/UserContext";
import { HtsCodeSet } from "../../../interfaces/hts";
import HtsCodeSetDropdown from "../../../components/HtsCodeSetDropdown";
import {
  exampleLists,
  tariffAnnouncementLists,
  TariffImpactResult,
} from "../../../tariffs/announcements/announcements";
import { TariffImpactCheck } from "../../../interfaces/tariffs";
import {
  createTariffImpactCheck,
  fetchTariffImpactChecksForUser,
} from "../../../libs/tariff-impact-check";
import {
  getActivePriorityTariffImpactPurchase,
  Purchase,
} from "../../../libs/supabase/purchase";
import { PricingPlan } from "../../../types";
import { classNames } from "../../../utilities/style";
import { SaveCodeListModal } from "../../../components/SaveCodesListModal";

export default function Home() {
  const CHARACTER_LIMIT = 3000;
  const { user, isLoading: loadingUser } = useUser();
  const { fetchElements, htsElements } = useHts();
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<TariffImpactResult[]>([]);
  const [fetchingTariffImpactChecks, setFetchingTariffImpactChecks] =
    useState(false);
  const [fetchingHtsCodeSets, setFetchingHtsCodeSets] = useState(false);
  const [tariffImpactChecks, setTariffImpactChecks] = useState<
    TariffImpactCheck[]
  >([]);
  const [selectedTariffAnnouncementIndex, setSelectedTariffAnnouncementIndex] =
    useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSaveCodesModal, setShowSaveCodesModal] = useState(false);
  const [htsCodeSets, setHtsCodeSets] = useState<HtsCodeSet[]>([]);
  const [selectedHtsCodeSetId, setSelectedHtsCodeSetId] = useState<
    string | null
  >(null);
  const [savingCodes, setSavingCodes] = useState(false);
  const [lastActionWasSubmit, setLastActionWasSubmit] = useState(false);
  const [activeTariffImpactPurchase, setActiveTariffImpactPurchase] =
    useState<Purchase | null>(null);

  const handleSaveCodes = async (name: string, description: string) => {
    try {
      setSavingCodes(true);
      setShowSaveCodesModal(false);

      if (selectedHtsCodeSetId) {
        console.log("updating existing set");
        // todo just update the existing set
      } else {
        console.log("creating new set");
        const newHtsCodeSet = await createHtsCodeSet(
          inputValue,
          name,
          description
        );
        const htsCodeSets = await fetchHtsCodeSetsForUser();
        setHtsCodeSets(htsCodeSets);
        setSelectedHtsCodeSetId(newHtsCodeSet.id);
        toast.success("Codes saved successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving codes");
    } finally {
      setSavingCodes(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      await Promise.all([
        fetchHtsCodeSets(),
        fetchTariffImpactChecks(),
        fetchPurchases(),
      ]);
    };

    const fetchTariffImpactChecks = async () => {
      try {
        setFetchingTariffImpactChecks(true);
        const tariffImpactChecks = await fetchTariffImpactChecksForUser();
        setTariffImpactChecks(tariffImpactChecks);
        setFetchingTariffImpactChecks(false);
      } catch {
        toast.error("Error fetching tariff impact checks");
      } finally {
        setFetchingTariffImpactChecks(false);
      }
    };

    const fetchHtsCodeSets = async () => {
      try {
        setFetchingHtsCodeSets(true);
        const htsCodeSets = await fetchHtsCodeSetsForUser();
        setHtsCodeSets(htsCodeSets);
        setSelectedHtsCodeSetId(null);
        setFetchingHtsCodeSets(false);
      } catch {
        toast.error("Error fetching hts code sets");
      } finally {
        setFetchingHtsCodeSets(false);
      }
    };

    const fetchPurchases = async () => {
      const activeTariffImpactPurchase =
        await getActivePriorityTariffImpactPurchase(user.id);

      setActiveTariffImpactPurchase(activeTariffImpactPurchase);
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    const loadElements = async () => {
      setLoading(true);
      await fetchElements("latest");
      setLoading(false);
    };

    loadElements();
  }, []);

  useEffect(() => {
    // Initialize with the first changeList when component mounts
    if (tariffAnnouncementLists.length > 0) {
      setSelectedTariffAnnouncementIndex(0);
    }
  }, []);

  useEffect(() => {
    handleInputChange(inputValue);
  }, [selectedTariffAnnouncementIndex]);

  const htsCodeExists = (str: string) => {
    return htsElements.some((element) => element.htsno === str);
  };

  const isEffectedByNewTariffs = (htsCode: string) => {
    // Format the input code to have proper periods
    const formattedCode = formatHtsCodeWithPeriods(htsCode);

    // Simple substring check - much more efficient
    return tariffAnnouncementLists[
      selectedTariffAnnouncementIndex
    ].codesImpacted.some(
      (change) =>
        formattedCode.includes(change) || change.includes(formattedCode)
    );
  };

  const getNotes = (result: TariffImpactResult) => {
    const { impacted, code, error } = result;
    const codeExists = htsCodeExists(code);

    if (impacted === null) {
      return (
        <td>
          <TertiaryText value={error || "Code Unsupported"} />
        </td>
      );
    }

    if (!codeExists) {
      return (
        <td>
          <TertiaryText value="Code Does Not Exist" />
        </td>
      );
    }

    return <td>-</td>;
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const thirtyDaysAgo = new Date(
        currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      // Check if the user has hit the limit based on their plan
      const tariffImpactChecksThisMonth = await fetchTariffImpactChecksForUser(
        thirtyDaysAgo,
        currentDate
      );
      const totalChecksThisMonth = tariffImpactChecksThisMonth.reduce(
        (acc, check) => acc + check.num_codes,
        0
      );

      console.log("Impact Checks for User This Month");
      console.log(totalChecksThisMonth);

      if (totalChecksThisMonth >= checkLimit) {
        // Show popup instead to get them to convert
        toast.error(
          `You have reached your limit of ${checkLimit} checks this month`
        );
        return;
      }

      const characterLimitedInput =
        inputValue.length >= CHARACTER_LIMIT
          ? inputValue.slice(0, CHARACTER_LIMIT)
          : inputValue;
      const results = getResults(characterLimitedInput);

      const numChecksForSubmit = results.length;

      if (totalChecksThisMonth + numChecksForSubmit > checkLimit) {
        toast.error(
          `You're trying to check ${numChecksForSubmit} codes but only have ${checkLimit - totalChecksThisMonth} left this month. Enter less codes or upgrade to get more checks`,
          { duration: 10000 }
        );
        return;
      }

      const tariffImpactCheck = await createTariffImpactCheck(inputValue);
      console.log("New Impact Check", tariffImpactCheck);

      // setFetchingTariffImpactChecks(true);
      const tariffImpactChecks = await fetchTariffImpactChecksForUser();
      setTariffImpactChecks(tariffImpactChecks);
      // setFetchingTariffImpactChecks(false);

      trackEvent(MixpanelEvent.TARIFF_IMPACT_CHECK, {
        numCodes: results.length,
        changeList:
          tariffAnnouncementLists[selectedTariffAnnouncementIndex].name,
      });

      setResults(results);
      setLastActionWasSubmit(true);
    } catch {
      toast.error("Error creating tariff impact check");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (inputValue: string) => {
    // Preserve the user's input format as-is
    const characterLimitedInput =
      inputValue.length >= CHARACTER_LIMIT
        ? inputValue.slice(0, CHARACTER_LIMIT)
        : inputValue;
    setInputValue(characterLimitedInput);
    setLastActionWasSubmit(false);

    const inputAsCodes = parseHtsCodeSet(inputValue);

    // Check if the current input exactly matches any saved HTS code set
    const matchingCodeSet = htsCodeSets.find((set) => {
      if (inputAsCodes.length !== set.codes.length) {
        return false;
      }

      // Sort both arrays to ensure order doesn't matter
      const sortedInputCodes = [...inputAsCodes].sort();
      const sortedSetCodes = [...set.codes].sort();

      return sortedInputCodes.every(
        (code, index) => code === sortedSetCodes[index]
      );
    });

    console.log("Matching code set", matchingCodeSet);

    // Update the selected code set if we found a match
    if (matchingCodeSet) {
      console.log("here here");
      setSelectedHtsCodeSetId(matchingCodeSet.id);
    }
    //  else {
    //   setSelectedHtsCodeSetId(null);
    // }
  };

  const getResults = (htsCodesString: string) => {
    const separators = /[\n, ]/;
    const parsedCodes = htsCodesString
      .trim()
      .split(separators)
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    return parsedCodes.map((code) => {
      const { valid: isValidTariffableCode, error } =
        validateTariffableHtsCode(code);
      // Format the code with proper periods if it's valid
      const formattedCode = isValidTariffableCode
        ? formatHtsCodeWithPeriods(code)
        : code;

      return {
        code: formattedCode,
        impacted: isValidTariffableCode ? isEffectedByNewTariffs(code) : null,
        error,
      };
    });
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

      // const results = getResults(codesString);

      // setResults(results);
      // setLastActionWasSubmit(true);
      // trackEvent(MixpanelEvent.TARIFF_IMPACT_CHECK_FROM_SET, {
      //   numCodes: results.length,
      //   tariffList:
      //     tariffAnnouncementLists[selectedTariffAnnouncementIndex].name,
      // });
    }
  };

  const numChecksThisMonth = tariffImpactChecks.reduce(
    (acc, check) => acc + check.num_codes,
    0
  );

  const getCheckLimitForUser = (purchase: Purchase | null) => {
    if (purchase === null) {
      return 1000;
    }

    if (purchase.product_name === PricingPlan.TARIFF_IMPACT_STANDARD) {
      return 200;
    }

    if (purchase.product_name === PricingPlan.TARIFF_IMPACT_PRO) {
      return Infinity;
    }
  };

  const checkLimit = getCheckLimitForUser(activeTariffImpactPurchase);

  return (
    <main className="w-screen h-full flex flex-col bg-base-300 py-6 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto flex flex-col px-8 gap-4 sm:gap-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
              Tariff Impact Checker
            </h1>
            <div className="ml-1">
              <SecondaryText value="Instantly see if your imports are impacted by tariff announcements." />
            </div>
          </div>

          {fetchingTariffImpactChecks ? (
            <LoadingIndicator spinnerOnly />
          ) : checkLimit === Infinity ? null : (
            <div className="flex flex-col items-center">
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

              <button className="link link-primary text-sm">
                Get Unlimited Checks
              </button>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4 sm:gap-8">
          {/* Tariff Announcement Selection */}
          <div className="flex flex-col gap-2">
            <PrimaryLabel value="Select Tariff Announcement" />
            <TariffAnnouncementDropdown
              tariffUpdates={tariffAnnouncementLists}
              selectedIndex={selectedTariffAnnouncementIndex}
              onSelectionChange={setSelectedTariffAnnouncementIndex}
            />
            {tariffAnnouncementLists[selectedTariffAnnouncementIndex].notes && (
              <p className="text-xs text-neutral-content font-bold">
                Note:{" "}
                {tariffAnnouncementLists[selectedTariffAnnouncementIndex].notes}
              </p>
            )}
          </div>

          {/* HTS Code Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <PrimaryLabel value="Enter HTS Codes" />
                  <button
                    className="btn btn-circle btn-xs bg-base-content/30 hover:bg-base-content/70 text-white ml-2 text-sm flex items-center justify-center"
                    onClick={() => setShowHelpModal(true)}
                    title="Help with HTS code formats"
                  >
                    ?
                  </button>
                </div>
                {loadingUser ||
                  (fetchingHtsCodeSets && <LoadingIndicator spinnerOnly />)}
              </div>

              {htsCodeSets.length > 0 && (
                <HtsCodeSetDropdown
                  htsCodeSets={htsCodeSets}
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
              placeholder="3808.94.10.00, 0202.20.80.00, etc..."
              characterLimit={CHARACTER_LIMIT}
              // showSaveCodes={!!selectedHtsCodeSetId}
              savingCodes={savingCodes}
              onSaveCodes={async () => {
                if (!selectedHtsCodeSetId) {
                  setShowSaveCodesModal(true);
                } else {
                  // Update exist set of codes
                  try {
                    setSavingCodes(true);
                    const parsedCodes = parseHtsCodeSet(inputValue);
                    await updateHtsCodeSet(selectedHtsCodeSetId, parsedCodes);
                    const updatedCodeSets = await fetchHtsCodeSetsForUser();
                    setHtsCodeSets(updatedCodeSets);
                    toast.success("Code set updated successfully");
                  } catch (error) {
                    console.error(error);
                    toast.error("Error updating code set");
                  } finally {
                    setSavingCodes(false);
                  }
                }
              }}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
              isValid={inputValue.length >= 8}
              disabled={
                lastActionWasSubmit ||
                loading ||
                savingCodes ||
                fetchingTariffImpactChecks ||
                fetchingHtsCodeSets
              }
              loading={loading}
            />
            <div className="flex gap-2 items-center">
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
            </div>
          </div>
        </div>

        {/* Results */}
        {results && results.length > 0 && (
          <div>
            <div className="flex flex-col gap-2 bg-base-100 bg-transparent">
              <div className="w-full flex-col sm:flex-row flex justify-between sm:items-end gap-2">
                <PrimaryLabel value="Impact Check Results" />

                <button className="link link-primary text-sm">
                  Want to Automate your Checks?
                </button>
              </div>
              <div
                className={`border-2 border-base-content/20 rounded-md ${
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
                          <th>Notes</th>
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
      <SaveCodeListModal
        isOpen={showSaveCodesModal}
        setIsOpen={setShowSaveCodesModal}
        onSave={handleSaveCodes}
        isLoading={savingCodes}
      />
    </main>
  );
}
