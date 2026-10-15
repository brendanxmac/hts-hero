import { Column, Link, Row, Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Eyebrow, P, Title, UpdateSummary, pct, updateUrl } from "../kit/parts"
import { C, FONT_DISPLAY, siteLink, TONES } from "../kit/brand"

// A personal tariff alert, short: how many of the account's imports one tariff update affects, sent
// after the admin approved the update's impact check. Each import shows its rate before and after
// (rates only, never dollars), confirmed by the duty engine, or likely (the
// update names its code and country; confirmed once it's in the HTS). Imports outside the plan's
// alert slots are counted, not detailed (the upgrade). A later approval sends only what's new or
// changed, and says which imports it no longer affects.

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
  paid: boolean
  footer: EmailFooter
}

const short = (description: string) => {
  const last = description.split(" › ").pop() ?? description
  return last.length > 60 ? `${last.slice(0, 57).trim()}…` : last
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

// The rate before and after, never dollars
const Change = ({ i }: { i: AlertedImport }) => {
  if (i.level === "likely") return <Text style={{ margin: 0, fontSize: 13, lineHeight: "19px", color: TONES["heads-up"].fg }}>May apply, confirmed once it&apos;s in the HTS</Text>
  if (Number(i.beforePct) === Number(i.afterPct))
    return <Text style={{ margin: 0, fontSize: 13, lineHeight: "19px", color: C.muted }}>Same duty ({pct(Number(i.afterPct))}), new Chapter 99 number to report</Text>
  const tone = Number(i.afterPct) > Number(i.beforePct) ? TONES.up.fg : TONES.down.fg
  return (
    <Text style={{ margin: 0, fontSize: 13, lineHeight: "19px", color: C.text }}>
      {pct(Number(i.beforePct))} → <strong style={{ color: tone }}>{pct(Number(i.afterPct))}</strong>
    </Text>
  )
}

export default function ImpactAlertEmail(props: ImpactAlertEmailProps) {
  const { update, imports: alerted, removed, beyond, paid, footer } = props
  const campaign = "impact-alert"
  return (
    <EmailLayout preview={`${update.title}. See the new rate on each one.`.slice(0, 160)} footer={footer}>
      <Eyebrow tone="up">Tariff alert</Eyebrow>
      <Title size={24}>{impactAlertSubject(props)}</Title>
      <P>
        <Link href={updateUrl(update.slug, campaign)} style={{ color: C.text, fontWeight: 600 }}>
          {update.title}
        </Link>
      </P>

      {alerted.length > 0 && (
        <Section style={{ margin: "4px 0 18px" }}>
          {alerted.map((i) => (
            <Row key={i.key} style={{ borderTop: `1px solid ${C.border}` }}>
              <Column style={{ padding: "12px 0", verticalAlign: "top" }}>
                <Text style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 15, lineHeight: "21px", fontWeight: 600, color: C.text }}>{short(i.description)}</Text>
                <Text style={{ margin: "2px 0 4px", fontSize: 12, lineHeight: "17px", color: C.muted }}>
                  {i.code} · {i.country}
                </Text>
                <Change i={i} />
              </Column>
            </Row>
          ))}
        </Section>
      )}

      {beyond > 0 && (
        <P small>
          Plus {beyond} more outside the imports your alerts cover.{" "}
          <Link href={siteLink("/tariff-tracker?upgrade=alerts", campaign)} style={{ color: C.cobalt, fontWeight: 600 }}>
            {paid ? "Cover them too" : "See plans"}
          </Link>
        </P>
      )}

      {removed.length > 0 && (
        <P small>No longer affected: {removed.map((r) => `${short(r.description)} (${r.code}, ${r.country})`).join("; ")}.</P>
      )}

      <Cta href={siteLink(`/tariff-tracker?tab=impact&update=${encodeURIComponent(update.slug)}`, campaign)} variant="next">
        See the impact on my imports
      </Cta>
      <P muted small>
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
  paid: false,
  footer: { reason: "You're getting this because alerts are on for your imports in the HTS Hero Tariff Tracker.", manageUrl: "https://htshero.com/tariff-updates/subscription?token=example", unsubscribeUrl: "https://htshero.com/api/email/unsubscribe?token=example" },
} satisfies ImpactAlertEmailProps
