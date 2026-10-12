"use client";

import { CheckIcon, LockClosedIcon, SparklesIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { TRIAL_DAYS } from "@/components/pricing-calculator/lib/pricing";
import { useOptionalTrackerAccess } from "@/components/tariff-tracker/access/accessContext";
import { HistorySegment } from "@/tariffs/engine-v2/history";
import { formatDate, formatMoney } from "../lib/format";
import { useConversion } from "./ConversionDialog";

// The calculator's way up, in three steps per tab: what anyone sees, what a free account adds,
// and what the Tariff Tracker (trial or paid) adds. Each locked step opens its pitch
// (useConversion).
// - Duty: the Possible Adjustments ladder (amounts / what each would change / which apply)
// - Duty Over Time: the history (free) / any past date in full (account) / past entries checked
//   for refunds in bulk (Tracker), the last from a button in the card's heading
// - Compare: up to 3 origins (free) / every origin ranked (account) / cheaper origins across the
//   catalog (Tracker)

type Conversion = ReturnType<typeof useConversion>;

const QUALIFY_TRIAL = {
  title: "Find out exactly which of these apply to your goods",
  subtitle:
    "A guided check works out which exemptions and trade programs should apply to this import, and the proof you'd need to claim them.",
  cta: "Find out what I qualify for",
};

// The top of Possible Adjustments: the three steps, the ones still locked as buttons
export const AdjustmentsLadder = ({ conversion, canSeeWhy }: { conversion: Conversion; canSeeWhy: boolean }) => {
  const access = useOptionalTrackerAccess();
  const premium = Boolean(access?.premium);
  return (
    <div className="grid grid-cols-3 gap-2">
      <Step state="open" label="Free" text="What each could change the total by" />
      {canSeeWhy ? (
        <Step state="open" label="Free account" text="What each would change, on each row" />
      ) : (
        <Step
          state="account"
          label="Free account"
          text="What each would change, in plain English"
          onClick={() =>
            conversion.openAccount(
              { title: "See what each adjustment would change, free", highlight: "adjustments", cta: "Create my free account" },
              "adjustments-ladder",
            )
          }
        />
      )}
      {premium ? (
        <Step state="open" label="Your plan" text="Which apply to your goods: coming soon" />
      ) : (
        <Step
          state="trial"
          label={`${TRIAL_DAYS}-day free trial`}
          text="Which apply to your goods, with the proof you'd need"
          onClick={() => conversion.openTrial("qualify", QUALIFY_TRIAL)}
        />
      )}
    </div>
  );
};

const STEP_STYLES = {
  open: "bg-tt-soft text-base-content/70",
  account: "bg-base-100 ring-1 ring-primary/40 hover:bg-primary/5",
  trial: "bg-base-100 ring-1 ring-success/50 hover:bg-success/5",
};

const Step = ({ state, label, text, onClick }: { state: keyof typeof STEP_STYLES; label: string; text: string; onClick?: () => void }) => {
  const tone = state === "trial" ? "text-success" : state === "account" ? "text-primary" : "text-base-content/60";
  const body = (
    <>
      <span className={`flex items-center gap-1 text-xs font-semibold ${tone}`}>
        {state === "open" ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : <LockClosedIcon className="h-3 w-3" aria-hidden />}
        {label}
      </span>
      <span className="text-xs leading-snug text-base-content">{text}</span>
    </>
  );
  const className = `flex flex-col gap-1 rounded-[8px] px-2.5 py-2 text-left transition-colors ${STEP_STYLES[state]}`;
  return onClick ? (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={className}>{body}</div>
  );
};

// Duty Over Time's heading: check past entries for refunds, with how much more this import has
// paid than it does today, when it has
export const RefundsButton = ({ conversion, history, customsValue }: { conversion: Conversion; history: HistorySegment[]; customsValue: number }) => {
  const access = useOptionalTrackerAccess();
  const today = new Date().toISOString().slice(0, 10);
  const past = history.filter((s) => s.from <= today);
  const current = past[past.length - 1];
  const peak = past.reduce<HistorySegment | undefined>((a, b) => (!a || b.result.totalDuty > a.result.totalDuty ? b : a), undefined);
  const over = peak && current ? peak.result.totalDuty - current.result.totalDuty : 0;
  const fact = over > 0.005 && peak ? `Up to ${formatMoney(over)} more per entry from ${formatDate(peak.from)}` : null;
  return (
    <div className="flex items-center gap-3">
      {fact && <span className="hidden text-right text-xs font-medium text-warning md:block">{fact}</span>}
      <button
        type="button"
        className={tt.button("money", "sm", "rounded")}
        onClick={() =>
          conversion.openTrial("refunds", {
            title: "Find out if you overpaid on past entries",
            subtitle: `${over > 0.005 && peak ? `From ${formatDate(peak.from)}, entries of this import paid up to ${formatMoney(over)} more on ${formatMoney(customsValue)} of goods than they would today. ` : ""}Check every past entry against the duty in force on its date, in bulk: refunds to request through your broker, or underpayments to fix.`,
            cta: "Check my past entries",
          })
        }
      >
        <SparklesIcon className="h-4 w-4" aria-hidden />
        {access?.premium ? "Check past entries (soon)" : "Check past entries for refunds"}
      </button>
    </div>
  );
};

// Compare's heading: the free comparison, and the next step up (every origin ranked, signed out;
// cheaper origins across the catalog, signed in)
export const CompareHeader = ({
  conversion,
  max,
  originsTeaser,
}: {
  conversion: Conversion;
  max: number;
  // How many origins pay less, without saying which (the Analysis' own teaser)
  originsTeaser: string | null;
}) => {
  const access = useOptionalTrackerAccess();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-base-300 bg-base-100 px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-base-content">Compare countries of origin</h3>
        <p className="mt-0.5 text-sm text-base-content/70">
          {originsTeaser ?? `Up to ${max} side by side, free.`}
        </p>
      </div>
      {!conversion.signedIn ? (
        <button
          type="button"
          className={tt.button("next", "md", "rounded")}
          onClick={() =>
            conversion.openAccount(
              {
                title: "See this import's duty from every country, free",
                highlight: "analysis",
                thisImport: ["Every origin ranked by duty, on a map", "The trade agreements that could lower it", "Which rates have been stable, and which haven't"],
                cta: "Rank every origin, free",
              },
              "compare-header",
            )
          }
        >
          <SparklesIcon className="h-4 w-4" aria-hidden />
          Rank every origin
        </button>
      ) : access?.premium ? null : (
        <button
          type="button"
          className={tt.button("money", "md", "rounded")}
          onClick={() =>
            conversion.openTrial("sourcing", {
              title: "Find cheaper origins for everything you import",
              subtitle: "See which countries could cut the duty on each of your products, and the trade agreements that could lower it further.",
              cta: "Find cheaper origins",
            })
          }
        >
          <SparklesIcon className="h-4 w-4" aria-hidden />
          Find cheaper origins for all your imports
        </button>
      )}
    </div>
  );
};
