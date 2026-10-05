// Facts about a Chapter 99 heading on the entry's date: when it started applying, its legal text
import { AllRules } from "@/tariffs/engine-v2/data";
import { isEffectiveOn } from "@/tariffs/engine-v2/dates";
import { CalculationResult } from "@/tariffs/engine-v2/types";

// When a heading started applying: the start of the unbroken run of its versions in effect on
// `asOf`, so a later rate or scope change doesn't reset it
export const tariffStartDate = (code: string, asOf: string) => {
  const versions = AllRules.tariffs.filter((t) => t.code === code);
  let current = versions.find((t) => isEffectiveOn(t.effective, asOf));
  while (current?.effective.from) {
    const from = current.effective.from;
    const previous = versions.find((t) => t.effective.to === from);
    if (!previous) break;
    current = previous;
  }
  return current?.effective.from;
};

// The legal text of the heading version in effect on the entry's date
export const legalText = (code: string, result: CalculationResult) => {
  const versions = AllRules.tariffs.filter((t) => t.code === code);
  const tariff =
    versions.find((t) => isEffectiveOn(t.effective, result.asOf)) ??
    versions[0];
  return tariff?.description?.trim()
    ? {
        text: tariff.description.trim(),
        asOf: result.asOf,
        htsCode: result.htsCode,
      }
    : undefined;
};
