"use client";

import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

// The trade program to claim on a compare card: a compact dropdown in the calculator's look (as
// TransportField), each program by name with its HTS symbol, and "None claimed" first
export const PreferencePicker = ({
  options,
  value,
  onChange,
  label,
}: {
  options: { symbol: string; name: string }[];
  value: string;
  onChange: (symbol: string) => void;
  // Names the control for screen readers
  label: string;
}) => {
  const current = options.find((p) => p.symbol === value);
  const all = [{ symbol: "", name: "None claimed" }, ...options];
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative min-w-0">
        <Listbox.Button
          aria-label={label}
          title={current?.name}
          className={`${ui.inputSm} flex items-center justify-between gap-2 text-left`}
        >
          <span className={`truncate ${current ? "font-medium text-base-content" : "text-base-content/60"}`}>
            {current ? current.name : "None claimed"}
          </span>
          <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-base-content/50" aria-hidden />
        </Listbox.Button>
        {/* Wider than the button, lined up with its right edge (the card lets it overflow) */}
        <Listbox.Options className={`${ui.popover} absolute right-0 z-40 mt-1.5 w-72 max-w-[calc(100vw-2rem)] focus:outline-none`}>
          {all.map((p) => (
            <Listbox.Option
              key={p.symbol || "none"}
              value={p.symbol}
              className={({ active }) => `flex cursor-pointer items-start gap-3 rounded-md px-3 py-2 text-sm ${active ? "bg-primary/10" : ""}`}
            >
              {({ selected }) => (
                <>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={`text-base-content ${selected ? "font-semibold" : ""}`}>{p.name}</span>
                    {p.symbol && <span className="text-xs text-base-content/50">HTS special program “{p.symbol}”</span>}
                  </span>
                  {selected && <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-label="Selected" />}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};
