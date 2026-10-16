import { Link, Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, P, Title, UpdateSummary, updateUrl } from "../kit/parts"
import { C, FONT_DISPLAY, siteLink, TONES } from "../kit/brand"

// A personal tariff alert, short: the update and how many of the account's imports it affects, sent
// after the admin approved the update's impact check. The imports and their rates are in the
// Tracker, one click away. Imports outside the plan's alert slots are counted (the upgrade). A
// later approval sends only what's new or changed, and says which imports it no longer affects.

export interface AlertedImport {
  key: string
  code: string
  country: string
  description: string
  level: "confirmed" | "likely"
  beforePct: number | null
  afterPct: number | null
  deltaUsd: number | null
  // Was "likely" in an earlier alert, now confirmed
  nowConfirmed?: boolean
}

export interface ImpactAlertEmailProps {
  update: UpdateSummary
  reached: number[]
  current: number
  imports: AlertedImport[]
  // Imports it was said to affect that it no longer does
  removed: { code: string; country: string; description: string }[]
  // Affected imports outside the plan's alert slots
  beyond: number
  // How many imports the plan alerts on (missing on alerts queued before it was sent)
  limit?: number
  paid: boolean
  footer: EmailFooter
}

const imports = (n: number) => `${n} of your imports`

export const impactAlertSubject = (p: ImpactAlertEmailProps) => {
  const n = p.imports.length + p.beyond
  if (!n && p.removed.length) return `Good news: a tariff update no longer affects ${imports(p.removed.length)}`
  // Only confirmations of an earlier "may apply" alert
  if (p.imports.length && p.imports.every((i) => i.nowConfirmed) && !p.beyond && !p.removed.length)
    return `Confirmed: ${imports(n)} ${n === 1 ? "is" : "are"} affected by a new tariff`
  const sure = p.imports.some((i) => i.level === "confirmed")
  return sure
    ? `${imports(n)} ${n === 1 ? "is" : "are"} affected by a new tariff announcement`
    : `${imports(n)} may be affected by a new tariff announcement`
}

// The affected count, in red under the headline, and how many of those the alerts don't cover
const Affected = ({ n, beyond, removed }: { n: number; beyond: number; removed: number }) => (
  <Section style={{ margin: "0 0 20px" }}>
    <Text style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 18, lineHeight: "24px", fontWeight: 700, color: n ? TONES.up.fg : TONES.down.fg }}>
      {n ? `${n} of your imports ${n === 1 ? "is" : "are"} affected` : `No longer affects ${removed} of your imports`}
    </Text>
    {/* {beyond > 0 && (
      <Text style={{ margin: "2px 0 0", fontSize: 14, lineHeight: "20px", color: C.muted }}>
        {beyond} of them {beyond === 1 ? "isn't" : "aren't"} covered by your alerts
      </Text>
    )} */}
  </Section>
)

// Affected imports past the plan's alert slots, in small print under the button so it doesn't
// compete with it. Free accounts are told it's the free limit, paid ones their plan's.
const NotCovered = ({ beyond, limit, paid, campaign }: { beyond: number; limit?: number; paid: boolean; campaign: string }) => (
  <Text style={{ margin: "-8px 0 14px", fontSize: 13, lineHeight: "19px", color: C.muted }}>
    {paid
      ? `${beyond} affected ${beyond === 1 ? "import isn't" : "imports aren't"} covered: your plan alerts on ${limit ? `${limit} imports` : "fewer imports than you track"}.`
      : `${beyond} affected ${beyond === 1 ? "import isn't" : "imports aren't"} covered: free accounts get alerts on ${limit ?? "a limited number of"} imports, and these stay unalerted until you upgrade.`}{" "}
    <Link href={siteLink("/tariff-tracker?upgrade=alerts", campaign)} style={{ color: C.cobalt, fontWeight: 600 }}>
      {paid ? "Cover all my imports" : "Upgrade to cover them"}
    </Link>
  </Text>
)

export default function ImpactAlertEmail(props: ImpactAlertEmailProps) {
  const { update, imports: alerted, removed, beyond, limit, paid, footer } = props
  const campaign = "impact-alert"
  return (
    <EmailLayout preview={impactAlertSubject(props).slice(0, 160)} footer={footer}>
      <Eyebrow tone="up">Tariff alert</Eyebrow>
      <Title size={26}>{update.title}</Title>

      <Affected n={alerted.length + beyond} beyond={beyond} removed={removed.length} />

      {removed.length > 0 && alerted.length + beyond > 0 && (
        <P small>No longer affected: {removed.map((r) => `${r.code} from ${r.country}`).join("; ")}.</P>
      )}

      <Cta href={siteLink(`/tariff-tracker?tab=impact&update=${encodeURIComponent(update.slug)}`, campaign)} variant="next">
        See the impact on my imports
      </Cta>

      {beyond > 0 && <NotCovered beyond={beyond} limit={limit} paid={paid} campaign={campaign} />}

      <P muted small>
        <Link href={updateUrl(update.slug, campaign)} style={{ color: C.muted }}>
          Read the update
        </Link>
        {" · "}
        <Link href={siteLink("/tariff-tracker?tab=alerts", campaign)} style={{ color: C.muted }}>
          Alert settings
        </Link>
      </P>
    </EmailLayout>
  )
}

ImpactAlertEmail.PreviewProps = {
  update: {
    slug: "ustr-imposes-25-section-301-tariff-on-goods-of-brazil",
    title: "USTR imposes 25% Section 301 tariff on goods of Brazil, with exemptions",
    summary: "A new 25% Section 301 duty applies to most goods of Brazil entered on or after July 22, 2026, with listed exemptions.",
    authorityLabel: "Section 301",
    stageLabel: "Published",
    effectiveOn: "2026-07-22",
    countriesLabel: "Brazil",
    tone: "up",
  },
  reached: [0, 3],
  current: 3,
  imports: [
    { key: "8413919015-BR", code: "8413.91.90.15", country: "Brazil", description: "Parts of pumps", level: "confirmed", beforePct: 10, afterPct: 35, deltaUsd: 2500 },
    { key: "4016931020-BR", code: "4016.93.10.20", country: "Brazil", description: "Oil seals", level: "likely", beforePct: null, afterPct: null, deltaUsd: null },
  ],
  removed: [],
  beyond: 3,
  limit: 10,
  paid: false,
  footer: { reason: "You're getting this because alerts are on for your imports in the HTS Hero Tariff Tracker.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies ImpactAlertEmailProps
