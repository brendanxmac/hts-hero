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
          <span className="text-sm leading-snug text-base-content">
            {code && (
              <span
                className={`${mono.className} mr-1.5 text-sm font-semibold text-primary`}
              >
                {code}
              </span>
            )}
            {label}
          </span>
          {(!checked && impact !== undefined && Math.abs(impact) >= 0.005) ||
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
