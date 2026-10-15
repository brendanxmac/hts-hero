import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, P, Panel, StageTrack, UpdateBlock, UpdateSummary, updateUrl } from "../kit/parts"

// A tariff news alert: one update from /tariff-updates, as soon as it's approved in the outbox.
// The stage track shows how far the action has got; an optional note from Brendan leads.

export interface TariffNewsEmailProps {
  update: UpdateSummary
  // Indexes into the stage track (0 announced … 5 in the HTS)
  reached: number[]
  current: number
  // A line written in the outbox before approving
  note?: string | null
  footer: EmailFooter
}

export const tariffNewsSubject = (p: TariffNewsEmailProps) => p.update.title

export default function TariffNewsEmail({ update, reached, current, note, footer }: TariffNewsEmailProps) {
  return (
    <EmailLayout preview={update.summary.slice(0, 140)} footer={footer}>
      <Eyebrow>US tariff update</Eyebrow>
      {note && (
        <Panel>
          <P small>{note}</P>
        </Panel>
      )}
      <UpdateBlock update={update} campaign="tariff-news" />
      <StageTrack reached={reached} current={current} />
      <Cta href={updateUrl(update.slug, "tariff-news")}>Read the full update</Cta>
      <P muted small>
        Every update links to the official documents it&apos;s based on: proclamations, Federal Register notices and CBP guidance.
      </P>
    </EmailLayout>
  )
}

TariffNewsEmail.PreviewProps = {
  update: {
    slug: "us-sets-section-232-tariffs-on-drones-2026-08-13",
    title: "US sets Section 232 tariffs of 100% and 25% on drones and drone components",
    summary:
      "Proclamation 11055 imposes Section 232 duties of 100% on drones over 25 kg and certain critical components, and 25% on smaller drones, for goods entered on or after September 3, 2026.",
    authorityLabel: "Section 232",
    stageLabel: "Published",
    effectiveOn: "2026-09-03",
    countriesLabel: "All countries",
    tone: "up",
  },
  reached: [1, 2, 3],
  current: 3,
  note: null,
  footer: { reason: "You subscribed to US tariff updates from HTS Hero.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies TariffNewsEmailProps
