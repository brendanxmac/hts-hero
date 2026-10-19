import React, { ReactNode } from "react"
import { Button, Column, Heading, Hr, Link, Row, Section, Text } from "@react-email/components"
import { LOWEST_PER_IMPORT, REVERSE_TRIAL, TRACKER_TIERS, TRIAL_ALLOWANCE, formatPrice } from "../../components/pricing-calculator/lib/pricing"
import { AUDITS_ENABLED, SAVINGS_AUDITS_LABEL, SAVINGS_ENABLED } from "../../libs/tariff-tracker/features"
import { AUTO_AUDITING, COMING_LOWER, SAVINGS_DETECTION } from "../../components/ui/marketing/comingSoon"
import { C, FONT_DISPLAY, formatDay, SITE, TONES, Tone } from "./brand"

// The pieces every email is made of, in the Tracker's look: a small bold eyebrow in a role color,
// a Sora headline, plain body text, one pill button, chips, and for tariff news the stage track
// the social posts use. Tables and inline styles only, so Outlook draws them too.

export const Eyebrow = ({ children, tone = "brand" }: { children: ReactNode; tone?: Tone }) => (
  <Text style={{ margin: "0 0 10px", fontSize: 12, lineHeight: "16px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TONES[tone].fg }}>
    {children}
  </Text>
)

export const Title = ({ children, size = 26 }: { children: ReactNode; size?: number }) => (
  <Heading
    as="h1"
    style={{
      margin: "0 0 14px",
      fontFamily: FONT_DISPLAY,
      fontSize: size,
      lineHeight: `${Math.round(size * 1.22)}px`,
      fontWeight: 600,
      color: C.text,
      letterSpacing: "-0.01em",
    }}
  >
    {children}
  </Heading>
)

export const Subtitle = ({ children }: { children: ReactNode }) => (
  <Heading as="h2" style={{ margin: "0 0 10px", fontFamily: FONT_DISPLAY, fontSize: 18, lineHeight: "24px", fontWeight: 600, color: C.text }}>
    {children}
  </Heading>
)

export const P = ({ children, muted, small }: { children: ReactNode; muted?: boolean; small?: boolean }) => (
  <Text style={{ margin: "0 0 14px", fontSize: small ? 14 : 16, lineHeight: small ? "21px" : "25px", color: muted ? C.muted : C.text }}>{children}</Text>
)

type ButtonVariant = "primary" | "next" | "money"

const BUTTON_COLORS: Record<ButtonVariant, string> = { primary: C.navy, next: C.cobalt, money: C.green }

// One per email: the next step, full width with room below it. Primary is the text color as a
// fill; next (cobalt) and money (green) as in the Tracker.
export const Cta = ({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: ButtonVariant }) => (
  <Section style={{ margin: "12px 0 26px" }}>
    <Button
      href={href}
      style={{
        backgroundColor: BUTTON_COLORS[variant],
        color: "#FFFFFF",
        borderRadius: 999,
        padding: "15px 24px",
        fontSize: 16,
        fontWeight: 600,
        textDecoration: "none",
        textAlign: "center",
        display: "block",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </Button>
  </Section>
)

export const Chip = ({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 999,
      backgroundColor: TONES[tone].bg,
      color: TONES[tone].fg,
      fontSize: 12,
      lineHeight: "18px",
      fontWeight: 700,
      marginRight: 6,
    }}
  >
    {children}
  </span>
)

export const Divider = () => <Hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "24px 0" }} />

// A soft panel inside the card: facts, a quote, a list
export const Panel = ({ children }: { children: ReactNode }) => (
  <Section style={{ backgroundColor: C.soft, borderRadius: 18, padding: "18px 20px", margin: "6px 0 18px" }}>{children}</Section>
)

// Label / value rows, e.g. "Effective · Sep 3, 2026"
export const Facts = ({ rows }: { rows: { label: string; value: ReactNode }[] }) => (
  <Panel>
    {rows.map((r) => (
      <Row key={r.label} style={{ marginBottom: 6 }}>
        <Column style={{ width: 110, verticalAlign: "top" }}>
          <Text style={{ margin: 0, fontSize: 11, lineHeight: "20px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted }}>
            {r.label}
          </Text>
        </Column>
        <Column style={{ verticalAlign: "top" }}>
          <Text style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: C.text }}>{r.value}</Text>
        </Column>
      </Row>
    ))}
  </Panel>
)

// Where a tariff action stands, as in the social posts: a dot per stage, the reached ones filled
export const STAGE_TRACK = ["Announced", "Signed", "Filed", "Published", "CBP guidance", "In the HTS"]

export const StageTrack = ({ reached, current }: { reached: number[]; current: number }) => (
  <Section style={{ margin: "4px 0 20px" }}>
    <Row>
      {STAGE_TRACK.map((label, i) => {
        const done = reached.includes(i)
        const isCurrent = i === current
        return (
          <Column key={label} align="center" style={{ width: `${100 / STAGE_TRACK.length}%`, verticalAlign: "top" }}>
            {/* Every dot sits in the same 24px row (padding, not margins, so nothing collapses) */}
            <div style={{ height: 24, paddingTop: isCurrent ? 0 : 4, boxSizing: "border-box" }}>
              <div
                style={{
                  width: isCurrent ? 16 : 12,
                  height: isCurrent ? 16 : 12,
                  borderRadius: 999,
                  margin: "0 auto",
                  backgroundColor: done ? C.cobalt : C.surface,
                  border: `${isCurrent ? 4 : 2}px solid ${isCurrent ? C.cobaltSoft : done ? C.cobalt : C.border}`,
                  boxSizing: "content-box",
                }}
              />
            </div>
            <Text style={{ margin: "6px 0 0", fontSize: 11, lineHeight: "14px", fontWeight: isCurrent ? 700 : 500, color: done ? C.text : C.faint, textAlign: "center" }}>
              {label}
            </Text>
          </Column>
        )
      })}
    </Row>
  </Section>
)

// One tariff update, as a block: law and stage chips, headline linked to its page, summary, and
// the effective date. Used alone (a news alert) and in lists (a digest).
export interface UpdateSummary {
  slug: string
  title: string
  summary: string
  authorityLabel: string
  stageLabel: string
  effectiveOn: string | null
  countriesLabel: string | null
  tone: Tone
}

export const updateUrl = (slug: string, campaign: string) => `${SITE}/tariff-updates/${slug}?utm_source=email&utm_medium=email&utm_campaign=${campaign}`

export const UpdateBlock = ({ update, campaign, compact }: { update: UpdateSummary; campaign: string; compact?: boolean }) => (
  <Section style={{ margin: "0 0 22px" }}>
    <Text style={{ margin: "0 0 8px" }}>
      <Chip tone={update.tone}>{update.authorityLabel}</Chip>
      <Chip tone="brand">{update.stageLabel}</Chip>
    </Text>
    <Link
      href={updateUrl(update.slug, campaign)}
      style={{ fontFamily: FONT_DISPLAY, fontSize: compact ? 17 : 20, lineHeight: compact ? "23px" : "27px", fontWeight: 600, color: C.text, textDecoration: "none" }}
    >
      {update.title}
    </Link>
    <Text style={{ margin: "8px 0 0", fontSize: compact ? 14 : 15, lineHeight: compact ? "21px" : "23px", color: compact ? C.muted : C.text }}>{update.summary}</Text>
    {(update.effectiveOn || update.countriesLabel) && (
      <Text style={{ margin: "8px 0 0", fontSize: 13, lineHeight: "19px", color: C.muted }}>
        {update.effectiveOn ? `Effective ${formatDay(update.effectiveOn)}` : ""}
        {update.effectiveOn && update.countriesLabel ? " · " : ""}
        {update.countriesLabel ?? ""}
      </Text>
    )}
  </Section>
)

// A list with a cobalt check per line: what's included, what to do next
export const Checklist = ({ items }: { items: ReactNode[] }) => (
  <Section style={{ margin: "4px 0 18px" }}>
    {items.map((item, i) => (
      <Row key={i} style={{ marginBottom: 8 }}>
        <Column style={{ width: 26, verticalAlign: "top" }}>
          <Text style={{ margin: 0, fontSize: 15, lineHeight: "22px", fontWeight: 700, color: C.cobalt }}>✓</Text>
        </Column>
        <Column style={{ verticalAlign: "top" }}>
          <Text style={{ margin: 0, fontSize: 15, lineHeight: "22px", color: C.text }}>{item}</Text>
        </Column>
      </Row>
    ))}
  </Section>
)

// What the Tariff Tracker does, as a checklist (the welcome and meet-the-Tracker emails). The
// Tracker MVP (features.ts) sells tracking, alerts and impact checks; savings detection and
// auditing show as coming, with their label, until they're on.
export const TRACKER_POINTS: ReactNode[] =
  SAVINGS_ENABLED || AUDITS_ENABLED
    ? ["Track the duty rate on every import", "Get alerted when a new tariff hits one", "Find savings you may qualify for", "Audit past entries for overpaid duty"]
    : [
        "Track the duty rate on every import",
        "Get alerted when a new tariff hits one, with the rate before and after",
        "AD/CVD alerts when an import may fall under a case",
        "See exactly how any tariff action affects each import, with Insights across your catalog",
        "Export every tariff on every import to CSV or Excel",
        <>
          {SAVINGS_DETECTION.name} and {AUTO_AUDITING.name.toLowerCase()}, included when they launch <Chip tone="heads-up">{SAVINGS_AUDITS_LABEL}</Chip>
        </>,
      ]

// Signed by the founder: every email is from a person, and replies reach him
export const Signature = ({ line = "Founder, HTS Hero" }: { line?: string }) => (
  <Text style={{ margin: "18px 0 0", fontSize: 15, lineHeight: "22px", color: C.text }}>
    Brendan
    <br />
    <span style={{ color: C.muted, fontSize: 13 }}>{line} · Just reply to reach me directly</span>
  </Text>
)

// The way up, always in view but never the ask: what the free account already does, and where
// the plans are. Value first, then the door. The Tracker MVP (features.ts) sells tracking only, so
// savings and audit checks drop out of it while they're off. Worded to hold whether the reader is in
// the 14-day trial (REVERSE_TRIAL) or past it, since emails don't know which.
export const PlanStrip = ({ campaign, signedUp = true }: { campaign: string; signedUp?: boolean }) => (
  <Section style={{ marginTop: 24, borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
    <Text style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: C.muted }}>
      {signedUp ? "Your free account" : "A free HTS Hero account"}{" "}
      {SAVINGS_ENABLED || AUDITS_ENABLED ? (
        <>
          gives you the duty on every import you add, its rate history and sourcing, {TRIAL_ALLOWANCE.savingsChecks} savings checks, {TRIAL_ALLOWANCE.auditChecks} audit
          checks and Tariff News alerts on every new US tariff action.
        </>
      ) : (
        <>
          gives you Tariff News alerts on every new US tariff action, the duty on every import you add, its rate history and sourcing insights, free forever, plus the
          full Tariff Tracker (AD/CVD checks included) free for {signedUp ? "your first" : "its first"} {REVERSE_TRIAL.days} days on up to {REVERSE_TRIAL.imports}{" "}
          imports, no credit card. Automatic savings detection and automatic auditing are {COMING_LOWER}, included in every plan.
        </>
      )}{" "}
      Plans with alerts on your imports start at {formatPrice(TRACKER_TIERS[0].price)}/mo, as low as {formatPrice(LOWEST_PER_IMPORT)} per import.{" "}
      <Link href={`${SITE}/pricing-calculator?utm_source=email&utm_medium=email&utm_campaign=${campaign}`} style={{ color: C.cobalt, fontWeight: 600 }}>
        See plans
      </Link>
    </Text>
  </Section>
)

// A row of numbers, e.g. duty per shipment · changes · potential savings. tone colors the value
// (red a cost or a change, green money that could be saved)
export const Stats = ({ items }: { items: { label: string; value: string; note?: string; tone?: Tone }[] }) => (
  <Section style={{ margin: "6px 0 18px" }}>
    <Row>
      {items.map((s, i) => (
        <Column key={s.label} style={{ width: `${100 / items.length}%`, verticalAlign: "top", paddingLeft: i ? 8 : 0 }}>
          <Section style={{ backgroundColor: C.soft, borderRadius: 16, padding: "14px 14px 12px" }}>
            <Text style={{ margin: 0, fontSize: 11, lineHeight: "15px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted }}>
              {s.label}
            </Text>
            <Text style={{ margin: "6px 0 0", fontFamily: FONT_DISPLAY, fontSize: 22, lineHeight: "28px", fontWeight: 600, color: s.tone ? TONES[s.tone].fg : C.text }}>
              {s.value}
            </Text>
            {s.note && <Text style={{ margin: "2px 0 0", fontSize: 12, lineHeight: "17px", color: C.muted }}>{s.note}</Text>}
          </Section>
        </Column>
      ))}
    </Row>
  </Section>
)

// "$51,480"
export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
// "23.4%"
export const pct = (n: number) => `${Math.round(n * 10) / 10}%`

// What a personal tariff alert looks like, drawn small inside another email. The label says
// whether it's an example or their own. Rates only, never dollars.
export interface AlertSampleProps {
  label: string
  updateTitle: string
  code: string
  country: string
  description?: string
  beforePct: number | null
  afterPct: number | null
}

export const AlertSample = ({ label, updateTitle, code, country, description, beforePct, afterPct }: AlertSampleProps) => {
  const confirmed = beforePct !== null && afterPct !== null
  const tone = Number(afterPct) > Number(beforePct) ? TONES.up.fg : TONES.down.fg
  return (
    <Section style={{ border: `1px solid ${C.border}`, borderLeft: `4px solid ${TONES.up.fg}`, borderRadius: 14, padding: "14px 16px", margin: "6px 0 18px" }}>
      <Text style={{ margin: "0 0 6px", fontSize: 11, lineHeight: "15px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted }}>
        {label}
      </Text>
      <Text style={{ margin: "0 0 10px", fontFamily: FONT_DISPLAY, fontSize: 16, lineHeight: "22px", fontWeight: 600, color: C.text }}>{updateTitle}</Text>
      <Text style={{ margin: 0, fontSize: 14, lineHeight: "20px", fontWeight: 600, color: C.text }}>
        {code} from {country}
      </Text>
      {description && <Text style={{ margin: "2px 0 0", fontSize: 13, lineHeight: "19px", color: C.muted }}>{description}</Text>}
      <Text style={{ margin: "4px 0 0", fontSize: 13, lineHeight: "19px", color: C.text }}>
        {confirmed && Number(beforePct) === Number(afterPct) ? (
          <span style={{ color: C.muted }}>New Chapter 99 number to report, same duty ({pct(Number(afterPct))})</span>
        ) : confirmed ? (
          <>
            {pct(Number(beforePct))} → <strong style={{ color: tone }}>{pct(Number(afterPct))}</strong>
          </>
        ) : (
          <span style={{ color: TONES["heads-up"].fg }}>May apply: confirmed once it&apos;s in the HTS</span>
        )}
      </Text>
    </Section>
  )
}
