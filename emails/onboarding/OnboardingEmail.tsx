import { EmailFooter, EmailLayout } from "../kit/Layout"
import { AlertSample, Checklist, Cta, Eyebrow, P, PlanStrip, Signature, Title, UpdateSummary } from "../kit/parts"
import { siteLink } from "../kit/brand"

// The "no imports yet" onboarding emails. Both lead to one thing, adding imports, and land on the
// Tracker's Add products dialog (?tab=catalog&add=paste):
//   step 1 (day 1)  excitement: everything the Tracker does for them, then add your imports (only
//                   sent while they have none)
//   step 2 (day 4)  the Tracker is still empty: what an alert on your imports looks like

export interface OnboardingEmailProps {
  step: 1 | 2
  // Tariff actions in the last 30 days, and the latest ones (no longer shown, kept for queued messages)
  actionsThisMonth: number
  recent: UpdateSummary[]
  footer: EmailFooter
}

const actions = (n: number) => (n > 0 ? `${n} US tariff changes in the last 30 days` : "US tariffs change every week")

export const onboardingSubject = (p: OnboardingEmailProps) =>
  p.step === 1 ? "You just made tariffs easy" : "Which new tariffs hit your imports?"

const preview = (p: OnboardingEmailProps) =>
  p.step === 1
    ? "No more tracking rates by hand. Here's everything your Tariff Tracker does for you."
    : `${actions(p.actionsThisMonth)}. Your Tracker can tell you which ones hit you, once your imports are in.`

const CAMPAIGN = (step: number) => `onboarding-${step}`

// Opens the Add products dialog on the paste step (ProductCatalog's ?add=)
export const ADD_IMPORTS_URL = "/tariff-tracker?tab=catalog&add=paste"

export default function OnboardingEmail(props: OnboardingEmailProps) {
  const { step, actionsThisMonth, footer } = props
  const campaign = CAMPAIGN(step)
  if (step === 1) {
    return (
      <EmailLayout preview={preview(props)} footer={footer}>
        <Eyebrow>Your Tariff Tracker</Eyebrow>
        <Title>You just made tariffs easy</Title>
        <P>No more digging through the HTS, Federal Register notices and CBP messages. Your Tariff Tracker does it for you:</P>
        <Checklist
          items={[
            <><strong>Every rate, always current.</strong> The full duty on each import, line by line, updated the moment anything changes.</>,
            <><strong>Alerts before it costs you.</strong> When a new tariff hits one of your imports, you hear about it first, by email, Slack or Teams.</>,
            <><strong>Savings you may qualify for.</strong> Trade programs, exclusions and lower-duty countries, checked for every import.</>,
            <><strong>Duty you may have overpaid.</strong> Audit past entries against the rates in force on the day.</>,
          ]}
        />
        <P>It all starts with your imports. Paste your HTS codes and countries, and you&apos;re set in about a minute.</P>
        <Cta href={siteLink(ADD_IMPORTS_URL, campaign)} variant="next">
          Add my imports
        </Cta>
        <Signature />
        <PlanStrip campaign={campaign} />
      </EmailLayout>
    )
  }
  return (
    <EmailLayout preview={preview(props)} footer={footer}>
      <Eyebrow tone="up">Tariff alerts</Eyebrow>
      <Title>Your Tracker is still empty</Title>
      <P>
        {actionsThisMonth > 0 ? `${actionsThisMonth} US tariff changes in the last 30 days.` : "US tariffs keep changing."} Add your imports and
        you&apos;ll get an alert like this when one hits:
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
      <Cta href={siteLink(ADD_IMPORTS_URL, campaign)} variant="next">
        Add my imports
      </Cta>
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
  step: 1,
  actionsThisMonth: 14,
  recent: [SAMPLE],
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies OnboardingEmailProps
