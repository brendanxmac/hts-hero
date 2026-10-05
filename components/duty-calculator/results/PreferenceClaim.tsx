"use client";

// The trade preferences (FTAs and preference programs) the entry could claim, as checkboxes of
// which at most one is checked, each with what claiming it would change
import { CheckRow } from "./CheckRow";

export const PreferenceClaim = ({
  options,
  value,
  onChange,
  impacts = {},
}: {
  options: { symbol: string; name: string }[];
  value: string;
  onChange: (symbol: string) => void;
  impacts?: Record<string, number>;
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
        />
      </li>
    ))}
  </ul>
);
