import { Column, Row, Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { C, siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"

// The reverse trial's emails (PRICING.md), from Brendan:
//   unlocked  existing accounts, once, when their fresh trial starts: everything is on
//   ending    3 days and 1 day before it ends: what the account is about to lose, in its numbers
//   ended     the day after: what it lost, and how to get it back
//   winback   about 7 and 14 days after: the tariff actions since, and the way back
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

// "12 of your products lose…"
const whatGoes = (p: Pick<TrialEmailProps, "imports">, ended: boolean) => {
  if (!p.imports) return ended ? "alerts, savings and audits are off" : "alerts, savings and audits stop"
  return `${count(p.imports, "of your products", "of your products")} ${ended ? "just lost" : p.imports === 1 ? "loses" : "lose"} tariff alerts`
}

export const trialSubject = (p: TrialEmailProps) =>
  p.variant === "unlocked"
    ? `Everything in your Duty Guard is unlocked for ${REVERSE_TRIAL.days} days`
    : p.variant === "winback"
      ? p.actionsThisMonth
        ? `${p.actionsThisMonth} tariff actions since your trial. Are your products covered?`
        : "Your products have no tariff alerts on them"
      : p.variant === "ending"
      ? `Your free trial ends ${when(p.daysLeft)}: ${whatGoes(p, false)}`
      : `Your free trial ended: ${whatGoes(p, true)}`

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
}

// What the free plan doesn't have (PRICING.md): the same five lines in every trial email
export const TRIAL_LOSSES: Loss[] = [
  {
    title: "Tariff alerts on all your products",
    body: "The day a new tariff hits one of your products, with the rate before and after. Without them, a change could go unnoticed until it's on your customs bill.",
  },
  { title: "Tariff impact checks on all your products", body: "Exactly how each new tariff action hits each of your products." },
  {
    title: "AD/CVD alerts and updates on all your products",
    body: "A heads-up when an antidumping or countervailing duty case or new petition may cover one of your products, or its rates change. Checking a product for cases stays free.",
  },
  {
    title: "Automatic auditing on your products",
    body: "Every entry checked against the duty in force on its date, flagging possible over and underpayments.",
  },
  { title: "Automatic savings detection on all your products", body: "Trade programs, exemptions and lower-duty origins your products may qualify for." },
]

const FREE_FOREVER =
  "Your whole catalog with its rate history and exports, Tariff News alerts on every new US tariff action, sourcing insights and AD/CVD checks on any product, and the Tariff Calculator."

export default function TrialEmail(p: TrialEmailProps) {
  const { variant, imports, changes12m = 0, productsHit12m = 0, plan, footer } = p
  const ended = variant === "ended" || variant === "winback"
  const keep = plan ? `${ended ? "Get it all back" : "Keep everything"} · $${plan.price}/mo` : ended ? "Get it all back" : "Keep everything"

  if (variant === "unlocked") {
    return (
      <EmailLayout
        preview={`For the next ${REVERSE_TRIAL.days} days you get everything in Duty Guard. No credit card required.`}
        footer={footer}
      >
        <Eyebrow>Free for {REVERSE_TRIAL.days} days</Eyebrow>
        <Title>Everything in your Duty Guard is unlocked</Title>
        <P>
          Starting today, your account gets the full Duty Guard for {REVERSE_TRIAL.days} days. Nothing to start and no credit card required
          required. It ends on {p.endsOn}.
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
              <strong>Automatic auditing and savings detection.</strong> Possible overpayments on your entries, and the programs
              and origins that could lower your duty.
            </>,
          ]}
        />
        <Cta href={siteLink(imports > 0 ? "/duty-guard" : "/duty-guard?tab=catalog", CAMPAIGN)} variant="next">
          {imports > 0 ? `Open my Duty Guard (${count(imports, "import")})` : "Add my imports"}
        </Cta>
        <P muted small>
          After {p.endsOn}, your account keeps {FREE_FOREVER.charAt(0).toLowerCase() + FREE_FOREVER.slice(1)}
        </P>
        <Signature />
      </EmailLayout>
    )
  }

  if (variant === "winback") {
    return (
      <EmailLayout preview="Your catalog is still here. Alerts on it are one click away." footer={footer}>
        <Eyebrow tone="heads-up">Since your trial ended</Eyebrow>
        <Title>{p.actionsThisMonth ? `${p.actionsThisMonth} New US Tariff Actions in 30 Days` : "Tariffs Keep Moving"}</Title>
        <P>
          Your catalog of {count(imports, "product")} is still here, free. What&apos;s off is the part that watches it: if a new tariff hits one of your products, you&apos;d get a
          heads-up, but not which product, the rate before and after, or what you may have overpaid.
        </P>
        {changes12m > 0 && (
          <P small>
            For a sense of what&apos;s at stake: {count(changes12m, "tariff change")} hit {count(productsHit12m, "of your products", "of your products")} in the last 12 months.
          </P>
        )}
        <Cta href={siteLink("/duty-guard?upgrade=plan", CAMPAIGN)}>{keep}</Cta>
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
          ? "I hope you had a chance to see how HTS Hero helps you avoid tariff surprises and overpayments on all your products. I wanted to let you know what's changed now that your free trial is over."
          : "I hope you've had a chance to see how HTS Hero helps you avoid tariff surprises and overpayments on all your products. I wanted to give you a heads-up before your free trial wraps up."}
      </P>
      <P>
        {ended
          ? `Your trial ended on ${p.endsOn}. Your whole catalog stays free, but here's what that turned off:`
          : `On ${p.endsOn}, your catalog stays free, but here's what turns off:`}
      </P>
      <Losses items={TRIAL_LOSSES} />
      {imports > 0 && changes12m > 0 && (
        <P small>
          For a sense of what&apos;s at stake: {count(changes12m, "tariff change")} hit {count(productsHit12m, "of your products", "of your products")} in the last 12
          months.
        </P>
      )}
      {imports === 0 && (
        <P small>You haven&apos;t added any products yet. Paste your HTS codes and countries and Duty Guard shows every tariff on each one, in about a minute.</P>
      )}

      <Cta href={siteLink(imports === 0 ? "/duty-guard?tab=catalog" : "/duty-guard?upgrade=plan", CAMPAIGN)} variant={imports === 0 ? "next" : "primary"}>
        {imports === 0 ? "Add my products" : keep}
      </Cta>
      {imports > 0 && plan && (
        <P muted small>
          That&apos;s just <strong style={{ color: C.green }}>${(Math.round((plan.price / plan.imports) * 100) / 100).toFixed(2)} per product</strong>, per month. {plan.name ?? "Duty Guard Pro"} covers up to {plan.imports.toLocaleString("en-US")} products, with alerts, audits and savings
          detection included. Cancel anytime.
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
  plan: { name: "Duty Guard Pro 100", imports: 100, price: 149 },
  footer: {
    reason: "You're getting this because you have an HTS Hero account.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies TrialEmailProps
