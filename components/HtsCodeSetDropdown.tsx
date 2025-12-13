"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { HtsCodeSet } from "../interfaces/hts";
import { PlusIcon, CalendarIcon } from "@heroicons/react/16/solid";

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
  placeholder = "Select or Create HTS Code List",
}: HtsCodeSetDropdownProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const selectedSet =
    selectedIndex !== null ? htsCodeSets[selectedIndex] : null;

  const getSelectedSetsTitle = (set: HtsCodeSet | null) => {
    if (!set) {
      return placeholder;
    }

    return set.name || "Untitled List";
  };

  return (
    <div className="w-full">
      <Listbox value={selectedIndex} onChange={onSelectionChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-xl border border-base-content/10 bg-base-100/50 py-3 pl-4 pr-10 text-left transition-all duration-200 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
            <div className="flex items-center gap-3">
              <span
                className={`truncate text-sm sm:text-base ${selectedSet ? "text-base-content font-medium" : "text-base-content/50"}`}
            >
              {getSelectedSetsTitle(selectedSet)}
              </span>
              {selectedSet && (
                <span className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                  {selectedSet.codes.length} codes
                </span>
              )}
            </div>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon
                className="h-5 w-5 text-base-content/40"
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
            <Listbox.Options className="absolute z-10 mt-2 max-h-72 w-full overflow-auto rounded-xl bg-base-100 border border-base-content/10 py-1 text-base shadow-2xl shadow-black/10 focus:outline-none">
              {/* Create New List Option */}
              <div
                className="relative cursor-pointer select-none py-3 px-4 transition-colors duration-150 hover:bg-primary/10 flex items-center gap-2 text-primary border-b border-base-content/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateSelected();
                }}
              >
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PlusIcon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">Create New List</span>
              </div>

              {htsCodeSets.length === 0 ? (
                <div className="py-4 px-4 text-center">
                  <span className="text-sm text-base-content/50">
                    No saved code lists yet
                  </span>
                </div>
              ) : (
                htsCodeSets.map((htsCodeSet, index) => (
                <Listbox.Option
                  key={index}
                    className={({ active, selected }) =>
                      `relative hover:cursor-pointer select-none py-3 px-4 transition-colors duration-150 ${
                      active
                          ? "bg-primary/10"
                          : selected
                            ? "bg-primary/5"
                            : ""
                    }`
                  }
                  value={index}
                >
                    {({ selected }) => (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                          <span
                            className={`truncate text-sm font-semibold ${
                              selected ? "text-primary" : "text-base-content"
                            }`}
                          >
                          {htsCodeSet.name || "Untitled List"}
                          </span>

                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded-md bg-base-content/5 text-xs font-medium text-base-content/60">
                            {htsCodeSet.codes.length} codes
                            </span>
                            <span className="flex items-center gap-1 text-xs text-base-content/40">
                              <CalendarIcon className="w-3 h-3" />
                            {formatDate(new Date(htsCodeSet.created_at))}
                            </span>
                        </div>
                      </div>

                      {/* Check icon for selected item */}
                      {selected && (
                          <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full bg-primary/10">
                            <CheckIcon
                              className="h-4 w-4 text-primary"
                              aria-hidden="true"
                            />
                        </span>
                      )}
                    </div>
                  )}
                </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
