import { FREE_FOREVER_SHORT } from "@/components/ui/marketing/comingSoon";
import { Billing, REVERSE_TRIAL, TRACKER_MAX_LISTED_PAIRS, TRACKER_TIERS, formatPerImport, formatPrice, monthlyRate, trackerBilling } from "../lib/pricing";

// Tariff Tracker's price for each size of catalog, from the free tier up, as one row on the
// Tracker's dark card. Monthly prices only while Tracker annual billing is off (trackerBilling)
export const TrackerTierTable = ({ billing }: { billing: Billing }) => {
  const stops = [
    { label: "Start", price: "Free", perImport: null as string | null, tone: "text-success" },
    ...TRACKER_TIERS.map((tier) => {
      const price = monthlyRate(tier.price, trackerBilling(billing));
      return { label: `Up to ${tier.maxPairs}`, price: formatPrice(price), perImport: formatPerImport({ price, maxPairs: tier.maxPairs }), tone: "text-base-content" };
    }),
    { label: `${TRACKER_MAX_LISTED_PAIRS}+`, price: "Let's talk", perImport: null, tone: "text-primary" },
  ];
  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-6 gap-1.5 rounded-2xl bg-base-content/5 p-1.5 ring-1 ring-base-content/10">
        {stops.map((stop) => (
          <div key={stop.label} className="flex flex-col-reverse items-center gap-0.5 rounded-xl px-1 py-2.5 text-center tabular-nums">
            <dt className="whitespace-nowrap text-xs text-base-content/60">{stop.label}</dt>
            <dd className="m-0 flex flex-col items-center gap-0.5">
              <span className={`whitespace-nowrap text-sm font-bold ${stop.tone}`}>{stop.price}</span>
              {stop.perImport && <span className="whitespace-nowrap text-[0.6875rem] text-base-content/50">{stop.perImport}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="m-0 text-xs text-base-content/50">
        Free: {REVERSE_TRIAL.days} days of everything on up to {REVERSE_TRIAL.imports} imports, then {FREE_FOREVER_SHORT}, forever.
        Billed monthly; 1 import = 1 HTS code from 1 country of origin. Per-import prices are per import, per month.
      </p>
    </div>
  );
};
