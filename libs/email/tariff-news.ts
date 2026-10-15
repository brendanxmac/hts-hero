import type { SupabaseClient } from "@supabase/supabase-js"
import { Countries } from "../../constants/countries"
import type { Tone } from "../../emails/kit/brand"
import type { UpdateSummary } from "../../emails/kit/parts"
import type { EmailFooter } from "../../emails/kit/Layout"
import type { TariffNewsEmailProps } from "../../emails/tariff-updates/TariffNewsEmail"
import { AUTHORITIES, STAGE_ORDER, STAGES, type Authority, type Kind, type Stage } from "../tariff-updates/types"
import { createBatch } from "./outbox"

// Tariff updates as emails: the props of the news alert and the digest, from an update's row.
// The subscription producer (Phase A) and the outbox's "draft a test" both use these.

export interface UpdateRowForEmail {
  id: string
  slug: string
  title: string
  summary: string
  kind: Kind
  authority: Authority
  countries: string[]
  effective_on: string | null
  stage: Stage
}

export const UPDATE_EMAIL_COLUMNS = "id, slug, title, summary, kind, authority, countries, effective_on, stage"

// Red for a new or higher tariff, green for one lifted, amber for a step toward one, cobalt else
const toneOf = (kind: Kind): Tone =>
  ["new_tariff", "rate_change", "scope_change"].includes(kind)
    ? "up"
    : ["end", "exclusion", "pause"].includes(kind)
      ? "down"
      : ["investigation", "deadline"].includes(kind)
        ? "heads-up"
        : "brand"

const countryNames = new Map(Countries.map((c) => [c.code, c.name]))

const countriesLabel = (codes: string[]) => {
  if (!codes.length) return null
  if (codes.includes("ALL")) return "All countries"
  const names = codes.map((c) => countryNames.get(c) ?? c)
  return names.length > 4 ? `${names.slice(0, 4).join(", ")} and ${names.length - 4} more` : names.join(", ")
}

export const updateSummary = (u: UpdateRowForEmail): UpdateSummary => ({
  slug: u.slug,
  title: u.title,
  summary: u.summary,
  authorityLabel: AUTHORITIES[u.authority] ?? u.authority,
  stageLabel: STAGES[u.stage]?.replace(" in the Federal Register", "").replace("Filed", "Filed early") ?? u.stage,
  effectiveOn: u.effective_on,
  countriesLabel: countriesLabel(u.countries),
  tone: toneOf(u.kind),
})

// The stages an update's sources have reached, as positions on the email's stage track
export const reachedStages = async (db: SupabaseClient, updateId: string) => {
  const { data } = await db.from("tariff_source_items").select("stage").eq("update_id", updateId)
  const stages = new Set((data ?? []).map((r: { stage: string | null }) => r.stage))
  return STAGE_ORDER.flatMap((stage, i) => (stages.has(stage) ? [i] : []))
}

export const newsEmailProps = async (db: SupabaseClient, u: UpdateRowForEmail, footer: EmailFooter): Promise<TariffNewsEmailProps> => ({
  update: updateSummary(u),
  reached: await reachedStages(db, u.id),
  current: STAGE_ORDER.indexOf(u.stage),
  footer,
})

// A news alert for one update, to the admin only, for trying the outbox and the template
export const draftTestNewsBatch = async (db: SupabaseClient, updateId: string, to: string) => {
  const { data: u, error } = await db.from("tariff_updates").select(UPDATE_EMAIL_COLUMNS).eq("id", updateId).single()
  if (error || !u) throw new Error(`Loading the update: ${error?.message ?? "not found"}`)
  const props = await newsEmailProps(db, u as UpdateRowForEmail, {
    reason: "This is a test of the HTS Hero tariff news alert, sent from the outbox.",
  })
  return createBatch(db, {
    kind: "test",
    title: `Test: ${u.title}`,
    ref: { update_id: updateId },
    messages: [{ channel: "email", recipient: to, template: "tariff_news", props: props as unknown as Record<string, unknown> }],
  })
}
