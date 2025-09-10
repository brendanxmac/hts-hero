"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { HtsCodeSet } from "../interfaces/hts";
import { PlusIcon } from "@heroicons/react/16/solid";

interface HtsCodeSetDropdownProps {
  htsCodeSets: HtsCodeSet[];
  selectedIndex: number | null;
  onSelectionChange: (index: number | null) => void;
  onCreateSelected: () => void;
  placeholder?: string;
}

export default function HtsCodeSetDropdown({
  htsCodeSets,
  selectedIndex,
  onSelectionChange,
  onCreateSelected,
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
          <Listbox.Button className="relative w-full cursor-default rounded-lg border border-base-content/20 bg-base-100 py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm">
            <p
              className={`truncate text-sm sm:text-base ${selectedSet ? "text-white" : "text-gray-500"}`}
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
            <Listbox.Options className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md bg-base-100 border border-base-content/20 py-1 text-base shadow-lg shadow-base-300 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {/* Create New List Option */}
              <div
                className="relative cursor-pointer select-none py-2 px-4 transition-colors duration-200 text-primary hover:bg-base-300 flex gap-1 items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateSelected();
                }}
              >
                <PlusIcon className="h-5 w-5" />
                <p className="text-sm font-medium">Create List</p>
              </div>

              <div className="border-t border-base-content/20 my-1"></div>

              {htsCodeSets.map((htsCodeSet, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative hover:cursor-pointer border-b border-base-content/20 select-none py-3 px-4 transition-colors duration-200 text-white ${
                      active ? "bg-base-300" : ""
                    }`
                  }
                  value={index}
                >
                  {({ selected }) => (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 flex flex-wrap gap-x-3 items-center justify-between">
                        <h3 className="text-white truncate">
                          {htsCodeSet.name || "Untitled List"}
                        </h3>

                        <div className="flex gap-2">
                          <p className="text-xs text-gray-400 flex-shrink-0">
                            {htsCodeSet.codes.length} codes
                          </p>

                          <p className="text-xs text-gray-400">
                            {formatDate(new Date(htsCodeSet.created_at))}
                          </p>
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
