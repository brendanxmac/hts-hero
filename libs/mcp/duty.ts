import { Country } from "../../constants/countries";
import { HtsElement } from "../../interfaces/hts";
import { buildEstimateInput, findTariffElement } from "../../components/duty-calculator/lib/estimate";
import { todayIso } from "../../components/duty-calculator/lib/format";
import { preferenceImpacts, questionImpacts, sortBySpecificity } from "../../components/duty-calculator/lib/questions";
import { findCountry } from "../../components/tariff-tracker/parse";
import { calculate } from "../../tariffs/engine-v2/calculate";
import { AllRules } from "../../tariffs/engine-v2/data";
import { getRevisionForDate, getVerifiedRevisions, isVerifiedDate } from "../../tariffs/engine-v2/revisions";
import { Answers, CalculationInput, CalculationResult, TransportMode } from "../../tariffs/engine-v2/types";
import { discontinuedCodes2026 } from "../../discontinued-codes-2026";
import { htsCodeDigitsOnly, normalizeHtsCode } from "../hts-code";
import { getHtsElementParents } from "../hts-parents";
import { getHtsElementsServer, getHtsRevisionNameServer } from "../hts-server";

// The duty calculator as a server-side service, for the MCP server: an HTS code and shipment in,
// the engine's result out. Base rates come from the latest HTS revision in Supabase; the engine
// stacks the Chapter 99 duties in force on the entry date on top of them.

export const DEFAULT_VALUE = 10000;
export const DEFAULT_UNITS = 1000;
export const DEFAULT_MODE: TransportMode = "ocean";

// A problem with what the caller asked for, worded for the model to relay or act on
export class DutyInputError extends Error {}

export interface DutyRequest {
  htsCode: string;
  country: string;
  customsValue?: number;
  quantity?: number;
  transportMode?: TransportMode;
  entryDate?: string;
  tradeProgram?: string;
  answers?: Record<string, unknown>;
}

export interface HtsLine {
  element: HtsElement;
  // The line carrying the base rates: itself or the nearest parent with them
  rateElement: HtsElement;
  parents: HtsElement[];
  elements: HtsElement[];
  ratesRevision: string;
}

export interface DutyCalculation {
  line: HtsLine;
  country: Country;
  asOf: string;
  customsValue: number;
  quantity: number;
  transportMode: TransportMode;
  input: Omit<CalculationInput, "answers">;
  answers: Answers;
  result: CalculationResult;
  rulesRevision: string;
  verified: boolean;
  warnings: string[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const plain = (text: string) => text.replace(/<[^>]+>/g, "").trim();

// The statistical lines under a line, if any: an 8-digit line with these needs one of them
export const childLines = (element: HtsElement, elements: HtsElement[]) => {
  const index = elements.findIndex((e) => e.uuid === element.uuid);
  const indent = Number(element.indent);
  const children: HtsElement[] = [];
  for (let i = index + 1; i < elements.length && Number(elements[i].indent) > indent; i++) {
    if (elements[i].htsno) children.push(elements[i]);
  }
  return children;
};

// The HTS line for a code. Duty needs a line without more specific lines under it
// (`requireLeaf`); looking a code up doesn't.
export const findHtsLine = async (rawCode: string, { requireLeaf = true } = {}): Promise<HtsLine> => {
  const digits = htsCodeDigitsOnly(rawCode ?? "");
  if (digits.length !== 8 && digits.length !== 10) {
    throw new DutyInputError(
      `"${rawCode}" isn't an HTS code. US HTS codes have 8 or 10 digits, e.g. 8471.30.0100.`
    );
  }
  if (digits.startsWith("99")) {
    throw new DutyInputError(
      `${normalizeHtsCode(digits)} is a Chapter 99 heading (an additional duty itself). Give the product's own HTS code from chapters 1–97 and the calculator adds the Chapter 99 duties that apply.`
    );
  }

  const [elements, ratesRevision] = await Promise.all([getHtsElementsServer(), getHtsRevisionNameServer()]);
  const element = elements.find((e) => e.htsno && htsCodeDigitsOnly(e.htsno) === digits);
  if (!element) {
    const discontinued = discontinuedCodes2026[normalizeHtsCode(digits)];
    throw new DutyInputError(
      discontinued
        ? `HTS ${normalizeHtsCode(digits)} is no longer in the HTS: ${discontinued}.`
        : `HTS ${normalizeHtsCode(digits)} isn't in the current HTS (${ratesRevision}). Check the code; it may have been renumbered.`
    );
  }

  const children = childLines(element, elements);
  if (requireLeaf && children.length) {
    const list = children
      .slice(0, 20)
      .map((c) => `${c.htsno} ${plain(c.description)}`)
      .join("; ");
    throw new DutyInputError(
      `HTS ${element.htsno} has more specific lines under it; tariffs can differ between them, so pick one: ${list}${children.length > 20 ? `; and ${children.length - 20} more` : ""}.`
    );
  }

  return {
    element,
    rateElement: findTariffElement(element, elements),
    parents: getHtsElementParents(element, elements),
    elements,
    ratesRevision,
  };
};

export const findOrigin = (raw: string): Country => {
  const country = findCountry(raw ?? "");
  if (!country) {
    throw new DutyInputError(
      `"${raw}" isn't a country of origin the calculator knows. Use a two-letter ISO code (CN, VN, MX) or the country's name.`
    );
  }
  return country;
};

// Keeps answers to the engine's known questions, in the type each expects
export const cleanAnswers = (raw: Record<string, unknown> | undefined) => {
  const answers: Answers = {};
  const unknown: string[] = [];
  Object.entries(raw ?? {}).forEach(([id, value]) => {
    const input = AllRules.inputs.find((i) => i.id === id);
    if (!input) return unknown.push(id);
    if (input.type === "boolean") {
      if (value === true || value === "true" || value === "yes") answers[id] = true;
      else if (value === false || value === "false" || value === "no") answers[id] = false;
    } else if (input.type === "date") {
      if (typeof value === "string" && ISO_DATE.test(value)) answers[id] = value;
    } else {
      const number = typeof value === "number" ? value : parseFloat(String(value));
      if (Number.isFinite(number)) answers[id] = number;
    }
  });
  return { answers, unknown };
};

export const firstVerifiedDate = () => getVerifiedRevisions()[0]?.from;

export const calculateDuty = async (req: DutyRequest): Promise<DutyCalculation> => {
  const line = await findHtsLine(req.htsCode);
  const country = findOrigin(req.country);
  const asOf = req.entryDate ?? todayIso();
  if (!ISO_DATE.test(asOf)) {
    throw new DutyInputError(`entry_date must be YYYY-MM-DD, e.g. ${todayIso()}.`);
  }
  const customsValue = req.customsValue ?? DEFAULT_VALUE;
  if (!(customsValue > 0)) throw new DutyInputError("customs_value_usd must be more than 0.");
  const quantity = req.quantity ?? DEFAULT_UNITS;
  const transportMode = req.transportMode ?? DEFAULT_MODE;
  const { answers, unknown } = cleanAnswers(req.answers);

  const input = buildEstimateInput({
    element: line.element,
    tariffElement: line.rateElement,
    country,
    asOf,
    customsValue,
    quantity,
    transportMode,
    claimedPreference: req.tradeProgram,
  });
  const result = calculate(AllRules, { ...input, answers });

  const verified = isVerifiedDate(asOf);
  const warnings = [...result.warnings];
  if (!verified) {
    warnings.push(
      `HTS Hero hasn't verified the tariff rules in force on ${asOf} (verified from ${firstVerifiedDate()} on); treat this estimate as unverified.`
    );
  }
  if (unknown.length) warnings.push(`Ignored unknown answer ids: ${unknown.join(", ")}.`);
  if (req.tradeProgram && !result.availablePreferences.some((p) => p.symbol === req.tradeProgram)) {
    warnings.push(`Trade program "${req.tradeProgram}" isn't available for this product and origin, so it wasn't applied.`);
  }

  return {
    line,
    country,
    asOf,
    customsValue,
    quantity,
    transportMode,
    input,
    answers,
    result,
    rulesRevision: getRevisionForDate(asOf)?.name ?? "unknown",
    verified,
    warnings,
  };
};

// What answering each yes/no question, or claiming each trade program, would change (USD)
export const impactsOf = (calc: DutyCalculation) => ({
  questions: questionImpacts({ ...calc.input, answers: calc.answers }, calc.result, calc.answers),
  preferences: preferenceImpacts({ ...calc.input, answers: calc.answers }, calc.result, calc.answers),
});

export const sortedQuestions = (calc: DutyCalculation) => sortBySpecificity(calc.result.questions, calc.asOf);
