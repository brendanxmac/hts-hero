"use client";

import * as tt from "@/components/ui/styles/tracker";
import { ERROR_MARK, PRIMARY_MARK } from "@/components/ui/theme";
import { sparkPath } from "./lib/geometry";

// The Overview's headline numbers, each with a small trend line in the color of what it shows
export interface Metric {
  label: string;
  value: string;
  note: string;
  noteTone: "error" | "success" | "neutral";
  spark?: number[];
  sparkTone?: "primary" | "error";
}

const NOTE_TONES = { error: "text-error", success: "text-success", neutral: "text-base-content/60" };

export const MetricTiles = ({ metrics }: { metrics: Metric[] }) => (
  <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
    {metrics.map((m) => (
      <div key={m.label} className={`${tt.panel} flex flex-col gap-1.5 p-5`}>
        <span className="text-sm text-base-content/70">{m.label}</span>
        <span className={tt.metric}>{m.value}</span>
        <svg viewBox="0 0 120 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
          {m.spark && m.spark.length > 1 && (
            // Theme marks (DESIGN_SYSTEM §10)
            <path d={sparkPath(m.spark, 120, 30, 3)} fill="none" stroke={m.sparkTone === "error" ? ERROR_MARK : PRIMARY_MARK} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        <span className={`text-xs font-semibold ${NOTE_TONES[m.noteTone]}`}>{m.note}</span>
      </div>
    ))}
  </section>
);
