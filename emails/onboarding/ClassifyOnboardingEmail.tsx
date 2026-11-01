import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Signature, Title } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { NUM_FREE_CLASSIFICATIONS } from "../../constants/classification"

// For accounts that signed up to classify (entry point "classify"; libs/email/lifecycle.ts):
//   1 (day 1)  your first classification
//   2 (day 3)  the report: why it's what your file needs
//   3 (day 6)  what's left of the free classifications, and the plans

export interface ClassifyOnboardingEmailProps {
  step: 1 | 2 | 3
  footer: EmailFooter
}

const STEPS = {
  1: {
    subject: "Classify your first product",
    title: "Classify Your First Product",
    body: "Describe a product in plain English. You'll get the candidate HS codes with the legal notes and CROSS rulings that back each one.",
    points: ["Start from a product description", "Compare the candidates side by side", "See why the others were ruled out"],
    cta: "Classify a product",
    href: "/classifications/new",
  },
  2: {
    subject: "The report your files need",
    title: "Turn a Classification Into a Report",
    body: "A code is only as good as the reasoning behind it. Every classification can become a report with the headings considered, the notes applied and the rulings cited.",
    points: ["Download it for your records", "Share it with your broker or team", "Keep the reasoning if CBP ever asks"],
    cta: "See my classifications",
    href: "/classifications",
  },
  3: {
    subject: "Your free classifications",
    title: "Keep Your Classifications Moving",
    body: `Your first ${NUM_FREE_CLASSIFICATIONS} classifications are free. When you need more, plans start with 10 a month, and Pro audits your existing codes too.`,
    points: ["Starter: 10 classifications a month", "Pro: up to 100, plus audits of existing codes", "Refunded in full if 10 classifications in 30 days don't satisfy you"],
    cta: "See the plans",
    href: "/classify#pricing",
  },
} as const

export const classifyOnboardingSubject = (p: ClassifyOnboardingEmailProps) => STEPS[p.step].subject

const CAMPAIGN = "classify-onboarding"

export default function ClassifyOnboardingEmail({ step, footer }: ClassifyOnboardingEmailProps) {
  const s = STEPS[step]
  return (
    <EmailLayout preview={s.body.slice(0, 140)} footer={footer}>
      <Eyebrow>Classification</Eyebrow>
      <Title>{s.title}</Title>
      <P>{s.body}</P>
      <Checklist items={[...s.points]} />
      <Cta href={siteLink(s.href, `${CAMPAIGN}-${step}`)} variant="next">
        {s.cta}
      </Cta>
      <Signature />
    </EmailLayout>
  )
}

ClassifyOnboardingEmail.PreviewProps = {
  step: 1,
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies ClassifyOnboardingEmailProps
