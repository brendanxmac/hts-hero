import type { SalesCta, SalesLink } from "@/components/ui/marketing/SalesHeader";

import { entryHref } from "@/libs/signup-onboarding";

// The plans on the page (the nav's Pricing). Every button starts the week-long free trial
// instead: sign up, then the onboarding (2026-10-30)
export const PRICING_HREF = "#pricing";

// The /tariff-alerts header: its sections, in page order, and its main button
export const ALERTS_NAV: SalesLink[] = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#sources", label: "Our Sources" },
  { href: "#faq", label: "FAQ" },
];
export const ALERTS_HEADER_CTA: SalesCta = { href: entryHref("alerts_page"), label: "Start Free Trial", entry: { page: "tariff-alerts", from: "alerts_page" } };
