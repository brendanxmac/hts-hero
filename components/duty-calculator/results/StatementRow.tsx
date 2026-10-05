"use client";

// One duty statement line in the table: line, applies to, rate, amount, and its legal text
import { useState } from "react";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatMoney, formatPct } from "../lib/format";
import { EffectiveDate } from "./EffectiveDate";
import { LegalPanel } from "./LegalPanel";
import { LegalToggle } from "./LegalToggle";
import { Stacked } from "./Stacked";
import { linkClass, RowLink, RowProps } from "./rowTypes";
import { Swatch } from "./Swatch";

export const StatementRow = ({
  code,
  name,
  program,
  effectiveFrom,
  detail,
  legal,
  basis,
  basisText,
  rate,
  rateText,
  amount,
  link,
  compact,
}: RowProps & { link?: RowLink; compact?: boolean }) => {
  const [legalOpen, setLegalOpen] = useState(false);
  const full = !compact;
  const pad = full ? "py-4" : "py-2.5";
  return (
    <>
      <tr
        className={`border-t border-base-300 align-top transition-colors ${linkClass(link)}`}
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
              <span className="text-base font-medium text-base-content">
                {name}
              </span>
            </div>
            {full && (program || effectiveFrom) && (
              <span className={ui.caption}>
                {program}
                <EffectiveDate from={effectiveFrom} />
              </span>
            )}
            {full && detail && <span className={ui.bodySm}>{detail}</span>}
            {full && legal && (
              <LegalToggle
                open={legalOpen}
                onToggle={() => setLegalOpen((x) => !x)}
              />
            )}
          </div>
        </td>
        <td className={`tabular-nums ${pad} px-3 text-sm text-base-content/70`}>
          <Stacked text={basisText ?? formatMoney(basis)} separator=" · " />
        </td>
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
          {formatMoney(amount)}
        </td>
      </tr>
      {full && legal && legalOpen && (
        <tr>
          <td colSpan={4} className="px-5 sm:px-6 pb-5 pt-1">
            <LegalPanel text={legal.text} notesFor={legal} />
          </td>
        </tr>
      )}
    </>
  );
};
