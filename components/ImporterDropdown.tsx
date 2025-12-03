"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import { Importer } from "../interfaces/hts";

interface ImporterDropdownProps {
  importers: Importer[];
  selectedImporterId: string;
  onSelectionChange: (importerId: string) => void;
  onCreateSelected: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  showCreateOption?: boolean;
  placeholder?: string;
}

export default function ImporterDropdown({
  importers,
  selectedImporterId,
  onSelectionChange,
  onCreateSelected,
  isLoading = false,
  disabled = false,
  showCreateOption = true,
  placeholder = "Select Importer",
}: ImporterDropdownProps) {
  const selectedImporter = importers.find((i) => i.id === selectedImporterId);

  const getDisplayText = () => {
    if (isLoading) {
      return "Loading importers...";
    }
    if (selectedImporter) {
      return selectedImporter.name;
    }
    return placeholder;
  };

  return (
    <Listbox
      value={selectedImporterId}
      onChange={onSelectionChange}
      disabled={isLoading || disabled}
    >
      <div className="relative w-full">
        <Listbox.Button className="relative w-full cursor-default rounded-lg border border-base-content/20 bg-base-100 py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
          <span
            className={`block truncate ${selectedImporterId ? "text-base-content" : "text-base-content/60"}`}
          >
            {getDisplayText()}
          </span>
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
          <Listbox.Options className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md bg-base-100 border border-base-content/20 py-1 text-base shadow-lg ring-1 ring-base-content/5 focus:outline-none sm:text-sm">
            {/* Create New Option */}
            {showCreateOption && (
              <>
                <div
                  className="relative cursor-pointer select-none py-3 px-4 transition-colors duration-200 text-primary hover:bg-primary hover:text-primary-content flex gap-2 items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateSelected();
                  }}
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Create New Importer
                  </span>
                </div>
                {importers.length > 0 && (
                  <div className="border-t border-base-content/20 my-1"></div>
                )}
              </>
            )}
            {importers.map((importer) => (
              <Listbox.Option
                key={importer.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-3 px-4 transition-colors duration-200 ${
                    active
                      ? "bg-primary text-primary-content"
                      : "text-base-content"
                  }`
                }
                value={importer.id}
              >
                {({ selected, active }) => (
                  <div className="flex items-center justify-between">
                    <span
                      className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                    >
                      {importer.name}
                    </span>
                    {selected && (
                      <CheckIcon
                        className={`h-5 w-5 flex-shrink-0 ${active ? "text-primary-content" : "text-primary"}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
