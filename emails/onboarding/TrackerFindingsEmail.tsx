import { EmailFooter, EmailLayout } from "../kit/Layout"
import { AlertSample, Checklist, Cta, Eyebrow, P, Panel, PlanStrip, Signature, Stats, Title, pct, usd } from "../kit/parts"
import { Link } from "@react-email/components"
import { C, siteLink } from "../kit/brand"
import { TRACKER_TIERS, TRIAL_ALLOWANCE } from "../../components/pricing-calculator/lib/pricing"

// The onboarding emails once imports are in, built from the account's own numbers (worked out on
// the server: libs/tariff-tracker/snapshot.ts) and the tariff actions that hit them
// (tariff_update_impacts). Alerts are on from the first import (alertPrefs.ts); each email leads
// to the next activation step, in order: a savings check, then an entry audit. Value first:
//   first_look       the morning after: what the Tracker found, that alerts are on for these
//                    imports (an alert drawn with their own numbers); the button is savings
//   savings_nudge    no savings check yet: the import with the most potential savings
//   audit_nudge      no audit yet: the rate change behind possible overpayments, on that import
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
  // The import with the most potential savings (locked: not checked yet, so its program stays unsaid)
  topSaving?: { key: string; code: string; country: string; description: string; usd: number; title: string; kind: string; locked: boolean } | null
  savingsUsd: number
  savingsProducts: number
  lockedSavingsUsd: number
  lockedSavingsProducts: number
}

// The published tariff actions of the last `days` that hit the account's imports, confirmed or
// likely (tariff_update_impacts), and the biggest one
export interface AlertStakes {
  days: number
  actions: number
  imports: number
  // What the confirmed ones add to one shipment of each import hit, rises only
  extraUsd: number
  top: {
    key: string
    code: string
    country: string
    updateTitle: string
    updateSlug: string
    level: "confirmed" | "likely"
    beforePct: number | null
    afterPct: number | null
    deltaUsd: number | null
  } | null
}

export interface TrackerFindingsEmailProps {
  variant: FindingsVariant
  numbers: FindingsNumbers
  // Whether the account set up where its alerts go (the Tracker's Alerts section)
  alertsOn?: boolean
  stakes?: AlertStakes | null
  footer: EmailFooter
}

const day = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
const short = (description: string) => {
  const last = description.split(" › ").pop() ?? description
  return last.length > 70 ? `${last.slice(0, 67).trim()}…` : last
}
// "Other valves (8481.80.40.90)": HTS descriptions often start "Other", so the code goes with it
const named = (description: string, code: string) => `${short(description)} (${code})`
const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`
const months = (days: number) => (days % 30 === 0 ? `${days / 30} months` : `${days} days`)

// The smallest plan that covers every import
const tierFor = (products: number) => TRACKER_TIERS.find((t) => t.maxPairs >= products) ?? TRACKER_TIERS[TRACKER_TIERS.length - 1]

// Where each step lands in the Tracker
const ALERTS_URL = "/tariff-tracker?tab=alerts"
const productUrl = (key: string, tab: string) => `/tariff-tracker?tab=catalog&product=${encodeURIComponent(key)}&ptab=${tab}`

const hitBy = (s: AlertStakes | null | undefined): s is AlertStakes => !!s && s.imports > 0

export const trackerFindingsSubject = ({ variant, numbers: n }: TrackerFindingsEmailProps) => {
  switch (variant) {
    case "first_look":
      return `We checked your ${plural(n.products, "import")}: here's what we found`
    case "savings_nudge":
      if (n.topSaving) return `Your import from ${n.topSaving.country} may qualify for up to ${usd(n.topSaving.usd)} less duty per shipment`
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

// An alert drawn with the account's own numbers: the biggest action that hit them lately, else
// its biggest rate change this year, else an example
const OwnAlert = ({ n, stakes }: { n: FindingsNumbers; stakes?: AlertStakes | null }) => {
  if (hitBy(stakes) && stakes.top) {
    const t = stakes.top
    return <AlertSample label="Your imports, a recent action" updateTitle={t.updateTitle} code={t.code} country={t.country} beforePct={t.beforePct} afterPct={t.afterPct} />
  }
  if (n.biggestChange) {
    const b = n.biggestChange
    return (
      <AlertSample
        label={`What you'd have got on ${day(b.date)}`}
        updateTitle={`Rate change on your imports, effective ${day(b.date)}`}
        code={b.code}
        country={b.country}
        description={short(b.description)}
        beforePct={b.fromPct}
        afterPct={b.toPct}
      />
    )
  }
  return null
}

export default function TrackerFindingsEmail({ variant, numbers: n, alertsOn = true, stakes, footer }: TrackerFindingsEmailProps) {
  const campaign = `onboarding-${variant.replace(/_/g, "-")}`
  const totalPotential = n.savingsUsd + n.lockedSavingsUsd
  const estimated = n.valuesDefault > 0 && n.valuesDefault === n.products
  const alertSlots = TRIAL_ALLOWANCE.alertImports

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
        {hitBy(stakes) ? (
          <Panel>
            <P small>
              <strong>
                In the last {months(stakes.days)}, {plural(stakes.actions, "US tariff action")} hit {plural(stakes.imports, "of your imports", "of your imports")}
              </strong>
              {stakes.top && stakes.top.beforePct !== null && stakes.top.afterPct !== null && stakes.top.beforePct !== stakes.top.afterPct
                ? `; the biggest moved ${stakes.top.code} (${stakes.top.country}) from ${pct(stakes.top.beforePct)} to ${pct(stakes.top.afterPct)}.`
                : "."}
            </P>
          </Panel>
        ) : (
          n.biggestChange && (
            <Panel>
              <P small>
                <strong>The biggest change:</strong> {short(n.biggestChange.description)} from {n.biggestChange.country} went from {pct(n.biggestChange.fromPct)} to{" "}
                {pct(n.biggestChange.toPct)} on {day(n.biggestChange.date)}.
              </P>
            </Panel>
          )
        )}
        {estimated && <P muted small>Worked out at $10,000 per import. Set your real values in the Tracker and every number becomes exact.</P>}
        {alertsOn ? (
          <>
            <P>
              <strong>Alerts are on for {n.products > alertSlots ? `${alertSlots} of these imports` : "these imports"}.</strong> When a tariff action hits one, we
              email you the rate before and after and what it adds to each shipment.
              {(hitBy(stakes) && stakes.top) || n.biggestChange ? " Here's what one looks like, with your numbers:" : ""}
            </P>
            <OwnAlert n={n} stakes={stakes} />
            <P muted small>
              Want them in Slack or Teams too, or only some kinds of update?{" "}
              <Link href={siteLink(ALERTS_URL, campaign)} style={{ color: C.cobalt, fontWeight: 600 }}>
                Choose where alerts go
              </Link>
            </P>
          </>
        ) : null}
        {n.topSaving ? (
          <>
            <P>
              <strong>Next: check savings.</strong> {named(n.topSaving.description, n.topSaving.code)} from {n.topSaving.country} may qualify for up to {usd(n.topSaving.usd)} less duty
              per shipment. One free check shows you how.
            </P>
            <Cta href={siteLink(productUrl(n.topSaving.key, "savings"), campaign)} variant="next">
              Check savings on this import
            </Cta>
          </>
        ) : (
          <Cta href={siteLink("/tariff-tracker", campaign)} variant="next">
            See my dashboard
          </Cta>
        )}
        <Closing campaign={campaign} />
      </EmailLayout>
    )
  }

  if (variant === "savings_nudge") {
    const top = n.topImport
    const saving = n.topSaving
    if (saving) {
      return (
        <EmailLayout preview={`Up to ${usd(saving.usd)} less duty per shipment, if it qualifies. You have ${TRIAL_ALLOWANCE.savingsChecks} free savings checks.`} footer={footer}>
          <Eyebrow tone="down">Where you could pay less</Eyebrow>
          <Title>
            {named(saving.description, saving.code)} from {saving.country} may qualify for up to {usd(saving.usd)} less duty per shipment
          </Title>
          <P>
            A savings check looks at one import for trade programs it could claim, exemptions worth checking, and countries that already make it for the US at a
            lower rate, and tells you what each one takes. You have {TRIAL_ALLOWANCE.savingsChecks} free; this import is the one to start with.
          </P>
          {n.lockedSavingsUsd > saving.usd && (
            <Panel>
              <P small>
                Across all your imports we see <strong>up to {usd(n.lockedSavingsUsd)} per shipment</strong> in potential savings, on{" "}
                {plural(n.lockedSavingsProducts, "import")}.
              </P>
            </Panel>
          )}
          <Cta href={siteLink(productUrl(saving.key, "savings"), campaign)} variant="money">
            Check savings on this import
          </Cta>
          <Closing campaign={campaign} />
        </EmailLayout>
      )
    }
    return (
      <EmailLayout preview={`You have ${TRIAL_ALLOWANCE.savingsChecks} free savings checks. Start with the import that costs you most.`} footer={footer}>
        <Eyebrow tone="down">Where you could pay less</Eyebrow>
        <Title>{top ? `${named(top.description, top.code)} from ${top.country} pays ${pct(top.ratePct)}` : "Check your imports for savings"}</Title>
        <P>
          {top ? `That's ${usd(top.dutyUsd)} on every shipment. ` : ""}A savings check looks at one import for trade programs it could claim, exemptions worth
          checking, and countries that already make it for the US at a lower rate. You have {TRIAL_ALLOWANCE.savingsChecks} free.
        </P>
        <Cta href={siteLink(top ? productUrl(top.key, "savings") : "/tariff-tracker?tab=catalog", campaign)} variant="money">
          {top ? "Check savings on this import" : "Check my imports"}
        </Cta>
        <Closing campaign={campaign} />
      </EmailLayout>
    )
  }

  if (variant === "audit_nudge") {
    const b = n.biggestChange
    const target = b?.key ?? n.topImport?.key
    return (
      <EmailLayout preview={`Rates on your imports changed ${plural(n.changes12m, "time")} this year. Entries around those dates are where overpayments hide.`} footer={footer}>
        <Eyebrow tone="heads-up">Past entries</Eyebrow>
        <Title>Did you pay the right duty on your past entries?</Title>
        <P>
          Rates on your imports changed {plural(n.changes12m, "time")} in the last 12 months
          {b ? `, including ${named(b.description, b.code)} from ${b.country} going from ${pct(b.fromPct)} to ${pct(b.toPct)} on ${day(b.date)}` : ""}. Entries filed
          around changes like these are where overpayments, and refunds you may be owed, hide.
        </P>
        <Checklist
          items={[
            "Enter what you paid on a past entry",
            "We check it against the duty in force on its entry date",
            "See a possible overpayment worth claiming back, or an underpayment to fix first",
          ]}
        />
        <P muted small>{TRIAL_ALLOWANCE.auditChecks} audit checks are free with your account.</P>
        <Cta href={siteLink(target ? productUrl(target, "audit") : "/tariff-tracker?tab=catalog", campaign)} variant="next">
          {b ? "Audit an entry of this import" : "Audit a past entry"}
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
    topSaving: { key: "8481804090-CN", code: "8481.80.40.90", country: "China", description: "Taps, cocks, valves › Other valves", usd: 2500, title: "Exclusion", kind: "exclusion", locked: true },
    savingsUsd: 2500,
    savingsProducts: 2,
    lockedSavingsUsd: 22480,
    lockedSavingsProducts: 19,
  },
  alertsOn: true,
  stakes: {
    days: 90,
    actions: 3,
    imports: 7,
    extraUsd: 9200,
    top: { key: "7326908688-DE", code: "7326.90.86.88", country: "Germany", updateTitle: "Section 232 steel derivatives: more products added", updateSlug: "example", level: "confirmed", beforePct: 12.9, afterPct: 52.9, deltaUsd: 4000 },
  },
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies TrackerFindingsEmailProps
