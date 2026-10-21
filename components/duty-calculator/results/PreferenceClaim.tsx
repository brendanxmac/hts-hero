"use client";

// The trade preferences (FTAs and preference programs) the entry could claim, as checkboxes of
// which at most one is checked, each with what claiming it would change
import React from "react";
import { CheckRow } from "./CheckRow";

export const PreferenceClaim = ({
  options,
  value,
  onChange,
  impacts = {},
  stable,
  notes = {},
  qualifyLink,
  changeSummary,
}: {
  options: { symbol: string; name: string }[];
  value: string;
  onChange: (symbol: string) => void;
  impacts?: Record<string, number>;
  // Rows keep their shape while answering (CheckRow), each with what claiming it does
  stable?: boolean;
  notes?: Record<string, React.ReactNode>;
  qualifyLink?: React.ReactNode;
  // What the last claim (or drop) did, under that program (by its symbol)
  changeSummary?: { id: string; node: React.ReactNode };
}) => (
  <ul className="flex flex-col divide-y divide-base-300">
    {options.map((p) => (
      <li key={p.symbol} className="py-3.5 first:pt-0 last:pb-0">
        <CheckRow
          checked={value === p.symbol}
          onChange={(checked) => onChange(checked ? p.symbol : "")}
          code={p.symbol}
          label={p.name}
          impact={impacts[p.symbol]}
          showNoChange
          stable={stable}
          note={notes[p.symbol]}
          qualifyLink={qualifyLink}
        />
        {changeSummary?.id === p.symbol && <div className="mt-3">{changeSummary.node}</div>}
      </li>
    ))}
  </ul>
);
