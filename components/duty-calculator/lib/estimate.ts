import { Country } from "../../../constants/countries";
import { HtsElement } from "../../../interfaces/hts";
import { getHtsElementParents } from "../../../libs/hts-parents";
import { AllRules } from "../../../tariffs/engine-v2/data";
import { baseRateAnswer, isBaseRateInput } from "../../../tariffs/engine-v2/base-rates";
import { Answers, BaseRates, CalculationInput, CalculationResult, TransportMode } from "../../../tariffs/engine-v2/types";
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

// Looks up an HTS code's rates (from the line that carries them), for base rates that point to
// another code ("The rate applicable to the natural juice in heading 2009"). One per element list.
const lookups = new WeakMap<HtsElement[], (htsCode: string) => BaseRates | null>();
export const baseRatesLookup = (htsElements: HtsElement[]) => {
  const cached = lookups.get(htsElements);
  if (cached) return cached;
  const byDigits = new Map(htsElements.map((e) => [e.htsno.replace(/\D/g, ""), e]));
  const lookup = (htsCode: string) => {
    const element = byDigits.get(htsCode.replace(/\D/g, ""));
    if (!element) return null;
    const rates = findTariffElement(element, htsElements);
    return { general: rates.general ?? null, special: rates.special ?? null, other: rates.other ?? null };
  };
  lookups.set(htsElements, lookup);
  return lookup;
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
  htsElements,
}: {
  element: HtsElement;
  tariffElement: HtsElement;
  country: Country;
  asOf: string;
  customsValue: number;
  quantity: number;
  transportMode: TransportMode;
  claimedPreference?: string;
  // The HTS, so base rates that point to another code can use its rate
  htsElements?: HtsElement[];
}): Omit<CalculationInput, "answers"> => ({
  htsCode: element.htsno,
  country: country.code,
  asOf,
  customsValue,
  quantity,
  // The first unit is the one duty is charged in, and the one the quantity is entered in
  quantityUnit: [...(element.units ?? []), ...(tariffElement.units ?? [])].find(Boolean),
  baseRates: {
    general: tariffElement.general,
    special: tariffElement.special,
    other: tariffElement.other,
  },
  claimedPreference: claimedPreference || undefined,
  transportMode,
  ...(htsElements?.length ? { lookupBaseRates: baseRatesLookup(htsElements) } : {}),
});

// Answers in a link: "confirm:9903.82.18,steelContentPct=40,loadingDate=2026-02-20".
// A yes is just the question's id; other answers are id=value.
export const encodeAnswers = (answers: Answers) =>
  Object.entries(answers)
    .filter(([, value]) => value !== undefined && value !== "" && value !== false)
    .map(([id, value]) => (value === true ? id : `${id}=${String(value)}`))
    .join(",");

// Reads answers from a link, keeping only known questions with a valid value for their type
export const parseAnswers = (raw: string | null): Answers => {
  const answers: Answers = {};
  (raw ?? "").split(",").forEach((part) => {
    const [id, value] = part.split("=");
    // The base rate's own questions (the value of the case, the code a rate points to)
    if (isBaseRateInput(id)) {
      const answer = baseRateAnswer(id, value);
      if (answer !== undefined) answers[id] = answer;
      return;
    }
    const input = AllRules.inputs.find((i) => i.id === id);
    if (!input) return;
    if (input.type === "boolean") {
      if (value === undefined || value === "true") answers[id] = true;
    } else if (input.type === "date") {
      if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) answers[id] = value;
    } else {
      const number = value ? parseFloat(value) : NaN;
      if (Number.isFinite(number)) answers[id] = number;
    }
  });
  return answers;
};

// The public calculator; the Tariff Tracker has its own copy
export const CALCULATOR_PATH = "/duty-calculator";

// A link that opens the Tariff Calculator with these inputs
export const calculatorUrl = (params: {
  // The site's origin; the current page's when omitted (the server passes it)
  origin?: string;
  // Where the calculator is, and anything else its address needs (e.g. the tracker's tab)
  path?: string;
  extra?: Record<string, string>;
  code?: string;
  country?: string;
  value: number;
  units?: number;
  date: string;
  mode: TransportMode;
  pref?: string;
  answers?: Answers;
  compare?: string[];
  view?: "compare";
}) => {
  const search = new URLSearchParams(params.extra);
  if (params.code) search.set("code", params.code);
  if (params.country) search.set("country", params.country);
  search.set("value", String(params.value));
  if (params.units !== undefined) search.set("units", String(params.units));
  search.set("date", params.date);
  search.set("mode", params.mode);
  if (params.pref) search.set("pref", params.pref);
  const answers = params.answers ? encodeAnswers(params.answers) : "";
  if (answers) search.set("answers", answers);
  if (params.compare?.length) search.set("compare", params.compare.join(","));
  if (params.view) search.set("view", params.view);
  return `${params.origin ?? window.location.origin}${params.path ?? CALCULATOR_PATH}?${search.toString()}`;
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
