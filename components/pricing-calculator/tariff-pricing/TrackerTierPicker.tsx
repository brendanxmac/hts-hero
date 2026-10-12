"use client";

import { KeyboardEvent, useRef } from "react";
import { Billing } from "../lib/pricing";
import { TRACKER_OPTIONS, TrackerOption, optionPrice } from "./plans";

// Tariff Tracker's free plan and paid tiers as one compact track on the dark Tracker card: each stop shows its pair
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
      aria-label="HTS code + country pairs to track"
      className="grid grid-cols-5 gap-1.5 rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10"
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
                : option.price === 0
                  ? `Up to ${option.maxPairs} pairs, free`
                  : `Up to ${option.maxPairs} pairs, ${optionPrice(option, billing)} a month`
            }
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 ${
              active ? "bg-white skin:bg-base-100 text-slate-900 skin:text-base-content" : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <span className="text-lg font-bold tabular-nums">{option.label}</span>
            <span className={`whitespace-nowrap text-xs tabular-nums ${active ? "text-slate-500 skin:text-base-content/60" : "text-slate-400"}`}>
              {optionPrice(option, billing)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
