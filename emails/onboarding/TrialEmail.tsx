import { Column, Row, Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { C, siteLink, TONES } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"
import { SAVINGS_AUDITS_LABEL } from "../../libs/tariff-tracker/features"

// The 14-day reverse trial's emails (PRICING.md), from Brendan:
//   unlocked  existing accounts, once, when their fresh 14 days start: everything is on
//   ending    3 days and 1 day before it ends: what the account is about to lose, in its numbers
//   ended     the day after: what it lost, and how to get it back
// Loss first (TRIAL_LOSSES: alerts, impact checks and AD/CVD alerts on all their imports, and
// auditing and savings detection, labeled until they launch), then the plan that keeps everything
// at its launch price while that lasts, then what stays free. No numbers on the loss.

export interface TrialEmailProps {
  variant: "unlocked" | "ending" | "ended"
  // Days left (ending only)
  daysLeft?: number
  // "Oct 26"
  endsOn: string
  // Imports in the Tracker, and those that lose alerts on the free plan (all of them since
  // 2026-10-18; kept for messages already queued)
  imports: number
  losing?: number
  // Rate changes that hit the imports in the last 12 months, and how many imports they hit
  changes12m?: number
  productsHit12m?: number
  // The plan that keeps everything for this catalog, and its price
  plan?: { imports: number; price: number } | null
  // "Nov 13" while launch pricing lasts
  launchEndsDay?: string | null
  footer: EmailFooter
}

const count = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`

const when = (daysLeft?: number) => (!daysLeft || daysLeft <= 1 ? "tomorrow" : `in ${daysLeft} days`)

export const trialSubject = (p: TrialEmailProps) =>
  p.variant === "unlocked"
    ? `Everything in your Tariff Tracker is unlocked for ${REVERSE_TRIAL.days} days`
    : p.variant === "ending"
      ? `Your free trial ends ${when(p.daysLeft)}: your imports lose tariff alerts`
      : "Your imports just lost their tariff alerts"

const CAMPAIGN = "reverse-trial"

// What goes, with a red cross per line (and the label on what hasn't launched yet)
const Losses = ({ items }: { items: Loss[] }) => (
  <Section style={{ margin: "4px 0 18px" }}>
    {items.map((item) => (
      <Row key={item.title} style={{ marginBottom: 10 }}>
        <Column style={{ width: 26, verticalAlign: "top" }}>
          <Text style={{ margin: 0, fontSize: 15, lineHeight: "22px", fontWeight: 700, color: C.red }}>✕</Text>
        </Column>
        <Column style={{ verticalAlign: "top" }}>
          <Text style={{ margin: 0, fontSize: 15, lineHeight: "22px", color: C.text }}>
            <strong>{item.title}</strong>
            {item.soon && (
              <span
                style={{
                  marginLeft: 6,
                  padding: "1px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  color: TONES["heads-up"].fg,
                  backgroundColor: TONES["heads-up"].bg,
                }}
              >
                {SAVINGS_AUDITS_LABEL}
              </span>
            )}
            <br />
            <span style={{ color: C.muted }}>{item.body}</span>
          </Text>
        </Column>
      </Row>
    ))}
  </Section>
)

interface Loss {
  title: string
  body: string
  soon?: boolean
}

// What the free plan doesn't have (PRICING.md): the same five lines in every trial email
export const TRIAL_LOSSES: Loss[] = [
  {
    title: "Tariff alerts on all your imports",
    body: "The day a new tariff hits one of your imports, with the rate before and after. Without them, a change could go unnoticed until it's on your customs bill.",
  },
  { title: "Tariff impact checks on all your imports", body: "Exactly how each new tariff action hits each of your imports." },
  {
    title: "AD/CVD alerts and updates on all your imports",
    body: "A heads-up when an antidumping or countervailing duty case or new petition may cover one of your imports, or its rates change. Checking an import for cases stays free.",
  },
  {
    title: "Automatic auditing on your imports",
    body: "Every entry checked against the duty in force on its date, flagging possible over and underpayments.",
    soon: true,
  },
  { title: "Automatic savings detection on all your imports", body: "Trade programs, exemptions and lower-duty origins your imports may qualify for.", soon: true },
]

const FREE_FOREVER =
  "Tariff News alerts on every new US tariff action, sourcing insights and AD/CVD checks on any import, your whole catalog with its rate history and exports, and the Tariff Calculator."

export default function TrialEmail(p: TrialEmailProps) {
  const { variant, imports, changes12m = 0, productsHit12m = 0, plan, launchEndsDay, footer } = p
  const ended = variant === "ended"
  const keep = plan ? `${ended ? "Get it all back" : "Keep everything"} · $${plan.price}/mo` : ended ? "Get it all back" : "Keep everything"

  if (variant === "unlocked") {
    return (
      <EmailLayout
        preview={`For the next ${REVERSE_TRIAL.days} days you get everything in the Tariff Tracker, on up to ${REVERSE_TRIAL.imports} imports. No card needed.`}
        footer={footer}
      >
        <Eyebrow>Free for {REVERSE_TRIAL.days} days</Eyebrow>
        <Title>Everything in your Tariff Tracker is unlocked</Title>
        <P>
          Starting today, your account gets the full Tariff Tracker for {REVERSE_TRIAL.days} days, on up to {REVERSE_TRIAL.imports} imports. Nothing to start and no card
          needed. It ends on {p.endsOn}.
        </P>
        <Checklist
          items={[
            <>
              <strong>Tariff alerts on every import.</strong> The day a tariff change hits one, with the rate before and after.
            </>,
            <>
              <strong>Tariff impact checks.</strong> Pick any tariff action and see exactly how it hits each import.
            </>,
            <>
              <strong>AD/CVD alerts.</strong> A heads-up when an antidumping or countervailing case or new petition may cover one of your imports, or its rates change.
            </>,
            <>
              <strong>Insights.</strong> Where your duty comes from, what moved it, and your most exposed imports and countries.
            </>,
            <>
              <strong>Automatic auditing and savings detection</strong> ({SAVINGS_AUDITS_LABEL.toLowerCase()}). Possible overpayments on your entries, and the programs
              and origins that could lower your duty.
            </>,
          ]}
        />
        <Cta href={siteLink(imports > 0 ? "/tariff-tracker" : "/tariff-tracker?tab=catalog", CAMPAIGN)} variant="next">
          {imports > 0 ? `Open my Tracker (${count(imports, "import")})` : "Add my imports"}
        </Cta>
        <P muted small>
          After {p.endsOn}, your account keeps {FREE_FOREVER.charAt(0).toLowerCase() + FREE_FOREVER.slice(1)}
        </P>
        <Signature />
      </EmailLayout>
    )
  }

  return (
    <EmailLayout
      preview={
        ended
          ? "Tariff alerts, AD/CVD alerts and impact checks are off on your imports. Here's how to get them back."
          : `On ${p.endsOn}, tariff alerts, AD/CVD alerts and impact checks stop on your imports. Here's what changes.`
      }
      footer={footer}
    >
      <Eyebrow tone={ended ? "up" : "heads-up"}>{ended ? "Your free trial has ended" : `Your free trial ends ${when(p.daysLeft)}`}</Eyebrow>
      {/* <Title>{ended ? "Here's what your imports lost" : "Here's what you'll lose"}</Title> */}
      {/* A note from the founder first: a small business, not a billing system */}
      <P>
        Howdy! This is Brendan, founder of HTS Hero.{" "}
        {ended
          ? "I hope you had a chance to see how Tariff Tracker helps you avoid tariff surprises and overpayments on all your imports. I wanted to let you know what's changed now that your free trial is over."
          : "I hope you've had a chance to see how Tariff Tracker helps you avoid tariff surprises and overpayments on all your imports. I wanted to give you a heads-up before your free trial wraps up."}
      </P>
      <P>
        {ended
          ? `Your ${REVERSE_TRIAL.days}-day trial ended on ${p.endsOn}, and your account moved to the free plan. Here's what that turned off:`
          : `On ${p.endsOn}, your account moves to the free plan. Here's what that turns off:`}
      </P>
      <Losses items={TRIAL_LOSSES} />
      {imports > 0 && changes12m > 0 && (
        <P small>
          For a sense of what&apos;s at stake: {count(changes12m, "tariff change")} hit {count(productsHit12m, "of your imports", "of your imports")} in the last 12
          months.
        </P>
      )}
      {imports === 0 && (
        <P small>You haven&apos;t added any imports yet. Paste your HTS codes and countries and the Tracker shows every tariff on each one, in about a minute.</P>
      )}

      <Cta href={siteLink(imports === 0 ? "/tariff-tracker?tab=catalog" : "/tariff-tracker?upgrade=plan", CAMPAIGN)} variant={imports === 0 ? "next" : "primary"}>
        {imports === 0 ? "Add my imports" : keep}
      </Cta>
      {imports > 0 && plan && (
        <P muted small>
          That&apos;s just <strong style={{ color: C.green }}>${(Math.round((plan.price / plan.imports) * 100) / 100).toFixed(2)} per import</strong>, per month. Tracker{" "}
          {plan.imports.toLocaleString("en-US")} covers up to {plan.imports.toLocaleString("en-US")} imports, with auditing and savings detection included when they
          arrive.
          {launchEndsDay ? ` It's a launch price: subscribe by ${launchEndsDay} and it's yours for as long as you stay subscribed. Prices go up after that.` : ""} Cancel
          anytime.
        </P>
      )}

      <Signature />
    </EmailLayout>
  )
}

TrialEmail.PreviewProps = {
  variant: "ending",
  daysLeft: 3,
  endsOn: "Nov 3",
  imports: 48,
  changes12m: 17,
  productsHit12m: 21,
  plan: { imports: 100, price: 89 },
  launchEndsDay: "Nov 13",
  footer: {
    reason: "You're getting this because you have an HTS Hero account.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies TrialEmailProps
