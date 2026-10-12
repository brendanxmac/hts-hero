import config from "@/config"
import {
  TRIAL_DAYS,
  TRIAL_PAIRS,
} from "@/components/pricing-calculator/lib/pricing"

// The one offer every hero leads with: the 14-day Tracker trial, with the free calculator behind it
export const OFFER = {
  cta: `Try it Free!`,
  note: `Track up to ${TRIAL_PAIRS} products with alerts, history and audits, free for ${TRIAL_DAYS} days. No credit card required.`,
  href: config.auth.loginUrl,
}
