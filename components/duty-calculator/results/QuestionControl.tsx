"use client";

// One question in the adjustments panel: a checkbox for yes/no, otherwise a number or date field
import React from "react";
import * as ui from "@/components/ui/styles";
import { DutyLine, Question } from "@/tariffs/engine-v2/types";
import { CheckRow } from "./CheckRow";

export const QuestionControl = ({
  question,
  value,
  impact,
  heading,
  onChange,
  notesFor,
  stable,
  note,
  muted,
  qualifyLink,
  hideLegal,
}: {
  question: Question;
  value: unknown;
  impact?: number;
  heading?: DutyLine;
  onChange: (value: unknown) => void;
  notesFor?: { asOf: string; htsCode: string };
  stable?: boolean;
  note?: React.ReactNode;
  muted?: boolean;
  qualifyLink?: React.ReactNode;
  hideLegal?: boolean;
}) => {
  const { input } = question;
  const code = heading?.code;
  const label = code ? heading.name : input.label;

  if (input.type === "boolean") {
    return (
      <CheckRow
        checked={value === true}
        onChange={(checked) => onChange(checked || undefined)}
        code={code}
        label={label}
        impact={impact}
        help={input.help}
        citations={input.citations}
        notesFor={notesFor}
        stable={stable}
        note={note}
        muted={muted}
        qualifyLink={qualifyLink}
        hideLegal={hideLegal}
      />
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm leading-snug text-base-content">
        {input.label}
      </span>
      <span className="relative">
        <input
          type={input.type === "date" ? "date" : input.type === "htsCode" ? "text" : "number"}
          // An HTS code is kept as typed; the calculator looks it up
          {...(input.type === "htsCode" ? { inputMode: "decimal" as const, placeholder: "e.g. 6104.42.00", spellCheck: false } : {})}
          className={`${ui.inputSm} ${input.unit ? "pr-16" : ""}`}
          value={(value as string | number) ?? ""}
          onChange={(e) =>
            onChange(
              input.type === "date" || input.type === "htsCode" || e.target.value === ""
                ? e.target.value.trim() || undefined
                : Number(e.target.value),
            )
          }
        />
        {input.unit && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-base-content/60">
            {input.unit}
          </span>
        )}
      </span>
      {input.help && <span className={ui.caption}>{input.help}</span>}
    </label>
  );
};
