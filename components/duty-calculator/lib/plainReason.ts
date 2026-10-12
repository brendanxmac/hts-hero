import { CalculationResult, Question } from "@/tariffs/engine-v2/types";
import { formatDate } from "./format";

// The engine's reasons for a heading, in plain English for the calculator page. Conditions name
// the question they depend on (by its label), and exclusions name the heading responsible.
// Anything not recognised is shown as the engine wrote it.

const OPS: Record<string, string> = { "<": "is under", "<=": "is at most", ">": "is over", ">=": "is at least", "=": "is" };

export const plainReasons = (result: CalculationResult, extraQuestions: Question[] = []) => {
  const questions = [...result.questions, ...extraQuestions];
  const lineName = (code: string) => result.lines.find((l) => l.code === code)?.name;
  const labelOf = (id: string) => {
    if (id.startsWith("confirm:")) return undefined;
    const label = questions.find((q) => q.input.id === id)?.input.label;
    return label ? `“${label.replace(/\?$/, "")}”` : id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  };

  return (reason: string): string => {
    let m = reason.match(/^Condition not met: (confirm:\S+) = true/);
    if (m) return "Only applies if you confirm your goods qualify (in Possible Adjustments)";
    m = reason.match(/^Condition not met: (\S+) = (true|false)( \(codes on .+\))?$/);
    if (m) return `Only applies if the answer to ${labelOf(m[1])} is ${m[2] === "true" ? "yes" : "no"}`;
    m = reason.match(/^Condition not met: base rate (\S+) (\S+)%$/);
    if (m) return `Only applies when the base rate ${OPS[m[1]] ?? m[1]} ${m[2]}%`;
    m = reason.match(/^Condition not met: (\S+) before (\d{4}-\d{2}-\d{2})$/);
    if (m) return `Only applies if ${labelOf(m[1])} is before ${formatDate(m[2])}`;
    m = reason.match(/^Condition not met: (\S+) (<=|>=|<|>|=) (.+)$/);
    if (m) return `Only applies if ${labelOf(m[1])} ${OPS[m[2]]} ${m[3]}`;
    m = reason.match(/^Excluded by (\S+)$/);
    if (m) return `Switched off by ${m[1]}${lineName(m[1]) ? ` (${lineName(m[1])})` : ""}`;
    m = reason.match(/^Not stacked: (.+)$/);
    if (m) return `Doesn't stack with another tariff here: ${m[1]}`;
    m = reason.match(/^Partly excluded: (.+)$/);
    if (m) return `Partly switched off: ${m[1]}`;
    m = reason.match(/^Needs (.+) to calculate$/);
    if (m) return `Needs the ${m[1].replace(/^the /, "")} to work out`;
    return reason;
  };
};
