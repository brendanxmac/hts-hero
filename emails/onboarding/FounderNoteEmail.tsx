import { Link, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Signature } from "../kit/parts"
import { C, siteLink } from "../kit/brand"

// Day 10 with no imports: a short note from Brendan, plain like a personal email. Two offers: help
// getting set up (send the list, he loads it), or dedicated tariff management done for them.

export interface FounderNoteEmailProps {
  daysSinceSignup: number
  footer: EmailFooter
}

export const founderNoteSubject = () => "Need a hand with your tariffs?"

const Para = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ margin: "0 0 16px", fontSize: 16, lineHeight: "25px", color: C.text }}>{children}</Text>
)

export default function FounderNoteEmail({ daysSinceSignup, footer }: FounderNoteEmailProps) {
  return (
    <EmailLayout preview="Send me your list and I'll set it up, or let us handle tariffs for you." footer={footer}>
      <Para>Hi,</Para>
      <Para>
        It&apos;s Brendan, the founder of HTS Hero. You opened your Tariff Tracker {daysSinceSignup} days ago but haven&apos;t added any imports yet, so I
        wanted to check in.
      </Para>
      <Para>
        <strong>Need a hand getting set up?</strong> Reply with your product list, a spreadsheet or an ACE report, and I&apos;ll load it into your Tracker
        myself.
      </Para>
      <Para>
        <strong>Want someone to handle tariffs for you?</strong> We also offer dedicated tariff management: we watch your whole catalog, flag every change
        that hits you, audit your entries for overpayments, find savings, and tell you what to do about each. Reply &quot;managed&quot; and I&apos;ll
        send you the details.
      </Para>
      <Para>
        Either way, just hit reply. Or{" "}
        <Link href={siteLink("/tariff-tracker?welcome=1", "onboarding-3")} style={{ color: C.cobalt, fontWeight: 600 }}>
          add your imports yourself
        </Link>
        .
      </Para>
      <Signature />
    </EmailLayout>
  )
}

FounderNoteEmail.PreviewProps = {
  daysSinceSignup: 10,
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies FounderNoteEmailProps
