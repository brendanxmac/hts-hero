import { Billing, TRACKER_MAX_LISTED_PAIRS, TRACKER_TIERS, TRIAL_ALLOWANCE, formatPrice, monthlyRate } from "../lib/pricing";

// Tariff Tracker's price for each size of catalog, from the free usage-based trial up, as one row
// on the Tracker's dark card
export const TrackerTierTable = ({ billing }: { billing: Billing }) => {
  const stops = [
    { label: "Start", price: "Free", tone: "text-success" },
    ...TRACKER_TIERS.map((tier) => ({ label: `Up to ${tier.maxPairs}`, price: formatPrice(monthlyRate(tier.price, billing)), tone: "text-base-content" })),
    { label: `${TRACKER_MAX_LISTED_PAIRS}+`, price: "Let's talk", tone: "text-primary" },
  ];
  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-6 gap-1.5 rounded-2xl bg-base-content/5 p-1.5 ring-1 ring-base-content/10">
        {stops.map((stop) => (
          <div key={stop.label} className="flex flex-col-reverse items-center gap-0.5 rounded-xl px-1 py-2.5 text-center tabular-nums">
            <dt className="whitespace-nowrap text-xs text-base-content/60">{stop.label}</dt>
            <dd className={`whitespace-nowrap text-sm font-bold ${stop.tone}`}>{stop.price}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 text-xs text-base-content/50">
        Free: {TRIAL_ALLOWANCE.savingsChecks} savings checks, {TRIAL_ALLOWANCE.auditChecks} audit checks, alerts on {TRIAL_ALLOWANCE.alertImports} imports.
        Prices per month; 1 import = 1 HTS code from 1 country of origin.
      </p>
    </div>
  );
};
