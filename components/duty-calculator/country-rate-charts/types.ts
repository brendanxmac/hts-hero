// Shared types for the rates-by-country charts and table

export interface CountryRates {
  code: string;
  name: string;
  flag: string;
  // Total duty per product as a number, when it is one ("Free" is 0; per-unit rates are null)
  values: (number | null)[];
  // The same totals as written, and the lower total from a trade preference when there is one
  labels: string[];
  preferences: (string | undefined)[];
}

export interface Product {
  code: string;
  label: string;
}

// How chosen countries show: colored markers, or their flags
export type Markers = "colors" | "flags";
