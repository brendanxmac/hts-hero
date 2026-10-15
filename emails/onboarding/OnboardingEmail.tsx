import { EmailFooter, EmailLayout } from "../kit/Layout"
import { AlertSample, Checklist, Cta, Divider, Eyebrow, P, Panel, PlanStrip, Signature, Title, UpdateBlock, UpdateSummary } from "../kit/parts"
import { siteLink } from "../kit/brand"
import { TRIAL_ALLOWANCE } from "../../components/pricing-calculator/lib/pricing"

// The "no imports yet" onboarding emails. Both lead to one thing, adding imports, and land on the
// Tracker's Add products dialog (?tab=catalog&add=paste):
//   step 1 (day 1)  how fast it is (paste two columns) and what comes back, with this week's actions
//   step 2 (day 4)  this month's real tariff actions, and what an alert on your imports looks like

export interface OnboardingEmailProps {
  step: 1 | 2
  // Tariff actions in the last 30 days, and the latest ones
  actionsThisMonth: number
  recent: UpdateSummary[]
  footer: EmailFooter
}

export const onboardingSubject = (p: OnboardingEmailProps) =>
  p.step === 1
    ? "Paste your HTS codes, see every duty in a minute"
    : p.actionsThisMonth > 0
      ? `${p.actionsThisMonth} US tariff actions in 30 days. Would you know if one hit your imports?`
      : "Would you know if a tariff change hit your imports?"

const CAMPAIGN = (step: number) => `onboarding-${step}`

// Opens the Add products dialog on the paste step (ProductCatalog's ?add=)
export const ADD_IMPORTS_URL = "/tariff-tracker?tab=catalog&add=paste"

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
      <EmailLayout preview="Two columns from your spreadsheet, HTS code and country. Your Tracker does the rest." footer={footer}>
        <Eyebrow>Getting started</Eyebrow>
        <Title>Two columns, one paste, every duty on your imports</Title>
        <P>
          Copy the HTS code and country of origin columns from any spreadsheet or ACE report and paste them in. No template, no formatting. About a minute
          later, every import shows:
        </P>
        <Checklist
          items={[
            "Every duty on it, line by line, with the legal reason each one applies",
            "How its rate changed this year, and what's been announced next",
            "Countries that already make it for the US at a lower rate",
            "Trade programs and exemptions it may qualify for",
          ]}
        />
        <Cta href={siteLink(ADD_IMPORTS_URL, campaign)} variant="next">
          Paste my HTS codes
        </Cta>
        <P muted small>Have values and quantities too? Upload a CSV from the same screen. Or reply with your file and I&apos;ll load it for you.</P>
        <Recent recent={recent} campaign={campaign} label="This week in US tariffs" />
        <Signature />
        <PlanStrip campaign={campaign} />
      </EmailLayout>
    )
  }
  return (
    <EmailLayout preview="Your Tracker checks every new action against your imports, and tells you when one hits." footer={footer}>
      <Eyebrow tone="up">Tariff alerts</Eyebrow>
      <Title>{actionsThisMonth > 0 ? `${actionsThisMonth} US tariff actions in the last 30 days` : "US tariffs keep moving"}</Title>
      <P>
        Each one changes the duty on some products from some countries. Once your imports are in your Tracker, we check every action against them and alert
        you when one hits, like this:
      </P>
      <AlertSample
        label="Example alert"
        updateTitle="Section 232: more steel derivative products added"
        code="7326.90.86.88"
        country="Germany"
        description="Other articles of iron or steel"
        beforePct={12.9}
        afterPct={52.9}
        deltaUsd={4000}
      />
      <P>
        Alerts are free on up to {TRIAL_ALLOWANCE.alertImports} imports, by email, Slack or Teams. Your account also checks {TRIAL_ALLOWANCE.savingsChecks}{" "}
        imports for savings and {TRIAL_ALLOWANCE.auditChecks} past entries for overpaid duty, free.
      </P>
      <Cta href={siteLink(ADD_IMPORTS_URL, campaign)} variant="next">
        Add my imports
      </Cta>
      <Panel>
        <P small>
          <strong>Short on time?</strong> Reply with your product list, a spreadsheet or an ACE report, and I&apos;ll load it into your Tracker for you.
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
