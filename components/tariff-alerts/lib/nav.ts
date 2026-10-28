import type { SalesLink } from "@/components/ui/marketing/SalesHeader";

// Every "get alerts" button on /tariff-alerts goes to the plans: the price is the next thing to see,
// and the plans are where you buy (2026-10-28)
export const PRICING_HREF = "#pricing";

// The /tariff-alerts header: its sections, in page order, and its main button
export const ALERTS_NAV: SalesLink[] = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#sources", label: "Our Sources" },
  { href: "#faq", label: "FAQ" },
];
export const ALERTS_HEADER_CTA = { href: PRICING_HREF, label: "Get Alerts" };
