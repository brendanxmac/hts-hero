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
import { SecondaryLabel } from "../../../components/SecondaryLabel";
import TariffUpdateDropdown from "../../../components/TariffUpdateDropdown";
import { indiaRussianOilConsumptionExclusions } from "../../../tariffs/exclusion-lists.ts/india-oil-issue-exclusions";
import {
  additionalReciprocalExemptHeadingSept5,
  removedReciprocalExemptHeadingsSept5,
} from "../../../tariffs/announcements/reciprocal-changes-sept-5";

interface ListExample {
  name: string;
  list: string;
}

export interface TariffUpdate {
  name: string;
  sourceName: string;
  source: string;
  codesImpacted: string[];
  effectiveDate: Date;
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

const additionalReciprocalExemptHeadingsFromSept5: TariffUpdate = {
  name: "Imports Added to Reciprocal Tariff Exemptions",
  sourceName: "Presidential Action, September 5th, whitehouse.gov",
  source:
    "https://www.whitehouse.gov/presidential-actions/2025/09/modifying-the-scope-of-reciprocal-tariffs-and-establishing-procedures-for-implementing-trade-and-security-agreements/",
  codesImpacted: additionalReciprocalExemptHeadingSept5,
  effectiveDate: new Date("2025-09-08"),
};

const removedReciprocalExemptHeadingsFromSept5: TariffUpdate = {
  name: "Imports Removed from Reciprocal Tariff Exemptions",
  sourceName: "Presidential Action, September 5th, whitehouse.gov",
  source:
    "https://www.whitehouse.gov/presidential-actions/2025/09/modifying-the-scope-of-reciprocal-tariffs-and-establishing-procedures-for-implementing-trade-and-security-agreements/",
  codesImpacted: removedReciprocalExemptHeadingsSept5,
  effectiveDate: new Date("2025-09-08"),
};

const indiaOilBasedExclusions: TariffUpdate = {
  name: "Exemptions for India 25% Tariff for Russian Oil Use",
  sourceName: "CSMS #66027027",
  source: "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3ef7e13",
  codesImpacted: indiaRussianOilConsumptionExclusions,
  effectiveDate: new Date("2025-08-25"),
  notes:
    "This specific announcement is only applicable to imports from India. Additional exemptions exist if the import is a qualified donation, information materials, or chapter 98 provision. Certain exemptions come with exclusions which you can see by clicking the HTS Code in the results table. Always contact a customs broker for proper import assistance and guidance.",
};

const section232SteelAndAluminumChanges: TariffUpdate = {
  name: "Additional Articles of Steel and Aluminum",
  sourceName: "Federal Register",
  source:
    "https://www.federalregister.gov/public-inspection/2025-15819/adoption-and-procedures-of-the-section-232-steel-and-aluminum-tariff-inclusions-process",
  codesImpacted: august_15_FR_232_impacted_codes_list,
  effectiveDate: new Date("2025-08-19"),
};

const reciprocalTariffExclusions: TariffUpdate = {
  name: "Exemptions for Reciprocal Tariffs",
  sourceName: "USITC - Chapter 99 Subchapter 3 Note 2(v)(iii) ",
  source: "https://hts.usitc.gov/search?query=9903.01.32",
  codesImpacted: reciprocalTariffExclusionsList,
  effectiveDate: new Date("2025-04-05"),
};

const changeLists: TariffUpdate[] = [
  section232SteelAndAluminumChanges,
  indiaOilBasedExclusions,
  reciprocalTariffExclusions,
  additionalReciprocalExemptHeadingsFromSept5,
  removedReciprocalExemptHeadingsFromSept5,
].sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());

export default function Home() {
  const CHARACTER_LIMIT = 650;
  const { fetchElements, htsElements } = useHts();
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<TariffImpactResult[]>([]);
  const [selectedChangeListIndex, setSelectedChangeListIndex] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);

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
    if (changeLists.length > 0) {
      setSelectedChangeListIndex(0);
    }
  }, []);

  useEffect(() => {
    handleInputChange(inputValue);
  }, [selectedChangeListIndex]);

  const htsCodeExists = (str: string) => {
    return htsElements.some((element) => element.htsno === str);
  };

  // Helper function to format HTS codes with proper periods
  const formatHtsCodeWithPeriods = (code: string): string => {
    // Remove any existing periods first
    const digitsOnly = code.replace(/\./g, "");

    // Only format if it's a valid length (4, 6, 8, or 10 digits)
    if (digitsOnly.length === 4) {
      return digitsOnly; // Just the heading: 1234
    } else if (digitsOnly.length === 6) {
      return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}`; // 1234.56
    } else if (digitsOnly.length === 8) {
      return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 8)}`; // 1234.56.78
    } else if (digitsOnly.length === 10) {
      return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 8)}.${digitsOnly.slice(8, 10)}`; // 1234.56.78.90
    } else if (digitsOnly.length > 10) {
      // For codes longer than 10 digits, format as 10-digit and ignore the rest
      return `${digitsOnly.slice(0, 4)}.${digitsOnly.slice(4, 6)}.${digitsOnly.slice(6, 8)}.${digitsOnly.slice(8, 10)}`;
    }

    // Return as-is if it doesn't match expected lengths
    return code;
  };

  const isEffectedByNewTariffs = (htsCode: string) => {
    // Format the input code to have proper periods
    const formattedCode = formatHtsCodeWithPeriods(htsCode);

    // Simple substring check - much more efficient
    return changeLists[selectedChangeListIndex].codesImpacted.some(
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
        tooltip = "Code is included";
      } else {
        indicator = "❌";
        tooltip = "Code is not included";
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

  const handleInputChange = (inputValue: string) => {
    // Preserve the user's input format as-is
    setInputValue(inputValue);

    const characterLimitedInput =
      inputValue.length >= CHARACTER_LIMIT
        ? inputValue.slice(0, CHARACTER_LIMIT)
        : inputValue;

    // Parse input by newlines or commas for processing
    const separators = /[\n, ]/;
    const parsedCodes = characterLimitedInput
      .trim()
      .split(separators)
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    const results = parsedCodes.map((code) => {
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

    setResults(results);
  };

  return (
    <main className="w-full h-full max-w-6xl mx-auto flex flex-col bg-base-300 py-6 overflow-y-auto">
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
                <SecondaryText value="Instantly see if any of your imports have been impacted by recent tariff announcements." />
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-4 sm:gap-8">
            <div className="flex flex-col gap-2">
              <SecondaryLabel
                value="Select Tariff Announcement"
                color={Color.WHITE}
              />
              <TariffUpdateDropdown
                tariffUpdates={changeLists}
                selectedIndex={selectedChangeListIndex}
                onSelectionChange={setSelectedChangeListIndex}
              />
              {changeLists[selectedChangeListIndex].notes && (
                <p className="text-xs text-warning font-bold">
                  Note: {changeLists[selectedChangeListIndex].notes}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <SecondaryLabel value="Enter HTS Codes" color={Color.WHITE} />
                  <button
                    className="btn btn-circle btn-xs btn-primary ml-2 text-sm flex items-center justify-center"
                    onClick={() => setShowHelpModal(true)}
                    title="Help with HTS code formats"
                  >
                    ?
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex flex-wrap items-center">
                    <p className="text-xs font-bold text-gray-500">
                      See Examples:
                    </p>
                    {singleElementExamples.map((example) => (
                      <button
                        key={`${example}-example`}
                        className="btn btn-xs btn-primary btn-link"
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
                        className="btn btn-xs btn-primary btn-link"
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
              <SimpleTextInput
                value={inputValue}
                placeholder="3808.94.10.00, 0202.20.80.00, etc..."
                characterLimit={CHARACTER_LIMIT}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Results */}
          {results && results.length > 0 && (
            <div>
              <div className="flex flex-col gap-2 bg-base-100 bg-transparent">
                <SecondaryLabel value="Results" color={Color.WHITE} />
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
                            <th>Included</th>
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
