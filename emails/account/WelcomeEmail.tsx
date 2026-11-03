import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Checklist, Cta, P, Signature, Title } from "../kit/parts"
import { siteLink } from "../kit/brand"

// Sent right after sign-up (libs/email/welcome.ts): one personal note from Brendan to everyone,
// plain like a real email. Direct access to him is the point: that's what a small company has and
// a big one doesn't. Then what we can help with, and one button, the only part that follows what
// they came for (their entry point). The emails after this one walk them through it.

export interface WelcomeEmailProps {
  // Where they signed up from (signup_onboarding.entry_point)
  entry?: string | null
  footer: EmailFooter
}

type Next = { line: string; cta: string; href: string }
const ADD_IMPORTS = { cta: "Add my imports", href: "/duty-guard?setup=add" }
const ALERTS: Next = { ...ADD_IMPORTS, line: "Whenever you're ready, the next step is adding your imports so we can let you know when they're affected by new tariffs." }
const AUDITS: Next = { ...ADD_IMPORTS, line: "Whenever you're ready, the next step is adding your imports so we can check your past entries." }
const TRACK: Next = { line: "Your imports are waiting for you whenever you want to pick up where you left off.", cta: "Open my imports", href: "/duty-guard?tab=catalog" }
const CALCULATOR: Next = { line: "Whenever you're ready, look up the duty on your next import.", cta: "Calculate a duty", href: "/duty-calculator" }
const CLASSIFY: Next = { line: "Whenever you're ready, describe a product and see the HTS codes with the most evidence behind them.", cta: "Classify a product", href: "/classifications/new" }
const GENERAL: Next = { line: "Whenever you're ready, Duty Guard is the best place to start.", cta: "Open Duty Guard", href: "/duty-guard" }

const NEXT: Record<string, Next> = {
  alerts: ALERTS,
  alerts_page: ALERTS,
  audit: AUDITS,
  audits_page: AUDITS,
  savings: AUDITS,
  calculator: CALCULATOR,
  calculator_unlock: CALCULATOR,
  classify: CLASSIFY,
  calculator_recent: TRACK,
  calculator_track: TRACK,
  hts_page: TRACK,
}

export const welcomeSubject = () => "Welcome to HTS Hero"

const CAMPAIGN = "welcome"

export default function WelcomeEmail({ entry, footer }: WelcomeEmailProps) {
  const next = (entry && NEXT[entry]) || GENERAL
  return (
    <EmailLayout preview="I'm Brendan, the founder. If you ever need anything, you've got me directly." footer={footer}>
      <Title>Welcome to HTS Hero</Title>
      <P>Hi, I&apos;m Brendan, the founder of HTS Hero. Thank you so much for signing up.</P>
      <P>I started HTS Hero for one reason: To help US importers and trade prossionals succeed despite thin margins, tough competition, and tariff chaos.</P>
      <P>
        And so far it&apos;s working. <strong>Over 300 importers and trade pros use HTS Hero every day to:</strong>
      </P>
      <Checklist
        items={[
          "Check if they're overpaying on duty and find out how they could pay less",
          "Calculate what they'll pay on new imports, line by line, with sources",
          "Get alerts when a tariff change hits their imports",
          "Produce HTS classifications built on legal evidence",
        ]}
      />
      <P>
        <strong>The most important thing to know is that you have direct access to me.</strong> Not a sales rep or a random employee. Me.
      </P>
      <P>
        Any time you have questions, suggestions, get stuck, or something doesn&apos;t fit the way you work, just let me know and I&apos;ll do everything I can to fix it.
      </P>
      <P>{next.line}</P>
      <Cta href={siteLink(next.href, CAMPAIGN)} variant="next">
        {next.cta}
      </Cta>
      <Signature />
    </EmailLayout>
  )
}

WelcomeEmail.PreviewProps = {
  entry: "alerts_page",
  footer: { reason: "You're getting this because you created an HTS Hero account with this email." },
} satisfies WelcomeEmailProps
