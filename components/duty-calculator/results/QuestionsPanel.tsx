"use client";

// Possible Adjustments: the trade preference to claim, then the questions that could change the
// total, with the ones that can't tucked away
import { ReactNode, useState } from "react";
import * as ui from "@/components/ui/styles";
import { DutyLine, Question } from "@/tariffs/engine-v2/types";
import { sortBySpecificity } from "../lib/questions";
import { Panel } from "./Panel";
import { QuestionControl } from "./QuestionControl";

export const QuestionsPanel = ({
  questions,
  answers,
  impacts,
  onAnswer,
  lines,
  asOf,
  htsCode,
  preference,
}: {
  questions: Question[];
  answers: Record<string, unknown>;
  impacts: Record<string, number>;
  onAnswer: (id: string, value: unknown) => void;
  lines: DutyLine[];
  asOf: string;
  // The entered code, to highlight it in referenced code lists
  htsCode?: string;
  // The trade preference control, when the entry has preferences to claim
  preference?: ReactNode;
}) => {
  const [showAll, setShowAll] = useState(false);
  // Questions that change the amount, can lift an import ban, or are already answered come first; the rest
  // wouldn't change this entry's total, so they're tucked away. Within each group, questions
  // about specific products come before ones that apply to a country's goods or to everything
  // (the order depends only on the headings, so answering one doesn't reshuffle the list).
  const matters = (q: Question) =>
    q.liftsProhibition ||
    q.answered ||
    answers[q.input.id] !== undefined ||
    q.input.type !== "boolean" ||
    Math.abs(impacts[q.input.id] ?? 0) >= 0.005;
  const sorted = sortBySpecificity(questions, asOf);
  const primary = sorted.filter(matters);
  const secondary = sorted.filter((q) => !matters(q));
  const visible = showAll ? [...primary, ...secondary] : primary;
  const open = primary.filter((q) => !q.answered).length;

  return (
    <Panel
      title="Possible Adjustments"
      badge={open > 0 ? `${open} could change the total` : undefined}
      description="Review the conditions below to get a more accurate duty calculation for your import"
    >
      <div className="flex flex-col gap-6">
        {preference && (
          <AdjustmentSection
            title="Special Tariff Programs"
            description="Free trade agreement or preference programs your goods may qualify for."
          >
            {preference}
          </AdjustmentSection>
        )}
        {questions.length > 0 && (
          <AdjustmentSection
            title="Special Tariff Provisions"
            description="Tariffs and conditions that may apply to your goods."
          >
            <div>
              {visible.length > 0 ? (
                <ul className="flex flex-col divide-y divide-base-300">
                  {visible.map((q) => (
                    <li
                      key={q.input.id}
                      className="py-3.5 first:pt-0 last:pb-0"
                    >
                      <QuestionControl
                        question={q}
                        value={answers[q.input.id]}
                        impact={impacts[q.input.id]}
                        heading={lines.find(
                          (l) => `confirm:${l.code}` === q.input.id,
                        )}
                        onChange={(v) => onAnswer(q.input.id, v)}
                        notesFor={htsCode ? { asOf, htsCode } : undefined}
                      />
                    </li>
                  ))}
                </ul>
              ) : preference ? null : (
                <p className="text-sm text-base-content/70">
                  No answer would change the total for this entry.
                </p>
              )}
              {secondary.length > 0 && (
                <button
                  type="button"
                  className={`${ui.link} mt-4 text-sm`}
                  onClick={() => setShowAll((x) => !x)}
                  aria-expanded={showAll}
                >
                  {showAll
                    ? "Hide questions that don't change the total"
                    : `Show ${secondary.length} more ${secondary.length === 1 ? "question" : "questions"} that don't change the total`}
                </button>
              )}
            </div>
          </AdjustmentSection>
        )}
      </div>
    </Panel>
  );
};

// A titled group inside the adjustments panel
const AdjustmentSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <div>
      <h4 className="text-sm font-semibold text-base-content">{title}</h4>
      <p className={`${ui.caption} leading-snug`}>{description}</p>
    </div>
    {children}
  </section>
);
