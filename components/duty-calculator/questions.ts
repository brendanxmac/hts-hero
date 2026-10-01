import { calculate } from "../../tariffs/engine-v2/calculate";
import { AllRules } from "../../tariffs/engine-v2/data";
import { Answers, CalculationInput, CalculationResult } from "../../tariffs/engine-v2/types";

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

// Open questions whose answer would change the amount
export const countOpenQuestions = (result: CalculationResult, impacts: Record<string, number>) =>
  result.questions.filter(
    (q) => !q.answered && (q.input.type !== "boolean" || Math.abs(impacts[q.input.id] ?? 0) >= 0.005)
  ).length;
