"use client";

import { SparkPoint, Sparkline } from "@/components/ui/charts/kit";
import * as tt from "@/components/ui/styles/tracker";
import { ERROR_MARK, PRIMARY_MARK } from "@/components/ui/theme";

// The Overview's headline numbers, each with a small trend line (the chart kit's Sparkline) in
// the color of what it shows: steps for a value that holds until it changes, along real dates
export interface Metric {
  label: string;
  value: string;
  note: string;
  noteTone: "error" | "success" | "neutral";
  spark?: SparkPoint[];
  sparkTone?: "primary" | "error";
  // Steps (a rate or duty that holds until it changes), running on to sparkTo (today)
  sparkStep?: boolean;
  sparkTo?: number;
}

const NOTE_TONES = { error: "text-error", success: "text-success", neutral: "text-base-content/60" };

export const MetricTiles = ({ metrics }: { metrics: Metric[] }) => (
  <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
    {metrics.map((m) => (
      <div key={m.label} className={`${tt.panel} flex flex-col gap-1.5 p-5`}>
        <span className="text-sm text-base-content/70">{m.label}</span>
        <span className={tt.metric}>{m.value}</span>
        <Sparkline points={m.spark ?? []} color={m.sparkTone === "error" ? ERROR_MARK : PRIMARY_MARK} step={m.sparkStep} to={m.sparkTo} height={32} />
        <span className={`text-xs font-semibold ${NOTE_TONES[m.noteTone]}`}>{m.note}</span>
      </div>
    ))}
  </section>
);
