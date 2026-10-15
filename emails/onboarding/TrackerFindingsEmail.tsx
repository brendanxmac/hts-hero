import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Panel, PlanStrip, Signature, Stats, Title, pct, usd } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { TRACKER_TIERS, TRIAL_ALLOWANCE } from "../../components/pricing-calculator/lib/pricing"

// The onboarding emails once imports are in, built from the account's own numbers (worked out on
// the server: libs/tariff-tracker/snapshot.ts). Value first, every time:
//   first_look       the morning after: what the Tracker found on their imports
//   savings_nudge    day 3, no savings check yet: their highest-duty import, and the free checks
//   audit_nudge      day 7, no audit yet: the rate changes behind possible overpayments
//   savings_used_up  the free savings checks are spent: what they found, what's left, a plan
//   audits_used_up   the free audit checks are spent: a plan for the rest
// Savings are always potential ("up to", "could", "if you qualify").

export type FindingsVariant = "first_look" | "savings_nudge" | "audit_nudge" | "savings_used_up" | "audits_used_up"

export interface FindingsNumbers {
  products: number
  countries: number
  valuesDefault: number
  dutyPerShipment: number
  averageRate: number
  changes12m: number
  productsHit12m: number
  biggestChange: { key: string; code: string; country: string; description: string; fromPct: number; toPct: number; date: string } | null
  topImport: { key: string; code: string; country: string; description: string; ratePct: number; dutyUsd: number } | null
  savingsUsd: number
  savingsProducts: number
  lockedSavingsUsd: number
  lockedSavingsProducts: number
}

export interface TrackerFindingsEmailProps {
  variant: FindingsVariant
  numbers: FindingsNumbers
  footer: EmailFooter
}

const day = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
const short = (description: string) => {
  const last = description.split(" › ").pop() ?? description
  return last.length > 70 ? `${last.slice(0, 67).trim()}…` : last
}
const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`

// The smallest plan that covers every import
const tierFor = (products: number) => TRACKER_TIERS.find((t) => t.maxPairs >= products) ?? TRACKER_TIERS[TRACKER_TIERS.length - 1]

const productUrl = (key: string, tab: string) => `/tariff-tracker?tab=catalog&product=${encodeURIComponent(key)}&ptab=${tab}`

export const trackerFindingsSubject = ({ variant, numbers: n }: TrackerFindingsEmailProps) => {
  switch (variant) {
    case "first_look":
      return `We checked your ${plural(n.products, "import")}: here's what we found`
    case "savings_nudge":
      return n.topImport ? `Your highest-duty import pays ${pct(n.topImport.ratePct)}` : "Check your imports for savings, free"
    case "audit_nudge":
      return `${plural(n.changes12m, "rate change")} hit your imports this year. Did you overpay?`
    case "savings_used_up":
      return n.savingsUsd > 0 ? `Your savings checks found up to ${usd(n.savingsUsd)} per shipment` : "You've used your free savings checks"
    case "audits_used_up":
      return "You've used your free audit checks"
  }
}

const Closing = ({ campaign }: { campaign: string }) => (
  <>
    <Signature />
    <PlanStrip campaign={campaign} />
  </>
)

export default function TrackerFindingsEmail({ variant, numbers: n, footer }: TrackerFindingsEmailProps) {
  const campaign = `onboarding-${variant.replace(/_/g, "-")}`
  const totalPotential = n.savingsUsd + n.lockedSavingsUsd
  const estimated = n.valuesDefault > 0 && n.valuesDefault === n.products

  if (variant === "first_look") {
    return (
      <EmailLayout preview={`${usd(n.dutyPerShipment)} in duty per shipment, ${plural(n.changes12m, "rate change")} this year, and where you could pay less.`} footer={footer}>
        <Eyebrow>Your first look</Eyebrow>
        <Title>We checked your {plural(n.products, "import")} against every US tariff in force</Title>
        <Stats
          items={[
            { label: "Duty per shipment", value: usd(n.dutyPerShipment), note: `${pct(n.averageRate)} on average` },
            { label: "Changes this year", value: n.changes12m.toLocaleString("en-US"), note: `on ${plural(n.productsHit12m, "import")}`, tone: n.changes12m ? "up" : undefined },
            ...(totalPotential > 0 ? [{ label: "Potential savings", value: `Up to ${usd(totalPotential)}`, note: "per shipment, if you qualify", tone: "down" as const }] : []),
          ]}
        />
        {n.biggestChange && (
          <Panel>
            <P small>
              <strong>The biggest change:</strong> {short(n.biggestChange.description)} from {n.biggestChange.country} went from {pct(n.biggestChange.fromPct)} to{" "}
              {pct(n.biggestChange.toPct)} on {day(n.biggestChange.date)}.
            </P>
          </Panel>
        )}
        {estimated && <P muted small>Worked out at $10,000 per import. Set your real values in the Tracker and every number becomes exact.</P>}
        <Cta href={siteLink("/tariff-tracker", campaign)} variant="next">
          See my dashboard
        </Cta>
        <Closing campaign={campaign} />
      </EmailLayout>
    )
  }

  if (variant === "savings_nudge") {
    const top = n.topImport
    return (
      <EmailLayout preview={`You have ${TRIAL_ALLOWANCE.savingsChecks} free savings checks. Start with the import that costs you most.`} footer={footer}>
        <Eyebrow tone="down">Where you could pay less</Eyebrow>
        <Title>{top ? `${short(top.description)} from ${top.country} pays ${pct(top.ratePct)}` : "Check your imports for savings"}</Title>
        <P>
          {top ? `That's ${usd(top.dutyUsd)} on every shipment. ` : ""}A savings check looks at one import for trade programs it could claim, exemptions worth
          checking, and countries that already make it for the US at a lower rate. You have {TRIAL_ALLOWANCE.savingsChecks} free.
        </P>
        {n.lockedSavingsUsd > 0 && (
          <Panel>
            <P small>
              Across your imports we already see <strong>up to {usd(n.lockedSavingsUsd)} per shipment</strong> in potential savings, on{" "}
              {plural(n.lockedSavingsProducts, "import")}. Checking one shows you exactly where, and what it takes.
            </P>
          </Panel>
        )}
        <Cta href={siteLink(top ? productUrl(top.key, "savings") : "/tariff-tracker?tab=catalog", campaign)} variant="next">
          {top ? "Check savings on this import" : "Check my imports"}
        </Cta>
        <Closing campaign={campaign} />
      </EmailLayout>
    )
  }

  if (variant === "audit_nudge") {
    return (
      <EmailLayout preview={`Rates on your imports changed ${plural(n.changes12m, "time")} this year. Entries around those dates are where overpayments hide.`} footer={footer}>
        <Eyebrow tone="heads-up">Past entries</Eyebrow>
        <Title>Did you pay the right duty on your past entries?</Title>
        <P>
          Rates on your imports changed {plural(n.changes12m, "time")} in the last 12 months
          {n.biggestChange ? `, including ${short(n.biggestChange.description)} from ${n.biggestChange.country} going from ${pct(n.biggestChange.fromPct)} to ${pct(n.biggestChange.toPct)} on ${day(n.biggestChange.date)}` : ""}
          . Entries filed around changes like these are where overpayments, and refunds you may be owed, hide.
        </P>
        <Checklist
          items={[
            "Enter what you paid on a past entry",
            "We check it against the duty in force on its entry date",
            "See a possible overpayment worth claiming back, or an underpayment to fix first",
          ]}
        />
        <P muted small>{TRIAL_ALLOWANCE.auditChecks} audit checks are free with your account.</P>
        <Cta href={siteLink("/tariff-tracker?tab=entries", campaign)} variant="next">
          Audit a past entry
        </Cta>
        <Closing campaign={campaign} />
      </EmailLayout>
    )
  }

  const tier = tierFor(n.products)
  if (variant === "savings_used_up") {
    return (
      <EmailLayout preview="What your checks found, what's left to check, and the plan that covers all your imports." footer={footer}>
        <Eyebrow tone="down">Your savings checks</Eyebrow>
        <Title>
          {n.savingsUsd > 0
            ? `Your checks found up to ${usd(n.savingsUsd)} per shipment in potential savings`
            : `You've used your ${TRIAL_ALLOWANCE.savingsChecks} free savings checks`}
        </Title>
        <Stats
          items={[
            { label: "Found so far", value: n.savingsUsd > 0 ? `Up to ${usd(n.savingsUsd)}` : "Nothing yet", note: `on ${plural(n.savingsProducts, "import")}`, tone: n.savingsUsd > 0 ? "down" : undefined },
            ...(n.lockedSavingsUsd > 0
              ? [{ label: "Still to check", value: `Up to ${usd(n.lockedSavingsUsd)}`, note: `on ${plural(n.lockedSavingsProducts, "more import")}`, tone: "down" as const }]
              : []),
          ]}
        />
        <P>
          A plan checks savings on every import it covers, keeps checking as rates change, and adds alerts on all of them. Your{" "}
          {plural(n.products, "import")} fit the <strong>up to {tier.maxPairs} imports</strong> plan at ${tier.price}/mo.
        </P>
        <Cta href={siteLink("/tariff-tracker?upgrade=savings", campaign)} variant="next">
          Check all my imports
        </Cta>
        <Signature />
      </EmailLayout>
    )
  }

  return (
    <EmailLayout preview="Keep checking past entries for overpayments, with every import covered." footer={footer}>
      <Eyebrow>Your audit checks</Eyebrow>
      <Title>You&apos;ve used your {TRIAL_ALLOWANCE.auditChecks} free audit checks</Title>
      <P>
        A plan audits every entry you log against the duty in force on its date, with no limit, and covers alerts and savings on your imports too. Your{" "}
        {plural(n.products, "import")} fit the <strong>up to {tier.maxPairs} imports</strong> plan at ${tier.price}/mo.
      </P>
      <Cta href={siteLink("/tariff-tracker?upgrade=entries", campaign)} variant="next">
        Keep auditing my entries
      </Cta>
      <Signature />
    </EmailLayout>
  )
}

TrackerFindingsEmail.PreviewProps = {
  variant: "first_look",
  numbers: {
    products: 22,
    countries: 16,
    valuesDefault: 22,
    dutyPerShipment: 51480,
    averageRate: 23.4,
    changes12m: 39,
    productsHit12m: 21,
    biggestChange: { key: "7326908688-DE", code: "7326.90.86.88", country: "Germany", description: "Other articles of iron or steel", fromPct: 12.9, toPct: 52.9, date: "2026-04-06" },
    topImport: { key: "7320205020-GB", code: "7320.20.50.20", country: "United Kingdom", description: "Helical springs › Helical springs, of wire", ratePct: 53.9, dutyUsd: 5390 },
    savingsUsd: 2500,
    savingsProducts: 2,
    lockedSavingsUsd: 22480,
    lockedSavingsProducts: 19,
  },
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies TrackerFindingsEmailProps
