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
    subject: "Smarter, Faster HTS Classification",
    title: "Smarter, Faster HTS Classification",
    body: "Describe any product and get candidate HS codes with legal notes and CROSS rulings that back each one in seconds.",
    points: ["Type a product description", "Get candidates with supporting evidence", "Save the report for your records"],
    cta: "Try it free",
    href: "/classifications/new",
  },
  2: {
    subject: "Defend Your Classifications",
    title: "Defense Reports for Your Classifications",
    body: "With HTS Hero every classification gets a full report with the headings considered, the notes applied, and the rulings cited.",
    points: ["Defends your choices", "Documents your reasoning", "Easy to share with your team or clients"],
    cta: "Try it free",
    href: "/classifications",
  },
  3: {
    subject: "Got that feeling?",
    title: "Ever been unsure about a classification?",
    body: `We all make mistakes, but price of misclassification can really sting. HTS Hero helps you avoid mistakes by finding evidence for every candidate and checking your blind spots.`,
    points: [],
    // points: ["Starter: 10 classifications a month", "Pro: up to 100, plus audits of existing codes", "Refunded in full if 10 classifications in 30 days don't satisfy you"],
    cta: "Classify with Confidence",
    href: "/classify#pricing",
  },
} as const

export const classifyOnboardingSubject = (p: ClassifyOnboardingEmailProps) => STEPS[p.step].subject

const CAMPAIGN = "classify-onboarding"

export default function ClassifyOnboardingEmail({ step, footer }: ClassifyOnboardingEmailProps) {
  const s = STEPS[step]
  return (
    <EmailLayout preview={s.body.slice(0, 140)} footer={footer}>
      <Eyebrow>Classification Assistant</Eyebrow>
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
