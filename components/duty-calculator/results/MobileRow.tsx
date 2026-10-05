"use client";

// One duty statement line on phones: code and amount on top, then rate and basis, then details
import { useState } from "react";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatMoney, formatPct } from "../lib/format";
import { EffectiveDate } from "./EffectiveDate";
import { LegalPanel } from "./LegalPanel";
import { LegalToggle } from "./LegalToggle";
import { linkClass, RowLink, RowProps } from "./rowTypes";
import { Swatch } from "./Swatch";

export const MobileRow = ({
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
  return (
    <li
      className={`border-t border-base-300 px-5 ${full ? "py-4" : "py-3"} flex flex-col gap-1.5 transition-colors ${linkClass(link)}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={`${mono.className} flex items-center gap-1.5 text-sm font-semibold text-primary`}
          >
            <Swatch color={link?.color} />
            {code}
          </div>
          <div className="text-base font-medium leading-snug text-base-content">
            {name}
          </div>
        </div>
        <div className="tabular-nums text-base font-semibold whitespace-nowrap">
          {formatMoney(amount)}
        </div>
      </div>
      <div className="tabular-nums text-sm text-base-content/70 flex flex-col">
        {rateText &&
        basisText &&
        rateText.split(" + ").length === basisText.split(" · ").length ? (
          // One line per part, e.g. "4.5% on the case of $2,000.00"
          rateText.split(" + ").map((part, i) => (
            <span key={i}>
              {part} of {basisText.split(" · ")[i]}
            </span>
          ))
        ) : (
          <span>
            {rateText ?? (rate === undefined ? "—" : formatPct(rate))} of{" "}
            {basisText ?? formatMoney(basis)}
          </span>
        )}
      </div>
      {full && (program || effectiveFrom) && (
        <div className={ui.caption}>
          {program}
          <EffectiveDate from={effectiveFrom} />
        </div>
      )}
      {full && detail && <div className={ui.bodySm}>{detail}</div>}
      {full && legal && (
        <LegalToggle
          open={legalOpen}
          onToggle={() => setLegalOpen((x) => !x)}
        />
      )}
      {full && legal && legalOpen && (
        <LegalPanel text={legal.text} notesFor={legal} />
      )}
    </li>
  );
};
