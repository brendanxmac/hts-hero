"use client";

// One question in the adjustments panel: a checkbox for yes/no, otherwise a number or date field
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
}: {
  question: Question;
  value: unknown;
  impact?: number;
  heading?: DutyLine;
  onChange: (value: unknown) => void;
  notesFor?: { asOf: string; htsCode: string };
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
      />
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm leading-snug text-base-content">
        {input.label}
      </span>
      <input
        type={input.type === "date" ? "date" : "number"}
        className={ui.inputSm}
        value={(value as string | number) ?? ""}
        onChange={(e) =>
          onChange(
            input.type === "date" || e.target.value === ""
              ? e.target.value || undefined
              : Number(e.target.value),
          )
        }
      />
      {input.help && <span className={ui.caption}>{input.help}</span>}
    </label>
  );
};
