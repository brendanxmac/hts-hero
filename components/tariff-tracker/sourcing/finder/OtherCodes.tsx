"use client";

import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { useHts } from "@/contexts/HtsContext";
import { Countries } from "@/constants/countries";
import * as ui from "@/components/ui/styles";
import type { TradeData, TradeLevel } from "@/libs/sourcing/trade";
import { SOURCE_URLS, Sources, usd } from "./bits";

// When the US trade figures shown leave something out: the code had no imports lately so a wider
// level stands in, or the other products in its 6-digit group have suppliers this code doesn't
// (China ships HFC-143a under 2903.44.10.20, not HFC-125 under .10.10). Names each of those codes'
// products, so a neighboring product is never mistaken for this one shipped under another number.

// "2903441020" → "2903.44.10.20"
const dotted = (code: string) => `${code.slice(0, 4)}.${code.slice(4, 6)}.${code.slice(6, 8)}.${code.slice(8, 10)}`;
// Codes named per country; the rest are counted
const CODES_SHOWN = 2;
const LEVEL_NAMES: Record<TradeLevel, string> = { HS10: "this exact code", HS8: "its 8 digits", HS6: "its 6-digit subheading" };

export const OtherCodes = ({ trade }: { trade: TradeData }) => {
  const { htsElements } = useHts();
  // Older cached responses may not have it
  const elsewhere = Object.entries(trade.elsewhere ?? {});
  // What a neighboring code is, in the HTS's words ("1,1,1-Trifluoroethane (HFC-143a)")
  const describe = (code: string) => htsElements.find((e) => e.htsno === dotted(code))?.description ?? null;
  const widened = trade.level !== trade.requested;
  if (!widened && !elsewhere.length) return null;
  const sub = `${trade.code.slice(0, 4)}.${trade.code.slice(4, 6)}`;
  return (
    <div className={`${ui.notice("primary")} flex items-start gap-3`} role="note">
      <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div className="flex min-w-0 flex-col gap-1.5 text-sm">
        {widened && (
          <p className="m-0">
            <strong>No US imports under {LEVEL_NAMES[trade.requested]} in the last 12 months</strong>, so the US figures here are for {LEVEL_NAMES[trade.level]}. A code
            renumbered in a recent HTS revision often looks like this.
            <Sources items={[{ label: "US Census", url: SOURCE_URLS.census }]} />
          </p>
        )}
        {elsewhere.length > 0 && (
          <>
            <p className="m-0">
              <strong>Other products in the same group ({sub}) have suppliers that don&apos;t show here.</strong> These are different products under their own codes, not this
              one shipped under another number (US imports, last 12 months):
              <Sources items={[{ label: `US Census, ${trade.months[trade.months.length - 12] ?? ""} to ${trade.months[trade.months.length - 1] ?? ""}`, url: SOURCE_URLS.census }]} />
            </p>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {elsewhere.map(([iso, list]) => {
                const country = Countries.find((c) => c.code === iso);
                const total = list.reduce((sum, [, v]) => sum + v, 0);
                return (
                  <li key={iso} className="text-base-content/80">
                    <span className="font-semibold text-base-content">
                      {country?.flag} {country?.name ?? iso}
                    </span>{" "}
                    {usd(total)}, mainly{" "}
                    {list
                      .slice(0, CODES_SHOWN)
                      .map(([c, v]) => {
                        const what = describe(c);
                        return `${dotted(c)}${what ? ` (${what})` : ""} ${usd(v)}`;
                      })
                      .join(" and ")}
                    {list.length > CODES_SHOWN ? ` +${list.length - CODES_SHOWN} more codes` : ""}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};
