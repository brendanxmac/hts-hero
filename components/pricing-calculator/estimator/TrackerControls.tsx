"use client";

import * as mk from "@/components/ui/marketing/styles";
import { PAIRS_SLIDER_MAX_PAIRS, pairsAt, positionOf } from "../lib/pairsScale";
import {
  Billing,
  FREE_TRACKED_PAIRS,
  TRACKER_MAX_LISTED_PAIRS,
  TRIAL_DAYS,
  TRIAL_PAIRS,
  TRACKER_TIERS,
  formatPrice,
  monthlyRate,
  trackerTierFor,
} from "../lib/pricing";
import { MAX_PAIRS } from "../lib/estimateParams";
import { NumberInput } from "./NumberInput";

// The custom tier: anything past the largest listed one
const CUSTOM_PAIRS = TRACKER_MAX_LISTED_PAIRS * 2;

// How many HTS code + country pairs to track. The slider's segments line up with the tier
// buttons under it, so dragging walks through the tiers.
export const TrackerControls = ({
  pairs,
  onPairsChange,
  billing,
}: {
  pairs: number;
  onPairsChange: (pairs: number) => void;
  billing: Billing;
}) => {
  const isFree = pairs <= FREE_TRACKED_PAIRS;
  const tier = trackerTierFor(pairs);
  const tiers = [
    { key: "free", label: `Up to ${FREE_TRACKED_PAIRS}`, price: "Free", pairs: FREE_TRACKED_PAIRS, active: isFree },
    ...TRACKER_TIERS.map((t) => ({
      key: String(t.maxPairs),
      label: `Up to ${t.maxPairs}`,
      price: formatPrice(monthlyRate(t.price, billing)),
      pairs: t.maxPairs,
      active: !isFree && tier === t,
    })),
    { key: "custom", label: `${TRACKER_MAX_LISTED_PAIRS}+`, price: "Let's talk", pairs: CUSTOM_PAIRS, active: !tier },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1 basis-64">
          <label htmlFor="tracker-pairs" className={mk.fieldLabel}>
            HTS code + country pairs
          </label>
          <p className={`${mk.small} mt-1 max-w-md leading-relaxed`}>
            One HTS code from one country of origin. The same code from China and Vietnam is two pairs.
            Try up to {TRIAL_PAIRS} free for {TRIAL_DAYS} days.
          </p>
        </div>
        <NumberInput id="tracker-pairs" value={pairs} onChange={onPairsChange} min={1} max={MAX_PAIRS} className="w-28 text-right" />
      </div>

      <div className="flex flex-col gap-4">
        <input
          type="range"
          min={0}
          max={100}
          step={0.25}
          value={positionOf(pairs)}
          onChange={(e) => onPairsChange(pairsAt(Number(e.target.value)))}
          aria-label="HTS code + country pairs"
          aria-valuetext={pairs >= PAIRS_SLIDER_MAX_PAIRS ? `${pairs}+ pairs` : `${pairs} pairs`}
          className="h-2 w-full cursor-pointer rounded-full accent-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-4"
        />
        <div
          role="radiogroup"
          aria-label="Tariff Tracker tier"
          className="grid grid-cols-2 gap-2 sm:grid-cols-5"
        >
          {tiers.map((t) => (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={t.active}
              onClick={() => onPairsChange(t.pairs)}
              className={`flex flex-col items-start gap-0.5 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 ${
                t.active ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className={`text-xs font-medium tabular-nums ${t.active ? "text-teal-700" : "text-slate-500"}`}>
                {t.label} pairs
              </span>
              <span className={`text-base font-semibold tabular-nums ${t.active ? "text-teal-800" : "text-slate-900"}`}>
                {t.price}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
