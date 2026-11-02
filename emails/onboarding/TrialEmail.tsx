import { Column, Row, Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, ReplyNote, Signature, Title } from "../kit/parts"
import { C, FONT_DISPLAY, M, siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"

// The reverse trial's emails (PRICING.md), from Brendan:
//   unlocked  existing accounts, once, when their fresh trial starts: everything is on
//   ending    3 days and 1 day before it ends: what the account is about to lose, in its numbers
//   ended     the day after: what it lost, and how to get it back
//   winback   about 7 and 14 days after: what's off on their imports, and the way back
// Loss first (TRIAL_LOSSES), then the plan that keeps everything, then what stays free.

export interface TrialEmailProps {
  variant: "unlocked" | "ending" | "ended" | "winback"
  // Days left (ending only)
  daysLeft?: number
  // "Oct 26"
  endsOn: string
  // Products in Duty Guard: all of them lose alerts on the free plan
  imports: number
  // Older queued messages carry it; not read any more
  losing?: number
  // New US tariff actions in the last 30 days (winback)
  actionsThisMonth?: number
  // Rate changes that hit the imports in the last 12 months, and how many imports they hit
  changes12m?: number
  productsHit12m?: number
  // The plan that keeps everything for this catalog, and its price
  plan?: { name?: string; imports: number; price: number } | null
  footer: EmailFooter
}

const count = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`

const when = (daysLeft?: number) => (!daysLeft || daysLeft <= 1 ? "tomorrow" : `in ${daysLeft} days`)

export const trialSubject = (p: TrialEmailProps) =>
  p.variant === "unlocked"
    ? `Everything in your Duty Guard is unlocked for ${REVERSE_TRIAL.days} days`
    : p.variant === "winback"
      ? "Overpayment and savings detection are off on your imports"
      : p.variant === "ending"
        ? `Your free trial ends ${when(p.daysLeft)}`
        : "You just lost duty overpayment detection & tariff alerts"

const CAMPAIGN = "reverse-trial"

// What goes, with a red cross per line
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
            {/* Off for now: bring back to show each line's detail
            <br />
            <span style={{ color: C.muted }}>{item.body}</span> */}
          </Text>
        </Column>
      </Row>
    ))}
  </Section>
)

interface Loss {
  title: string
  body?: string
}

// What the free plan doesn't have (PRICING.md): the same five lines in every trial email
export const TRIAL_LOSSES: Loss[] = [
  {
    title: "Tariff alerts on all your products",
    body: "Without them, changes can go unnoticed until you get the bill.",
  },
  { title: "Tariff impact checks on all your products", body: "See how each new tariff action hits each of your products." },
  {
    title: "AD/CVD alerts and updates on all your products",
    body: "A heads-up when an antidumping or countervailing duty case or new petition may cover one of your products, or its rates change.",
  },
  {
    title: "Overpayment detection on your Imports",
    body: "We will not longer flag possible over and underpayments.",
  },
  { title: "Automatic savings detection on all your products", body: "Trade programs, exemptions and lower-duty origins you may qualify for." },
]

// The price as what it costs per import: the plan's price over the imports it covers
const perImport = (plan: NonNullable<TrialEmailProps["plan"]>) => `$${(plan.price / plan.imports).toFixed(2)}`

const CostPerImport = ({ plan, lead }: { plan: NonNullable<TrialEmailProps["plan"]>; lead: string }) => (
  <Section className={M.box} style={{ backgroundColor: C.greenSoft, borderRadius: 18, padding: "20px", margin: "6px 0 14px" }}>
    <Text style={{ margin: 0, textAlign: "center", fontSize: 20, lineHeight: "24px", fontWeight: 700, color: C.text }}>{lead} for just:</Text>
    <Text style={{ margin: "12px 0 0", textAlign: "center", fontFamily: FONT_DISPLAY, fontSize: 40, lineHeight: "37px", fontWeight: 700, color: C.green }}>
      {perImport(plan)}
    </Text>
    <Text style={{ margin: "2px 0 0", textAlign: "center", fontSize: 14, lineHeight: "20px", fontWeight: 500, color: C.muted }}>per import, per month</Text>
    {/* <Text style={{ margin: "12px 0 0", textAlign: "center", fontSize: 14, lineHeight: "21px", color: C.text }}>
      It&apos;s like tiny insurance on every import: you hear about tariff changes and possible overpayments before they cost you, which could save you thousands.
    </Text> */}
    {/* <Text style={{ margin: "8px 0 0", textAlign: "center", fontSize: 13, lineHeight: "19px", color: C.muted }}>
      {plan.name ?? "Duty Guard Pro"} covers up to {plan.imports.toLocaleString("en-US")} imports for ${plan.price}/mo, with alerts, audits and savings detection included. Cancel anytime.
    </Text> */}
  </Section>
)

// What's off since the trial ended, most valuable first (the win-backs)
const WINBACK_LOSSES: Loss[] = [
  { title: "Overpayment detection on your entries" },
  { title: "Savings detection on all your imports" },
  { title: "Tariff alerts when a change hits your imports" },
  { title: "AD/CVD alerts when a case may cover your imports" },
]

const FREE_FOREVER =
  "Your whole catalog with its rate history and exports, Tariff News alerts on every new US tariff action, sourcing insights and AD/CVD checks on any product, and the Tariff Calculator."

export default function TrialEmail(p: TrialEmailProps) {
  const { variant, imports, actionsThisMonth = 0, changes12m = 0, productsHit12m = 0, plan, footer } = p
  const ended = variant === "ended" || variant === "winback"
  const keep = plan ? `${ended ? "Get it all back" : "Keep everything"}` : ended ? "Get it all back" : "Keep everything"

  if (variant === "unlocked") {
    return (
      <EmailLayout
        preview={`For the next ${REVERSE_TRIAL.days} days you get everything in Duty Guard. No credit card required.`}
        footer={footer}
      >
        <Eyebrow>Free for {REVERSE_TRIAL.days} days</Eyebrow>
        <Title>Duty Guard, Activated!</Title>
        <P>
          You free {REVERSE_TRIAL.days} day trial of Duty Guard Pro is now active. Here's what you now have access to until {p.endsOn}:
        </P>
        <Checklist
          items={[
            <>
              <strong>Automatic auditing and savings detection.</strong> Possible overpayments on your entries, and the programs
              and origins that could lower your duty.
            </>,
            <>
              <strong> Duty Insights.</strong> Where your duty comes from, what moved it, and your most exposed imports and countries.
            </>,
            <>
              <strong>Tariff alerts on every import.</strong> The day a tariff change hits one, with the rate before and after.
            </>,
            <>
              <strong>Tariff impact checks.</strong> Pick any tariff action and see exactly how it hits each import.
            </>,
            <>
              <strong>AD/CVD alerts.</strong> A heads-up when an antidumping or countervailing case or new petition may cover one of your imports, or its rates change.
            </>,
          ]}
        />
        <Cta href={siteLink("/duty-guard", CAMPAIGN)} variant="next">
          Open Duty Guard &rarr;
        </Cta>
        <P muted small>
          After {p.endsOn}, your account keeps {FREE_FOREVER.charAt(0).toLowerCase() + FREE_FOREVER.slice(1)}
        </P>
        <ReplyNote />
        <Signature />
      </EmailLayout>
    )
  }

  if (variant === "winback") {
    return (
      <EmailLayout
        preview={`Overpayment detection, savings detection and alerts are off.${plan ? ` Turn them back on for just ${perImport(plan)} per import, per month.` : ""}`}
        footer={footer}
      >
        <Eyebrow tone="heads-up">Since your trial ended</Eyebrow>
        <Title>What Your Imports Are Missing</Title>
        <P>Your catalog of {count(imports, "import")} is still here, free. But since your trial ended, here&apos;s what&apos;s off:</P>
        <Losses items={WINBACK_LOSSES} />
        {plan && <CostPerImport plan={plan} lead="Turn them all back on" />}
        <Cta href={siteLink("/duty-guard?upgrade=plan", CAMPAIGN)}>{keep}</Cta>
        {(actionsThisMonth > 0 || changes12m > 0) && (
          <P muted small>
            Tariffs keep moving: {actionsThisMonth > 0 && <>{count(actionsThisMonth, "new US tariff action")} in the last 30 days{changes12m > 0 ? ", and " : "."}</>}
            {changes12m > 0 && <>{count(changes12m, "tariff change")} hit {count(productsHit12m, "of your imports", "of your imports")} in the last 12 months.</>}
          </P>
        )}
        <ReplyNote />
        <Signature />
      </EmailLayout>
    )
  }

  return (
    <EmailLayout
      preview={
        ended
          ? "Tariff alerts, impact checks, savings and audits are off on your products. Here's how to get them back."
          : `On ${p.endsOn}, tariff alerts, impact checks, savings and audits stop on your products. Here's what changes.`
      }
      footer={footer}
    >
      <Eyebrow tone={ended ? "up" : "heads-up"}>{ended ? "Your free trial has ended" : `Your free trial ends ${when(p.daysLeft)}`}</Eyebrow>
      {/* <Title>{ended ? "Here's what your imports lost" : "Here's what you'll lose"}</Title> */}
      {/* A note from the founder first: a small business, not a billing system */}
      <P>
        Howdy! This is Brendan, founder of HTS Hero.{" "}
        {ended
          ? "I hope you had a chance to see how Duty Guard helps you avoid tariff surprises and overpayments on all your products. I wanted to let you know what's changed now that your free trial is over."
          : "I hope you've had a chance to see how Duty Guard helps you avoid tariff surprises and overpayments on all your products. I wanted to give you a heads-up before your free trial wraps up."}
      </P>
      <P>
        {ended
          ? `Your trial ended on ${p.endsOn}. Your whole catalog stays free, but here's what turned off:`
          : `On ${p.endsOn}, your catalog stays free, but here's what turns off:`}
      </P>
      <Losses items={TRIAL_LOSSES} />

      {plan && <CostPerImport plan={plan} lead={ended ? "Get it all back" : "Keep everything"} />}
      <Cta href={siteLink("/duty-guard?upgrade=plan", CAMPAIGN)}>{keep}</Cta>
      {changes12m > 0 && (
        <P small>
          For a sense of what&apos;s at stake: {count(changes12m, "tariff change")} hit {count(productsHit12m, "of your products", "of your products")} in the last 12
          months.
        </P>
      )}
      <ReplyNote />
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
  plan: { name: "Duty Guard Pro 100", imports: 100, price: 149 },
  footer: {
    reason: "You're getting this because you have an HTS Hero account.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies TrialEmailProps
