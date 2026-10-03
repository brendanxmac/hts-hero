import { calculate } from "../../tariffs/engine-v2/calculate";
import { AllRules } from "../../tariffs/engine-v2/data";
import { isEffectiveOn } from "../../tariffs/engine-v2/dates";
import {
  Answers,
  CalculationInput,
  CalculationResult,
  ListRef,
  Question,
  Scope,
} from "../../tariffs/engine-v2/types";

// Which questions matter for a result, shared by the calculator and the Tariff Watcher

// How much answering "yes" instead of "no" changes duty and fees, for every yes/no question.
// Answered ones are measured the other way round, so a question keeps its sign (and its place
// in any grouping) after it's answered.
export const questionImpacts = (input: CalculationInput, result: CalculationResult, answers: Answers) => {
  const current = result.totalDuty + result.totalFees;
  const out: Record<string, number> = {};
  result.questions
    .filter((q) => q.input.type === "boolean")
    .forEach((q) => {
      const id = q.input.id;
      const yes = answers[id] === true;
      const next = { ...answers };
      if (yes) delete next[id];
      else next[id] = true;
      const alt = calculate(AllRules, { ...input, answers: next });
      const delta = alt.totalDuty + alt.totalFees - current;
      out[id] = yes ? -delta : delta;
    });
  return out;
};

// How much claiming each available trade preference would change duty and fees, compared with
// the current result. The one already claimed has no entry.
export const preferenceImpacts = (input: CalculationInput, result: CalculationResult, answers: Answers) => {
  const current = result.totalDuty + result.totalFees;
  const out: Record<string, number> = {};
  result.availablePreferences.forEach((p) => {
    if (p.symbol === result.claimedPreference) return;
    const alt = calculate(AllRules, { ...input, answers, claimedPreference: p.symbol });
    out[p.symbol] = alt.totalDuty + alt.totalFees - current;
  });
  return out;
};

// Open questions whose answer would change the amount
export const countOpenQuestions = (result: CalculationResult, impacts: Record<string, number>) =>
  result.questions.filter(
    (q) => !q.answered && (q.input.type !== "boolean" || Math.abs(impacts[q.input.id] ?? 0) >= 0.005)
  ).length;

// ── Specificity ──

// How many entries a list holds on a date, counting lists it includes
const listSize = (id: string, asOf: string, seen = new Set<string>()): number => {
  if (seen.has(id)) return 0;
  seen.add(id);
  const list = AllRules.lists.find((l) => l.id === id);
  const version = list?.versions.find((v) => isEffectiveOn(v.effective, asOf)) ?? list?.versions[list.versions.length - 1];
  if (!version) return 0;
  return (version.codes?.length ?? 0) + (version.includes ?? []).reduce((n, ref) => n + listSize(ref.list, asOf, seen), 0);
};

const selectorSize = (selector: (string | ListRef)[], asOf: string) =>
  selector.reduce((n, item) => n + (typeof item === "string" ? 1 : listSize(item.list, asOf)), 0);

// [tier, size], lower is more specific: 0 = listed products (fewer codes first), 1 = all goods
// of some countries (fewer countries first), 2 = everything
const scopeSpecificity = (scope: Scope, asOf: string): [number, number] => {
  if (scope.codes !== "all") return [0, selectorSize(scope.codes, asOf)];
  if (scope.countries !== "all") return [1, selectorSize(scope.countries, asOf)];
  return [2, 0];
};

const compareRank = (a: [number, number], b: [number, number]) => a[0] - b[0] || a[1] - b[1];

// A question ranks by the most specific heading it affects, on the entry's date
export const questionSpecificity = (question: Question, asOf: string): [number, number] => {
  let best: [number, number] = [3, 0];
  for (const code of question.headings) {
    const versions = AllRules.tariffs.filter((t) => t.code === code);
    const tariff = versions.find((t) => isEffectiveOn(t.effective, asOf)) ?? versions[0];
    if (!tariff) continue;
    const rank = scopeSpecificity(tariff.scope, asOf);
    if (compareRank(rank, best) < 0) best = rank;
  }
  return best;
};

// Questions about specific products first, then a country's goods, then ones that apply to
// everything. Depends only on the headings, so answering a question never reorders the list;
// ties keep the engine's order.
export const sortBySpecificity = (questions: Question[], asOf: string) =>
  questions
    .map((q, index) => ({ q, index, rank: questionSpecificity(q, asOf) }))
    .sort((a, b) => compareRank(a.rank, b.rank) || a.index - b.index)
    .map(({ q }) => q);
