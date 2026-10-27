import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Divider, Eyebrow, P, Panel, Title, UpdateBlock, UpdateSummary } from "../kit/parts"
import { SITE } from "../kit/brand"
import { TrackerLine } from "./TariffNewsEmail"

// The weekly tariff digest, on Mondays: every update from the week before that matches the
// subscriber's choices, newest first, approved in the outbox before it goes.

export interface TariffDigestEmailProps {
  // "Oct 8 – Oct 14, 2026"
  period: string
  updates: UpdateSummary[]
  // The reader has an account: the next step is their Tracker, not signing up
  signedIn?: boolean
  note?: string | null
  footer: EmailFooter
}

// Short and the same every week; the admin can change it per batch in the outbox
export const tariffDigestSubject = (_p: TariffDigestEmailProps) => "Your Weekly Tariff Brief"

export default function TariffDigestEmail({ period, updates, signedIn, note, footer }: TariffDigestEmailProps) {
  return (
    <EmailLayout preview={`Also: ${updates.slice(1).map((u) => u.title).join(" · ") || updates[0]?.summary || ""}`.slice(0, 150)} footer={footer}>
      <Eyebrow>Weekly tariff digest · {period}</Eyebrow>
      <Title>
        {updates.length} US tariff {updates.length === 1 ? "update" : "updates"} last week
      </Title>
      {note && (
        <Panel>
          <P small>{note}</P>
        </Panel>
      )}
      {updates.map((u, i) => (
        <div key={u.slug}>
          {i > 0 && <Divider />}
          <UpdateBlock update={u} campaign="tariff-digest" compact />
        </div>
      ))}
      <Divider />
      <Cta href={`${SITE}/tariff-updates?utm_source=email&utm_medium=email&utm_campaign=tariff-digest`}>See every tariff update</Cta>
      <TrackerLine signedIn={signedIn} campaign="tariff-digest" />
    </EmailLayout>
  )
}

TariffDigestEmail.PreviewProps = {
  period: "Oct 8 – Oct 14, 2026",
  updates: [
    {
      slug: "commerce-defines-u-s-content",
      title: "Commerce defines \"U.S. content\" for USMCA metal goods under Proclamation 11032",
      summary: "A Bureau of Industry and Security notice tells CBP how to assess U.S. content for metal goods entered under USMCA, which lowers the Section 232 duty on qualifying goods.",
      authorityLabel: "Section 232",
      stageLabel: "Published",
      effectiveOn: null,
      countriesLabel: "Canada, Mexico",
      tone: "brand",
    },
    {
      slug: "usitc-posts-hts-revision-21",
      title: "USITC posts HTS Revision 21 (2026)",
      summary: "It takes effect October 9, 2026. The change record lists every change to the HTS in this revision.",
      authorityLabel: "HTS",
      stageLabel: "In the HTS",
      effectiveOn: "2026-10-09",
      countriesLabel: null,
      tone: "neutral",
    },
  ],
  footer: { reason: "You get the weekly US tariff digest from HTS Hero.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies TariffDigestEmailProps
