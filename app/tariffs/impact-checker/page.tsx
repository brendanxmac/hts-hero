"use client";

import { useEffect, useState } from "react";
import { useHts } from "../../../contexts/HtsContext";
import { validateTariffableHtsCode } from "../../../libs/hts";
import SimpleTextInput from "../../../components/SimpleTextInput";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import { august_15_FR_232_impacted_codes_list } from "../../../tariffs/announcements/232-FR-August-15";
import Link from "next/link";
import { SecondaryText } from "../../../components/SecondaryText";
import Modal from "../../../components/Modal";
import { TariffImpactInputHelp } from "../../../components/TariffImpactInputHelp";
import { TertiaryText } from "../../../components/TertiaryText";
import { reciprocalTariffExclusionsList } from "../../../tariffs/exclusion-lists.ts/reciprocal-tariff-exlcusions";
import { Color } from "../../../enums/style";
import TariffUpdateDropdown from "../../../components/TariffUpdateDropdown";
import { indiaRussianOilConsumptionExclusions } from "../../../tariffs/exclusion-lists.ts/india-oil-issue-exclusions";
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
import { Select } from "../../../components/Select";
import HtsCodeSetDropdown from "../../../components/HtsCodeSetDropdown";

interface ListExample {
  name: string;
  list: string;
}

interface TariffUpdate {
  name: string;
  sourceName: string;
  source: string;
  codesImpacted: string[];
  dateReleased: Date;
  notes?: string;
}

interface TariffImpactResult {
  code: string;
  impacted: boolean | null;
  error?: string;
}

const exampleList = [
  "2602.00.00.40",
  "8544.49.20.00",
  "9701.21.00.00",
  "9403.99.90.10",
  "4408.90.01",
  "4408.90.01.10",
  "9701.21.00.00",
  "2825.80.00.00",
  "7614.10.10.00",
  "7614.10.50.00",
  "2106.90.99.98",
];

const commaSeparatedList = exampleList.join(", ");
const newlineSeparatedList = [...exampleList]
  .sort(() => Math.random() - 0.5)
  .join("\n");
const spaceSeparatedList = [...exampleList]
  .sort(() => Math.random() - 0.5)
  .join(" ");
// const mixedSeparatedList =
//   "2602.00.00.40, 9701.21.00.00\n4408.90.01, 4408.90.01.10\n97.01.21.00.00, 2825.80.00.00\n8544.49.20.00, 9403.99.90.10\n7614.10.10.00, 7614.10.50.00\n2106.90.99.98";

const singleElementExamples = ["6902.20.10", "3808.94.10.00"];
const listExamples: ListExample[] = [
  {
    name: "List with Commas",
    list: commaSeparatedList,
  },
  {
    name: "List with Newlines",
    list: newlineSeparatedList,
  },
  {
    name: "List with Spaces",
    list: spaceSeparatedList,
  },
  // {
  //   name: "List with Mixed Separators",
  //   list: mixedSeparatedList,
  // },
];

const indiaOilBasedExclusions: TariffUpdate = {
  name: "Exemptions for India 25% Tariff for Russian Oil Use",
  sourceName: "CSMS #66027027",
  source: "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3ef7e13",
  codesImpacted: indiaRussianOilConsumptionExclusions,
  dateReleased: new Date("2025-08-25"),
  notes:
    "This specific announcement is only applicable to imports from India. Additional exemptions exist if the import is a qualified donation, information materials, or chapter 98 provision. Certain exemptions come with exclusions which you can see by clicking the HTS Code in the results table. Always contact a customs broker for proper import assistance and guidance.",
};

const section232SteelAndAluminumChanges: TariffUpdate = {
  name: "Additional Articles of Steel and Aluminum",
  sourceName: "Federal Register",
  source:
    "https://www.federalregister.gov/public-inspection/2025-15819/adoption-and-procedures-of-the-section-232-steel-and-aluminum-tariff-inclusions-process",
  codesImpacted: august_15_FR_232_impacted_codes_list,
  dateReleased: new Date("2025-08-19"),
};

const reciprocalTariffExclusions: TariffUpdate = {
  name: "Exemptions for Reciprocal Tariffs",
  sourceName: "USITC - Chapter 99 Subchapter 3 Note 2(v)(iii) ",
  source: "https://hts.usitc.gov/search?query=9903.01.32",
  codesImpacted: reciprocalTariffExclusionsList,
  dateReleased: new Date("2025-04-05"),
};

const tariffAnnouncementLists: TariffUpdate[] = [
  section232SteelAndAluminumChanges,
  indiaOilBasedExclusions,
  reciprocalTariffExclusions,
];

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
  const [htsCodeSets, setHtsCodeSets] = useState<HtsCodeSet[]>([]);
  const [selectedHtsCodeSetId, setSelectedHtsCodeSetId] = useState<
    string | null
  >(null);
  const [savingCodes, setSavingCodes] = useState(false);
  const [lastActionWasSubmit, setLastActionWasSubmit] = useState(false);

  useEffect(() => {
    // If we're setting this for the first time
    if (htsCodeSets?.length > 0) {
      console.log("htsCodeSets", htsCodeSets);
      const { id, codes } = htsCodeSets[0];
      setSelectedHtsCodeSetId(id);
      setInputValue(codes.join(", "));
      const results = getResults(codes.join(", "));
      setResults(results);
      setLastActionWasSubmit(true);
    }
  }, [htsCodeSets]);

  useEffect(() => {
    const fetchHtsCodeSets = async () => {
      if (user) {
        const htsCodeSets = await fetchHtsCodeSetsForUser(user.id);
        setHtsCodeSets(htsCodeSets);
        setSelectedHtsCodeSetId(htsCodeSets[0].id);
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

  const handleInputChange = (inputValue: string) => {
    // Preserve the user's input format as-is
    const characterLimitedInput =
      inputValue.length >= CHARACTER_LIMIT
        ? inputValue.slice(0, CHARACTER_LIMIT)
        : inputValue;
    setInputValue(characterLimitedInput);
    setLastActionWasSubmit(false);
    setResults([]);

    if (inputValue === "") {
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

  const handleHtsCodeSetSelection = (htsCodeSetId: string) => {
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
                Tariff Impact Checker
              </h1>
              <div className="ml-1">
                <SecondaryText value="Instantly see if any of your imports are impacted by recent tariff announcements." />
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-4 sm:gap-8">
            <div className="flex flex-col gap-2">
              <PrimaryLabel value="Select Tariff Announcement" />
              <TariffUpdateDropdown
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
                <div className="flex gap-2 items-center">
                  <div className="flex flex-wrap items-center">
                    <p className="text-xs font-bold text-gray-500">Examples:</p>
                    {singleElementExamples.map((example) => (
                      <button
                        key={`${example}-example`}
                        className="btn btn-xs text-base-content/80 hover:text-primary btn-link"
                        onClick={() => {
                          handleInputChange(example);
                        }}
                      >
                        {example}
                      </button>
                    ))}
                    {listExamples.map((example) => (
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
                          : 0
                      }
                      onSelectionChange={(index) => {
                        handleHtsCodeSetSelection(htsCodeSets[index].id);
                      }}
                    />
                    // <Select
                    //   options={htsCodeSets.map((set, i) => ({
                    //     label: `${set.name || `${new Date(set.created_at).toLocaleDateString()}`} (${set.codes.length} ${set.codes.length === 1 ? "code" : "codes"})`,
                    //     value: set.id,
                    //   }))}
                    //   selectedValue={selectedHtsCodeSetId}
                    //   onSelectionChange={handleHtsCodeSetSelection}
                    //   placeholder="Select from your saved sets of codes"
                    // />
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
            </div>
          </div>

          {/* Results */}
          {results && results.length > 0 && (
            <div>
              <div className="flex flex-col gap-2 bg-base-100 bg-transparent">
                <div className="w-full flex justify-between items-end">
                  <PrimaryLabel value="Impact Check Results" />
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-primary w-44"
                      onClick={async () => {
                        try {
                          setSavingCodes(true);
                          if (selectedHtsCodeSetId) {
                            console.log("updating existing set");
                            // todo just update the existing set
                          } else {
                            console.log("creating new set");
                            const newHtsCodeSet =
                              await createHtsCodeSet(inputValue);
                            const htsCodeSets = await fetchHtsCodeSetsForUser(
                              user.id
                            );
                            setHtsCodeSets(htsCodeSets);
                            setSelectedHtsCodeSetId(newHtsCodeSet.id);
                          }
                        } catch (error) {
                          console.error(error);
                          toast.error("Error saving codes");
                        } finally {
                          setSavingCodes(false);
                        }
                      }}
                    >
                      {savingCodes ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <span>
                          {selectedHtsCodeSetId
                            ? "Update Set"
                            : "Save Codes as Set"}
                        </span>
                      )}
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      Automate your Checks
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
    </main>
  );
}
