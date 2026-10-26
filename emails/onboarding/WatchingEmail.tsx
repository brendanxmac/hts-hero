import { Link, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, Facts, P, PlanStrip, Signature, Title } from "../kit/parts"
import { C, siteLink } from "../kit/brand"

// Sent the moment someone starts watching an import from the one-click ways in (the HTS pages'
// Get Alerts, the calculator's Stop Overpaying), once per import: what they asked for, done, with
// that import's duty today, its last change and anything coming, so the first email is already
// worth opening; then one link back to that import, and the way to add the rest. Rates as %.

export interface WatchingEmailProps {
  // "73181580-CN": which import it was, so it's sent once per import (not shown)
  productKey?: string
  // "7318.15.80"
  htsno: string
  // "Screws and bolts"
  productName: string
  // "China"
  country: string
  // The import's page in the Tracker (a path)
  path: string
  // Total duty today (base plus tariffs), % of value
  dutyPct: number
  asOf: string // "Oct 26, 2026"
  // The latest change to that total, and the next one already announced
  last: { date: string; beforePct: number; afterPct: number } | null
  next: { date: string; beforePct: number; afterPct: number } | null
  // "Nov 17, 2025": when our verified rates start
  since: string
  footer: EmailFooter
}

const CAMPAIGN = "watching"
const pct = (n: number) => `${Math.round(n * 100) / 100}%`

export const watchingSubject = (p: WatchingEmailProps) => `You're watching ${p.htsno} from ${p.country}`

export default function WatchingEmail(p: WatchingEmailProps) {
  return (
    <EmailLayout preview={`${p.htsno} from ${p.country} pays ${pct(p.dutyPct)} today. We'll email you the day that changes.`} footer={p.footer}>
      <Eyebrow>Alerts on</Eyebrow>
      <Title>
        You&apos;re watching {p.htsno} from {p.country}
      </Title>
      <P>
        {p.productName}. We&apos;ll email you the day a tariff change hits it, with the rate before and after and the official source.
      </P>
      <Facts
        rows={[
          { label: "Duty today", value: `${pct(p.dutyPct)} as of ${p.asOf}, before fees` },
          {
            label: "Last change",
            value: p.last ? `${p.last.date}: ${pct(p.last.beforePct)} → ${pct(p.last.afterPct)}` : `No change since ${p.since}`,
          },
          {
            label: "Coming up",
            value: p.next ? `${p.next.date}: ${pct(p.next.beforePct)} → ${pct(p.next.afterPct)}` : "Nothing announced yet",
          },
        ]}
      />
      <Cta href={siteLink(p.path, CAMPAIGN)}>See this import</Cta>
      <Text style={{ margin: "14px 0 0", fontSize: 15, lineHeight: "22px", color: C.text }}>
        Import more than one product?{" "}
        <Link href={siteLink("/tariff-tracker?setup=add", CAMPAIGN)} style={{ color: C.cobalt, fontWeight: 600 }}>
          Add the rest of your imports
        </Link>{" "}
        and we&apos;ll watch them too.
      </Text>
      <Signature />
      <PlanStrip campaign={CAMPAIGN} />
    </EmailLayout>
  )
}
