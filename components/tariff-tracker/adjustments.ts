import { Country } from "../../constants/countries";
import { htsCodeDigitsOnly } from "../../libs/hts-code";
import { Answers, CalculationResult, TransportMode } from "../../tariffs/engine-v2/types";
import { formatMoney, TRANSPORT_MODES } from "../duty-calculator/lib/format";

// What a user has told us about one product in their catalog, beyond its code and origin: the
// same inputs the calculator takes. Anything left out uses the catalog's defaults. Remembered per
// product (HTS code + country), so a line that's removed and pasted back keeps them, and the same
// product on two lines shares them.

export interface Adjustments {
  customsValue?: number;
  quantity?: number;
  transportMode?: TransportMode;
  // The trade preference (SPI symbol) claimed
  claimedPreference?: string;
  // Answers to the calculator's questions: exemptions confirmed, content percentages, dates
  answers?: Answers;
}

// Rates are shown as a percentage of the customs value. Rates with per-unit parts (e.g. 24¢
// each) depend on the shipment, so unadjusted products are worked out for this value and quantity.
export const DEFAULT_VALUE = 10000;
export const DEFAULT_UNITS = 1000;
export const DEFAULT_MODE: TransportMode = "ocean";

export const productKey = (htsno: string, country: Country) => `${htsCodeDigitsOnly(htsno)}-${country.code}`;

// Drops what's empty or back at its default, so an untouched product stores nothing
export const cleanAdjustments = (adjustments: Adjustments): Adjustments => {
  const out: Adjustments = {};
  if (adjustments.customsValue && adjustments.customsValue > 0) out.customsValue = adjustments.customsValue;
  if (adjustments.quantity && adjustments.quantity > 0) out.quantity = adjustments.quantity;
  if (adjustments.transportMode && adjustments.transportMode !== DEFAULT_MODE) out.transportMode = adjustments.transportMode;
  if (adjustments.claimedPreference) out.claimedPreference = adjustments.claimedPreference;
  const answers = Object.fromEntries(
    Object.entries(adjustments.answers ?? {}).filter(([, v]) => v !== undefined && v !== "")
  );
  if (Object.keys(answers).length) out.answers = answers;
  return out;
};

export const isAdjusted = (adjustments: Adjustments) => Object.keys(cleanAdjustments(adjustments)).length > 0;

export interface AdjustmentTag {
  id: keyof Adjustments;
  label: string;
  // The longer version, on hover
  title: string;
}

// The key adjustments on a product, short enough for its summary line. The result names trade
// programs and questions; without one, they're shown by symbol and count.
export const adjustmentTags = (
  adjustments: Adjustments,
  result?: Pick<CalculationResult, "availablePreferences" | "questions">
): AdjustmentTag[] => {
  const a = cleanAdjustments(adjustments);
  const tags: AdjustmentTag[] = [];
  if (a.customsValue) {
    const value = formatMoney(a.customsValue).replace(/\.00$/, "");
    tags.push({ id: "customsValue", label: value, title: `Customs value ${value}` });
  }
  if (a.quantity) {
    const units = a.quantity.toLocaleString("en-US");
    tags.push({ id: "quantity", label: `${units} units`, title: `Quantity ${units}` });
  }
  if (a.transportMode) {
    const mode = TRANSPORT_MODES.find((m) => m.id === a.transportMode)?.label ?? a.transportMode;
    tags.push({ id: "transportMode", label: mode, title: `Shipped by ${mode.toLowerCase()}` });
  }
  if (a.claimedPreference) {
    const name = result?.availablePreferences.find((p) => p.symbol === a.claimedPreference)?.name ?? a.claimedPreference;
    tags.push({ id: "claimedPreference", label: name, title: `Claiming ${name} (${a.claimedPreference})` });
  }
  if (a.answers) {
    const answered = (result?.questions ?? []).filter((q) => a.answers?.[q.input.id] !== undefined);
    const count = answered.length || Object.keys(a.answers).length;
    tags.push({
      id: "answers",
      label: `${count} ${count === 1 ? "condition" : "conditions"} answered`,
      title: answered.map((q) => q.input.label).join("\n") || "Answers to the calculator's questions",
    });
  }
  return tags;
};

// The plain-text version, for exports
export const adjustmentSummary = (adjustments: Adjustments, result: CalculationResult) =>
  adjustmentTags(adjustments, result)
    .map((t) => t.title)
    .join("; ");

// ── Storage ──
// Kept on this device until catalogs are saved to accounts. Versioned, so the shape can change.

export const ADJUSTMENTS_KEY = "hts-hero-tariff-tracker-adjustments";

interface StoredAdjustments {
  version: 1;
  products: Record<string, Adjustments>;
}

export const readAdjustments = (raw: string | null): Record<string, Adjustments> => {
  if (!raw) return {};
  try {
    const stored = JSON.parse(raw) as StoredAdjustments;
    return stored?.version === 1 && stored.products && typeof stored.products === "object" ? stored.products : {};
  } catch {
    return {};
  }
};

export const writeAdjustments = (products: Record<string, Adjustments>) =>
  JSON.stringify({ version: 1, products } satisfies StoredAdjustments);
