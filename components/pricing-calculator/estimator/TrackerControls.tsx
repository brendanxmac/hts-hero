"use client";

import * as ui from "@/components/ui/styles";
import { PAIRS_SLIDER_MAX_PAIRS, pairsAt, positionOf } from "../lib/pairsScale";
import {
  Billing,
  TRACKER_MAX_LISTED_PAIRS,
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
  const tier = trackerTierFor(pairs);
  const tiers = [
    ...TRACKER_TIERS.map((t) => ({
      key: String(t.maxPairs),
      label: `Up to ${t.maxPairs}`,
      price: formatPrice(monthlyRate(t.price, billing)),
      pairs: t.maxPairs,
      active: tier === t,
    })),
    { key: "custom", label: `${TRACKER_MAX_LISTED_PAIRS}+`, price: "Let's talk", pairs: CUSTOM_PAIRS, active: !tier },
  ];

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <label htmlFor="tracker-pairs" className={ui.fieldLabel}>
            HTS code + country pairs
          </label>
          <p className={`${ui.caption} mt-1 max-w-md`}>
            One HTS code from one country of origin. The same code from China and Vietnam is two pairs.
          </p>
        </div>
        <NumberInput id="tracker-pairs" value={pairs} onChange={onPairsChange} min={1} max={MAX_PAIRS} className="w-28 text-right" />
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={0.25}
          value={positionOf(pairs)}
          onChange={(e) => onPairsChange(pairsAt(Number(e.target.value)))}
          aria-label="HTS code + country pairs"
          aria-valuetext={pairs >= PAIRS_SLIDER_MAX_PAIRS ? `${pairs}+ pairs` : `${pairs} pairs`}
          className="h-2 w-full cursor-pointer accent-primary"
        />
        <div
          role="radiogroup"
          aria-label="Tariff Tracker tier"
          className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-base-300 bg-base-300 sm:grid-cols-4"
        >
          {tiers.map((t) => (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={t.active}
              onClick={() => onPairsChange(t.pairs)}
              className={`flex flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                t.active ? "bg-primary/10" : "bg-base-100 hover:bg-base-200"
              }`}
            >
              <span className={`text-xs font-medium ${t.active ? "text-primary" : "text-base-content/60"}`}>
                {t.label} pairs
              </span>
              <span className={`text-sm font-semibold tabular-nums ${t.active ? "text-primary" : "text-base-content"}`}>
                {t.price}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
