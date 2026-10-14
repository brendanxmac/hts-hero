import config from "@/config"
import {
  TRIAL_ALLOWANCE,
} from "@/components/pricing-calculator/lib/pricing"

// The one offer every hero leads with: the Tracker's free usage-based trial, with the free calculator behind it
export const OFFER = {
  cta: `Try it Free!`,
  note: `Upload your whole catalog, check ${TRIAL_ALLOWANCE.savingsChecks} imports for savings and get ${TRIAL_ALLOWANCE.auditChecks} free audit checks. No credit card required.`,
  href: config.auth.loginUrl,
}
