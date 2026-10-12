import { Countries } from "@/constants/countries";
import { AllRules } from "@/tariffs/engine-v2/data";
import { isEffectiveOn } from "@/tariffs/engine-v2/dates";
import { CalculationResult, CountrySelector, DutyLine, Question, Tariff } from "@/tariffs/engine-v2/types";
import { programName } from "../results/labels";

// Plain-English "why" for the calculator page, built from each heading's rules (the engine says
// little about headings that apply): who and what a heading covers, what triggered it, what it
// switches off, and which exemptions could still switch it off. And for the Possible Adjustments
// list, what checking a box would do.

const tariffOn = (code: string, asOf: string): Tariff | undefined => {
  const versions = AllRules.tariffs.filter((t) => t.code === code);
  return versions.find((t) => isEffectiveOn(t.effective, asOf)) ?? versions[versions.length - 1];
};

const countryNames = (sel: CountrySelector) => {
  if (sel === "all") return "every country";
  const names = sel.map((c) =>
    typeof c === "string" ? Countries.find((x) => x.code === c)?.name ?? c : AllRules.lists.find((l) => l.id === c.list)?.description ?? "the listed countries"
  );
  return names.length > 3 ? `${names.slice(0, 3).join(", ")} and ${names.length - 3} more` : names.join(" and ");
};

const nameOf = (code: string, result: CalculationResult) => result.lines.find((l) => l.code === code)?.name ?? tariffOn(code, result.asOf)?.name ?? code;

const rateText = (t: Tariff) => {
  const r = t.rate as { kind: string; pct?: number; amount?: number; per?: string };
  if (r.kind === "free") return "duty-free";
  if (r.kind === "adValorem" && r.pct !== undefined) return `a ${r.pct}% duty`;
  return "its own rate";
};

// Why an applied Chapter 99 line applies, sentence by sentence
export const whyApplies = (line: DutyLine, result: CalculationResult, questions: Question[]): string[] => {
  const t = tariffOn(line.code, result.asOf);
  if (!t) return [];
  const out: string[] = [];
  const trigger = line.reasons.map((r) => r.match(/^Applies because (\S+) applies$/)?.[1]).find(Boolean);
  if (trigger) out.push(`Applies because ${trigger} (${nameOf(trigger, result)}) applies to this import`);
  else {
    const who = `goods from ${countryNames(t.scope.countries)}`;
    const what = t.scope.codes === "all" ? "on every product" : "on the products it lists, which include this HTS code";
    out.push(`${programName(t.program)} charges ${rateText(t)} on ${who}, ${what}`);
  }
  (t.requires ?? []).forEach((c) => {
    const id = String((c as { input?: string }).input ?? "");
    if (id.startsWith("confirm:")) out.push("You confirmed your goods qualify");
    else if (id) {
      const label = questions.find((q) => q.input.id === id)?.input.label;
      if (label) out.push(`You answered yes to “${label.replace(/\?$/, "")}”`);
    }
  });
  // What it switches off is shown beside these, as chips
  const open = (t.exceptions ?? []).filter((code) => result.lines.some((l) => l.code === code && l.status === "needsAnswer"));
  if (open.length) out.push(`${open.length === 1 ? "1 exemption" : `${open.length} exemptions`} could switch it off: see Possible Adjustments`);
  line.reasons.filter((r) => !r.startsWith("Applies because")).forEach((r) => out.push(r));
  return out;
};

// What checking a provision would do: the heading it brings in, and what that switches off
// (judged against the import before any answer, so the text doesn't change while answering)
export const whatItWouldDo = (q: Question, result: CalculationResult, unadjusted: CalculationResult | null): string | undefined => {
  const base = unadjusted ?? result;
  const applied = base.lines.filter((l) => l.status === "applies");
  const parts = q.headings.map((code) => {
    const t = tariffOn(code, result.asOf);
    if (!t) return undefined;
    // Headings that apply alongside this one (e.g. an exemption that comes with it), one step
    const companions = AllRules.tariffs
      .filter((x) => isEffectiveOn(x.effective, result.asOf) && x.scope.whenApplies?.codes?.includes(code))
      .map((x) => x.code);
    const offs = applied.filter((l) => {
      const exceptions = tariffOn(l.code, result.asOf)?.exceptions ?? [];
      return exceptions.includes(code) || companions.some((c) => exceptions.includes(c));
    });
    const effect = offs.length
      ? `switches off ${offs.map((l) => `${l.code} (${l.name.replace(/^Section \d+ /, "")})`).join(" and ")}`
      : `is ${rateText(t)}`;
    return q.input.id.startsWith("confirm:") ? `If your goods qualify, ${code} ${effect}` : `A yes brings in ${code}, which ${effect}`;
  });
  return parts.filter(Boolean).join(". ") || undefined;
};

// What claiming a trade program does
export const whatClaimingDoes = (name: string) => `Uses the ${name} rate for the base duty instead of the General rate, if your goods qualify`;
