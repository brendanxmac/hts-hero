import { ALERT_TIERS, AUDIT_TIERS, formatPrice } from "@/components/pricing-calculator/lib/pricing"

// The one offer every home button leads with: Tariff Alerts and Tariff Audits, both paid (no trial),
// so "Get Started" goes to the pricing on the page. The Tariff Calculator stays free and keeps its
// own button
export const OFFER = {
  cta: "Get Started",
  note: `Tariff Alerts from ${formatPrice(ALERT_TIERS[0].price)}/mo and Tariff Audits from ${formatPrice(AUDIT_TIERS[0].price)}/mo. Set up in 30 seconds, cancel anytime. The Tariff Calculator stays free.`,
  href: "#pricing",
}
