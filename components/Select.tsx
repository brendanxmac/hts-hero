"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";

interface Props {
  options: { label: string; value: string }[];
  selectedValue?: string | null;
  onSelectionChange?: (value: string) => void;
  placeholder?: string;
}

export const Select = ({
  options,
  selectedValue,
  onSelectionChange,
  placeholder = "Select an option",
}: Props) => {
  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  // Ensure we always have a controlled value - use empty string for null/undefined
  const controlledValue = selectedValue || "";

  return (
    <div className="w-full">
      <Listbox value={controlledValue} onChange={onSelectionChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg border-2 border-base-content/20 bg-base-100 py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm">
            <span className="block truncate text-white text-base">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
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
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-100 border-2 border-base-content/60 py-1 text-base shadow-lg shadow-base-300 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-4 pr-4 ${
                      active ? "bg-primary/20 text-white" : "text-gray-300"
                    }`
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
