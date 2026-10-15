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
      <Para>Howdy! It&apos;s Brendan, the founder of HTS Hero.</Para>
      <Para>
        I noticed you signed up for Tariff Tracker {daysSinceSignup} days ago but haven&apos;t uploaded your imports yet. I wanted to check in to see if you needed a hand or if you were having trouble.
      </Para>
      <Para>
        Adding them takes usually takes a minute or two and you can either import via csv or paste your HTS code + country pairs direclty.
      </Para>
      <Para>
        Once that&apos;s done, we immediately analyze each one for savings you may
        qualify for and let you quickly check for overpaid duty. We also alert you any new tariff affects your imports, so you can take action before it's too late.
      </Para>

      <Para>
        To get started, just click the button below!
      </Para>

      <Cta href={siteLink("/tariff-tracker?tab=catalog&add=paste", "onboarding-3")} variant="next">
        Add your imports
      </Cta>
      <Para>
        <strong>Want someone to manage your tariffs for you?</strong> We can watch your whole catalog, flag every change
        that hits you, walk you through the impacts, audit your entries for overpayments, find savings, and much more...{" "}
        <Link href={siteLink("/tariff-tracker?tab=expert-help", "onboarding-3")} style={{ color: C.cobalt, fontWeight: 600 }}>
          See how HTS Hero Managed works
        </Link>
        , or reply here with your business details we can setup a time to talk.
      </Para>
      <Signature />
    </EmailLayout>
  )
}

FounderNoteEmail.PreviewProps = {
  daysSinceSignup: 10,
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies FounderNoteEmailProps
