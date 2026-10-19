"use client";

// One duty statement line in the table: line, applies to, rate, amount, and its legal text
import { useState } from "react";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatMoney, formatPct } from "../lib/format";
import { LegalPanel } from "./LegalPanel";
import { LegalToggle } from "./LegalToggle";
import { Stacked } from "./Stacked";
import { linkClass, RowChange, RowLink, RowProps } from "./rowTypes";
import { Swatch } from "./Swatch";
import { WhyLocked } from "../calculator/WhyGate";

export const StatementRow = ({
  code,
  name,
  detail,
  legal,
  basis,
  basisText,
  rate,
  rateText,
  amount,
  change,
  whyLocked,
  link,
  compact,
  hideBasis,
}: RowProps & { link?: RowLink; compact?: boolean; hideBasis?: boolean }) => {
  const [legalOpen, setLegalOpen] = useState(false);
  const full = !compact;
  const pad = full ? "py-4" : "py-2.5";
  return (
    <>
      <tr
        className={`border-t border-base-300 align-top transition-colors ${linkClass(link)} ${CHANGE_ROW[change?.kind ?? "none"]}`}
        onMouseEnter={link?.onHover && (() => link.onHover?.(true))}
        onMouseLeave={link?.onHover && (() => link.onHover?.(false))}
      >
        <td className={`${pad} pl-5 sm:pl-6 pr-3`}>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <span
                className={`${mono.className} inline-flex items-center gap-2 text-sm font-semibold text-primary`}
              >
                <Swatch color={link?.color} />
                {code}
              </span>
              <span className={`text-base font-medium text-base-content ${change?.kind === "removed" ? "line-through decoration-base-content/40 text-base-content/60" : ""}`}>
                {name}
              </span>
              {change && <ChangeBadge change={change} amount={amount} />}
            </div>
            {full && detail && (
              <span className={ui.bodySm}>{detail}</span>
            )}
            {full && whyLocked && <WhyLocked label="See why this applies, with full legal text" where="breakdown" />}
            {full && legal && (
              <LegalToggle
                open={legalOpen}
                onToggle={() => setLegalOpen((x) => !x)}
              />
            )}
          </div>
        </td>
        {!hideBasis && (
          <td className={`tabular-nums ${pad} px-3 text-sm text-base-content/70`}>
            <Stacked text={basisText ?? formatMoney(basis)} separator=" · " />
          </td>
        )}
        <td
          className={`tabular-nums ${pad} px-3 text-sm text-base-content/70 text-right`}
        >
          <Stacked
            text={rateText ?? (rate === undefined ? "—" : formatPct(rate))}
            separator=" + "
            align="right"
          />
        </td>
        <td
          className={`tabular-nums ${pad} pl-3 pr-5 sm:pr-6 text-base font-semibold text-right whitespace-nowrap`}
        >
          {change?.before !== undefined && (
            <span className="block text-xs font-normal text-base-content/60 line-through">{formatMoney(change.before)}</span>
          )}
          {formatMoney(amount)}
        </td>
      </tr>
      {full && legal && legalOpen && (
        <tr>
          <td colSpan={hideBasis ? 3 : 4} className="px-5 sm:px-6 pb-5 pt-1">
            <LegalPanel text={legal.text} notesFor={legal} />
          </td>
        </tr>
      )}
    </>
  );
};

// A row the last answer changed: tinted green when added, blue when its amount moved, red when
// switched off
const CHANGE_ROW = { added: "bg-success/[0.06]", changed: "bg-primary/[0.06]", removed: "bg-error/[0.06]", none: "" };

const ChangeBadge = ({ change, amount }: { change: RowChange; amount: number }) => {
  const diff = amount - (change.before ?? 0);
  const label =
    change.kind === "added"
      ? "Added by your answer"
      : change.kind === "removed"
        ? "Removed by your answer"
        : `${diff < 0 ? "−" : "+"}${formatMoney(Math.abs(diff))}`;
  // Added lines green, switched-off lines red; a line whose amount moved, green when it lowered the
  // duty and red when it raised it
  const tone =
    change.kind === "added" ? "bg-success/10 text-success" : change.kind === "removed" || diff > 0.005 ? "bg-error/10 text-error" : "bg-success/10 text-success";
  return <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>;
};
