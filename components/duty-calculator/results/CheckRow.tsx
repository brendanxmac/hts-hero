"use client";

// One checkbox row, shared by the questions and the trade preferences: label, the amount checking
// it would change the total by, and optional legal text
import { ReactNode, useState } from "react";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatMoney } from "../lib/format";
import { LegalPanel } from "./LegalPanel";
import { LegalToggle } from "./LegalToggle";

export const CheckRow = ({
  checked,
  onChange,
  code,
  label,
  impact,
  help,
  showNoChange = false,
  citations,
  notesFor,
  stable = false,
  note,
  muted = false,
  qualifyLink,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  code?: string;
  label: ReactNode;
  impact?: number;
  help?: string;
  // Extra note citations to show with the legal text, beyond those the text itself cites
  citations?: string[];
  // The entry the referenced notes are shown for (date and code); without it, no notes
  notesFor?: { asOf: string; htsCode: string };
  // Say "No change" when checking it wouldn't change the total (otherwise nothing is shown)
  showNoChange?: boolean;
  // Keeps its shape whatever it says: the amount line always shows, checked or not, so answering
  // one row never moves the rows below it
  stable?: boolean;
  // What checking it would do, in plain English (or the locked line, signed out)
  note?: ReactNode;
  // Doesn't apply with the other answers as they stand
  muted?: boolean;
  // A link to find out whether the goods qualify, on a stable row that could save money
  qualifyLink?: ReactNode;
}) => {
  const [expanded, setExpanded] = useState(false);
  const noChange =
    showNoChange &&
    !checked &&
    impact !== undefined &&
    Math.abs(impact) < 0.005;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className={ui.checkbox}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="flex flex-col gap-1 min-w-0">
          <span className={`text-sm leading-snug ${muted ? "text-base-content/50" : "text-base-content"}`}>
            {code && (
              <span
                className={`${mono.className} mr-1.5 text-sm font-semibold text-primary`}
              >
                {code}
              </span>
            )}
            {label}
          </span>
          {note && <span className="flex text-xs leading-snug text-base-content/60">{note}</span>}
          {stable ? (
            <span className="flex flex-wrap items-center gap-2">
              <StableAmount amount={impact} checked={checked} />
              {qualifyLink && !checked && impact !== undefined && impact < -0.005 && qualifyLink}
              {help && <LegalToggle open={expanded} onToggle={() => setExpanded((x) => !x)} />}
            </span>
          ) : (!checked && impact !== undefined && Math.abs(impact) >= 0.005) ||
          noChange ||
          help ? (
            <span className="flex flex-wrap items-center gap-2">
              {!checked && <Impact amount={impact} />}
              {noChange && (
                <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium bg-base-300 text-base-content/60">
                  No change to the total
                </span>
              )}
              {help && (
                <LegalToggle
                  open={expanded}
                  onToggle={() => setExpanded((x) => !x)}
                />
              )}
            </span>
          ) : null}
        </span>
      </label>
      {expanded && help && (
        <div className="ml-8">
          <LegalPanel text={help} citations={citations} notesFor={notesFor} />
        </div>
      )}
    </div>
  );
};

// What checking the row would change the total by: green when lower, red when higher
const Impact = ({ amount }: { amount?: number }) => {
  if (amount === undefined || Math.abs(amount) < 0.005) return null;
  const lower = amount < 0;
  return (
    <span
      className={`tabular-nums inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${
        lower ? "bg-success/10 text-success" : "bg-error/10 text-error"
      }`}
    >
      {lower ? "−" : "+"}
      {formatMoney(Math.abs(amount))}
    </span>
  );
};

// The amount in a stable row: what checking it could do, what it's doing once checked, or that it
// makes no change, always in the same place
const StableAmount = ({ amount, checked }: { amount?: number; checked: boolean }) => {
  const none = amount === undefined || Math.abs(amount) < 0.005;
  if (none)
    return (
      <span className="inline-flex items-center rounded-md bg-base-300 px-1.5 py-0.5 text-xs font-medium text-base-content/60">
        {checked ? "Applied" : "No change to the total"}
      </span>
    );
  const lower = amount < 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${lower ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
      {checked ? "Applied" : lower ? "Could save" : "Would add"} {lower ? "−" : "+"}
      {formatMoney(Math.abs(amount))}
    </span>
  );
};
