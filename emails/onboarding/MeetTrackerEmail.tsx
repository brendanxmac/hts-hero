import { Link } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Divider, Eyebrow, P, Panel, PlanStrip, Signature, Title, UpdateBlock, UpdateSummary } from "../kit/parts"
import { C, siteLink } from "../kit/brand"
import { TRIAL_ALLOWANCE } from "../../components/pricing-calculator/lib/pricing"

// One time, to accounts from before the Tariff Tracker: what their account includes now, the
// latest tariff actions, and a one-click opt-in to the weekly digest (they're not on it unless
// they click).

export interface MeetTrackerEmailProps {
  optInUrl: string
  recent: UpdateSummary[]
  footer: EmailFooter
}

export const meetTrackerSubject = () => "Your HTS Hero account now tracks every tariff on your imports"

const CAMPAIGN = "meet-tracker"

export default function MeetTrackerEmail({ optInUrl, recent, footer }: MeetTrackerEmailProps) {
  return (
    <EmailLayout preview="The Tariff Tracker comes with your account: every duty on your imports, savings, audits and alerts." footer={footer}>
      <Eyebrow>New in your account</Eyebrow>
      <Title>Meet the Tariff Tracker</Title>
      <P>HTS Hero has grown into a full tariff toolkit since you signed up, and your account already includes it:</P>
      <Checklist
        items={[
          "The Tariff Calculator: every duty on any HTS code and country of origin, line by line. Free and unlimited",
          "The Tariff Tracker: add your imports and see each one's duty, rate history and cheaper origins",
          `${TRIAL_ALLOWANCE.savingsChecks} savings checks, ${TRIAL_ALLOWANCE.auditChecks} audit checks and alerts on ${TRIAL_ALLOWANCE.alertImports} imports, on us`,
          "Tariff updates: every new US tariff action, in plain English, with the official documents",
        ]}
      />
      <Cta href={siteLink("/tariff-tracker?welcome=1", CAMPAIGN)} variant="next">
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
      {recent.length > 0 && (
        <>
          <Divider />
          <Eyebrow tone="neutral">The latest US tariff actions</Eyebrow>
          {recent.map((u) => (
            <UpdateBlock key={u.slug} update={u} campaign={CAMPAIGN} compact />
          ))}
        </>
      )}
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
