import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, ReplyNote, Signature, Title, TRACKER_POINTS } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"

// The Duty Guard launch, once, to every existing account (queued by `npm run email:duty-guard-launch`
// and held for review in /email-outbox): what it does, and the free trial.

export interface DutyGuardLaunchEmailProps {
  footer: EmailFooter
}

export const dutyGuardLaunchSubject = () => "Duty Guard is Live!"

const CAMPAIGN = "duty-guard-launch"

export default function DutyGuardLaunchEmail({ footer }: DutyGuardLaunchEmailProps) {
  return (
    <EmailLayout preview="No more overpayments or tariff surprises" footer={footer}>
      <Eyebrow>New in HTS Hero</Eyebrow>
      <Title>Meet Duty Guard</Title>
      <P>
        For nearly 2 years we&apos;ve been helping US importers and trade pros nail their duty calculations & classifications.
      </P>
      <P>
        Now we&apos;re expanding on that by letting them audit every
        single entry, discover potential savings, and get alerted anytime their imports (or their clients&apos;) are affected by new tariff changes.
      </P>
      <Checklist items={TRACKER_POINTS} />
      <Cta href={siteLink("/duty-guard", CAMPAIGN)} variant="next">
        Try it free &rarr;
      </Cta>
      <P muted small>
        Free for {REVERSE_TRIAL.days} days, no credit card required.
      </P>
      <ReplyNote />
      <Signature />
    </EmailLayout>
  )
}

DutyGuardLaunchEmail.PreviewProps = {
  footer: {
    reason: "You're getting this because you have an HTS Hero account.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies DutyGuardLaunchEmailProps
