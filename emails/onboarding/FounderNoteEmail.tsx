import { Link, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Signature } from "../kit/parts"
import { C, siteLink } from "../kit/brand"

// Day 10 with no imports: a short note from Brendan, plain like a personal email. One link back to
// adding imports, and an offer of dedicated tariff management done for them.

export interface FounderNoteEmailProps {
  daysSinceSignup: number
  footer: EmailFooter
}

export const founderNoteSubject = () => "Quick question about your imports"

const Para = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ margin: "0 0 16px", fontSize: 16, lineHeight: "25px", color: C.text }}>{children}</Text>
)

export default function FounderNoteEmail({ daysSinceSignup, footer }: FounderNoteEmailProps) {
  return (
    <EmailLayout preview="Is something stopping you from adding them? Just hit reply and tell me." footer={footer}>
      <Para>Hi,</Para>
      <Para>
        It&apos;s Brendan, the founder of HTS Hero. You opened your Tariff Tracker {daysSinceSignup} days ago but haven&apos;t added any imports yet, so I
        wanted to check in.
      </Para>
      <Para>
        Adding them takes about a minute: paste your HTS codes and countries, and your Tracker starts watching every one for new tariffs, savings you may
        qualify for and overpaid duty.
      </Para>
      <Cta href={siteLink("/tariff-tracker?tab=catalog&add=paste", "onboarding-3")} variant="next">
        Add my imports
      </Cta>
      <Para>
        <strong>Want someone to handle tariffs for you?</strong> We also offer dedicated tariff management: we watch your whole catalog, flag every change
        that hits you, audit your entries for overpayments, find savings, and tell you what to do about each.{" "}
        <Link href={siteLink("/tariff-tracker?tab=expert-help", "onboarding-3")} style={{ color: C.cobalt, fontWeight: 600 }}>
          See how HTS Hero Managed works
        </Link>
        , or reply &quot;managed&quot; and I&apos;ll send you the details.
      </Para>
      <Para>If something&apos;s in the way, just hit reply and tell me. I read every one.</Para>
      <Signature />
    </EmailLayout>
  )
}

FounderNoteEmail.PreviewProps = {
  daysSinceSignup: 10,
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies FounderNoteEmailProps
