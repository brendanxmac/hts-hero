"use client";

import { useEffect, useState } from "react";
import { useHts } from "../../contexts/HtsContext";
import { isValidTariffableHtsCode } from "../../libs/hts";
import SimpleTextInput from "../../components/SimpleTextInput";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { august_15_FR_232_tariff_changes } from "../../tariffs/announcements/232-FR-August-15";
import Link from "next/link";
import { TertiaryText } from "../../components/TertiaryText";
import { TertiaryLabel } from "../../components/TertiaryLabel";
import { SecondaryText } from "../../components/SecondaryText";

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

  const htsCodeExists = (str: string) => {
    return htsElements.some((element) => element.htsno === str);
  };

  const isEffectedByNewTariffs = (htsCode: string) => {
    // Check if any element in the changes array is a substring of the HTS code
    return changeList.some((change) => htsCode.includes(change));
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
              <h1 className="text-2xl md:text-3xl font-bold">
                Tariff Impact Checker
              </h1>
              <SecondaryText
                value="Easily see if any 8 or 10-digit HTS codes
                  have been impacted by recent tariff announcements."
              />
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
              <TertiaryLabel value="Select Tariff Announcement:" />
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
              <TertiaryLabel value="Enter HTS Codes:" />
              <SimpleTextInput
                value={inputValue}
                placeholder="e.g. 3808.94.10.00"
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
                    return {
                      code: code,
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
                        setInputValue(example);
                        setResults([
                          {
                            code: example,
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
                          return {
                            code: code,
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
          <div>
            <div className="flex flex-col gap-2 bg-base-100 bg-transparent">
              <div className="flex gap-2 justify-between items-center">
                <TertiaryLabel value="Results:" />
                {/* <p className="text-sm">✅ = Impacted | ❌ = Not Impacted</p> */}
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
                          <th>HTS Code</th>
                          <th>Impacted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result) => {
                          const htsElementForCode = htsElements.find(
                            (element) => element.htsno === result.code
                          );
                          return (
                            <tr key={result.code}>
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
                              ) : result.isImpacted ? (
                                <td className="font-bold text-red-500">Yes</td>
                              ) : (
                                <td className="font-bold text-green-600">No</td>
                              )}
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
        </div>
      )}
    </main>
  );
}
