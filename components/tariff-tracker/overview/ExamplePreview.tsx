"use client";

import * as tt from "@/components/ui/styles/tracker";
import { CHART_COLORS, PRIMARY_MARK, SUCCESS_MARK } from "@/components/ui/theme";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { itemsFromText } from "../catalog";
import { EXAMPLE_LIST } from "../exampleList";
import { useTracker } from "../TrackerContext";
import { SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";

// What the Overview looks like with a catalog in it. Illustrative numbers for a made-up
// 48-product catalog, labeled EXAMPLE on the page; loading the real example catalog replaces it.
const KPIS = [
  { label: "Rate change, 12 months", value: "+4.2%", note: "Average rate 18.8% → 23.0%", tone: "text-error" },
  { label: "Average rate", value: "23.0%", note: "▲ 1.1% in 90 days", tone: "text-error" },
  { label: "Changes, last 12 months", value: "6", note: "Hit 3 products", tone: "text-base-content/60" },
  SAVINGS_ENABLED
    ? { label: "Potential savings", value: "Up to $6,700", note: "Per shipment, if you qualify", tone: "text-success" }
    : { label: "Imports tracked", value: "48", note: "Alerts and impact checks on each", tone: "text-base-content/60" },
];

const ORIGINS = [
  { name: "China", share: 38, color: CHART_COLORS[1] },
  { name: "Vietnam", share: 19, color: CHART_COLORS[2] },
  { name: "Mexico", share: 15, color: SUCCESS_MARK },
  { name: "Germany", share: 10, color: CHART_COLORS[3] },
];

const R = 84;
const C = 2 * Math.PI * R;

export const ExamplePreview = () => {
  const { addProducts } = useTracker();
  const load = () => {
    addProducts(itemsFromText(EXAMPLE_LIST), "example");
    trackEvent(MixpanelEvent.TARIFF_TRACKER_EXAMPLE_USED, { from: "overview_preview" });
  };
  return (
    <section aria-labelledby="tt-example" className="flex flex-col gap-4 rounded-lg border-2 border-dashed border-base-300 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className={tt.chip("warning")}>Example</span>
        <h2 id="tt-example" className={`${tt.title} flex-1`}>
          What Your Dashboard Looks Like with 48 Products
        </h2>
        <button type="button" className="text-sm font-semibold text-primary hover:underline" onClick={load}>
          Load example imports →
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-hidden>
        {KPIS.map((k) => (
          <div key={k.label} className={`${tt.panel} flex flex-col gap-1 p-4`}>
            <span className="text-sm text-base-content/60">{k.label}</span>
            <span className={tt.metric}>{k.value}</span>
            <span className={`text-xs font-semibold ${k.tone}`}>{k.note}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-12" aria-hidden>
        <div className={`${tt.panel} flex flex-col items-center gap-2 p-5 xl:col-span-3`}>
          <svg width="150" height="150" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={R} fill="none" className="stroke-tt-soft" strokeWidth={18} />
            <circle cx="100" cy="100" r={R} fill="none" stroke={SUCCESS_MARK} strokeWidth={18} strokeLinecap="round" strokeDasharray={`${0.73 * C} ${C}`} transform="rotate(-90 100 100)" />
            <text x="100" y="112" textAnchor="middle" className={`${tt.display} fill-base-content text-[2.5rem] font-semibold`}>
              73%
            </text>
          </svg>
          <span className="text-sm text-base-content/60">of duty you could potentially save</span>
        </div>
        <div className={`${tt.panel} flex flex-col gap-2 p-5 xl:col-span-5`}>
          <span className="text-sm font-semibold text-base-content">Rate pulse</span>
          <svg viewBox="0 0 400 140" className="h-auto w-full">
            <path d="M0 50 C55 50 100 52 130 92 S 180 98 210 82 S 270 46 300 42 S 370 40 400 40" fill="none" stroke={PRIMARY_MARK} strokeWidth={3} />
          </svg>
        </div>
        <div className={`${tt.panel} flex flex-col gap-2.5 p-5 xl:col-span-4`}>
          <span className="text-sm font-semibold text-base-content">Origin distribution</span>
          {ORIGINS.map((o) => (
            <div key={o.name} className="grid grid-cols-[5rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-sm">
              <span>{o.name}</span>
              <span className="h-3 overflow-hidden rounded-full bg-tt-soft">
                <span className="block h-full rounded-full" style={{ width: `${(o.share / 38) * 100}%`, background: o.color }} />
              </span>
              <b className="text-right">{o.share}%</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
