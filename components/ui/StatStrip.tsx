import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";
import { InfoTip } from "./InfoTip";

// A row of headline numbers divided by 1px rules: the one way to show a few stats side by side
// (DESIGN_SYSTEM "Stat strip"). On its own it's a card; inside a card (`framed={false}`) it's one
// of the card's sections, drawing no rule of its own (CardSections draws them). The first stat can lead (a bigger number, a wider
// cell) when it's the answer and the rest explain it.

export interface StatItem {
  label: string;
  value: ReactNode;
  // A line under the number: where it comes from, what it covers
  note?: ReactNode;
  // The number's color: the user's figure (primary), money saved (success), a problem (error)
  tone?: "primary" | "success" | "error";
  // Anything more under the note (a small trend line)
  extra?: ReactNode;
  // Spans two columns on a phone (the last of four after a leading one)
  wide?: boolean;
  // What the number (and its trend line) means in full, behind an (i) in the stat's top right
  info?: ReactNode;
}

const TONES = { primary: "text-primary", success: "text-success", error: "text-error" };

const COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

export const StatStrip = ({
  stats,
  framed = true,
  lead = false,
  label,
  className = "",
}: {
  stats: StatItem[];
  framed?: boolean;
  lead?: boolean;
  // Names the strip for screen readers
  label?: string;
  className?: string;
}) => (
  <dl
    aria-label={label}
    className={`m-0 grid gap-px bg-base-300 ${
      lead && stats.length === 4 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.45fr_1fr_1fr_1fr]" : (COLUMNS[stats.length] ?? "grid-cols-1 sm:grid-cols-3")
    } ${framed ? `${ui.card} !bg-base-300` : ""} ${className}`}
  >
    {stats.map((s, i) => {
      const big = lead && i === 0;
      return (
        <div key={s.label} className={`flex min-w-0 flex-col gap-2 bg-base-100 px-5 py-5 sm:px-6 ${big && stats.length === 4 ? "col-span-2 sm:col-span-3 lg:col-span-1" : ""} ${s.wide ? "col-span-2 sm:col-span-1" : ""}`}>
          <dt className={`${ui.label} flex items-start justify-between gap-2`}>
            {s.label}
            {s.info && (
              <InfoTip label={`About ${s.label}`} className="-mr-1 -mt-0.5">
                {s.info}
              </InfoTip>
            )}
          </dt>
          <dd className={`m-0 ${big ? ui.metric.primary : ui.metric.secondary} ${s.tone ? TONES[s.tone] : ""}`}>{s.value}</dd>
          {s.note && (
            <dd className="m-0 truncate text-sm text-base-content/60" title={typeof s.note === "string" ? s.note : undefined}>
              {s.note}
            </dd>
          )}
          {s.extra && <dd className="m-0">{s.extra}</dd>}
        </div>
      );
    })}
  </dl>
);
