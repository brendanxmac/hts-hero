import { Opportunity } from "./OpportunitiesContext";
import { isOpen } from "./statuses";

// Savings found and secured, per shipment and per year (each product's shipments a year, 1 when
// unset). Secured savings are added up; the pipeline counts the best open one on each product, so
// two origins for the same product aren't counted twice. Savings are only ever potential until
// they're secured (PRICING.md).

// pts: what it takes off the rate, in points (one product's page: across products they don't add up)
export interface Tally {
  secured: { count: number; perShipment: number; perYear: number; pts: number };
  pipeline: { count: number; perShipment: number; perYear: number; pts: number };
  notEligible: number;
}

export const tallyOpportunities = (opportunities: Opportunity[], shipmentsPerYear: (productKey: string) => number): Tally => {
  const secured = opportunities.filter((o) => o.status === "secured");
  const bestOpen = new Map<string, Opportunity>();
  opportunities
    .filter((o) => isOpen(o.status))
    .forEach((o) => {
      const best = bestOpen.get(o.productKey);
      if (!best || o.usdPerShipment > best.usdPerShipment) bestOpen.set(o.productKey, o);
    });
  const sum = (list: Opportunity[], yearly: boolean) =>
    list.reduce((total, o) => total + o.usdPerShipment * (yearly ? shipmentsPerYear(o.productKey) : 1), 0);
  const open = Array.from(bestOpen.values());
  const pts = (list: Opportunity[]) => list.reduce((total, o) => total + (o.rateBefore - o.rateAfter), 0);
  return {
    secured: { count: secured.length, perShipment: sum(secured, false), perYear: sum(secured, true), pts: pts(secured) },
    pipeline: { count: opportunities.filter((o) => isOpen(o.status)).length, perShipment: sum(open, false), perYear: sum(open, true), pts: pts(open) },
    notEligible: opportunities.filter((o) => o.status === "not_eligible").length,
  };
};
