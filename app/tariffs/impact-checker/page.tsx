"use client";

import { useEffect, useState } from "react";
import { useHts } from "../../../contexts/HtsContext";
import { isValidTariffableHtsCode } from "../../../libs/hts";
import SimpleTextInput from "../../../components/SimpleTextInput";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import { august_15_FR_232_tariff_changes } from "../../../tariffs/announcements/232-FR-August-15";
import Link from "next/link";
import { TertiaryLabel } from "../../../components/TertiaryLabel";
import { SecondaryText } from "../../../components/SecondaryText";
import { Color } from "../../../enums/style";
import Modal from "../../../components/Modal";
import { TariffImpactInputHelp } from "../../../components/TariffImpactInputHelp";

interface ListExample {
  name: string;
  list: string;
}

const singleElementExamples = ["6902.20.10", "3808.94.10.00"];
const listExamples: ListExample[] = [
  {
    name: "Comma Separated List",
    list: "6902.20.10, 3808.94.10.00, 1204.00.00, 0804.50.80.10",
  },
  {
    name: "Newline Separated List",
    list: "6902.20.10\n3808.94.10.00\n1204.00.00\n0804.50.80.10",
  },
  {
    name: "Space Separated List",
    list: "6902.20.10 3808.94.10.00 1204.00.00 0804.50.80.10",
  },
  {
    name: "Mixed Separated List",
    list: "6902.20.10, 3808.94.10.00\n1204.00.00, 0804.50.80.10",
  },
];

interface Result {
  code: string;
  isImpacted: boolean | null;
}

export default function Home() {
  const { fetchElements, htsElements } = useHts();
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [changeList, setChangeList] = useState<string[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const loadElements = async () => {
      if (htsElements.length === 0) {
        setLoading(true);
        await fetchElements("latest");
        setLoading(false);
      }
    };

    loadElements();
  }, []);

  useEffect(() => {
    // Initialize with the first changeList when component mounts
    if (changeLists.length > 0) {
      setChangeList(changeLists[0].list);
    }
  }, []);

  //   const htsCodeExists = (str: string) => {
  //     return htsElements.some((element) => element.htsno === str);
  //   };

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
    return changeList.some(
      (change) =>
        formattedCode.includes(change) || change.includes(formattedCode)
    );
  };

  interface TariffChange {
    name: string;
    sourceName: string;
    source: string;
    list: string[];
  }

  const section232SteelAndAluminumChanges: TariffChange = {
    name: "Federal Register, Steel and Aluminum Changes (August 15, 2025)",
    sourceName: "Federal Register",
    source:
      "https://www.federalregister.gov/public-inspection/2025-15819/adoption-and-procedures-of-the-section-232-steel-and-aluminum-tariff-inclusions-process",
    list: august_15_FR_232_tariff_changes,
  };

  const changeLists: TariffChange[] = [section232SteelAndAluminumChanges];

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col bg-base-300 py-6 overflow-y-auto">
      {loading ? (
        <div className="w-full h-full flex justify-center pt-20">
          <LoadingIndicator />
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto flex flex-col px-8 gap-8">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
                Tariff Impact Checker
              </h1>
              <div className="ml-1">
                <SecondaryText
                  value="Instantly see if any of your 8 or 10-digit HTS codes
                  have been impacted by recent tariff announcements."
                />
              </div>
            </div>
            {/* <div className="flex flex-col gap-2">
              <TertiaryLabel value="How to use this tool:" />
              <TertiaryText
                value="1. Select the tariff change list you are interested in from
                  the dropdown."
              />
              <TertiaryText
                value="2. Enter the list of HTS codes you want to check against the
                  selected tariff change list."
              />
            </div> */}
          </div>
          {/* Inputs */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <TertiaryLabel value="Select Tariff Announcement" />
              <select
                className="select select-bordered border-2 w-full max-w-xl"
                value={changeLists.findIndex((cl) => cl.list === changeList)}
                onChange={(e) => {
                  const selectedIndex = parseInt(e.target.value);
                  if (
                    selectedIndex >= 0 &&
                    selectedIndex < changeLists.length
                  ) {
                    setChangeList(changeLists[selectedIndex].list);
                  }
                }}
              >
                {changeLists.map((changeListItem, index) => (
                  <option key={index} value={index}>
                    {changeListItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <TertiaryLabel value="Enter HTS Codes" />
                <button
                  className="btn btn-circle btn-xs btn-primary ml-2 text-sm flex items-center justify-center"
                  onClick={() => setShowHelpModal(true)}
                  title="Help with HTS code formats"
                >
                  ?
                </button>
              </div>
              <SimpleTextInput
                value={inputValue}
                placeholder="3808.94.10.00, 0202.20.80.00, etc..."
                characterLimit={5000}
                onChange={(value) => {
                  // Preserve the user's input format as-is
                  setInputValue(value);

                  // Parse input by newlines or commas for processing
                  const separators = /[\n, ]/;
                  const parsedCodes = value
                    .trim()
                    .split(separators)
                    .map((code) => code.trim())
                    .filter((code) => code.length > 0);

                  const results = parsedCodes.map((code) => {
                    // Format the code with proper periods if it's valid
                    const formattedCode = isValidTariffableHtsCode(code)
                      ? formatHtsCodeWithPeriods(code)
                      : code;

                    return {
                      code: formattedCode,
                      isImpacted: isValidTariffableHtsCode(code)
                        ? isEffectedByNewTariffs(code)
                        : null,
                    };
                  });

                  setResults(results);
                }}
              />
              <div className="flex gap-2 items-center">
                <div className="flex flex-wrap">
                  <p className="text-sm text-gray-500">Examples:</p>
                  {singleElementExamples.map((example) => (
                    <button
                      key={`${example}-example`}
                      className="btn btn-xs btn-primary btn-link"
                      onClick={() => {
                        const formattedExample =
                          formatHtsCodeWithPeriods(example);
                        setInputValue(formattedExample);
                        setResults([
                          {
                            code: formattedExample,
                            isImpacted: isEffectedByNewTariffs(example),
                          },
                        ]);
                      }}
                    >
                      {example}
                    </button>
                  ))}
                  {listExamples.map((example) => (
                    <button
                      key={`${example}-example`}
                      className="btn btn-xs btn-primary btn-link"
                      onClick={() => {
                        // Preserve the user's input format as-is
                        setInputValue(example.list);

                        // Parse input by newlines or commas for processing
                        const separators = /[\n, ]/;
                        const parsedCodes = example.list
                          .trim()
                          .split(separators)
                          .map((code) => code.trim())
                          .filter((code) => code.length > 0);

                        const results = parsedCodes.map((code) => {
                          // Format the code with proper periods if it's valid
                          const formattedCode = isValidTariffableHtsCode(code)
                            ? formatHtsCodeWithPeriods(code)
                            : code;

                          return {
                            code: formattedCode,
                            isImpacted: isValidTariffableHtsCode(code)
                              ? isEffectedByNewTariffs(code)
                              : null,
                          };
                        });

                        setResults(results);
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
                <div className="flex flex-wrap gap-2 justify-between items-center">
                  <TertiaryLabel value="Results:" />
                  <div className="flex gap-2">
                    <p className="text-sm">✅ = Impacted</p>
                    <p className="text-sm">❌ = Not Impacted</p>
                  </div>
                </div>

                <div
                  className={`border-2 border-base-content/20 rounded-md ${
                    results.length > 0 ? "p-0" : "p-4"
                  }`}
                >
                  {results.length > 0 ? (
                    <div className="overflow-x-auto rounded-md">
                      <table className="table table-zebra table-pin-cols w-full">
                        <thead>
                          <tr>
                            <th></th>
                            <th className="w-full">HTS Code</th>
                            <th>Impacted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((result, i) => {
                            const htsElementForCode = htsElements.find(
                              (element) => element.htsno === result.code
                            );
                            return (
                              <tr key={result.code}>
                                <td>{i + 1}</td>
                                {htsElementForCode ? (
                                  <td>
                                    <Link
                                      href={`/explore?code=${result.code}`}
                                      target="_blank"
                                      className="link link-primary font-bold"
                                    >
                                      {result.code}
                                    </Link>
                                  </td>
                                ) : (
                                  <td>{result.code}</td>
                                )}
                                {result.isImpacted === null ? (
                                  <td>Invalid Code</td>
                                ) : (
                                  <td className="text-lg">
                                    {result.isImpacted ? "✅" : "❌"}
                                  </td>
                                )}
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
