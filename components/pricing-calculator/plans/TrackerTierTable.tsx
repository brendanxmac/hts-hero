import { Billing, FREE_TRACKED_PAIRS, TRACKER_MAX_LISTED_PAIRS, TRACKER_TIERS, formatPrice, monthlyRate } from "../lib/pricing";

// Tariff Tracker's price for each size of catalog, from the free plan up, on the Tracker's dark card
export const TrackerTierTable = ({ billing }: { billing: Billing }) => (
  <div className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
    <table className="w-full text-sm tabular-nums">
      <thead>
        <tr className="text-xs uppercase tracking-wider text-slate-400">
          <th scope="col" className="px-5 py-3 text-left font-semibold">
            Products tracked
          </th>
          <th scope="col" className="px-5 py-3 text-right font-semibold">
            Per month
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-white/10">
          <th scope="row" className="px-5 py-3 text-left font-medium text-slate-200">
            Up to {FREE_TRACKED_PAIRS} <span className="text-slate-400">· monitoring and alerts</span>
          </th>
          <td className="px-5 py-3 text-right text-base font-bold text-emerald-300">Free</td>
        </tr>
        {TRACKER_TIERS.map((tier) => (
          <tr key={tier.maxPairs} className="border-t border-white/10">
            <th scope="row" className="px-5 py-3 text-left font-medium text-slate-200">
              Up to {tier.maxPairs}
            </th>
            <td className="px-5 py-3 text-right text-base font-bold text-white">{formatPrice(monthlyRate(tier.price, billing))}</td>
          </tr>
        ))}
        <tr className="border-t border-white/10">
          <th scope="row" className="px-5 py-3 text-left font-medium text-slate-200">
            {TRACKER_MAX_LISTED_PAIRS}+
          </th>
          <td className="px-5 py-3 text-right text-base font-bold text-teal-300">Let&apos;s talk</td>
        </tr>
      </tbody>
    </table>
    <p className="border-t border-white/10 px-5 py-3 text-xs text-slate-400">1 product = 1 HTS code from 1 country of origin.</p>
  </div>
);
