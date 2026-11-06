import { EmailLayout, type EmailFooter } from "../kit/Layout"
import { Checklist, Cta, DarkHero, HeroMuted, P } from "../kit/parts"

// Double opt-in for tariff news: nothing is sent until this is clicked. A dark opening that says
// they made a good call, what they'll get, and the one button. The welcome (NewsWelcomeEmail)
// follows once they click.

export interface NewsConfirmEmailProps {
  confirmUrl: string
  frequency: "instant" | "weekly" | "both" | "off"
  footer: EmailFooter
}

export const newsConfirmSubject = ({ frequency }: NewsConfirmEmailProps) =>
  frequency === "instant" || frequency === "both" ? "One click to start your US tariff updates" : "One click to start your Weekly Tariff Digest"

const WHAT = [
  "Every new US tariff action, in plain English",
  "The goods, HTS codes and countries each one covers",
  "When it takes effect, and how far it has got",
  "A link to the official document behind it",
]

export default function NewsConfirmEmail({ confirmUrl, frequency, footer }: NewsConfirmEmailProps) {
  const instant = frequency === "instant"
  const both = frequency === "both"
  return (
    <EmailLayout
      preview={
        both
          ? "Confirm and you'll get each new US tariff action as it happens, plus the digest every Monday."
          : instant
            ? "Confirm and you'll get each new US tariff action as it happens."
            : "Confirm and your first Weekly Tariff Digest arrives Monday."
      }
      footer={footer}
    >
      <DarkHero
        eyebrow={instant || both ? "US tariff updates" : "The Weekly Tariff Digest"}
        title={
          <>
            One click and you&apos;re in.
            <br />
            <HeroMuted>{both ? "As it happens, and every Monday." : instant ? "Every change, as it happens." : "Every change, every Monday."}</HeroMuted>
          </>
        }
      >
        Good call. US tariffs now change by the week, and you&apos;re about to stop chasing them.
      </DarkHero>
      <P>
        {both
          ? "Confirm your address and each new US tariff action comes straight to your inbox as it happens, with the week's recap every Monday:"
          : instant
          ? "Confirm your address and each new US tariff action comes straight to your inbox, as it happens:"
          : "Confirm your address and every Monday you'll get one email with every new US tariff action from the week before:"}
      </P>
      <Checklist items={WHAT} />
      <Cta href={confirmUrl} variant="next">
        Confirm My Subscription &rarr;
      </Cta>
      <P muted small>
        Didn&apos;t ask for this? Ignore it: nothing is sent until you confirm.
      </P>
    </EmailLayout>
  )
}

NewsConfirmEmail.PreviewProps = {
  confirmUrl: "https://htshero.com/api/email/confirm?token=example",
  frequency: "weekly",
  footer: { reason: "You're getting this because this address was entered to get US tariff updates from HTS Hero. If that wasn't you, ignore it." },
} satisfies NewsConfirmEmailProps
