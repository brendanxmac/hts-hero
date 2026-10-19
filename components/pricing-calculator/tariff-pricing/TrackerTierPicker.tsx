"use client";

import { KeyboardEvent, useRef } from "react";
import { Billing } from "../lib/pricing";
import { TRACKER_OPTIONS, TrackerOption, optionPrice } from "./plans";

// Tariff Tracker's paid tiers as one compact track on the dark Tracker card: each stop shows its import
// limit and its price, so every tier is visible at once and choosing one updates the card's price.
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
      aria-label="Imports (HTS code + country pairs) to cover"
      className="grid grid-cols-5 gap-1.5 rounded-2xl bg-base-content/5 p-1.5 ring-1 ring-base-content/10"
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
                ? `More than ${TRACKER_OPTIONS[index - 1].maxPairs} imports, priced with us`
                : `Up to ${option.maxPairs} imports, ${optionPrice(option, billing)} a month`
            }
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 py-3 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 ${
              active ? "bg-base-100 text-base-content skin:bg-primary skin:text-primary-content" : "text-base-content/70 hover:bg-base-content/10"
            }`}
          >
            <span className="text-lg font-bold tabular-nums">{option.label}</span>
            <span className={`whitespace-nowrap text-xs tabular-nums ${active ? "text-base-content/60 skin:text-primary-content/70" : "text-base-content/50"}`}>
              {optionPrice(option, billing)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
