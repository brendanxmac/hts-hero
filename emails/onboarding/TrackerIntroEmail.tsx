import { EmailFooter, EmailLayout } from "../kit/Layout"
import { AlertSample, Checklist, Cta, Eyebrow, P, PlanStrip, Signature, Title, TRACKER_POINTS } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"

// A day after sign-up, to an account that came for the calculator (or classification) and hasn't
// opened Duty Guard (libs/email/lifecycle.ts tracker_intro). The calculator answers one
// import at a time, today; Duty Guard watches all of them, every day. What an alert looks like,
// then the way in: the takeover, which offers their calculator searches first.

export interface TrackerIntroEmailProps {
  footer: EmailFooter
}

export const trackerIntroSubject = () => "Stop checking your tariffs by hand"

const CAMPAIGN = "tracker-intro"

export default function TrackerIntroEmail({ footer }: TrackerIntroEmailProps) {
  return (
    <EmailLayout preview={`The duty calculator answers one import at a time. Duty Guard watches all of them, free for ${REVERSE_TRIAL.days} days.`} footer={footer}>
      <Eyebrow>Included in your account</Eyebrow>
      <Title>We monitor your imports 24/7</Title>
      <P>
        The duty calculator tells you what an import costs today. Duty Guard monitors every one of your imports and gives you:
      </P>
      {/* <AlertSample
        label="Tariff Alert"
        updateTitle="A new tariff affects 1 of your imports"
        code="7326.90.86.88"
        country="Germany"
        description="Other articles of iron or steel"
        beforePct={12.9}
        afterPct={32.9}
      /> */}
      {/* <P>Add your imports to unlock:</P> */}
      <Checklist items={TRACKER_POINTS} />
      <P>
        Try it free, no credit card required.
      </P>
      <Cta href={siteLink("/duty-guard?setup=add", CAMPAIGN)} variant="next">
        Add your imports &rarr;
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
