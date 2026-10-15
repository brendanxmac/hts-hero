import { Column, Link, Row, Section, Text } from "@react-email/components"
import { EmailFooter, EmailLayout } from "../kit/Layout"
import { Cta, Divider, Eyebrow, P, Panel, Signature, StageTrack, Title, UpdateBlock, UpdateSummary, pct, usd } from "../kit/parts"
import { C, FONT_DISPLAY, siteLink, TONES } from "../kit/brand"

// A personal tariff alert: one tariff update and the account's own imports it affects, sent after
// the admin approved the update's impact check. Each import shows what changes for it: confirmed
// by the duty engine (rate before and after, and the change on one shipment), or likely (the
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

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

export const impactAlertSubject = (p: ImpactAlertEmailProps) => {
  const n = p.imports.length + p.beyond
  const title = p.update.title.length > 70 ? `${p.update.title.slice(0, 67).trim()}…` : p.update.title
  if (!n && p.removed.length) return `Update: ${title} no longer affects ${plural(p.removed.length, "of your imports", "of your imports")}`
  const sure = p.imports.some((i) => i.level === "confirmed")
  return `Tariff alert: ${title} ${sure ? "affects" : "may affect"} ${n} of your imports`
}

const Change = ({ i }: { i: AlertedImport }) => {
  if (i.level === "likely") return <Text style={{ margin: 0, fontSize: 13, lineHeight: "19px", color: TONES["heads-up"].fg }}>May apply: we&apos;ll confirm once it&apos;s in the HTS</Text>
  const delta = Number(i.deltaUsd ?? 0)
  if (Math.abs(delta) < 0.5)
    return <Text style={{ margin: 0, fontSize: 13, lineHeight: "19px", color: C.muted }}>New Chapter 99 number to report, same duty ({pct(Number(i.afterPct))})</Text>
  const tone = delta > 0 ? TONES.up.fg : TONES.down.fg
  return (
    <Text style={{ margin: 0, fontSize: 13, lineHeight: "19px", color: C.text }}>
      {pct(Number(i.beforePct))} → <strong style={{ color: tone }}>{pct(Number(i.afterPct))}</strong>
      <span style={{ color: tone }}>
        {" "}
        · {delta > 0 ? "+" : "−"}
        {usd(Math.abs(delta))} per shipment
      </span>
    </Text>
  )
}

export default function ImpactAlertEmail({ update, reached, current, imports, removed, beyond, paid, footer }: ImpactAlertEmailProps) {
  const campaign = "impact-alert"
  const total = imports.length + beyond
  const extra = imports.filter((i) => i.level === "confirmed").reduce((sum, i) => sum + Number(i.deltaUsd ?? 0), 0)
  return (
    <EmailLayout preview={total ? `${plural(total, "of your imports", "of your imports")}${extra > 0 ? `, up to ${usd(extra)} more per shipment` : ""}. ${update.summary.slice(0, 90)}` : update.summary.slice(0, 140)} footer={footer}>
      <Eyebrow tone="up">Tariff alert</Eyebrow>
      <Title size={24}>
        {total
          ? `This affects ${plural(total, "of your imports", "of your imports")}`
          : `This no longer affects ${plural(removed.length, "of your imports", "of your imports")}`}
      </Title>
      <UpdateBlock update={update} campaign={campaign} />
      <StageTrack reached={reached} current={current} />

      {imports.length > 0 && (
        <Section style={{ margin: "4px 0 18px" }}>
          {imports.map((i) => (
            <Row key={i.key} style={{ borderTop: `1px solid ${C.border}` }}>
              <Column style={{ padding: "12px 0", verticalAlign: "top" }}>
                <Text style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 15, lineHeight: "21px", fontWeight: 600, color: C.text }}>
                  {short(i.description)}
                  {i.nowConfirmed && <span style={{ marginLeft: 6, fontSize: 11, color: TONES.up.fg }}>NOW CONFIRMED</span>}
                </Text>
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
        <Panel>
          <Text style={{ margin: 0, fontSize: 14, lineHeight: "21px", color: C.text }}>
            <strong>It may also affect {plural(beyond, "more of your imports", "more of your imports")}</strong>, outside the imports your alerts cover.{" "}
            {paid ? "Add them to your plan to see each one." : "Alerts cover up to 10 imports on your free account; a plan covers them all."}{" "}
            <Link href={siteLink("/tariff-tracker?upgrade=alerts", campaign)} style={{ color: C.cobalt, fontWeight: 600 }}>
              See plans
            </Link>
          </Text>
        </Panel>
      )}

      {removed.length > 0 && (
        <>
          <Divider />
          <Eyebrow tone="down">No longer affected</Eyebrow>
          <P small>
            On a closer look at the official documents, this update doesn&apos;t apply to {removed.map((r) => `${short(r.description)} (${r.code}, ${r.country})`).join("; ")}.
          </P>
        </>
      )}

      <Cta href={siteLink("/tariff-tracker?tab=news", campaign)} variant="next">
        See it in my Tracker
      </Cta>
      {imports.length > 0 && (
        <P muted small>
          Confirmed changes come from the duty engine, worked out on your import&apos;s saved value.
          {imports.some((i) => i.level === "likely") &&
            " \"May apply\" means the update names your import's code and country; we'll confirm the exact duty once it's in the HTS."}
        </P>
      )}
      <Signature />
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
