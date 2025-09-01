"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { HtsCodeSet } from "../interfaces/hts";
import { classNames } from "../utilities/style";

interface HtsCodeSetDropdownProps {
  htsCodeSets: HtsCodeSet[];
  selectedIndex: number | null;
  onSelectionChange: (index: number | null) => void;
  placeholder?: string;
}

export default function HtsCodeSetDropdown({
  htsCodeSets,
  selectedIndex,
  onSelectionChange,
  placeholder = "Select from your Lists",
}: HtsCodeSetDropdownProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedSet =
    selectedIndex !== null ? htsCodeSets[selectedIndex] : null;

  const getSelectedSetsTitle = (set: HtsCodeSet | null) => {
    if (!set) {
      return placeholder;
    }

    let titleBase = "";
    if (set.name) {
      titleBase = set.name;
    } else {
      titleBase = `Untitled List`;
    }

    const numCodes = set.codes.length;
    const setHasMoreThanOneCode = numCodes > 1;

    return `${titleBase} (${numCodes} ${setHasMoreThanOneCode ? "codes" : "code"})`;
  };

  return (
    <div className="w-full">
      <Listbox value={selectedIndex} onChange={onSelectionChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg border-2 border-base-content/20 bg-base-100 py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm">
            <p
              className={`truncate text-sm sm:text-base font-semibold ${selectedSet ? "text-white" : "text-gray-400"}`}
            >
              {getSelectedSetsTitle(selectedSet)}
            </p>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md bg-base-100 border-2 border-base-content/60 py-1 text-base shadow-lg shadow-base-300 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {/* Option to clear selection */}
              <Listbox.Option
                className={({ active, selected }) =>
                  classNames(
                    "relative cursor-default select-none py-2 px-4 transition-colors duration-200 text-gray-400",
                    active && "bg-base-300",
                    selected && "text-white"
                  )
                }
                value={null}
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm sm:text-base font-medium ${
                        selected ? "text-gray-400" : "text-primary"
                      }`}
                    >
                      {selected ? "No List Selected" : "Clear Selection"}
                    </p>
                    {selected && (
                      <span className="flex items-center justify-center text-primary ml-2 flex-shrink-0">
                        <CheckIcon className="h-6 w-6" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                )}
              </Listbox.Option>

              {/* Divider */}
              <div className="border-t border-base-content/20 my-1"></div>

              {htsCodeSets.map((htsCodeSet, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default border-b border-base-content/20 select-none py-3 px-4 transition-colors duration-200 text-white ${
                      active ? "bg-base-300" : ""
                    }`
                  }
                  value={index}
                >
                  {({ selected }) => (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex flex-col">
                          <h3 className="sm:text-lg font-semibold text-white truncate">
                            {htsCodeSet.name || "Untitled List"}
                          </h3>
                          <p className="text-sm text-gray-400 italic">
                            {htsCodeSet.description || null}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              Codes:
                            </span>
                            <span className="text-sm text-gray-300 break-words">
                              {htsCodeSet.codes.length}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              Created:
                            </span>
                            <span className="text-sm text-gray-300">
                              {formatDate(new Date(htsCodeSet.created_at))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Check icon for selected item */}
                      {selected && (
                        <span className="flex items-center justify-center text-primary flex-shrink-0">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
