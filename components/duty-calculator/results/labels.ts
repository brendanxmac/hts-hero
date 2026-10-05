// Display names for programs, rate columns and HTS revisions
import { AllRules } from "@/tariffs/engine-v2/data";

export const programName = (id?: string) =>
  AllRules.programs.find((p) => p.id === id)?.name ?? "Other";

export const COLUMN_LABEL = {
  general: "Column 1 General",
  special: "Column 1 Special",
  column2: "Column 2",
};

// Supabase revision names look like "2026-21" (year-revision); USITC's like "2026HTSRev21"
export const describeHtsRevision = (name: string | null) => {
  const match = name?.match(/^(\d{4})(?:-|HTSRev)(\d+)$/);
  if (match) return `${match[1]} Rev ${match[2]}`;
  return name ?? "latest revision";
};
