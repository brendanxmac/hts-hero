import { Answers } from "../../../../tariffs/engine-v2/types";
import { formatDate } from "../../../duty-calculator/lib/format";
import { TrackedProduct } from "../../report";
import { EntryAdcvdCase, EntryFacts, entryProductKey, TrackerEntry } from "../entries";

// The entry being audited, as it's typed in, step by step (EntryCheck). Kept by the button that
// opened it, so closing midway and coming back picks up where they left off.

export interface EntryDraft {
  productKey: string;
  entryDate: string;
  entryNumber: string;
  customsValue: string;
  quantity: string;
  dutyPaid: string;
  // Null until Adjustments first opens: then the import's settings today, to set to how the entry
  // was filed
  claimedPreference: string | null;
  answers: Answers | null;
  // Null until the AD/CVD step's lookup is in: then the cases our matching found (with the import's
  // own answers about them), and any the user adds
  adcvdCases: EntryAdcvdCase[] | null;
  // A saved entry being changed (stepped back into from its Results): Finish saves over it
  editingId?: string;
}

// A saved entry, back as a draft to step through and change. Entries before AD/CVD was folded into
// the duty paid kept its deposits apart: they're added back in, as What You Paid asks.
export const entryDraft = (entry: TrackerEntry): EntryDraft => ({
  productKey: entryProductKey(entry),
  entryDate: entry.entryDate,
  entryNumber: entry.entryNumber ?? "",
  customsValue: String(entry.customsValue),
  quantity: entry.quantity === null ? "" : String(entry.quantity),
  dutyPaid: String(Math.round((entry.dutyPaid + (entry.adcvd?.paid ?? 0)) * 100) / 100),
  claimedPreference: entry.claimedPreference,
  answers: entry.answers ?? {},
  adcvdCases: entry.adcvd?.cases ?? [],
  editingId: entry.id,
});

export const emptyDraft = (productKey: string): EntryDraft => ({
  productKey,
  entryDate: "",
  entryNumber: "",
  customsValue: "",
  quantity: "",
  dutyPaid: "",
  claimedPreference: null,
  answers: null,
  adcvdCases: null,
});

// Each case that covers the goods has a rate
export const adcvdProblem = (draft: EntryDraft) =>
  (draft.adcvdCases ?? []).some((c) => c.answer === "yes" && c.ratePct === null) ? "Enter the deposit rate for each case that covers your goods." : null;

// What was paid on the cases is in the duty paid (What You Paid asks for the total, AD/CVD included)
export const draftAdcvd = (draft: EntryDraft) => ({ cases: draft.adcvdCases ?? [], paid: 0 });

export type DetailsField = "productKey" | "entryDate" | "customsValue" | "quantity";

// What's missing or wrong on the entry's details, by field
export const detailsProblems = (
  draft: EntryDraft,
  product: TrackedProduct | undefined,
  range: { from: string },
  today: string
): Partial<Record<DetailsField, string>> => {
  const out: Partial<Record<DetailsField, string>> = {};
  if (!product) out.productKey = "Pick the import this entry was for.";
  if (!draft.entryDate) out.entryDate = "Enter the entry date from the entry summary.";
  else if (draft.entryDate > today) out.entryDate = "The entry date can't be in the future.";
  else if (draft.entryDate < range.from) out.entryDate = `Entries from ${formatDate(range.from)} on can be audited.`;
  if (!(Number(draft.customsValue) > 0)) out.customsValue = "Enter the entered value, in US dollars.";
  if (draft.quantity && !(Number(draft.quantity) > 0)) out.quantity = "Enter a quantity above zero, or leave it empty.";
  return out;
};

export const paidProblem = (draft: EntryDraft) =>
  draft.dutyPaid.trim() === "" || !(Number(draft.dutyPaid) >= 0) ? "Enter the total duty paid on this line, AD/CVD included (0 if none)." : null;

export const draftFacts = (draft: EntryDraft): EntryFacts => ({
  entryDate: draft.entryDate,
  customsValue: Number(draft.customsValue),
  quantity: draft.quantity ? Number(draft.quantity) : null,
  claimedPreference: draft.claimedPreference,
  answers: draft.answers ?? {},
});
