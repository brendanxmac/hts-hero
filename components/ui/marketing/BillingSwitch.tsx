"use client";

import { ANNUAL_DISCOUNT, Billing } from "@/components/pricing-calculator/lib/pricing";

// Monthly or annual, for marketing pages. The annual side always carries its saving, so it can't be
// missed.
export const BillingSwitch = ({
  billing,
  onChange,
  size = "md",
}: {
  billing: Billing;
  onChange: (billing: Billing) => void;
  size?: "sm" | "md";
}) => (
  <div
    className={`inline-flex items-center rounded-full bg-white shadow-xs ring-1 ring-slate-200 skin:bg-base-100 skin:ring-base-300 ${size === "sm" ? "p-1" : "p-1.5"}`}
    role="radiogroup"
    aria-label="Billing period"
  >
    {(["monthly", "annual"] as const).map((b) => {
      const active = billing === b;
      const pad = size === "sm" ? (b === "annual" ? "pl-4 pr-1.5 py-1.5 text-sm" : "px-4 py-1.5 text-sm") : b === "annual" ? "pl-6 pr-2.5 py-2.5 text-base" : "px-6 py-2.5 text-base";
      return (
        <button
          key={b}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(b)}
          className={`flex items-center gap-2.5 rounded-full font-semibold transition-colors ${pad} ${active ? "bg-slate-900 text-white skin:bg-base-content skin:text-base-100" : "text-slate-600 hover:text-slate-900 skin:text-base-content/70 skin:hover:text-base-content"}`}
        >
          {b === "monthly" ? "Monthly" : "Annual"}
          {b === "annual" && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${active ? "bg-emerald-400 text-slate-950 skin:bg-success skin:text-success-content" : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 skin:bg-success/10 skin:text-success skin:ring-success/30"}`}
            >
              Save {ANNUAL_DISCOUNT * 100}%
            </span>
          )}
        </button>
      );
    })}
  </div>
);
