import type { SupabaseClient } from "@supabase/supabase-js"
import { todayIso } from "../../components/duty-calculator/lib/format"
import type { Theme, Tone } from "../../social/brand"
import type { NewsProps, Post } from "../../social/types"
import { callJson } from "../hts-revision-diff/claude"
import type { ClaudeUsage } from "../hts-revision-diff/types"
import { AUTHORITIES, KINDS, STAGE_ORDER, type Authority, type Kind, type Stage } from "../tariff-updates/types"
import { importsUnder, isKnownCountry, postCountry } from "./data"
import { censusCodeLink, dedupe, htsLink } from "./sources"
import type { SourceLink } from "../../social/types"
import { numbersCheck } from "./numbers"
import { captionsFor } from "../../social/captions"
import type { Idea } from "./ideas"

// News posts from the /tariff-updates feed. Each action is worth two posts: when it's announced
// and when it takes effect. The update's own fields fill the post; Claude only writes the hook
// headline and reads the rate change out of the summary, and anything it writes with a number
// the update doesn't state is dropped.

export interface UpdateRow {
  id: string
  slug: string
  title: string
  summary: string
  kind: Kind
  authority: Authority
  countries: string[]
  hts_codes: string[]
  products: string | null
  effective_on: string | null
  stage: Stage
  last_activity_at: string
}

export const UPDATE_COLUMNS = "id, slug, title, summary, kind, authority, countries, hts_codes, products, effective_on, stage, last_activity_at"

export const recentUpdates = async (db: SupabaseClient, days: number): Promise<UpdateRow[]> => {
  const since = new Date(Date.now() - days * 86400e3).toISOString()
  const { data, error } = await db
    .from("tariff_updates")
    .select(UPDATE_COLUMNS)
    .eq("status", "published")
    // AD/CVD notices are steady news for the importers they touch, not daily posts
    .neq("authority", "ad_cvd")
    .gte("last_activity_at", since)
    .order("last_activity_at", { ascending: false })
    .limit(200)
  if (error) throw new Error(`Loading tariff updates: ${error.message}`)
  return data as UpdateRow[]
}

const TONE: Record<Kind, Tone> = {
  new_tariff: "up",
  rate_change: "up",
  scope_change: "up",
  exclusion: "down",
  pause: "down",
  end: "down",
  deadline: "heads-up",
  guidance: "brand",
  investigation: "heads-up",
  deal: "brand",
  hts_revision: "neutral",
  ad_cvd: "heads-up",
  other: "neutral",
}

// How much a kind of action is worth a post; zero: never
const KIND_WEIGHT: Record<Kind, number> = {
  new_tariff: 100,
  rate_change: 100,
  end: 85,
  deal: 80,
  pause: 75,
  exclusion: 70,
  scope_change: 60,
  investigation: 45,
  deadline: 30,
  guidance: 20,
  hts_revision: 0,
  ad_cvd: 0,
  other: 0,
}

// "announced" until it takes effect; "in-effect" once CBP has guidance, it's in the HTS, or its date has come
export const newsPhase = (u: UpdateRow, today = todayIso()) =>
  u.stage === "cbp_guidance" || u.stage === "in_hts" || (u.effective_on && u.effective_on <= today) ? "in-effect" : "announced"

// A score for the daily ideas, or null for updates not worth a post
export const newsScore = (u: UpdateRow, today = todayIso()) => {
  const weight = KIND_WEIGHT[u.kind]
  if (!weight) return null
  const ageDays = (Date.parse(today) - Date.parse(u.last_activity_at)) / 86400e3
  if (ageDays > 4) return null
  const imports = importsUnder(u.hts_codes, u.countries.filter((c) => c !== "ALL"))
  const size = imports && imports.value > 0 ? 1 + Math.log10(Math.max(imports.value / 1e6, 1)) / 2 : 1
  return weight * size * (ageDays <= 1 ? 1.5 : 1)
}

// The official documents behind an update (Federal Register, CBP CSMS, White House, USTR,
// USITC), newest first, as collected by the tariff sources pipeline
export interface OfficialSource {
  title: string
  url: string
  source: string
  published_at: string
}

const SOURCE_NAMES: Record<string, string> = {
  federal_register: "Federal Register",
  federal_register_pi: "Federal Register (public inspection)",
  white_house: "White House",
  csms: "CBP CSMS",
  ustr: "USTR",
  usitc: "USITC",
}

export const officialSources = async (db: SupabaseClient, u: UpdateRow): Promise<OfficialSource[]> => {
  const { data } = await db.from("tariff_source_items").select("title, url, source, published_at").eq("update_id", u.id).order("published_at", { ascending: false })
  return (data ?? []) as OfficialSource[]
}

// Every claim on a news post: the documents for what changed and when, the update page that
// gathers them, the schedule for the codes named, and Census for the imports at stake
const newsSources = (u: UpdateRow, official: OfficialSource[], countries: string[], imports: { value: number; year: number } | null): SourceLink[] => {
  const codes = Array.from(new Set(u.hts_codes.map((c) => c.replace(/\D/g, "")).filter((d) => [2, 4, 6, 8, 10].includes(d.length) && !d.startsWith("99"))))
  return dedupe([
    ...official.map((o) => ({
      claim: "What changes, for whom, from when",
      label: `${SOURCE_NAMES[o.source] ?? o.source} · ${o.title}`,
      url: o.url,
      official: true,
    })),
    { claim: "Every source for this action, and its stage", label: "HTS Hero tariff updates · this action", url: `/tariff-updates/${u.slug}`, official: false },
    ...codes.slice(0, 5).map((c) => htsLink(`HTS ${c}, named in the action`, c)),
    ...(imports
      ? codes
          .filter((c) => c.length >= 4)
          .slice(0, 5)
          .map((c) =>
            censusCodeLink(
              `At stake: US imports in ${imports.year} under ${c}${countries.length ? ` from ${countries.join(", ")}` : ""} (add up the codes named)`,
              c,
              imports.year
            )
          )
      : []),
  ])
}

// What Claude may write on top of the update's fields
export interface NewsWords {
  headline?: string
  rate_before?: string
  rate_after?: string
  rate_note?: string
}

// The update in words: what Claude reads, and what its numbers are checked against
export const newsFacts = (u: UpdateRow) =>
  [
    `Title: ${u.title}`,
    `Kind: ${KINDS[u.kind]} · Law: ${AUTHORITIES[u.authority]} · Stage: ${u.stage} · Effective: ${u.effective_on ?? "not stated"}`,
    `Countries: ${u.countries.length ? u.countries.join(", ") : "not stated"} · HTS codes: ${u.hts_codes.join(", ") || "not stated"}`,
    `Products: ${u.products ?? "not stated"}`,
    `Summary: ${u.summary}`,
  ].join("\n")

const shortTitle = (title: string) => (title.length <= 90 ? title : `${title.slice(0, 89).replace(/\s+\S*$/, "")}…`)

export const newsPost = (u: UpdateRow, theme: Theme, words: NewsWords = {}, official: OfficialSource[] = []): Post<"News"> => {
  const facts = newsFacts(u)
  // Claude's words only if every number in them is in the update
  const ok = (text?: string) => (text && numbersCheck(text, facts) ? text.trim() : undefined)
  const countries = u.countries.filter((c) => c !== "ALL" && isKnownCountry(c))
  const imports = importsUnder(u.hts_codes, countries)
  const rateAfter = ok(words.rate_after)
  const props: NewsProps = {
    theme,
    asOf: todayIso(),
    source: "Official notices · HTS Hero tariff updates",
    headline: ok(words.headline) ?? shortTitle(u.title),
    authority: AUTHORITIES[u.authority],
    kindLabel: KINDS[u.kind],
    tone: TONE[u.kind],
    // Empty strings, not undefined, so the studio shows the fields to fill in by hand
    rateBefore: (rateAfter && ok(words.rate_before)) || "",
    rateAfter: rateAfter ?? "",
    rateNote: (rateAfter && ok(words.rate_note)) || "",
    countries: countries.map(postCountry),
    products: u.products ?? "",
    effectiveOn: u.effective_on ?? undefined,
    stage: Math.max(STAGE_ORDER.indexOf(u.stage), 0),
    imports: imports && imports.value > 0 ? imports : undefined,
    slug: u.slug,
  }
  const phase = newsPhase(u)
  return {
    key: `news-${u.slug}-${phase}`,
    template: "News",
    title: `${phase === "in-effect" ? "Now in effect" : "Announced"}: ${u.title}`,
    props,
    sources: newsSources(u, official, countries, props.imports ?? null),
  }
}

// The dedupe key a news post is saved under: one post per update and moment
export const newsKey = (u: UpdateRow) => `news:${u.slug}:${newsPhase(u)}`

// A news post as a saved idea, for the News tab (the daily ideas build their own)
export const newsIdea = (u: UpdateRow, post: Post<"News">): Idea => ({
  run_on: todayIso(),
  // Made by hand, outside the daily run's order (a rerun of the day's ideas leaves it alone)
  position: -1,
  kind: "news",
  template: "News",
  title: post.title,
  why: "Made from the News tab.",
  score: newsScore(u) ?? 0,
  dedupe_key: newsKey(u),
  props: post.props,
  sources: post.sources,
  captions: captionsFor("News", post.props),
  status: "new",
  model: null,
})

const WORDS_SYSTEM = `You write the words on a branded social post about one US tariff action, for importers on LinkedIn and X. You get the action's record from HTS Hero's tariff updates feed.

- headline: the hook, at most 80 characters, plain and specific: what changes and for whom. No hype, no questions, no emoji.
- rate_before / rate_after: the headline rate change as short rates exactly as the summary writes them ("25%", "50%"). rate_after alone when it's a new tariff (rate_before empty). Both empty when the action has no single headline rate, or when the summary lists many different rates.
- rate_note: what the rate applies to, at most 50 characters ("on steel from Canada"). Empty when the rates are empty.
Use only numbers that appear in the record. Never compute or round numbers. Write rates with "%"; never write "pts", "points" or "percentage points".`

const WORDS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "rate_before", "rate_after", "rate_note"],
  properties: {
    headline: { type: "string" },
    rate_before: { type: "string" },
    rate_after: { type: "string" },
    rate_note: { type: "string" },
  },
}

// Claude's words for one update, for the studio's News tab
export const writeNewsWords = async (u: UpdateRow): Promise<{ words: NewsWords; usage: ClaudeUsage }> => {
  const { data, usage } = await callJson<NewsWords>({
    system: WORDS_SYSTEM,
    user: newsFacts(u),
    schema: WORDS_SCHEMA,
    maxTokens: 4000,
    effort: "low",
    model: "claude-sonnet-5-5",
  })
  return { words: data, usage }
}
