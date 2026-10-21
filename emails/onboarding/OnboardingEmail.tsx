import { EmailFooter, EmailLayout } from "../kit/Layout"
import { AlertSample, Checklist, Cta, Eyebrow, P, Panel, PlanStrip, Signature, Title, UpdateBlock, UpdateSummary } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"

// The "no imports yet" email the day after an account first opened the Tracker and left it empty
// (libs/email/lifecycle.ts tracker_no_imports_1). Value first: the tariff actions of the last 30
// days, the latest ones in full, and the question only their imports can answer. Then the three
// ways in from the Tracker's takeover, and what to do without the list (ask the broker). The CTA
// lands on the takeover's ways in (?setup=add). `reminder`: they asked for it ("Remind me tomorrow").
//   step 2 (no longer sent, kept for queued messages): what an alert on your imports looks like

export interface OnboardingEmailProps {
  step: 1 | 2
  // Tariff actions in the last 30 days, and the latest ones
  actionsThisMonth: number
  recent: UpdateSummary[]
  // They pressed "Remind me tomorrow" in the takeover
  reminder?: boolean
  footer: EmailFooter
}

const actions = (n: number) => (n > 0 ? `${n} US tariff changes in the last 30 days` : "US tariffs change every week")

export const onboardingSubject = (p: OnboardingEmailProps) =>
  p.step === 2
    ? "Which new tariffs hit your imports?"
    : p.reminder
      ? "Your reminder: add your imports"
      : p.actionsThisMonth > 0
        ? `${p.actionsThisMonth} tariff changes this month. Do any hit your imports?`
        : "Do this week's tariff changes hit your imports?"

const preview = (p: OnboardingEmailProps) =>
  p.step === 1
    ? "Add your imports and your Tracker shows which ones every change hits. About a minute, three ways to do it."
    : `${actions(p.actionsThisMonth)}. Your Tracker can tell you which ones hit you, once your imports are in.`

const CAMPAIGN = (step: number) => `onboarding-${step}`

// Opens the Tracker's import takeover on its ways in (ImportTakeover's ?setup=)
export const ADD_IMPORTS_URL = "/tariff-tracker?setup=add"

export default function OnboardingEmail(props: OnboardingEmailProps) {
  const { step, actionsThisMonth, recent, reminder, footer } = props
  const campaign = CAMPAIGN(step)
  if (step === 1) {
    return (
      <EmailLayout preview={preview(props)} footer={footer}>
        <Eyebrow tone="up">{reminder ? "Your reminder" : "Tariff Tracker"}</Eyebrow>
        <Title>{actionsThisMonth > 0 ? `${actionsThisMonth} tariff changes in 30 days. Which hit you?` : "Which tariff changes hit your imports?"}</Title>
        <P>
          {reminder ? "Here's the reminder you asked for. " : ""}Your Tariff Tracker is set up and watching every US tariff action. It just doesn&apos;t know what you
          import yet, so it can&apos;t tell you which of these hit you:
        </P>
        {recent.slice(0, 2).map((u) => (
          <UpdateBlock key={u.slug} update={u} campaign={campaign} compact />
        ))}
        <P>
          <strong>Add your imports in about a minute</strong>, any of three ways:
        </P>
        <Checklist
          items={[
            <>
              <strong>Paste a list.</strong> Copy the HTS code and country of origin columns from any spreadsheet.
            </>,
            <>
              <strong>Upload a spreadsheet.</strong> Excel or CSV, as it is. We find the right columns.
            </>,
            <>
              <strong>Start from your searches.</strong> The imports you looked up in the duty calculator, in one click.
            </>,
          ]}
        />
        <Panel>
          <P small>
            <strong>No list to hand?</strong> Your customs broker has every entry you&apos;ve filed. Ask them for the HTS codes and countries of origin on your entries from
            the last 12 months, and drop their spreadsheet straight in.
          </P>
        </Panel>
        <P>
          Your free {REVERSE_TRIAL.days}-day trial starts when you add them: everything the Tracker does, on up to {REVERSE_TRIAL.imports} imports, no credit card.
        </P>
        <Cta href={siteLink(ADD_IMPORTS_URL, campaign)} variant="next">
          Add my imports &rarr;
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
        {actionsThisMonth > 0 ? `${actionsThisMonth} US tariff changes in the last 30 days.` : "US tariffs keep changing."} Add your imports and you&apos;ll get an alert
        like this when one hits. Your free trial covers up to {REVERSE_TRIAL.imports} imports, so bring your whole catalog:
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
  title: 'Commerce defines "U.S. content" for USMCA metal goods under Proclamation 11032',
  summary: "A Bureau of Industry and Security notice tells CBP how to assess U.S. content for metal goods entered under USMCA.",
  authorityLabel: "Section 232",
  stageLabel: "Published",
  effectiveOn: null,
  countriesLabel: "Canada, Mexico",
  tone: "brand",
}

OnboardingEmail.PreviewProps = {
  step: 1,
  reminder: false,
  actionsThisMonth: 14,
  recent: [SAMPLE],
  footer: {
    reason: "You're getting this because you have an HTS Hero account.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies OnboardingEmailProps
