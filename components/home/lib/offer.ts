import config from "@/config"
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing"
import { FREE_FOREVER_LINE } from "@/components/ui/marketing/comingSoon"

// The one offer every hero leads with: the Tracker's 14-day reverse trial (REVERSE_TRIAL), then what
// stays free forever (Tariff News alerts, sourcing insights; no alerts on the
// account's own imports), with the free calculator behind it
export const OFFER = {
  cta: `Try it free for ${REVERSE_TRIAL.days} days`,
  note: `Everything the Tariff Tracker does, on up to ${REVERSE_TRIAL.imports} imports, free for ${REVERSE_TRIAL.days} days. No credit card. ${FREE_FOREVER_LINE}`,
  href: config.auth.loginUrl,
}
