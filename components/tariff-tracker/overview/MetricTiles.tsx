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
  // A second line on the same scale, and a legend in place of the note naming both
  spark2?: SparkPoint[];
  legend?: { label: string; color: string }[];
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
          <Sparkline
            points={m.spark ?? []}
            color={m.sparkTone === "error" ? ERROR_MARK : PRIMARY_MARK}
            step={m.sparkStep}
            to={m.sparkTo}
            height={32}
            also={m.spark2 && m.legend?.[1] ? { points: m.spark2, color: m.legend[1].color } : undefined}
          />
          {m.legend ? (
            <span className="flex flex-wrap gap-x-3 text-xs font-semibold text-base-content/60">
              {m.legend.map((l) => (
                <span key={l.label} className="inline-flex items-center gap-1.5">
                  {/* Series color (DESIGN_SYSTEM §10) */}
                  <span className="h-2 w-2 rounded-full" style={{ background: l.color }} aria-hidden />
                  {l.label}
                </span>
              ))}
            </span>
          ) : (
            <span className={`text-xs font-semibold ${NOTE_TONES[m.noteTone]}`}>{m.note}</span>
          )}
        </div>
      ),
    }))}
  />
);
