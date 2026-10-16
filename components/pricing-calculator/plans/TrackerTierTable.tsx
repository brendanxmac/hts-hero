import { Billing, TRACKER_MAX_LISTED_PAIRS, TRACKER_TIERS, TRIAL_ALLOWANCE, formatPrice, monthlyRate } from "../lib/pricing";

// Tariff Tracker's price for each size of catalog, from the free usage-based trial up, on the
// Tracker's dark card
export const TrackerTierTable = ({ billing }: { billing: Billing }) => (
  <div className="overflow-hidden rounded-2xl bg-base-content/5 ring-1 ring-base-content/10">
    <table className="w-full text-sm tabular-nums">
      <thead>
        <tr className="text-xs uppercase tracking-wider text-base-content/50">
          <th scope="col" className="px-5 py-3 text-left font-semibold">
            Imports covered
          </th>
          <th scope="col" className="px-5 py-3 text-right font-semibold">
            Per month
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-base-content/10">
          <th scope="row" className="px-5 py-3 text-left font-medium text-base-content/80">
            Start free{" "}
            <span className="text-base-content/50">
              · {TRIAL_ALLOWANCE.savingsChecks} savings checks, {TRIAL_ALLOWANCE.auditChecks} audit checks, alerts on {TRIAL_ALLOWANCE.alertImports}
            </span>
          </th>
          <td className="px-5 py-3 text-right text-base font-bold text-success">Free</td>
        </tr>
        {TRACKER_TIERS.map((tier) => (
          <tr key={tier.maxPairs} className="border-t border-base-content/10">
            <th scope="row" className="px-5 py-3 text-left font-medium text-base-content/80">
              Up to {tier.maxPairs}
            </th>
            <td className="px-5 py-3 text-right text-base font-bold text-base-content">{formatPrice(monthlyRate(tier.price, billing))}</td>
          </tr>
        ))}
        <tr className="border-t border-base-content/10">
          <th scope="row" className="px-5 py-3 text-left font-medium text-base-content/80">
            {TRACKER_MAX_LISTED_PAIRS}+
          </th>
          <td className="px-5 py-3 text-right text-base font-bold text-primary">Let&apos;s talk</td>
        </tr>
      </tbody>
    </table>
    <p className="border-t border-base-content/10 px-5 py-3 text-xs text-base-content/50">1 import = 1 HTS code from 1 country of origin.</p>
  </div>
);
