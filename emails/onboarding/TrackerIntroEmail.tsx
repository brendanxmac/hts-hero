import { EmailFooter, EmailLayout } from "../kit/Layout"
import { AlertSample, Checklist, Cta, Eyebrow, P, PlanStrip, Signature, Title, TRACKER_POINTS } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"

// A day after sign-up, to an account that came for the calculator (or classification) and hasn't
// opened the Tariff Tracker (libs/email/lifecycle.ts tracker_intro). The calculator answers one
// import at a time, today; the Tracker watches all of them, every day. What an alert looks like,
// then the way in: the takeover, which offers their calculator searches first.

export interface TrackerIntroEmailProps {
  footer: EmailFooter
}

export const trackerIntroSubject = () => "Stop checking your tariffs by hand"

const CAMPAIGN = "tracker-intro"

export default function TrackerIntroEmail({ footer }: TrackerIntroEmailProps) {
  return (
    <EmailLayout preview={`The duty calculator answers one import at a time. The Tariff Tracker watches all of them, free for ${REVERSE_TRIAL.days} days.`} footer={footer}>
      <Eyebrow>Included in your account</Eyebrow>
      <Title>Your calculator searches, watched every day</Title>
      <P>
        The duty calculator tells you what an import costs today. The Tariff Tracker keeps checking every one of your imports and tells you the day a new tariff hits
        one, like this:
      </P>
      <AlertSample
        label="Example alert"
        updateTitle="Section 232: more steel derivative products added"
        code="7326.90.86.88"
        country="Germany"
        description="Other articles of iron or steel"
        beforePct={12.9}
        afterPct={52.9}
      />
      <P>Add your imports once (just HTS codes and countries of origin) and you&apos;ll:</P>
      <Checklist items={TRACKER_POINTS} />
      <P>
        Already looked some up in the calculator? They&apos;re waiting for you: start from your recent searches in one click. Your free {REVERSE_TRIAL.days}-day trial
        starts when you add them, on up to {REVERSE_TRIAL.imports} imports, no credit card.
      </P>
      <Cta href={siteLink("/tariff-tracker?setup=add", CAMPAIGN)} variant="next">
        Track my imports &rarr;
      </Cta>
      <Signature />
      <PlanStrip campaign={CAMPAIGN} />
    </EmailLayout>
  )
}

TrackerIntroEmail.PreviewProps = {
  footer: {
    reason: "You're getting this because you have an HTS Hero account.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies TrackerIntroEmailProps
