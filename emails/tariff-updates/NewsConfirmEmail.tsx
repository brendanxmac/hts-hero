import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, P, Title } from "../kit/parts"

// Double opt-in for tariff news: nothing is sent until this is clicked. Says what they'll get.

export interface NewsConfirmEmailProps {
  confirmUrl: string
  frequency: "instant" | "weekly" | "off"
  footer: EmailFooter
}

export const newsConfirmSubject = () => "Confirm your US tariff updates"

export default function NewsConfirmEmail({ confirmUrl, frequency, footer }: NewsConfirmEmailProps) {
  return (
    <EmailLayout preview="One click and you'll get every new US tariff action, in plain English." footer={footer}>
      <Eyebrow>One click left</Eyebrow>
      <Title>Confirm your US tariff updates</Title>
      <P>
        {frequency === "instant"
          ? "Confirm and you'll get each new US tariff action as it happens: what changes, for which goods and countries, and from when, with links to the official documents."
          : "Confirm and you'll get a weekly digest of every new US tariff action: what changes, for which goods and countries, and from when, with links to the official documents."}
      </P>
      <Cta href={confirmUrl} variant="next">
        Confirm my subscription
      </Cta>
    </EmailLayout>
  )
}

NewsConfirmEmail.PreviewProps = {
  confirmUrl: "https://htshero.com/api/email/confirm?token=example",
  frequency: "weekly",
  footer: { reason: "You're getting this because this address was entered to get US tariff updates from HTS Hero. If that wasn't you, ignore it." },
} satisfies NewsConfirmEmailProps
