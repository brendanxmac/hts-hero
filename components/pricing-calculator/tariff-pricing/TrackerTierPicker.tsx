"use client";

import { KeyboardEvent, useRef } from "react";
import * as ui from "@/components/ui/styles";
import { Billing } from "../lib/pricing";
import { TRACKER_OPTIONS, TrackerOption, optionPrice } from "./plans";

// Tariff Tracker's tiers as one compact track: each stop shows its pair limit and its price,
// so every tier is visible at once and choosing one updates the card's price.
// Arrow keys move between stops, like any radio group.
export const TrackerTierPicker = ({
  value,
  onChange,
  billing,
}: {
  value: TrackerOption;
  onChange: (option: TrackerOption) => void;
  billing: Billing;
}) => {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + TRACKER_OPTIONS.length) % TRACKER_OPTIONS.length;
    onChange(TRACKER_OPTIONS[next]);
    buttons.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="HTS code + country pairs to track"
      className="grid grid-cols-4 gap-0.5 rounded-lg bg-base-200 p-0.5 ring-1 ring-inset ring-base-300"
    >
      {TRACKER_OPTIONS.map((option, index) => {
        const active = option.id === value.id;
        return (
          <button
            key={option.id}
            ref={(el) => {
              buttons.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={
              option.maxPairs === null
                ? `More than ${TRACKER_OPTIONS[index - 1].maxPairs} pairs, priced with us`
                : `Up to ${option.maxPairs} pairs, ${optionPrice(option, billing)} a month`
            }
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`flex min-w-0 flex-col items-center gap-0.5 rounded-md px-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              active ? "bg-base-100 shadow-sm ring-1 ring-base-300" : "hover:bg-base-100/60"
            }`}
          >
            <span className={`text-sm font-semibold tabular-nums ${active ? "text-primary" : "text-base-content"}`}>
              {option.label}
            </span>
            <span className={`${ui.caption} whitespace-nowrap tabular-nums`}>{optionPrice(option, billing)}</span>
          </button>
        );
      })}
    </div>
  );
};
