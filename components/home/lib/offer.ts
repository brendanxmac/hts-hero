import { signupHref } from "@/components/tariff-tracker/access/signup"
import { ONBOARDING_PATH } from "@/libs/signup-onboarding"
import {
  ALERT_TIERS,
  formatPrice,
  REVERSE_TRIAL,
} from "@/components/pricing-calculator/lib/pricing"

// The one offer the hero and closing buttons lead with: a free account (/signup), then straight
// into the sign-up onboarding (/onboarding), like every button on the page (EntryCta). The Tariff Calculator keeps its own button
export const OFFER = {
  cta: "Get Started Free",
  note: `Try Tariff Alerts and Duty Audits free for ${REVERSE_TRIAL.days} days, no credit card. Then from ${formatPrice(ALERT_TIERS[0].price)}/mo. Set up in 30 seconds. The Tariff Calculator stays free.`,
  // Also the country calculator pages' button (no homepage section)
  href: signupHref(ONBOARDING_PATH),
}

// The homepage's buttons: where they start (libs/signup-onboarding.ts)
export { HOME_SECTIONS, type HomeSection } from "@/libs/signup-onboarding"
