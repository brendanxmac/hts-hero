import { Column, Row, Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Divider, Eyebrow, P, Panel, PlanStrip, Signature, Title, UpdateBlock, UpdateSummary } from "../kit/parts"
import { C, FONT_DISPLAY, siteLink } from "../kit/brand"
import { TRIAL_ALLOWANCE } from "../../components/pricing-calculator/lib/pricing"

// The "no imports yet" onboarding emails, each showing a little more of what the account can do:
// step 1 (day 1) what one import shows, step 2 (day 4) what the Tracker finds across them. Both
// lead to adding imports, with this month's real tariff actions as the proof it matters.

export interface OnboardingEmailProps {
  step: 1 | 2
  // Tariff actions in the last 30 days, and the latest ones
  actionsThisMonth: number
  recent: UpdateSummary[]
  footer: EmailFooter
}

export const onboardingSubject = (p: OnboardingEmailProps) =>
  p.step === 1 ? "Your first import takes a minute. Here's what it shows you" : `${p.actionsThisMonth} US tariff actions this month. Are your imports in them?`

const CAMPAIGN = (step: number) => `onboarding-${step}`

const Feature = ({ title, body }: { title: string; body: string }) => (
  <Section style={{ backgroundColor: C.soft, borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
    <Text style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 15, lineHeight: "21px", fontWeight: 600, color: C.text }}>{title}</Text>
    <Text style={{ margin: "4px 0 0", fontSize: 14, lineHeight: "21px", color: C.muted }}>{body}</Text>
  </Section>
)

const Recent = ({ recent, campaign, label }: { recent: UpdateSummary[]; campaign: string; label: string }) =>
  recent.length ? (
    <>
      <Divider />
      <Eyebrow tone="neutral">{label}</Eyebrow>
      {recent.map((u) => (
        <UpdateBlock key={u.slug} update={u} campaign={campaign} compact />
      ))}
    </>
  ) : null

export default function OnboardingEmail({ step, actionsThisMonth, recent, footer }: OnboardingEmailProps) {
  const campaign = CAMPAIGN(step)
  if (step === 1) {
    return (
      <EmailLayout preview="Add one HTS code and its country, and your Tracker fills in the rest." footer={footer}>
        <Eyebrow>Getting started</Eyebrow>
        <Title>See everything on your first import</Title>
        <P>Add one HTS code and its country of origin, and your Tracker fills in:</P>
        <Checklist
          items={[
            "Every duty on it, line by line, with the legal reason each one applies",
            "How its rate has changed, and what's coming",
            "Countries you could source it from for less",
            "An alert when a tariff change hits it",
          ]}
        />
        <Cta href={siteLink("/tariff-tracker?welcome=1", campaign)} variant="next">
          Add my first import
        </Cta>
        <P muted small>Got a spreadsheet? Reply with it and we&apos;ll load it for you.</P>
        <Recent recent={recent} campaign={campaign} label="This week in US tariffs" />
        <Signature />
        <PlanStrip campaign={campaign} />
      </EmailLayout>
    )
  }
  return (
    <EmailLayout preview="Your Tracker checks each one against your imports, and finds savings and refunds too." footer={footer}>
      <Eyebrow>What your Tracker can find</Eyebrow>
      <Title>{actionsThisMonth} US tariff actions in the last 30 days</Title>
      <P>Your Tracker checks every one against your imports. Add them, and your account also gets you:</P>
      <Feature
        title={`${TRIAL_ALLOWANCE.savingsChecks} free savings checks`}
        body="Trade programs, exemptions and lower-duty origins your imports may qualify for, and what each could save per shipment."
      />
      <Feature
        title={`${TRIAL_ALLOWANCE.auditChecks} free audit checks`}
        body="What you paid on past entries against the duty in force that day: overpayments worth a refund, underpayments worth fixing."
      />
      <Feature
        title={`Alerts on ${TRIAL_ALLOWANCE.alertImports} imports`}
        body="By email, Slack or Teams, the day a tariff change is announced, and again when it reaches the HTS."
      />
      <Row style={{ marginTop: 8 }}>
        <Column>
          <Cta href={siteLink("/tariff-tracker?welcome=1", campaign)} variant="next">
            Add my imports
          </Cta>
        </Column>
      </Row>
      <Panel>
        <P small>
          <strong>Short on time?</strong> Reply with your product list, a spreadsheet or an ACE report, and we&apos;ll load it into your Tracker for you.
        </P>
      </Panel>
      <Recent recent={recent} campaign={campaign} label="The latest actions" />
      <Signature />
      <PlanStrip campaign={campaign} />
    </EmailLayout>
  )
}

const SAMPLE: UpdateSummary = {
  slug: "commerce-defines-u-s-content",
  title: "Commerce defines \"U.S. content\" for USMCA metal goods under Proclamation 11032",
  summary: "A Bureau of Industry and Security notice tells CBP how to assess U.S. content for metal goods entered under USMCA.",
  authorityLabel: "Section 232",
  stageLabel: "Published",
  effectiveOn: null,
  countriesLabel: "Canada, Mexico",
  tone: "brand",
}

OnboardingEmail.PreviewProps = {
  step: 2,
  actionsThisMonth: 14,
  recent: [SAMPLE],
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies OnboardingEmailProps
