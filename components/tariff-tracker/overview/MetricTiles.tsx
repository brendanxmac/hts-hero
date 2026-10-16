"use client";

import { ReactNode } from "react";
import { SparkPoint, Sparkline } from "@/components/ui/charts/kit";
import { StatStrip } from "@/components/ui/StatStrip";
import { ERROR_MARK, PRIMARY_MARK } from "@/components/ui/theme";

// The Overview's headline numbers, each with a small trend line (the chart kit's Sparkline) in
// the color of what it shows: steps for a value that holds until it changes, along real dates
export interface Metric {
  label: string;
  value: string;
  note: string;
  noteTone: "error" | "success" | "neutral";
  // The number's color: a rise (error) or a drop (success)
  tone?: "error" | "success";
  // The number and its trend line explained in full, behind an (i)
  info?: ReactNode;
  spark?: SparkPoint[];
  sparkTone?: "primary" | "error";
  // Steps (a rate or duty that holds until it changes), running on to sparkTo (today)
  sparkStep?: boolean;
  sparkTo?: number;
}

const NOTE_TONES = { error: "text-error", success: "text-success", neutral: "text-base-content/60" };

export const MetricTiles = ({ metrics }: { metrics: Metric[] }) => (
  <StatStrip
    label="Key numbers"
    stats={metrics.map((m) => ({
      label: m.label,
      value: m.value,
      tone: m.tone,
      info: m.info,
      extra: (
        <div className="flex flex-col gap-1.5">
          <Sparkline points={m.spark ?? []} color={m.sparkTone === "error" ? ERROR_MARK : PRIMARY_MARK} step={m.sparkStep} to={m.sparkTo} height={32} />
          <span className={`text-xs font-semibold ${NOTE_TONES[m.noteTone]}`}>{m.note}</span>
        </div>
      ),
    }))}
  />
);
