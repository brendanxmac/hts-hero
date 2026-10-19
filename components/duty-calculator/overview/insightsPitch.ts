import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing"
import { COMING_LOWER } from "@/components/ui/marketing/comingSoon"
import { shortDate } from "../rate-history/format"
import type { AccountPitch } from "../calculator/ConversionDialog"
import { pct } from "./parts"
import { Overview } from "./useOverview"

// "Get Alerts, Insights & News" in the calculator: the free account's pitch. One promise for the
// headline, then the real reasons not to wait on this import (a change already scheduled, an
// AD/CVD case that may cover it, how often its duty has moved, news about it), then the three core
// benefits in its own numbers. Urgency comes only from real data. Sells only what's live (the
// Tracker MVP, features.ts: savings and audits are off): alerts and news with the 14-day trial
// (REVERSE_TRIAL), sourcing insights, with AD/CVD checks in the trial, and automatic savings detection named only
// with its "coming" label. Lower rates are always "could"; with
// nothing worked out yet, the same points without numbers.

export interface PitchExtras {
  // Tariff updates that may touch the import (the News tab's count)
  news?: number
  // An AD/CVD case or petition may cover it (null until known)
  adcvd?: boolean | null
}

export const insightsPitch = (o: Overview | null, { news = 0, adcvd = null }: PitchExtras = {}): AccountPitch => {
  // How much lower it could be from another of its big suppliers (sourcing intelligence, free with
  // an account); the Tracker's savings checks are off, so exemptions and programs aren't pitched
  const best = o?.cheaper?.[0] ? o.ratePct - o.cheaper[0].pct : 0
  const countries = o?.cheaper?.length ?? 0
  const scheduled = o?.scheduled
  const changes = o?.history ? o.changes : 0

  // The amber line under it: every real reason not to wait
  const urgency = [
    scheduled && `Rate change already scheduled for ${shortDate(scheduled.date, true)}`,
    adcvd && "An AD/CVD case may add duty on top of this estimate",
    changes > 0 && o?.history && `${changes} rate ${changes === 1 ? "change" : "changes"} since ${shortDate(o.history.fromDate, true)}`,
    news > 0 && `${news} tariff ${news === 1 ? "update" : "updates"} may touch it right now`,
  ].filter((x): x is string => Boolean(x))

  return {
    // One promise for the headline; this import's own facts follow in the amber line
    title: "Automate your US Tariff Intelligence",
    urgency: urgency.length ? urgency.slice(0, 3).join(" · ") : undefined,
    // The three core benefits: alerts and news (with the trial), sourcing insights, AD/CVD checks
    points: [
      {
        icon: "bell",
        title: "Alerts any time this import is affected",
        body: `By a new tariff, or in the news, with the rate before and after. The full Tariff Tracker free for ${REVERSE_TRIAL.days} days.`,
      },
      {
        icon: "globe",
        title: "Sourcing insights",
        body:
          best > 0.005
            ? `${countries} of its biggest supplier ${countries === 1 ? "country" : "countries"} could bring the rate up to ${pct(best)} lower. Automatic savings detection is ${COMING_LOWER}.`
            : `Its duty from every country of origin, to see where it could cost less. Automatic savings detection is ${COMING_LOWER}.`,
      },
      {
        icon: "shield",
        title: "Anti-dumping + countervailing detection",
        body: adcvd
          ? "An AD/CVD case may cover this import: see if it affects you, and the rates Commerce set."
          : "Know if an AD/CVD case may cover this import, and the rates Commerce set if it does.",
      },
    ],
    hideNote: true,
    cta: "Create My Free Account",
  }
}
