import { TONES, type Tone } from "./kit/brand"

// How a message reads in Slack and Microsoft Teams. Built to be read at a glance in a busy
// channel: a small line saying what kind of news it is, a big headline, the few rows that matter
// (each import with its rate before → after), then buttons to the full details on the site. The
// colored edge says which way it goes: red when duty goes up, green when it goes down.

export interface ChatRow {
  // Bold, e.g. "8413.91.90.15 · Brazil", or a linked update title
  label: string
  url?: string
  // Muted, under the label, e.g. "Parts of pumps"
  detail?: string
  // The right-hand column, e.g. "10% → 35%  ▲ +25%"
  value?: string
  tone?: Tone
}

export interface ChatMessage {
  // The headline. Also what the push notification says.
  title: string
  tone: Tone
  // Above the headline, e.g. "Tariff alert · Section 301 · Brazil"
  eyebrow?: string
  // A sentence or two under the headline (Slack mrkdwn: *bold* works)
  summary?: string
  // Short label/value pairs, e.g. Effective: Sep 3, 2026
  facts?: { label: string; value: string }[]
  rows?: ChatRow[]
  // Small print under the rows
  notes?: string[]
  // Buttons; the first is the main one
  actions: { label: string; url: string }[]
}

// "2026-07-22" → "Jul 22, 2026"
export const chatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
}

const round = (n: number) => Math.round(n * 10) / 10

// A rate change as before → after and the difference in % (never "points", never dollars)
export const rateChange = (beforePct: number | null, afterPct: number | null): { value: string; tone: Tone } | null => {
  if (beforePct === null || afterPct === null) return null
  const diff = round(Number(afterPct) - Number(beforePct))
  const rates = `${round(Number(beforePct))}% → ${round(Number(afterPct))}%`
  if (!diff) return { value: `${rates}  · same rate`, tone: "neutral" }
  return diff > 0 ? { value: `${rates}  ▲ +${diff}%`, tone: "up" } : { value: `${rates}  ▼ −${Math.abs(diff)}%`, tone: "down" }
}

// ---------- Slack (incoming webhook, Block Kit) ----------

// Slack mrkdwn treats &, < and > as control characters
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const cut = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1)}…` : s)
const mrkdwn = (text: string) => ({ type: "mrkdwn", text })

const slackRows = (rows: ChatRow[]) => {
  const label = (r: ChatRow) => (r.url ? `*<${r.url}|${esc(r.label)}>*` : `*${esc(r.label)}*`)
  const left = (r: ChatRow) => `${label(r)}${r.detail ? `\n${esc(r.detail)}` : ""}`
  // Rows without a value read as a list; rows with one as a two-column table (a section holds 10
  // fields, so 5 rows each)
  if (rows.every((r) => !r.value)) return [{ type: "section", text: mrkdwn(rows.map(left).join("\n\n")) }]
  const blocks = []
  for (let i = 0; i < rows.length; i += 5) {
    blocks.push({ type: "section", fields: rows.slice(i, i + 5).flatMap((r) => [mrkdwn(left(r)), mrkdwn(r.value ? `*${esc(r.value)}*` : " ")]) })
  }
  return blocks
}

export const slackPayload = (m: ChatMessage) => ({
  // The notification and the fallback where blocks don't show
  text: m.title,
  attachments: [
    {
      color: TONES[m.tone].fg,
      blocks: [
        ...(m.eyebrow ? [{ type: "context", elements: [mrkdwn(esc(m.eyebrow))] }] : []),
        { type: "header", text: { type: "plain_text", text: cut(m.title, 150), emoji: true } },
        ...(m.summary ? [{ type: "section", text: mrkdwn(m.summary) }] : []),
        ...(m.facts?.length ? [{ type: "section", fields: m.facts.slice(0, 10).map((f) => mrkdwn(`*${esc(f.label)}*\n${esc(f.value)}`)) }] : []),
        ...(m.rows?.length ? [{ type: "divider" }, ...slackRows(m.rows)] : []),
        ...(m.notes?.length ? [{ type: "context", elements: m.notes.slice(0, 10).map((n) => mrkdwn(esc(n))) }] : []),
        {
          type: "actions",
          elements: m.actions.slice(0, 5).map((a, i) => ({ type: "button", text: { type: "plain_text", text: cut(a.label, 75) }, url: a.url, ...(i === 0 ? { style: "primary" } : {}) })),
        },
      ],
    },
  ],
})

// ---------- Microsoft Teams (Workflows webhook, Adaptive Card) ----------

const TEAMS_COLORS: Record<Tone, string> = { up: "Attention", down: "Good", "heads-up": "Warning", brand: "Accent", neutral: "Default" }

// Adaptive Cards use Markdown: **bold** and [text](url)
const toTeams = (s: string) => s.replace(/\*([^*\n]+)\*/g, "**$1**")

export const teamsPayload = (m: ChatMessage) => ({
  type: "message",
  attachments: [
    {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: {
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        type: "AdaptiveCard",
        version: "1.4",
        msteams: { width: "Full" },
        body: [
          ...(m.eyebrow ? [{ type: "TextBlock", text: m.eyebrow, size: "Small", weight: "Bolder", color: TEAMS_COLORS[m.tone], wrap: true }] : []),
          { type: "TextBlock", text: m.title, size: "Large", weight: "Bolder", wrap: true, spacing: "Small" },
          ...(m.summary ? [{ type: "TextBlock", text: toTeams(m.summary), wrap: true }] : []),
          ...(m.facts?.length ? [{ type: "FactSet", facts: m.facts.map((f) => ({ title: f.label, value: f.value })) }] : []),
          ...(m.rows ?? []).map((r, i) => ({
            type: "ColumnSet",
            separator: i === 0,
            spacing: i === 0 ? "Medium" : "Small",
            columns: [
              {
                type: "Column",
                width: "stretch",
                items: [
                  { type: "TextBlock", text: r.url ? `[${r.label}](${r.url})` : r.label, weight: "Bolder", wrap: true },
                  ...(r.detail ? [{ type: "TextBlock", text: r.detail, isSubtle: true, size: "Small", spacing: "None", wrap: true }] : []),
                ],
              },
              ...(r.value
                ? [{ type: "Column", width: "auto", items: [{ type: "TextBlock", text: r.value, weight: "Bolder", color: TEAMS_COLORS[r.tone ?? "neutral"], horizontalAlignment: "Right" }] }]
                : []),
            ],
          })),
          ...(m.notes ?? []).map((n, i) => ({ type: "TextBlock", text: n, isSubtle: true, size: "Small", wrap: true, ...(i === 0 ? { separator: true } : { spacing: "Small" }) })),
        ],
        actions: m.actions.map((a) => ({ type: "Action.OpenUrl", title: a.label, url: a.url })),
      },
    },
  ],
})
