"use client";

import { SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { HistorySegment } from "@/tariffs/engine-v2/history";
import { formatDate, formatPct } from "../lib/format";
import { ArrowLink } from "./ArrowLink";
import { useConversion } from "./ConversionDialog";

// The calculator's way up, in three steps per tab: what anyone sees, what a free account adds,
// and what the Tariff Tracker adds (its usage-based trial comes with every account; signed in, each
// step opens its Tracker tab). Each locked step opens its pitch
// (useConversion).
// - Duty: the adjustments and what each would change, for anyone; which ones the goods qualify
//   for (Tracker), from "See which ones apply" across from Possible Adjustments' title (a button
//   atop it, in the Tracker) and a link on each row that could save
// - Duty Over Time: the history (free) / any past date in full (account) / past entries checked
//   for refunds in bulk (Tracker), the last from a button in the card's heading
// - Compare: up to 4 origins side by side (free) / every origin ranked (account) / cheaper origins across the
//   catalog (Tracker)

type Conversion = ReturnType<typeof useConversion>;

export const QUALIFY_TRIAL = {
  title: "See what savings you might qualify for, across your entire product catalog",
  subtitle:
    "Find the exemptions and trade programs that could lower the duty on every product you import. See what proof you'd need to qualify and never miss out on savings as tariffs change.",
  cta: "See what I qualify for",
};

// What each adjustment would change is free for everyone (on each row of Possible Adjustments);
// working out which ones the goods qualify for is the Tracker's savings check. In the Tracker,
// across from Possible Adjustments' title: the way to this import's savings (the host says where)
export const CheckSavingsLink = ({ onClick }: { onClick: () => void }) => <ArrowLink onClick={onClick}>Check Possible Savings</ArrowLink>;

// On /duty-calculator, across from Possible Adjustments' title: the same check, as a link
export const QualifyHeaderLink = ({ conversion }: { conversion: Conversion }) => {
  return <ArrowLink onClick={() => conversion.openTrial("qualify", QUALIFY_TRIAL)}>Check if you&apos;re qualified</ArrowLink>;
};

// On each adjustment that could save money: the same check, from the row
export const QualifyLink = ({ conversion }: { conversion: Conversion }) => {
  return (
    <button
      type="button"
      className="group inline-flex items-center gap-1 text-xs font-medium text-primary"
      onClick={(e) => {
        e.preventDefault();
        conversion.openTrial("qualify", QUALIFY_TRIAL);
      }}
    >
      <span className="underline-offset-2 group-hover:underline">See if you qualify</span>
    </button>
  );
};

// Duty Over Time's heading: check past entries for refunds, with how much more this import has
// paid than it does today, when it has
export const RefundsButton = ({ conversion, history, customsValue: _customsValue }: { conversion: Conversion; history: HistorySegment[]; customsValue: number }) => {
  const today = new Date().toISOString().slice(0, 10);
  const past = history.filter((s) => s.from <= today);
  const current = past[past.length - 1];
  const peak = past.reduce<HistorySegment | undefined>((a, b) => (!a || b.result.totalDuty > a.result.totalDuty ? b : a), undefined);
  const over = peak && current ? peak.result.totalDuty - current.result.totalDuty : 0;
  // The overall change in the duty since then, as a percentage, so it holds for any shipment size
  const change = peak && current && peak.result.totalDuty > 0.005 ? (current.result.totalDuty - peak.result.totalDuty) / peak.result.totalDuty : 0;
  const changeText = peak ? `${change < 0 ? "Down" : "Up"} ${formatPct(Math.round(Math.abs(change) * 100))} since ${formatDate(peak.from)}` : "";
  const fact = over > 0.005 && peak ? changeText : null;
  return (
    <div className="flex items-center gap-3">
      {fact && <span className="hidden text-right text-xs font-medium text-warning md:block">{fact}</span>}
      <button
        type="button"
        className={ui.button({ variant: "primary", size: "sm" })}
        onClick={() =>
          conversion.openTrial("refunds", {
            title: "Find out if you overpaid, or underpaid, on past entries",
            subtitle: `${over > 0.005 && peak ? `The duty on this import is ${changeText.charAt(0).toLowerCase()}${changeText.slice(1)}. ` : ""} Check every past entry against the duty in force on its date across your entire product catalog with our Tariff Tracker.`,
            cta: "Check my entries free",
          })
        }
      >
        <SparklesIcon className="h-4 w-4" aria-hidden />
        Check my entries for refunds or issues
      </button>
    </div>
  );
};
