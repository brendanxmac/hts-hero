"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { TariffCodeSet } from "../tariffs/announcements/announcements";

interface TariffUpdateDropdownProps {
  disabled: boolean;
  tariffCodeSets: TariffCodeSet[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
}

export default function TariffUpdateDropdown({
  disabled = false,
  tariffCodeSets,
  selectedIndex,
  onSelectionChange,
}: TariffUpdateDropdownProps) {
  const formatDate = (isoDateString: string) => {
    const date = new Date(isoDateString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedUpdate = tariffCodeSets[selectedIndex];

  return (
    <div className="w-full">
      <Listbox
        value={selectedIndex}
        onChange={onSelectionChange}
        disabled={disabled}
      >
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg border border-base-content/20 bg-base-100 py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm">
            <p className="text-sm md:text-base font-semibold text-white">
              {selectedUpdate
                ? selectedUpdate.name
                : "Select a Tariff Announcement"}
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
              {tariffCodeSets.length > 0 &&
                tariffCodeSets.map((update, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      `relative cursor-default select-none py-3 px-4 text-white transition-colors duration-200 ${
                        active ? "bg-base-300" : ""
                      }`
                    }
                    value={index}
                  >
                    {({ selected }) => (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col flex-1 min-w-0">
                            {/* Name - largest, clearest text */}
                            <p className={`text-base font-bold`}>
                              {update.name}
                            </p>

                            {/* Source Name - smaller beneath name */}
                            <p className="text-sm text-gray-400">
                              Source:{" "}
                              <a
                                href={update.source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary "
                                onClick={(e) => e.stopPropagation()}
                              >
                                {update.source_name}
                              </a>
                            </p>

                            {/* Date Released - clearly displayed */}
                            <p className="text-sm text-gray-400">
                              Released:{" "}
                              <span className="text-gray-100 font-medium">
                                {formatDate(update.published_at)}
                              </span>
                            </p>
                          </div>

                          {/* Check icon for selected item */}
                          {selected ? (
                            <span className="flex items-center justify-center text-primary ml-2 flex-shrink-0">
                              <CheckIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
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
