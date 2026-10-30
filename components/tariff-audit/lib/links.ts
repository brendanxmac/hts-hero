import { signupHref } from "@/components/tariff-tracker/access/signup"
import { entryHref } from "@/libs/signup-onboarding"
import { sectionUrl } from "@/components/tariff-tracker"
import type { SalesCta, SalesLink } from "@/components/ui/marketing/SalesHeader"
import { bookCallHref } from "@/libs/book-call"

// Where the audit page's calls to action go. A self-audit runs in the Tracker's Entries section,
// free during the account's 14-day trial, then on a paid plan (PRICING.md); signing up
// lands there.
export const SELF_AUDIT_URL = sectionUrl("entries")
export const SIGN_UP_TO_AUDIT = signupHref(SELF_AUDIT_URL)
export const REQUEST_ANCHOR = "#request"

// A historical (one-time) audit of past entries is sold on a call; the booking says so
export const HISTORICAL_AUDIT_HREF = bookCallHref({
  source: "tariff-audit",
  campaign: "historical-audit",
  context:
    "Historical audit of past entries, from the Duty Audits page (htshero.com/duty-audits)",
})

// The page's header: its sections, in page order, and its main button
export const AUDIT_NAV: SalesLink[] = [
  { href: "#keep-100", label: "Keep 100%" },
  { href: "#instant-results", label: "Instant Results" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
]
export const AUDIT_HEADER_CTA: SalesCta = {
  href: entryHref("audits_page"),
  label: "Start Free Trial",
  entry: { page: "duty-audits", from: "audits_page" },
}
