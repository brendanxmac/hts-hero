import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing"
import type { AccountPitch } from "../calculator/ConversionDialog"

// "Get Tariff Alerts, Audits, & Savings" in the calculator: the pitch for what the Tariff Tracker
// does with an account (its 14-day trial, REVERSE_TRIAL). One promise for the headline, then the
// three things it sells: tariff alerts (the early heads-up and each import's rate change), tariff
// audits of every entry, and the savings finder (quick wins and sourcing changes). Savings are
// always "could" / "may". No amber urgency line: the points are the pitch.
// member: signed in, so the button gets them started: their imports into the Tracker (a line under
// the title says so)
export const insightsPitch = (member = false): AccountPitch => ({
  eyebrow: "US Tariff Intelligence",
  title: "Get Tariff Alerts & Audits, For All Your Imports",
  subtitle: member ? "Add your imports to get started." : undefined,
  points: [
    {
      icon: "bell",
      title: "Tariff Monitoring & Alerts",
      body: "Get an early heads-up when a tariff is announced, and an alert the moment one hits your imports. See the rate change and quickly review the impact with your team.",
    },
    {
      icon: "receipt",
      title: "Tariff Audits on Every Entry",
      body: "Have each entry checked against the duty in force on its date, to find duty you may have overpaid or underpaid.",
    },
    {
      icon: "money",
      title: "Import Savings Finder",
      body: "See potential quick wins like exemptions and trade programs you may qualify for, and sourcing changes that could lower your duty.",
    },
  ],
  hideNote: true,
  perk: `Free for ${REVERSE_TRIAL.days} days`,
  member,
  cta: member ? "Upload Your Imports" : "Create My Free Account",
})
