import { Link } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { C, siteLink } from "../kit/brand"
import { Cta, Eyebrow, P, Panel, StageTrack, UpdateBlock, UpdateSummary, updateUrl } from "../kit/parts"

// A tariff news alert: one update from /tariff-updates, as soon as it's found (or cleared after
// review). The stage track shows how far the action has got; an optional note from Brendan leads.
// A follow-up for an update already alerted says what's new in the subject and eyebrow.

export interface TariffNewsEmailProps {
  update: UpdateSummary
  // Indexes into the stage track (0 announced … 5 in the HTS)
  reached: number[]
  current: number
  // What's new since the last alert about this update ("Published in the Federal Register")
  step?: string | null
  // The reader has an account: the next step is their Tracker, not signing up
  signedIn?: boolean
  // A line written in the outbox before approving
  note?: string | null
  footer: EmailFooter
}

export const tariffNewsSubject = (p: TariffNewsEmailProps) => (p.step ? `${p.step}: ${p.update.title}` : p.update.title)

// After the news, the way to the reader's own imports: their Tracker, or a free one
export const TrackerLine = ({ signedIn, campaign }: { signedIn?: boolean; campaign: string }) =>
  signedIn ? (
    <P muted small>
      See whether it changes the duty on your own imports in{" "}
      <Link href={siteLink("/tariff-tracker?tab=news", campaign)} style={{ color: C.cobalt, fontWeight: 600 }}>
        your Tariff Tracker
      </Link>
      .
    </P>
  ) : (
    <P muted small>
      Want to know when a change like this hits your own imports? Add your HTS codes and countries to the free Tariff Tracker and we&apos;ll alert you
      when an update affects one of them.{" "}
      <Link href={siteLink("/tariff-tracker?tab=catalog&add=paste", campaign)} style={{ color: C.cobalt, fontWeight: 600 }}>
        Add my imports, free
      </Link>
    </P>
  )

export default function TariffNewsEmail({ update, reached, current, step, signedIn, note, footer }: TariffNewsEmailProps) {
  return (
    <EmailLayout preview={update.summary.slice(0, 140)} footer={footer}>
      <Eyebrow>{step ? `US tariff update · ${step}` : "US tariff update"}</Eyebrow>
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
      <TrackerLine signedIn={signedIn} campaign="tariff-news" />
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
  step: null,
  signedIn: false,
  note: null,
  footer: { reason: "You subscribed to US tariff updates from HTS Hero.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies TariffNewsEmailProps
