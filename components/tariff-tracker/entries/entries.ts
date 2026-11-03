import { AllRules } from "../../../tariffs/engine-v2/data";
import { calculate } from "../../../tariffs/engine-v2/calculate";
import { Answers, CalculationInput, CalculationResult, IsoDate } from "../../../tariffs/engine-v2/types";
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
  // Duty paid on this line, without fees (MPF, HMF). Since 2026-11-02 the total, AD/CVD deposits
  // included (adcvd.paid is 0); entries before kept AD/CVD apart in adcvd.paid
  dutyPaid: number;
  // What applied when it was filed: the trade program claimed (SPI symbol) and the answers to the
  // calculator's questions. Answers null: logged before entries kept their own, so it's checked
  // with the import's settings
  claimedPreference: string | null;
  answers: Answers | null;
  // The AD/CVD cases on it and the deposits paid; null: logged before entries kept them
  adcvd: EntryAdcvd | null;
  createdAt: string;
}

// One AD/CVD proceeding (its AD and CVD cases together) on an entry
export interface EntryAdcvdCase {
  // Its case numbers joined ("A-570-056,C-570-057"), as on the import's AD/CVD answers
  key: string;
  product: string;
  caseNumbers: string[];
  // Does it cover the goods? Only "yes" counts toward what was owed
  answer: "yes" | "no" | "unsure";
  // The producer whose rate applies; null: the "all others" rate
  supplier: string | null;
  // The deposit rate used, % of the entered value (the latest set, or one typed in)
  ratePct: number | null;
  // Found by our matching, or added by the user (searched or pasted)
  source: "match" | "added";
}

export interface EntryAdcvd {
  cases: EntryAdcvdCase[];
  // AD/CVD deposits paid on the line, USD, when they were asked apart (0 since they're in dutyPaid)
  paid: number;
}

// What the AD/CVD cases that cover the goods owed
export const adcvdOwed = (adcvd: EntryAdcvd | null, customsValue: number) =>
  (adcvd?.cases ?? []).filter((c) => c.answer === "yes").reduce((sum, c) => sum + ((c.ratePct ?? 0) / 100) * customsValue, 0);

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
  claimed_preference: string | null;
  answers: Answers | null;
  adcvd: EntryAdcvd | null;
  created_at: string;
}

export const ENTRY_COLUMNS = "id, hts_code, country, entry_date, entry_number, customs_value, quantity, duty_paid, claimed_preference, answers, adcvd, created_at";

export const fromEntryRow = (row: EntryRow): TrackerEntry => ({
  id: row.id,
  htsCode: row.hts_code,
  country: row.country,
  entryDate: row.entry_date,
  entryNumber: row.entry_number,
  customsValue: Number(row.customs_value),
  quantity: row.quantity === null ? null : Number(row.quantity),
  dutyPaid: Number(row.duty_paid),
  claimedPreference: row.claimed_preference,
  answers: row.answers,
  adcvd: row.adcvd,
  createdAt: row.created_at,
});

// Within this much, paid and owed are the same: rounding on the entry summary
const SAME_USD = 1;

export type AuditVerdict = "overpaid" | "underpaid" | "correct";

export interface EntryAudit {
  // Duty and AD/CVD deposits, paid and owed
  paid: number;
  owed: number;
  dutyPaid: number;
  dutyOwed: number;
  adcvdPaid: number;
  adcvdOwed: number;
  // Paid minus owed: positive is an overpayment
  difference: number;
  verdict: AuditVerdict;
  ratePaidPct: number;
  rateOwedPct: number;
}

export interface EntryFacts {
  entryDate: IsoDate;
  customsValue: number;
  quantity: number | null;
  claimedPreference: string | null;
  answers: Answers;
}

// The entry's own adjustments, or (logged before entries kept them) the import's
export const entryFacts = (entry: TrackerEntry, product: TrackedProduct): EntryFacts => ({
  entryDate: entry.entryDate,
  customsValue: entry.customsValue,
  quantity: entry.quantity,
  claimedPreference: entry.answers ? entry.claimedPreference : (product.input.claimedPreference ?? null),
  answers: entry.answers ?? product.adjustments.answers ?? {},
});

// The duty in force on the entry date, for what applied to the entry. The base rate is today's HTS
// line's; the Chapter 99 tariffs are the ones in force on the date.
export const entryInput = (product: TrackedProduct, facts: EntryFacts): CalculationInput => ({
  ...product.input,
  asOf: facts.entryDate,
  customsValue: facts.customsValue,
  quantity: facts.quantity ?? product.quantity,
  claimedPreference: facts.claimedPreference ?? undefined,
  answers: facts.answers,
});

export const owedOn = (product: TrackedProduct, facts: EntryFacts): CalculationResult => calculate(AllRules, entryInput(product, facts));

// Paid against owed: duty, and AD/CVD deposits on top when the entry has any
export const compare = (
  customsValue: number,
  paid: { duty: number; adcvd: number },
  owed: { duty: number; adcvd: number }
): EntryAudit => {
  const total = paid.duty + paid.adcvd;
  const totalOwed = owed.duty + owed.adcvd;
  const difference = total - totalOwed;
  return {
    paid: total,
    owed: totalOwed,
    dutyPaid: paid.duty,
    dutyOwed: owed.duty,
    adcvdPaid: paid.adcvd,
    adcvdOwed: owed.adcvd,
    difference,
    verdict: Math.abs(difference) < SAME_USD ? "correct" : difference > 0 ? "overpaid" : "underpaid",
    ratePaidPct: (total / customsValue) * 100,
    rateOwedPct: (totalOwed / customsValue) * 100,
  };
};

// What the entry owed on its entry date, for what applied to it, against what was paid
export const auditEntry = (entry: TrackerEntry, product: TrackedProduct): EntryAudit =>
  compare(
    entry.customsValue,
    { duty: entry.dutyPaid, adcvd: entry.adcvd?.paid ?? 0 },
    { duty: owedOn(product, entryFacts(entry, product)).totalDuty, adcvd: adcvdOwed(entry.adcvd, entry.customsValue) }
  );
