import { formatMoney } from "../../duty-calculator/lib/format";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { Insights } from "./InsightsContext";

// The one-line teasers on locked features: real numbers from the user's own catalog. Null while
// they're still being worked out, or when there's nothing to say.

const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

// "$4,180"
export const wholeDollars = (usd: number) => formatMoney(Math.round(usd)).replace(/\.00$/, "");

export const changesTeaser = (insights: Insights) => {
  if (!insights.historyReady || !insights.products.length) return null;
  const products = new Set(insights.changes.map((c) => c.product.key)).size;
  if (!insights.changes.length) {
    return `None of your products' rates has changed since ${shortDate(insights.range.from, true)}. Tracking keeps watching for you.`;
  }
  return `${plural(insights.changes.length, "tariff change", "tariff changes")} hit ${products === 1 ? "1 of your products" : `${products} of your products`} since ${shortDate(insights.range.from, true)}.`;
};

export const savingsTeaser = (insights: Insights) => {
  if (!insights.savingsReady || !insights.products.length) return null;
  const { anyUsd, productsWithSavings, keepSupplierUsd, exemptionsToCheck } = insights.totals;
  const exemptions = exemptionsToCheck ? ` ${plural(exemptionsToCheck, "product has", "products have")} an exemption worth checking.` : "";
  if (!productsWithSavings) return `We checked every trade program and origin for your products.${exemptions}`;
  const lead = `Up to ${wholeDollars(anyUsd)} in potential savings per shipment across ${plural(productsWithSavings, "product", "products")}`;
  return `${keepSupplierUsd > 0 ? `${lead}, ${wholeDollars(keepSupplierUsd)} of it from trade programs you may qualify for.` : `${lead}.`}${exemptions}`;
};

export const sourcingTeaser = (insights: Insights) => {
  if (!insights.savingsReady || !insights.totals.cheaperOrigins) return null;
  return `${plural(insights.totals.cheaperOrigins, "of your products has", "of your products have")} a country of origin with lower duty.`;
};
