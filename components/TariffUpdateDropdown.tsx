"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";

interface TariffUpdate {
  name: string;
  sourceName: string;
  source: string;
  codesImpacted: string[];
  dateReleased: Date;
}

interface TariffUpdateDropdownProps {
  tariffUpdates: TariffUpdate[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
}

export default function TariffUpdateDropdown({
  tariffUpdates,
  selectedIndex,
  onSelectionChange,
}: TariffUpdateDropdownProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedUpdate = tariffUpdates[selectedIndex];

  return (
    <div className="w-full">
      <Listbox value={selectedIndex} onChange={onSelectionChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg border-2 border-base-content/20 bg-base-100 py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm">
            <p className="truncate text-base font-semibold text-white">
              {selectedUpdate.name} | {selectedUpdate.sourceName} |{" "}
              {formatDate(selectedUpdate.dateReleased)}
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
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-100 border-2 border-base-content/20 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {tariffUpdates.map((update, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default select-none py-3 px-4 ${
                      active ? "bg-primary/20 text-white" : "text-gray-300"
                    }`
                  }
                  value={index}
                >
                  {({ selected }) => (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          {/* Name - largest, clearest text */}
                          <p className={`text-base font-bold truncate`}>
                            {update.name}
                          </p>

                          {/* Source Name - smaller beneath name */}
                          <p className="text-sm text-gray-400">
                            Source:{" "}
                            <a
                              href={update.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {update.sourceName}
                            </a>
                          </p>

                          {/* Date Released - clearly displayed */}
                          <p className="text-sm text-gray-400">
                            Released:{" "}
                            <span className="text-secondary font-semibold">
                              {formatDate(update.dateReleased)}
                            </span>
                          </p>
                        </div>

                        {/* Check icon for selected item */}
                        {selected ? (
                          <span className="flex items-center justify-center text-primary ml-2 flex-shrink-0">
                            <CheckIcon className="h-6 w-6" aria-hidden="true" />
                          </span>
                        ) : null}
                      </div>
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
