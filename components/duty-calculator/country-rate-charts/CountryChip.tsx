"use client";

import { CountryMarker } from "./CountryMarker";
import { CountryRates } from "./types";

// A country to choose for the comparison: raised with its marker when chosen
export const CountryChip = ({
  row,
  color,
  flags,
  onToggle,
}: {
  row: CountryRates;
  // Its series color when chosen
  color?: string;
  flags: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={Boolean(color)}
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm transition-colors ${
      color
        ? "border-base-content/20 bg-base-100 font-semibold text-base-content"
        : "border-base-300 bg-base-200 text-base-content/60 hover:border-base-content/20 hover:text-base-content"
    }`}
  >
    {color ? (
      <CountryMarker row={row} size="chip" flags={flags} color={color} />
    ) : (
      <span aria-hidden>{row.flag}</span>
    )}
    {row.name}
  </button>
);
