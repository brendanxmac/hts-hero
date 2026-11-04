import { Img } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../../kit/Layout"
import { Cta, Eyebrow, FeatureList, P, ReplyNote, Signature, Title, TRACKER_FEATURES } from "../../kit/parts"
import { C, dutyGuardHeroUrl, FONT_SANS, siteLink } from "../../kit/brand"
import { REVERSE_TRIAL } from "../../../components/pricing-calculator/lib/pricing"

// The Duty Guard launch: what it does, and the free trial. A marketing email (sent from the Content
// Studio's Marketing Emails tab, emails/kit/marketing.ts). It was first queued to every account by
// `npm run email:duty-guard-launch` as the "duty_guard_launch" template, which still renders it, so
// those messages keep opening and their recipients are left out of studio sends (alsoSentAs).

export interface DutyGuardLaunchEmailProps {
  footer: EmailFooter
  // The inbox preview line; the original send had none, so it falls back to `preview`
  preview?: string
}

export const subject = "Duty Guard is Live!"
export const preview = "No more overpayments or tariff surprises"
export const alsoSentAs = ["duty_guard_launch"]

export const dutyGuardLaunchSubject = () => subject

const CAMPAIGN = "duty-guard-launch"

export default function DutyGuardLaunchEmail({ footer, preview: previewLine = preview }: DutyGuardLaunchEmailProps) {
  return (
    <EmailLayout preview={previewLine} footer={footer}>
      <Eyebrow>New in HTS Hero</Eyebrow>
      <Title>Meet Duty Guard</Title>
      {/* What it does, at a glance: one catalog with what alerts, savings and audits each found. Full
          card width (fluid on phones); the dark ground and rounded corners are baked in. The alt
          text carries the message when images are blocked. */}
      <Img
        src={dutyGuardHeroUrl()}
        alt="Duty Guard watching your imports: tariff change alerts, savings you may qualify for, and entries that may be overpaid"
        width="496"
        style={{ display: "block", width: "100%", maxWidth: 496, height: "auto", margin: "4px 0 24px", border: 0, borderRadius: 18, backgroundColor: C.navy, fontFamily: FONT_SANS, fontSize: 13, lineHeight: "20px", color: C.surface }}
      />
      <P>
        For nearly 2 years we&apos;ve been helping US importers and trade pros nail their duty calculations & classifications.
      </P>
      <P>
        Now we&apos;re expanding on that by letting them audit every
        single entry, discover potential savings, and get alerted anytime their imports (or their clients&apos;) are affected by new tariff changes.
      </P>
      <FeatureList items={TRACKER_FEATURES} />
      <Cta href={siteLink("/duty-guard", CAMPAIGN)} variant="next">
        Try it free &rarr;
      </Cta>
      {/* <P muted small>
        Free for {REVERSE_TRIAL.days} days, no credit card required.
      </P> */}
      <ReplyNote />
      <Signature />
    </EmailLayout>
  )
}

DutyGuardLaunchEmail.PreviewProps = {
  preview,
  footer: {
    reason: "You're getting this because you have an HTS Hero account.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies DutyGuardLaunchEmailProps
