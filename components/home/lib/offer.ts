import { TRY_FREE_HREF } from "@/components/tariff-tracker/access/signup"
import { REVERSE_TRIAL, TRY_IT_FREE } from "@/components/pricing-calculator/lib/pricing"
import { FREE_FOREVER_LINE } from "@/components/ui/marketing/comingSoon"

// The one offer every hero leads with: the Tracker's 14-day reverse trial (REVERSE_TRIAL), then what
// stays free forever (alerts on TRIAL_ALLOWANCE.alertImports of the account's imports, Tariff News
// alerts, sourcing insights), with the free calculator behind it
export const OFFER = {
  cta: TRY_IT_FREE,
  note: `Everything the Tariff Tracker does, on up to ${REVERSE_TRIAL.imports} imports, free for ${REVERSE_TRIAL.days} days. No credit card. ${FREE_FOREVER_LINE}`,
  href: TRY_FREE_HREF,
}
