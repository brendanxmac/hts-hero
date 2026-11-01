import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { siteLink } from "../kit/brand"

// Three during the trial (libs/email/lifecycle.ts): each teaches one thing on the account's own
// products while it's on, with one button to it. Savings are always "could" and "may".

export type TrialLesson = "alerts" | "savings" | "audits"

export interface TrialEducationEmailProps {
  lesson: TrialLesson
  imports: number
  // Rate changes that hit the products in the last 12 months, and how many they hit
  changes12m?: number
  productsHit12m?: number
  daysLeft: number
  footer: EmailFooter
}

const LESSONS: Record<TrialLesson, { subject: string; eyebrow: string; title: string; body: string; points: string[]; cta: string; href: string }> = {
  alerts: {
    subject: "How a tariff alert works on your products",
    eyebrow: "Your trial · Alerts",
    title: "See How Any Tariff Hits Your Products",
    body: "Every new US tariff action is checked against your products. When one applies, the alert names the products, the rate before and after, and the official source.",
    points: ["Open Tariff Changes and pick any action", "See each product it hits, before → after", "Choose where alerts go: email now, and Slack or Teams on plans for 100 or more products"],
    cta: "See my tariff changes",
    href: "/duty-guard?tab=changes",
  },
  savings: {
    subject: "Could you be paying less duty?",
    eyebrow: "Your trial · Savings",
    title: "Check What Your Products May Qualify For",
    body: "Savings detection looks at the trade programs, exemptions and lower-duty origins your products may qualify for, and shows what it takes to claim each one.",
    points: ["Open Savings to see what was found", "Check the rules for each program or exemption", "Send the list to your broker or team"],
    cta: "See my savings",
    href: "/duty-guard?tab=savings",
  },
  audits: {
    subject: "Check one entry for overpaid duty",
    eyebrow: "Your trial · Audits",
    title: "Audit One Entry in a Minute",
    body: "Pick a past entry and enter what you paid. We check it against the duty in force on its date and flag a possible over or underpayment for you and your broker to review.",
    points: ["Open Audits and add one entry", "See the duty in force on its date", "Keep 100% of anything you recover, with no contingency fee"],
    cta: "Audit an entry",
    href: "/duty-guard?tab=entries",
  },
}

export const trialEducationSubject = (p: TrialEducationEmailProps) => LESSONS[p.lesson].subject

const CAMPAIGN = "trial-education"

export default function TrialEducationEmail({ lesson, imports, changes12m = 0, productsHit12m = 0, daysLeft, footer }: TrialEducationEmailProps) {
  const l = LESSONS[lesson]
  return (
    <EmailLayout preview={l.body.slice(0, 140)} footer={footer}>
      <Eyebrow>{l.eyebrow}</Eyebrow>
      <Title>{l.title}</Title>
      <P>{l.body}</P>
      {lesson === "alerts" && changes12m > 0 && (
        <P>
          On your {imports.toLocaleString("en-US")} products, {changes12m.toLocaleString("en-US")} tariff {changes12m === 1 ? "change" : "changes"} hit {productsHit12m.toLocaleString("en-US")} of them in the
          last 12 months.
        </P>
      )}
      <Checklist items={l.points} />
      <Cta href={siteLink(l.href, `${CAMPAIGN}-${lesson}`)} variant="next">
        {l.cta}
      </Cta>
      <P muted small>
        {daysLeft} {daysLeft === 1 ? "day" : "days"} left in your free trial.
      </P>
      <Signature />
    </EmailLayout>
  )
}

TrialEducationEmail.PreviewProps = {
  lesson: "alerts",
  imports: 48,
  changes12m: 17,
  productsHit12m: 21,
  daysLeft: 5,
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies TrialEducationEmailProps
