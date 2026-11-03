import { Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, Eyebrow, P, Panel, PlanStrip, Signature, Title } from "../kit/parts"
import { C, siteLink } from "../kit/brand"

// The "no imports yet" emails, for an account that opened Duty Guard and left it empty
// (libs/email/lifecycle.ts tracker_no_imports_1/2/3, days 1, 3 and 7 from the first visit). Each is
// one reason to add their imports, then the button, then a reply reaches Brendan if they're stuck.
// `reminder`: they asked for it ("Remind me tomorrow"), and this is the next one they hadn't had.

export type OnboardingStep = 1 | 2 | 3

export interface OnboardingEmailProps {
  step: OnboardingStep
  // They pressed "Remind me tomorrow" in the takeover
  reminder?: boolean
  footer: EmailFooter
}

const STEPS: Record<OnboardingStep, { campaign: string; subject: string; eyebrow: string; title: string; body: string; points: string[]; cta: string }> = {
  1: {
    campaign: "overpayments",
    subject: "Are you overpaying on your imports?",
    eyebrow: "Duty Guard · Overpayments",
    title: "Are You Overpaying on Your Imports?",
    body: "Improper tariff stacking, unclaimed exemptions and rules that change after entry can all mean you paid more duty than you had to. Add your imports and Duty Guard can check for it.",
    points: ["Add your imports", "Audit a past entry against the duty in force on its date", "See possible overpayments to review with your team or broker"],
    cta: "Check your Imports",
  },
  2: {
    campaign: "alerts",
    subject: "Know when tariffs affect your imports",
    eyebrow: "Duty Guard · Alerts",
    title: "Know When New Tariffs Affect Your Imports",
    body: "Tariffs change constantly, and finding out late means a surprise on the customs bill. Add your imports to Duty Guard checks every new US tariff action against them.",
    points: ["Alerts the moment a change hits your imports", "The rate before and after, with the official source", "A heads up when a new tariffs are proposed (so you can plan)"],
    cta: "Add your Imports",
  },
  3: {
    campaign: "savings",
    subject: "Discover possible savings on your imports",
    eyebrow: "Duty Guard · Savings",
    title: "Discover Possible Savings on All Your Imports",
    body: "Many importers don't know they're overpaying on duty. Duty Guard analyzes all your imports in seconds and checks for every way you could save.",
    points: ["Trade programs your imports may qualify for", "Exemptions that could lower your duty", "Lower-duty countries of origin"],
    cta: "Check your Imports",
  },
}

export const onboardingSubject = (p: OnboardingEmailProps) => (p.reminder ? "Your reminder: add your imports" : STEPS[p.step].subject)

// Opens Duty Guard's import takeover on its ways in (ImportTakeover's ?setup=)
export const ADD_IMPORTS_URL = "/duty-guard?setup=add"

export default function OnboardingEmail({ step, reminder, footer }: OnboardingEmailProps) {
  const s = STEPS[step]
  const campaign = `onboarding-${s.campaign}`
  return (
    <EmailLayout preview={s.body.slice(0, 140)} footer={footer}>
      <Eyebrow>{reminder ? "Your reminder" : s.eyebrow}</Eyebrow>
      <Title>{s.title}</Title>
      <P>
        {reminder ? "Here's the reminder you asked for. " : ""}
        {s.body}
      </P>
      <Checklist items={s.points} />
      <Cta href={siteLink(ADD_IMPORTS_URL, campaign)} variant="next">
        {s.cta}
      </Cta>
      <Panel>
        <Text style={{ margin: 0, fontSize: 14, lineHeight: "21px", color: C.text }}>
          <strong>Having trouble adding your imports?</strong> Reply directly to this email and I&apos;ll personally give you a hand.
        </Text>
      </Panel>
      <Signature />
      <PlanStrip campaign={campaign} />
    </EmailLayout>
  )
}

OnboardingEmail.PreviewProps = {
  step: 1,
  reminder: false,
  footer: {
    reason: "You're getting this because you have an HTS Hero account.",
    manageUrl: "https://htshero.com/tariff-updates/subscription?token=example",
    unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example",
  },
} satisfies OnboardingEmailProps
