"use client";

import { useEffect, useState } from "react";
import { useHts } from "../../../contexts/HtsContext";
import { validateTariffableHtsCode } from "../../../libs/hts";
import SimpleTextInput from "../../../components/SimpleTextInput";
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

// Modal content component for creating a list of codes
function CreateListModal({
  isOpen,
  setIsOpen,
  onSave,
  isLoading,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (name: string, description: string) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), description.trim());
      setName("");
      setDescription("");
    }
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="p-6 max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-base-content mb-2">
            Create List of Codes
          </h2>
          <p className="text-sm text-base-content/70">
            Give your list of codes a name to save them for later
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-base-content mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter a name for your list"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-base-content mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Enter a description (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Create List"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default function Home() {
  const CHARACTER_LIMIT = 500;
  const { user, isLoading: loadingUser } = useUser();
  const { fetchElements, htsElements } = useHts();
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<TariffImpactResult[]>([]);
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
        const htsCodeSets = await fetchHtsCodeSetsForUser(user!.id);
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

  // useEffect(() => {
  //   // If we're setting this for the first time
  //   if (htsCodeSets?.length > 0) {
  //     console.log("htsCodeSets", htsCodeSets);
  //     const { id, codes } = htsCodeSets[0];
  //     setSelectedHtsCodeSetId(id);
  //     setInputValue(codes.join(", "));
  //     const results = getResults(codes.join(", "));
  //     setResults(results);
  //     setLastActionWasSubmit(true);
  //   }
  // }, [htsCodeSets]);

  useEffect(() => {
    const fetchHtsCodeSets = async () => {
      if (user) {
        const htsCodeSets = await fetchHtsCodeSetsForUser(user.id);
        setHtsCodeSets(htsCodeSets);
        // Don't automatically select the first item - start with no selection
        setSelectedHtsCodeSetId(null);
      }
    };

    if (user) {
      fetchHtsCodeSets();
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
    setResults([]);
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

  const handleSubmit = () => {
    const characterLimitedInput =
      inputValue.length >= CHARACTER_LIMIT
        ? inputValue.slice(0, CHARACTER_LIMIT)
        : inputValue;

    const results = getResults(characterLimitedInput);

    setResults(results);
    trackEvent(MixpanelEvent.TARIFF_IMPACT_CHECK, {
      numCodes: results.length,
      changeList: tariffAnnouncementLists[selectedTariffAnnouncementIndex].name,
    });
    setLastActionWasSubmit(true);
  };

  const handleInputChange = (
    inputValue: string,
    clearSelectedSet: boolean = false
  ) => {
    // Preserve the user's input format as-is
    const characterLimitedInput =
      inputValue.length >= CHARACTER_LIMIT
        ? inputValue.slice(0, CHARACTER_LIMIT)
        : inputValue;
    setInputValue(characterLimitedInput);
    setLastActionWasSubmit(false);

    if (clearSelectedSet) {
      setResults([]);
      setSelectedHtsCodeSetId(null);
    }
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
      setResults([]);
      setLastActionWasSubmit(false);
      return;
    }

    const selectedSet = htsCodeSets.find((set) => set.id === htsCodeSetId);
    if (selectedSet) {
      // Join the codes with commas and spaces for readability
      const codesString = selectedSet.codes.join(", ");
      setInputValue(codesString);
      setSelectedHtsCodeSetId(htsCodeSetId);

      const results = getResults(codesString);

      setResults(results);
      setLastActionWasSubmit(true);
      trackEvent(MixpanelEvent.TARIFF_IMPACT_CHECK_FROM_SET, {
        numCodes: results.length,
        tariffList:
          tariffAnnouncementLists[selectedTariffAnnouncementIndex].name,
      });
    }
  };

  return (
    <main className="w-screen h-full flex flex-col bg-base-300 py-6 overflow-y-auto">
      {loading ? (
        <div className="w-full h-full flex justify-center pt-20">
          <LoadingIndicator />
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto flex flex-col px-8 gap-4 sm:gap-8">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
                  Tariff Impact Checker
                </h1>

                <button className="hidden sm:block btn btn-sm btn-primary">
                  Want Impact Notifications?
                </button>
              </div>
              <div className="ml-1">
                <SecondaryText value="Instantly see if your imports are impacted by tariff announcements." />
              </div>
            </div>
            <button className="sm:hidden btn btn-sm btn-accent">
              Want Notifications?
            </button>
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-4 sm:gap-8">
            <div className="flex flex-col gap-2">
              <PrimaryLabel value="Select Tariff Announcement" />
              <TariffAnnouncementDropdown
                tariffUpdates={tariffAnnouncementLists}
                selectedIndex={selectedTariffAnnouncementIndex}
                onSelectionChange={setSelectedTariffAnnouncementIndex}
              />
              {tariffAnnouncementLists[selectedTariffAnnouncementIndex]
                .notes && (
                <p className="text-xs text-warning font-bold">
                  Note:{" "}
                  {
                    tariffAnnouncementLists[selectedTariffAnnouncementIndex]
                      .notes
                  }
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
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
                {loadingUser ? (
                  <LoadingIndicator />
                ) : (
                  htsCodeSets.length > 0 && (
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
                        if (index === null) {
                          handleHtsCodeSetSelection(null);
                        } else {
                          handleHtsCodeSetSelection(htsCodeSets[index].id);
                        }
                      }}
                    />
                  )
                )}
              </div>
              <SimpleTextInput
                value={inputValue}
                placeholder="3808.94.10.00, 0202.20.80.00, etc..."
                characterLimit={CHARACTER_LIMIT}
                onSubmit={handleSubmit}
                onChange={handleInputChange}
                isValid={inputValue.length >= 8}
                disabled={lastActionWasSubmit}
              />
              <div className="flex gap-2 items-center">
                <div className="flex flex-wrap items-center">
                  <p className="text-xs font-bold text-gray-500">Try Me!</p>
                  {exampleLists.map((example) => (
                    <button
                      key={`${example.name}-example`}
                      className="btn btn-xs text-base-content/80 hover:text-primary btn-link"
                      onClick={() => {
                        handleInputChange(example.list, true);
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
                  <div className="w-full sm:w-auto flex gap-2">
                    <button
                      disabled={!!selectedHtsCodeSetId}
                      className="grow btn btn-sm btn-primary sm:w-32"
                      onClick={() => setShowSaveCodesModal(true)}
                    >
                      {savingCodes ? (
                        <div className="flex gap-1 items-center">
                          <span>Saving</span>
                          <span className="loading loading-spinner loading-xs"></span>
                        </div>
                      ) : (
                        <span>Save List</span>
                      )}
                    </button>

                    <button className="grow btn btn-sm btn-primary">
                      Automate your Checks?
                    </button>
                  </div>
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
                      No results yet, enter code(s) to see if they are impacted
                      by the selected tariff change list.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <Modal isOpen={showHelpModal} setIsOpen={setShowHelpModal}>
        <TariffImpactInputHelp />
      </Modal>
      <CreateListModal
        isOpen={showSaveCodesModal}
        setIsOpen={setShowSaveCodesModal}
        onSave={handleSaveCodes}
        isLoading={savingCodes}
      />
    </main>
  );
}
