import { EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, Facts, Title } from "../kit/parts"

// For the team, not customers: a new lead or request, its details as rows, and a button that starts
// a reply to the person. Not a Reply-To header: one pointing at an outside address on a message
// from our own domain is a phishing sign, and Gmail sends the notice to spam for it.

export interface InternalNoticeEmailProps {
  eyebrow: string
  title: string
  rows: { label: string; value: string }[]
  replyTo?: { name: string; email: string }
}

export const internalNoticeSubject = (p: InternalNoticeEmailProps) => p.title

export default function InternalNoticeEmail({ eyebrow, title, rows, replyTo }: InternalNoticeEmailProps) {
  return (
    <EmailLayout preview={title} footer={{ reason: "Internal notification from htshero.com." }}>
      <Eyebrow tone="heads-up">{eyebrow}</Eyebrow>
      <Title size={22}>{title}</Title>
      <Facts rows={rows.map((r) => ({ label: r.label, value: <span style={{ whiteSpace: "pre-wrap" }}>{r.value}</span> }))} />
      {replyTo && (
        <Cta href={`mailto:${replyTo.email}?subject=${encodeURIComponent(`Re: ${title}`)}`}>Reply to {replyTo.name.split(" ")[0] || replyTo.name}</Cta>
      )}
    </EmailLayout>
  )
}

InternalNoticeEmail.PreviewProps = {
  eyebrow: "New tariff audit request",
  title: "Tariff audit request: Acme Imports",
  rows: [
    { label: "Name", value: "Alex Smith" },
    { label: "Email", value: "alex@acme.com" },
    { label: "Imports", value: "$1M–$10M a year" },
  ],
  replyTo: { name: "Alex Smith", email: "alex@acme.com" },
} satisfies InternalNoticeEmailProps
