import { AllRules } from "../../../tariffs/engine-v2/data";
import { calculate } from "../../../tariffs/engine-v2/calculate";
import { IsoDate } from "../../../tariffs/engine-v2/types";
import { TrackedProduct } from "../report";

// The Entry audit's entries: one product line of a past entry, with what was paid, saved to the
// account (tracker_entries), and the check of each against the duty in force on its entry date.
// Each check spends one of the trial's audit checks (PRICING.md); the check itself runs here.

export interface TrackerEntry {
  id: string;
  // The catalog product: HTS code digits and country code, as in its product key
  htsCode: string;
  country: string;
  entryDate: IsoDate;
  entryNumber: string | null;
  customsValue: number;
  quantity: number | null;
  // Duty paid on this line, without fees (MPF, HMF)
  dutyPaid: number;
  createdAt: string;
}

export type NewEntry = Omit<TrackerEntry, "id" | "createdAt">;

export const entryProductKey = (entry: Pick<TrackerEntry, "htsCode" | "country">) => `${entry.htsCode}-${entry.country}`;

export interface EntryRow {
  id: string;
  hts_code: string;
  country: string;
  entry_date: string;
  entry_number: string | null;
  customs_value: number | string;
  quantity: number | string | null;
  duty_paid: number | string;
  created_at: string;
}

export const ENTRY_COLUMNS = "id, hts_code, country, entry_date, entry_number, customs_value, quantity, duty_paid, created_at";

export const fromEntryRow = (row: EntryRow): TrackerEntry => ({
  id: row.id,
  htsCode: row.hts_code,
  country: row.country,
  entryDate: row.entry_date,
  entryNumber: row.entry_number,
  customsValue: Number(row.customs_value),
  quantity: row.quantity === null ? null : Number(row.quantity),
  dutyPaid: Number(row.duty_paid),
  createdAt: row.created_at,
});

// Within this much, paid and owed are the same: rounding on the entry summary
const SAME_USD = 1;

export type AuditVerdict = "overpaid" | "underpaid" | "correct";

export interface EntryAudit {
  owed: number;
  // Paid minus owed: positive is an overpayment
  difference: number;
  verdict: AuditVerdict;
  ratePaidPct: number;
  rateOwedPct: number;
}

// What the entry owed on its entry date, for the product's own answers and claimed trade program,
// against what was paid. The base rate is today's HTS line's; the Chapter 99 tariffs are the ones
// in force on the date.
export const auditEntry = (entry: TrackerEntry, product: TrackedProduct): EntryAudit => {
  const result = calculate(AllRules, {
    ...product.input,
    asOf: entry.entryDate,
    customsValue: entry.customsValue,
    quantity: entry.quantity ?? product.quantity,
    answers: product.adjustments.answers ?? {},
  });
  const owed = result.totalDuty;
  const difference = entry.dutyPaid - owed;
  return {
    owed,
    difference,
    verdict: Math.abs(difference) < SAME_USD ? "correct" : difference > 0 ? "overpaid" : "underpaid",
    ratePaidPct: (entry.dutyPaid / entry.customsValue) * 100,
    rateOwedPct: (owed / entry.customsValue) * 100,
  };
};
