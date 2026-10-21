import { Link, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Signature } from "../kit/parts"
import { C, siteLink } from "../kit/brand"
import { AUDITS_ENABLED, SAVINGS_ENABLED } from "../../libs/tariff-tracker/features"
import { REVERSE_TRIAL } from "../../components/pricing-calculator/lib/pricing"

// A note from Brendan to an account that opened the Tracker and hasn't added its imports, plain
// like a personal email (libs/email/lifecycle.ts):
//   help  3 days after the first visit: "can I give you a hand?", answering why they skipped
//         (tracker_onboarding.skip_reason) when they said, and offering to set it up from a
//         spreadsheet they reply with
//   last  10 days after: the same help first, then HTS Hero Managed, clearly but second
// Messages queued before the variants carry only daysSinceSignup: they read as "last".

export type FounderNoteVariant = "help" | "last"

export interface FounderNoteEmailProps {
  variant?: FounderNoteVariant
  // Why they pressed "Skip for now", if they did, and what they wrote
  skipReason?: string | null
  skipNote?: string | null
  daysSinceSignup?: number
  footer: EmailFooter
}

export const founderNoteSubject = (p: FounderNoteEmailProps) => (p.variant === "help" ? "Can I give you a hand?" : "Want me to set it up for you?")

const CAMPAIGN = (variant: FounderNoteVariant) => (variant === "help" ? "onboarding-founder" : "onboarding-3")

const Para = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ margin: "0 0 16px", fontSize: 16, lineHeight: "25px", color: C.text }}>{children}</Text>
)

// What they told us when they skipped, answered
const ReasonLine = ({ reason, note }: { reason?: string | null; note?: string | null }) => {
  switch (reason) {
    case "no_list":
    case "remind_me":
      return (
        <Para>
          You mentioned you didn&apos;t have your list handy. The quickest fix I know: your customs broker has every entry you&apos;ve filed, so a one-line email
          asking for the HTS codes and countries of origin on your entries from the last 12 months usually gets it back the same day.
        </Para>
      )
    case "someone_else":
      return (
        <Para>
          You mentioned someone else manages your imports{note ? ` (${note})` : ""}. Feel free to forward this to them, or loop them in on a reply, and I&apos;ll help
          them get it set up.
        </Para>
      )
    case "looking":
      return (
        <Para>
          You said you were looking around first, which makes total sense. The Tracker only really comes alive with your own imports, though: that&apos;s when you see
          your real duty on each one and start getting alerts when a change hits.
        </Para>
      )
    case "pricing":
      return (
        <Para>
          You wanted to know what it costs first, fair enough. The {REVERSE_TRIAL.days}-day trial is free with no card, so you can see it working on your own imports
          before deciding anything, and if you reply with roughly how many products you import, I&apos;ll tell you which plan fits.
        </Para>
      )
    case "data_privacy":
      return (
        <Para>
          You mentioned you weren&apos;t comfortable sharing your import data. All the Tracker needs is HTS codes and countries of origin: no prices, suppliers or
          customers, and only your account can see them. Happy to answer anything else about it.
        </Para>
      )
    case "few_imports":
      return (
        <Para>
          You mentioned you only import a few products. That&apos;s plenty: the Tracker watches each one and tells you the day a tariff change hits it, and with only a
          few, setup takes a minute.
        </Para>
      )
    case "other":
      return note ? (
        <Para>
          You mentioned: &ldquo;{note}&rdquo;. I&apos;d really like to help with that, so just reply and tell me a bit more.
        </Para>
      ) : (
        <Para>Was something in the way? I&apos;d genuinely like to know, even if it&apos;s just a sentence.</Para>
      )
    default:
      return <Para>Was something in the way? I&apos;d genuinely like to know, even if it&apos;s just a sentence.</Para>
  }
}

export default function FounderNoteEmail({ variant = "last", skipReason, skipNote, footer }: FounderNoteEmailProps) {
  const campaign = CAMPAIGN(variant)
  return (
    <EmailLayout
      preview={variant === "help" ? "Reply with your spreadsheet and I'll add your imports for you." : "Send me your list and I'll set up your Tracker myself."}
      footer={footer}
    >
      <Para>Hi, it&apos;s Brendan, the founder of HTS Hero.</Para>
      {variant === "help" ? (
        <Para>
          I saw you opened the Tariff Tracker a few days ago but haven&apos;t added your imports yet, so I wanted to check in personally and see if I can help.
        </Para>
      ) : (
        <Para>
          Your Tariff Tracker is still waiting on your imports, and I don&apos;t want you to miss out on it. So here&apos;s an offer: let me do the setup for you.
        </Para>
      )}
      <ReasonLine reason={skipReason} note={skipNote} />
      <Para>
        <strong>The easiest way: just reply to this email with your spreadsheet attached.</strong> Any format, any columns, as long as the HTS codes and countries of origin
        are in there somewhere. I&apos;ll add your imports for you myself and let you know when your dashboard is ready.
      </Para>
      {SAVINGS_ENABLED || AUDITS_ENABLED ? (
        <Para>
          Once they&apos;re in, we work out the duty on each one, look for savings you may qualify for, and alert you the moment a new tariff affects any of them.
        </Para>
      ) : (
        // The Tracker MVP (features.ts): tracking, alerts and impact checks
        <Para>
          Once they&apos;re in, you&apos;ll see the duty on every one of them, and we&apos;ll alert you the moment a new tariff hits one, with the rate before and after.
        </Para>
      )}
      <Para>Or, if you&apos;d rather do it yourself, it takes about a minute:</Para>
      <Cta href={siteLink("/tariff-tracker?setup=add", campaign)} variant="next">
        Add my imports
      </Cta>
      {variant === "last" && (
        <Para>
          <strong>Rather not deal with tariffs at all?</strong> With HTS Hero Managed, our team watches your whole catalog, flags every change that hits you, walks you
          through the impact and audits your entries.{" "}
          <Link href={siteLink("/tariff-tracker?tab=expert-help", campaign)} style={{ color: C.cobalt, fontWeight: 600 }}>
            See how Managed works
          </Link>
          , or reply with a time that suits you and we&apos;ll talk it through.
        </Para>
      )}
      <Signature />
    </EmailLayout>
  )
}

FounderNoteEmail.PreviewProps = {
  variant: "help",
  skipReason: "no_list",
  skipNote: null,
  footer: { reason: "You're getting this because you have an HTS Hero account.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies FounderNoteEmailProps
