import * as ui from "@/components/ui/styles";
import { Billing, TRACKER_MAX_LISTED_PAIRS, TRACKER_TIERS, formatPrice, monthlyRate } from "../lib/pricing";

// Tariff Tracker's price for each size of list
export const TrackerTierTable = ({ billing }: { billing: Billing }) => (
  <div className="overflow-hidden rounded-md border border-base-300">
    <table className="w-full text-sm tabular-nums">
      <thead className="bg-base-200">
        <tr>
          <th scope="col" className={`${ui.label} px-4 py-2 text-left`}>
            HTS + country pairs
          </th>
          <th scope="col" className={`${ui.label} px-4 py-2 text-right`}>
            Per month
          </th>
        </tr>
      </thead>
      <tbody>
        {TRACKER_TIERS.map((tier) => (
          <tr key={tier.maxPairs} className="border-t border-base-300">
            <th scope="row" className="px-4 py-2.5 text-left font-medium text-base-content/70">
              Up to {tier.maxPairs}
            </th>
            <td className="px-4 py-2.5 text-right font-semibold text-base-content">
              {formatPrice(monthlyRate(tier.price, billing))}
            </td>
          </tr>
        ))}
        <tr className="border-t border-base-300">
          <th scope="row" className="px-4 py-2.5 text-left font-medium text-base-content/70">
            {TRACKER_MAX_LISTED_PAIRS}+
          </th>
          <td className="px-4 py-2.5 text-right font-semibold text-primary">Let&apos;s talk</td>
        </tr>
      </tbody>
    </table>
  </div>
);
