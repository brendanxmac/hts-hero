import type { SalesCta, SalesLink } from "@/components/ui/marketing/SalesHeader";
import { entryHref } from "@/libs/signup-onboarding";
import { MAIN_CTA } from "./copy";

// The header's links to the page's sections, and its button
export const PRICING_NAV: SalesLink[] = [
  { href: "#calculator", label: "Calculator" },
  { href: "#free", label: "Free" },
  { href: "#plans", label: "Plans" },
  { href: "#trial", label: "Free Trial" },
  { href: "#compare", label: "Compare" },
  { href: "#faq", label: "FAQ" },
  { href: "#classification", label: "Classification", wide: true },
  { href: "#managed", label: "Managed", wide: true },
];

export const PRICING_HEADER_CTA: SalesCta = { href: entryHref("pricing_page"), label: MAIN_CTA, entry: { page: "pricing", from: "pricing_page" } };
