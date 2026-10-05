import { MAX_COMPARE, TariffFinder } from "../lib/useTariffFinder";

// The empty state's copy, before a code and country are chosen

export const EMPTY_STEPS = [
  "Enter an 8 or 10 digit HTS code, or search by description",
  `Choose the country of origin (or up to ${MAX_COMPARE} to compare), value and entry date`,
  "Select any adjustments that apply to your product or entry to see the final estimate ",
];

export const emptyTitle = (f: TariffFinder) =>
  f.selectedElement && !f.country ? "Choose a country of origin to see your duty" : "Enter an HTS code to see your duty";
