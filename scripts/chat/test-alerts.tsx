// Sends sample tariff alerts to a Slack and/or Microsoft Teams channel, rendered and posted exactly
// the way the outbox sends real ones (emails/registry.tsx renderChat → slackPayload / teamsPayload),
// each title marked [Test]. Nothing is written to the database and no customer gets anything.
//
//   npm run chat:test -- --slack https://hooks.slack.com/services/… --teams https://…
//   npm run chat:test                       (uses SLACK_TEST_WEBHOOK / TEAMS_TEST_WEBHOOK in .env.local)
//   npm run chat:test -- --only impact      (only the samples whose name contains "impact")
//   npm run chat:test -- --list             (lists the samples without sending)
//   npm run chat:test -- --site https://…   (where the links go; defaults to BASE_URL in .env.local,
//                                            e.g. http://localhost:3000, else htshero.com)

import { existsSync } from "fs"
import { SITE } from "../../emails/kit/brand"
import { renderChat, slackPayload, teamsPayload } from "../../emails/registry"
import ImpactAlertEmail, { type ImpactAlertEmailProps } from "../../emails/tariff-updates/ImpactAlertEmail"
import TariffDigestEmail, { type TariffDigestEmailProps } from "../../emails/tariff-updates/TariffDigestEmail"
import TariffNewsEmail, { type TariffNewsEmailProps } from "../../emails/tariff-updates/TariffNewsEmail"

const news = TariffNewsEmail.PreviewProps as TariffNewsEmailProps
const digest = TariffDigestEmail.PreviewProps as TariffDigestEmailProps
const impact = ImpactAlertEmail.PreviewProps as ImpactAlertEmailProps

const brazilImport = (code: string, description: string, beforePct: number | null, afterPct: number | null, level: "confirmed" | "likely" = "confirmed") => ({
  key: `${code.replace(/\./g, "")}-BR`,
  code,
  country: "Brazil",
  description,
  level,
  beforePct,
  afterPct,
  deltaUsd: null as number | null,
})

// One of each kind of message a customer's channel can get, plus the edge cases of the impact alert
const SAMPLES: { name: string; template: string; props: Record<string, unknown> }[] = [
  { name: "news", template: "tariff_news", props: { ...news } },
  { name: "news-with-step", template: "tariff_news", props: { ...news, step: "Now in effect" } },
  { name: "news-with-note", template: "tariff_news", props: { ...news, note: "CBP guidance on entry filing is expected this week." } },
  { name: "digest", template: "tariff_digest", props: { ...digest } },
  { name: "impact", template: "impact_alert", props: { ...impact } },
  {
    name: "impact-many-imports",
    template: "impact_alert",
    props: {
      ...impact,
      imports: [
        brazilImport("8413.91.90.15", "Parts of pumps", 10, 35),
        brazilImport("8481.80.90.50", "Valves", 2, 27),
        brazilImport("7318.15.80.66", "Bolts", 0, 25),
        brazilImport("8536.50.90.65", "Switches", 2.7, 27.7),
        brazilImport("4016.93.10.20", "Oil seals", null, null, "likely"),
        brazilImport("8708.99.81.80", "Vehicle parts", 25, 25),
        brazilImport("9403.20.00.90", "Metal furniture", 0, 25),
        brazilImport("6403.99.90.65", "Footwear", 10, 35),
      ],
      removed: [{ code: "2009.11.00.20", country: "Brazil", description: "Orange juice" }],
      beyond: 4,
    },
  },
  {
    name: "impact-no-longer",
    template: "impact_alert",
    props: {
      ...impact,
      update: { ...impact.update, title: "USTR exempts orange juice and aircraft parts from the Section 301 tariff on Brazil", tone: "down" },
      imports: [],
      removed: [
        { code: "2009.11.00.20", country: "Brazil", description: "Orange juice" },
        { code: "8803.30.00.60", country: "Brazil", description: "Aircraft parts" },
      ],
      beyond: 0,
    },
  },
]

const flag = (name: string) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : (process.argv[i + 1] ?? "")
}

const post = async (url: string, body: unknown) => {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error(`answered ${response.status}: ${(await response.text()).slice(0, 200)}`)
}

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const only = flag("only")
  const samples = SAMPLES.filter((s) => !only || s.name.includes(only))
  if (process.argv.includes("--list")) {
    for (const s of SAMPLES) console.log(`${s.name.padEnd(22)} ${renderChat(s.template, s.props).title}`)
    return
  }
  const targets = [
    { channel: "Slack", url: flag("slack") ?? process.env.SLACK_TEST_WEBHOOK, payload: slackPayload },
    { channel: "Teams", url: flag("teams") ?? process.env.TEAMS_TEST_WEBHOOK, payload: teamsPayload },
  ].filter((t): t is typeof t & { url: string } => Boolean(t.url))
  if (!targets.length) throw new Error("No webhook: pass --slack <url> and/or --teams <url>, or set SLACK_TEST_WEBHOOK / TEAMS_TEST_WEBHOOK in .env.local")
  if (!samples.length) throw new Error(`No sample matches "${only}" (see --list)`)
  // Real alerts always link to htshero.com; a test can link to the site it's testing instead
  const site = (flag("site") ?? process.env.BASE_URL ?? SITE).replace(/\/$/, "")
  // The samples' updates may not exist on a dev site, so their links open its newest update instead
  const slug =
    site === SITE
      ? null
      : ((await fetch(`${site}/tariff-updates`, { signal: AbortSignal.timeout(120_000) })
          .then((r) => r.text())
          .then((html) => html.match(/href="\/tariff-updates\/([a-z0-9-]+)"/)?.[1])
          .catch((): undefined => undefined)) ?? null)
  const linkOf = (url: string) => {
    const local = url.replace(SITE, site)
    return slug ? local.replace(/\/tariff-updates\/[a-z0-9-]+/, `/tariff-updates/${slug}`).replace(/update=[a-z0-9-]+/, `update=${slug}`) : local
  }
  console.log(`Links go to ${site}${slug ? `, opening its update ${slug}` : ""}`)

  let failed = 0
  for (const target of targets) {
    for (const s of samples) {
      const chat = renderChat(s.template, s.props)
      try {
        await post(target.url, target.payload({ ...chat, title: `[Test] ${chat.title}`, actions: chat.actions.map((a) => ({ ...a, url: linkOf(a.url) })), rows: chat.rows?.map((r) => (r.url ? { ...r, url: linkOf(r.url) } : r)) }))
        console.log(`✓ ${target.channel}  ${s.name}`)
      } catch (e) {
        failed++
        console.log(`✗ ${target.channel}  ${s.name}: ${e instanceof Error ? e.message : e}`)
      }
      // Slack allows about one incoming-webhook message a second
      await new Promise((r) => setTimeout(r, 1100))
    }
  }
  if (failed) process.exit(1)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
