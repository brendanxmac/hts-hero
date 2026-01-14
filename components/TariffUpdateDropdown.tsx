"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  CalendarIcon,
  LinkIcon,
} from "@heroicons/react/20/solid";
import { TariffCodeSet } from "../tariffs/announcements/announcements";

interface TariffUpdateDropdownProps {
  disabled?: boolean;
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
          <Listbox.Button className="relative w-full cursor-default rounded-xl border border-base-content/10 bg-base-100/50 py-3 pl-4 pr-10 text-left transition-all duration-200 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
            <div className="flex items-center gap-3">
              <span className="text-sm md:text-base text-base-content font-medium">
                {selectedUpdate
                  ? selectedUpdate.name
                  : "Select a Tariff Announcement"}
              </span>
              {selectedUpdate && (
                <span className="px-2 py-0.5 rounded-lg bg-base-content/5 border border-base-content/10 text-xs text-base-content/60">
                  {formatDate(selectedUpdate.effective_at)}
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
              {tariffCodeSets.length > 0 &&
                tariffCodeSets.map((update, index) => (
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
                        <div className="flex-1 flex flex-col gap-1">
                          {/* Name */}
                          <span
                            className={`text-sm font-semibold ${
                              selected ? "text-primary" : "text-base-content"
                            }`}
                          >
                            {update.name}
                          </span>

                          {/* Meta info */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-base-content/50">
                              <CalendarIcon className="w-3 h-3" />
                              {formatDate(update.effective_at)}
                            </span>
                            <a
                              href={update.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <LinkIcon className="w-3 h-3" />
                              {update.source_name}
                            </a>
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
                ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
