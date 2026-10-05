// One country in the comparison: its result, the preference claimed, and its open questions
import { Country } from "@/constants/countries";
import { CalculationResult } from "@/tariffs/engine-v2/types";

export interface CompareEntry {
  country: Country;
  result: CalculationResult;
  claimedPreference: string;
  openQuestions: number;
}
