import { Link } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Panel, PlanStrip, Signature, Title, TRACKER_POINTS, UpdateSummary } from "../kit/parts"
import { C, siteLink } from "../kit/brand"

// One time, to accounts from before the Tariff Tracker: what their account includes now, and a
// one-click opt-in to the weekly digest (they're not on it unless
// they click).

export interface MeetTrackerEmailProps {
  optInUrl: string
  recent: UpdateSummary[]
  footer: EmailFooter
}

export const meetTrackerSubject = () => "New in your account: Tariff Tracker"

const CAMPAIGN = "meet-tracker"

export default function MeetTrackerEmail({ optInUrl, footer }: MeetTrackerEmailProps) {
  return (
    <EmailLayout preview="Add your imports once and get alerted when a new tariff hits one. Free with your account." footer={footer}>
      <Eyebrow>New in your account</Eyebrow>
      <Title>Meet the Tariff Tracker</Title>
      <P>US tariffs change every week. Your account now watches your imports for you. Add them once (just HTS codes and countries) to:</P>
      <Checklist items={TRACKER_POINTS} />
      <Cta href={siteLink("/tariff-tracker?tab=catalog&add=paste", CAMPAIGN)} variant="next">
        Add my imports
      </Cta>
      <Panel>
        <P small>
          <strong>Want the weekly tariff digest?</strong> One email every Monday with the week&apos;s US tariff actions.{" "}
          <Link href={optInUrl} style={{ color: C.cobalt, fontWeight: 600 }}>
            Yes, send me the digest
          </Link>
        </P>
      </Panel>
      <Signature />
      <PlanStrip campaign={CAMPAIGN} />
    </EmailLayout>
  )
}

MeetTrackerEmail.PreviewProps = {
  optInUrl: "https://htshero.com/api/email/opt-in?token=example",
  recent: [],
  footer: { reason: "You're getting this one-time update because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies MeetTrackerEmailProps
