import { Link } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { C, formatDay, siteLink } from "../kit/brand"
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

export const tariffNewsSubject = (p: TariffNewsEmailProps) => (p.step ? `${p.step}: ${p.update.title}` : `New tariff: ${p.update.title}`)

// The facts first (when, who), then the summary: enough to open, not enough to skip the click
const newsPreview = (u: UpdateSummary) =>
  [[u.effectiveOn ? `Effective ${formatDay(u.effectiveOn)}` : null, u.countriesLabel].filter(Boolean).join(" · "), u.summary]
    .filter(Boolean)
    .join(". ")
    .slice(0, 150)

// After the news, the way to the reader's own imports: their Tracker, or a free one
export const TrackerLine = ({ signedIn, campaign }: { signedIn?: boolean; campaign: string }) =>
  signedIn ? (
    <P muted small>
      Does it hit your imports?{" "}
      <Link href={siteLink("/tariff-tracker?tab=news", campaign)} style={{ color: C.cobalt, fontWeight: 600 }}>
        Check in your Tariff Tracker
      </Link>
    </P>
  ) : (
    <P muted small>
      Want to get alerted when a change like this hits your own imports?{" "}
      <Link href={siteLink("/tariff-tracker?tab=catalog&add=paste", campaign)} style={{ color: C.cobalt, fontWeight: 600 }}>
        Track your imports here, free.
      </Link>
    </P>
  )

export default function TariffNewsEmail({ update, reached, current, step, signedIn, note, footer }: TariffNewsEmailProps) {
  return (
    <EmailLayout preview={newsPreview(update)} footer={footer}>
      <Eyebrow>{step ? `US tariff update · ${step}` : "US tariff update"}</Eyebrow>
      {note && (
        <Panel>
          <P small>{note}</P>
        </Panel>
      )}
      <UpdateBlock update={update} campaign="tariff-news" />
      <StageTrack reached={reached} current={current} />
      <Cta href={updateUrl(update.slug, "tariff-news")}>Learn More &rarr;</Cta>
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
