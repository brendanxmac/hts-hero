"use client";

import * as tt from "@/components/ui/styles/tracker";
import { SUCCESS_MARK } from "@/components/ui/theme";
import { wholeDollars } from "../insights/teasers";

// The share of the catalog's duty that could potentially be saved: one green arc on a soft track
const R = 84;
const C = 2 * Math.PI * R;

export const SavingsRing = ({
  potential,
  duty,
  ready,
  action,
}: {
  potential: number;
  duty: number;
  ready: boolean;
  action: { label: string; onClick: () => void; money: boolean };
}) => {
  const share = duty > 0 ? Math.min(1, potential / duty) : 0;
  const pct = Math.round(share * 100);
  return (
    <section className={`${tt.panel} ${tt.panelPad} flex flex-col items-center gap-4 text-center`} aria-labelledby="tt-ring">
      <div className="self-stretch text-left">
        <h2 id="tt-ring" className={tt.title}>
          Potential savings
        </h2>
        <p className={tt.subtitle}>Share of your duty you might be able to avoid</p>
      </div>
      <svg width="200" height="200" viewBox="0 0 200 200" role="img" aria-label={ready ? `Up to ${pct}% of your duty could potentially be saved` : "Working out potential savings"}>
        <circle cx="100" cy="100" r={R} fill="none" className="stroke-tt-soft" strokeWidth={16} />
        {ready && share > 0 && (
          // Runtime geometry, theme mark (DESIGN_SYSTEM §10)
          <circle cx="100" cy="100" r={R} fill="none" stroke={SUCCESS_MARK} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${share * C} ${C}`} transform="rotate(-90 100 100)" />
        )}
        <text x="100" y="102" textAnchor="middle" className={`${tt.display} fill-base-content text-[2.5rem] font-semibold`}>
          {ready ? `${pct}%` : "…"}
        </text>
        <text x="100" y="126" textAnchor="middle" className="fill-base-content/60 text-[0.8rem]">
          could save
        </text>
      </svg>
      <p className="m-0 text-sm text-base-content/70">
        {ready ? (
          <>
            Up to <b className="text-success">{wholeDollars(potential)}</b> of {wholeDollars(duty)} per shipment, if you qualify
          </>
        ) : (
          "Checking every trade program and origin…"
        )}
      </p>
      <button type="button" className={`${tt.button(action.money ? "money" : "next")} self-stretch`} onClick={action.onClick}>
        {action.label}
      </button>
    </section>
  );
};
