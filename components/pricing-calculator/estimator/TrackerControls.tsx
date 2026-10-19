"use client";

import * as mk from "@/components/ui/marketing/styles";
import { FREE_FOREVER_SHORT } from "@/components/ui/marketing/comingSoon";
import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";
import { PAIRS_SLIDER_MAX_PAIRS, pairsAt, positionOf } from "../lib/pairsScale";
import {
  Billing,
  REVERSE_TRIAL,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  formatPerImport,
  formatPrice,
  monthlyRate,
  trackerBilling,
  trackerTierFor,
} from "../lib/pricing";
import { MAX_PAIRS } from "../lib/estimateParams";
import { NumberInput } from "./NumberInput";

// The custom tier: anything past the largest listed one
const CUSTOM_PAIRS = TRACKER_MAX_LISTED_PAIRS * 2;

// How many imports (HTS code + country pairs) to cover. The slider's segments line up with the tier
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
      price: formatPrice(monthlyRate(t.price, trackerBilling(billing))),
      perImport: formatPerImport({ price: monthlyRate(t.price, trackerBilling(billing)), maxPairs: t.maxPairs }),
      pairs: t.maxPairs,
      active: tier === t,
    })),
    { key: "custom", label: `${TRACKER_MAX_LISTED_PAIRS}+`, price: "Let's talk", perImport: null as string | null, pairs: CUSTOM_PAIRS, active: !tier },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1 basis-64">
          <label htmlFor="tracker-pairs" className={mk.fieldLabel}>
            Imports
          </label>
          <p className={`${mk.small} mt-1 max-w-md leading-relaxed`}>
            One HTS code from one country of origin. The same code from China and Vietnam is two imports.
            Every new account gets the Tracker free for {REVERSE_TRIAL.days} days on up to {REVERSE_TRIAL.imports} imports, no credit card,
            then {FREE_FOREVER_SHORT} stay free, forever.
            {!TRACKER_ANNUAL_ENABLED && " Tracker plans are billed monthly."}
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
          aria-label="Imports (HTS code + country pairs)"
          aria-valuetext={pairs >= PAIRS_SLIDER_MAX_PAIRS ? `${pairs}+ imports` : `${pairs} imports`}
          className="h-2 w-full cursor-pointer rounded-full accent-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4"
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
              className={`flex flex-col items-start gap-0.5 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 ${
                t.active ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-base-300 bg-base-100 hover:border-base-300 hover:bg-tt-soft"
              }`}
            >
              <span className={`text-xs font-medium tabular-nums ${t.active ? "text-primary" : "text-base-content/60"}`}>
                {t.label} imports
              </span>
              <span className={`text-base font-semibold tabular-nums ${t.active ? "text-primary" : "text-base-content"}`}>
                {t.price}
              </span>
              {t.perImport && <span className="text-xs tabular-nums text-base-content/50">{t.perImport}</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
