"use client";

import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { TRANSPORT_MODES } from "../lib/format";

type Mode = (typeof TRANSPORT_MODES)[number]["id"];

// How the goods arrive (it decides the Harbor Maintenance Fee), as a dropdown the height and
// look of the entry rail's other inputs
export const TransportField = ({ id, value, onChange }: { id?: string; value: Mode; onChange: (mode: Mode) => void }) => {
  const current = TRANSPORT_MODES.find((m) => m.id === value) ?? TRANSPORT_MODES[0];
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button id={id} className={`${ui.input} flex items-center justify-between gap-2 text-left`}>
          <span className="truncate font-medium">{current.label}</span>
          <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-base-content/50" aria-hidden />
        </Listbox.Button>
        <Listbox.Options className={`${ui.popover} absolute z-30 mt-2 w-full min-w-40 focus:outline-none`}>
          {TRANSPORT_MODES.map((mode) => (
            <Listbox.Option
              key={mode.id}
              value={mode.id}
              className={({ active }) => `flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm ${active ? "bg-primary/10" : ""}`}
            >
              {({ selected }) => (
                <>
                  <span className={`flex-1 text-base-content ${selected ? "font-semibold" : ""}`}>{mode.label}</span>
                  {selected && <CheckIcon className="h-4 w-4 text-primary" aria-label="Selected" />}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};
