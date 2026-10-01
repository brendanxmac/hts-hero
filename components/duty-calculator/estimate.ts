import { Country } from "../../constants/countries";
import { HtsElement } from "../../interfaces/hts";
import { getHtsElementParents } from "../../libs/hts";
import { CalculationInput, CalculationResult, TransportMode } from "../../tariffs/engine-v2/types";
import { formatDate, formatMoney, formatPct } from "./format";

// Pieces of a duty estimate shared by the Tariff Finder page and the estimates embedded
// elsewhere (the HTS explorer and classification pages)

// The HTS line carrying the base rates: the line itself, or the nearest parent that has them.
// Statistical (10-digit) lines usually inherit their rates from the 8-digit line above.
export const findTariffElement = (element: HtsElement, htsElements: HtsElement[]): HtsElement => {
  if (element.general || element.special || element.other) return element;
  const parents = getHtsElementParents(element, htsElements);
  for (let i = parents.length - 1; i >= 0; i--) {
    if (parents[i].general || parents[i].special || parents[i].other) return parents[i];
  }
  return element;
};

export const buildEstimateInput = ({
  element,
  tariffElement,
  country,
  asOf,
  customsValue,
  quantity,
  transportMode,
  claimedPreference,
}: {
  element: HtsElement;
  tariffElement: HtsElement;
  country: Country;
  asOf: string;
  customsValue: number;
  quantity: number;
  transportMode: TransportMode;
  claimedPreference?: string;
}): Omit<CalculationInput, "answers"> => ({
  htsCode: element.htsno,
  country: country.code,
  asOf,
  customsValue,
  quantity,
  baseRates: {
    general: tariffElement.general,
    special: tariffElement.special,
    other: tariffElement.other,
  },
  claimedPreference: claimedPreference || undefined,
  transportMode,
});

// A link that opens the Tariff Calculator with these inputs
export const calculatorUrl = (params: {
  code?: string;
  country?: string;
  value: number;
  units?: number;
  date: string;
  mode: TransportMode;
  pref?: string;
  compare?: string[];
  view?: "compare";
}) => {
  const search = new URLSearchParams();
  if (params.code) search.set("code", params.code);
  if (params.country) search.set("country", params.country);
  search.set("value", String(params.value));
  if (params.units !== undefined) search.set("units", String(params.units));
  search.set("date", params.date);
  search.set("mode", params.mode);
  if (params.pref) search.set("pref", params.pref);
  if (params.compare?.length) search.set("compare", params.compare.join(","));
  if (params.view) search.set("view", params.view);
  return `${window.location.origin}/duty-calculator?${search.toString()}`;
};

// A plain-text statement for pasting into an email or ticket
export const estimateSummaryText = ({
  result,
  htsno,
  country,
  customsValue,
  transportLabel,
  link,
}: {
  result: CalculationResult;
  htsno: string;
  country: Country;
  customsValue: number;
  transportLabel: string;
  link: string;
}) =>
  [
    `Duty estimate · HTS ${htsno} from ${country.name}`,
    `Entry ${formatDate(result.asOf)} · ${transportLabel} · Customs value ${formatMoney(customsValue)}`,
    "",
    `Base duty (${result.base.reasons[0] ?? "Free"})`.padEnd(48) + formatMoney(result.base.amount),
    ...result.lines
      .filter((l) => l.status === "applies")
      .map((l) => `${l.code} ${l.name} (${formatPct(l.ratePct ?? 0)})`.slice(0, 46).padEnd(48) + formatMoney(l.amount)),
    "Total duty".padEnd(48) + formatMoney(result.totalDuty),
    ...result.fees.map((f) => `${f.name} (${formatPct(f.ratePct)})`.padEnd(48) + formatMoney(f.amount)),
    "Total duty and fees".padEnd(48) + formatMoney(result.totalDuty + result.totalFees),
    "Landed cost".padEnd(48) + formatMoney(customsValue + result.totalDuty + result.totalFees),
    "",
    link,
  ].join("\n");
