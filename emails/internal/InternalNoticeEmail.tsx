import { EmailLayout } from "../kit/Layout"
import { Eyebrow, Facts, Title } from "../kit/parts"

// For the team, not customers: a new lead or request, its details as rows. Reply goes to the person.

export interface InternalNoticeEmailProps {
  eyebrow: string
  title: string
  rows: { label: string; value: string }[]
}

export const internalNoticeSubject = (p: InternalNoticeEmailProps) => p.title

export default function InternalNoticeEmail({ eyebrow, title, rows }: InternalNoticeEmailProps) {
  return (
    <EmailLayout preview={title} footer={{ reason: "Internal notification from htshero.com. Reply to answer the person directly." }}>
      <Eyebrow tone="heads-up">{eyebrow}</Eyebrow>
      <Title size={22}>{title}</Title>
      <Facts rows={rows.map((r) => ({ label: r.label, value: <span style={{ whiteSpace: "pre-wrap" }}>{r.value}</span> }))} />
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
} satisfies InternalNoticeEmailProps
