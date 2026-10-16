import config from "@/config"
import {
  TRIAL_ALLOWANCE,
} from "@/components/pricing-calculator/lib/pricing"

// The one offer every hero leads with: the Tracker's free imports, with the free calculator behind it
export const OFFER = {
  cta: `Try it Free!`,
  note: `Upload your whole catalog and track ${TRIAL_ALLOWANCE.alertImports} imports free, with alerts and impact checks. No credit card required.`,
  href: config.auth.loginUrl,
}
