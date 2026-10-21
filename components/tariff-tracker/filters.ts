import { HtsSection } from "../../interfaces/hts";

// The imports table's filters, kept in the Tracker (TrackerContext) so they stay set between
// tabs: the picked values, by the table column they filter (origin, HTS chapter, tariff, savings,
// alerts). Empty or missing means that filter is off. The matching, counts and menus are the
// shared table's (components/ui/table); the columns are in imports/importColumns.tsx.
export type FilterState = Record<string, string[]>;

// What filters need beyond the imports, such as chapter names
export interface FilterContext {
  sections: HtsSection[];
}
