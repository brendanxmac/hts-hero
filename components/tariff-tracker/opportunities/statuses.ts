// Where a savings opportunity stands, as the user researches it and does the paperwork. Secured
// is when it's applied to the catalog (and counted as secured in tallies); Not eligible closes it,
// with a reason.

export type OpportunityStatus = "found" | "researching" | "in_progress" | "secured" | "not_eligible";

export type StatusTone = "neutral" | "primary" | "warning" | "success" | "error";

export interface StatusInfo {
  id: OpportunityStatus;
  label: string;
  // What it means, under the picker
  description: string;
  tone: StatusTone;
}

export const STATUSES: StatusInfo[] = [
  { id: "found", label: "Found", description: "Spotted by HTS Hero, not looked into yet", tone: "neutral" },
  { id: "researching", label: "Researching", description: "Checking whether your goods meet the requirements", tone: "primary" },
  { id: "in_progress", label: "In progress", description: "Paperwork, certificates or supplier changes under way", tone: "warning" },
  { id: "secured", label: "Secured", description: "Done: applied to your imports and counted as secured", tone: "success" },
  { id: "not_eligible", label: "Not eligible", description: "Ruled out, with the reason kept for the record", tone: "error" },
];

export const statusInfo = (id: OpportunityStatus) => STATUSES.find((s) => s.id === id) ?? STATUSES[0];

// Still being worked on: counted in the pipeline
export const isOpen = (status: OpportunityStatus) => status !== "secured" && status !== "not_eligible";
