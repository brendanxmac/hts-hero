import type { SupabaseClient } from "@supabase/supabase-js"
import { todayIso } from "../../components/duty-calculator/lib/format"
import type { Theme } from "../../social/brand"
import { captionsFor, Captions } from "../../social/captions"
import type { Post, SourceLink, TemplateId } from "../../social/types"
import { callJson } from "../hts-revision-diff/claude"
import type { ClaudeUsage } from "../hts-revision-diff/types"
import { Candidate, mineCandidates } from "./miners"
import { newsFacts, newsPhase, newsPost, newsScore, officialSources, recentUpdates, UpdateRow } from "./news"
import { numbersCheck } from "./numbers"

// The daily ideas: mine candidates, keep the best few of each kind that haven't run lately, and
// have Claude pick a varied set and write each one's headline and captions. Claude only words
// the post; any number it writes that isn't in the candidate's facts sends that text back to
// the code's own draft.

export const IDEAS_TABLE = "social_ideas"
const MODEL = "claude-sonnet-5-5"
const PER_KIND = 6
// Don't bring back a story that ran (or was offered) in the last 30 days
const DEDUPE_DAYS = 30

export interface Idea {
  id?: string
  run_on: string
  position: number
  kind: string
  template: TemplateId
  title: string
  why: string
  score: number
  dedupe_key: string
  props: Post["props"]
  // Where every figure in the post can be checked
  sources: SourceLink[]
  captions: Captions
  status: "new" | "used" | "skipped"
  model: string | null
}

// The prop each template's main line lives in
const HEADLINE_KEY: Record<TemplateId, string> = {
  RateTimeline: "headline",
  BigNumber: "label",
  HeadToHead: "headline",
  Ranking: "headline",
  TradeShift: "headline",
  SourcingSaver: "headline",
  CountrySnapshot: "headline",
  RateSpread: "headline",
  TopList: "headline",
  Quiz: "question",
  News: "headline",
}

const SYSTEM = `You are the social media editor for HTS Hero, a US tariff and import duty tool. Each day you pick posts from candidates that code found in HTS Hero's tariff engine and US Census import data, and write their words. The posts go out as branded images and short videos on LinkedIn and X to importers, customs brokers, sourcing managers and trade watchers.

Pick posts that make a busy importer stop scrolling: surprising, concrete, useful, and easy to grasp in two seconds. Favor big gaps, recent changes, real sourcing options and products people know. Mix the kinds and templates, and don't pick two posts about the same product or two about the same country unless they're very different.

Candidates of kind "news" are tariff actions from the last few days (HTS Hero's /tariff-updates feed). When one changes what importers pay (a new tariff, a rate change, an end, a pause, an exclusion, a deal), include the most important one or two: news is what people share. Its post is either "Announced" or "Now in effect", as its title says. Skip paperwork, quota openings and routine guidance unless nothing else is happening.

Rules for every word you write:
- Use only numbers that appear in that candidate's facts, written the same way. Never compute new numbers, never round differently, never invent.
- Tariffs are rates on the customs value. Imports are Census figures.
- A trade shift is a pattern, never a cause: don't say a tariff caused a change in imports.
- Savings are only ever potential: "could save", "up to", "may". Duty only, never landed cost.
- Write every rate and every difference between rates with "%" ("+25%", "save up to 30.9%", "pays 27.5% more"). Never write "pts", "points" or "percentage points".
- No legal or customs advice, no predictions, no hype words (game-changer, shocking), at most one emoji per caption.
- Headline: at most 70 characters, plain and specific, the hook of the post.
- LinkedIn: a hook line, a blank line, 2–4 short lines starting with "→", a blank line, then "Look up any HTS code's tariff from any country, free: htshero.com" and "#tariffs #imports #trade". Under 1,000 characters.
- X: at most 260 characters, ending with htshero.com.
- product: the product's name as a reader would say it, at most 40 characters ("Pickup trucks", "Lithium-ion batteries"), from the facts' description. Keep any size or spec numbers exactly as the facts write them, or leave them out. Empty for posts about a country or a list.
- why: one sentence for the HTS Hero team on why this post is worth making today.
- rate_before / rate_after / rate_note: news only. The headline rate change exactly as the summary writes it ("25%", "50%"), rate_after alone for a new tariff, and what it applies to in at most 50 characters ("on steel from Canada"). All empty when there's no single headline rate, and for every other kind.
- For news, end the LinkedIn caption with "Follow every tariff action: htshero.com/tariff-updates" instead of the lookup line, and the X post with htshero.com/tariff-updates.`

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["picks"],
  properties: {
    picks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "headline", "product", "why", "linkedin", "x", "rate_before", "rate_after", "rate_note"],
        properties: {
          id: { type: "string" },
          headline: { type: "string" },
          product: { type: "string" },
          why: { type: "string" },
          linkedin: { type: "string" },
          x: { type: "string" },
          rate_before: { type: "string" },
          rate_after: { type: "string" },
          rate_note: { type: "string" },
        },
      },
    },
  },
}

interface Pick {
  id: string
  headline: string
  product: string
  why: string
  linkedin: string
  x: string
  rate_before: string
  rate_after: string
  rate_note: string
}

// The best few of each kind, not run lately, with a boost for products in this week's tariff news
export const shortlist = (candidates: Candidate[], recentKeys: Set<string>, newsCodes: string[]) => {
  const inNews = (c: Candidate) => !!c.htsCode && newsCodes.some((code) => c.htsCode!.replace(/\./g, "").startsWith(code.replace(/\./g, "")))
  const byKind = new Map<string, Candidate[]>()
  candidates
    .filter((c) => !recentKeys.has(c.dedupeKey))
    .map((c) => (inNews(c) ? { ...c, score: c.score * 2, facts: `${c.facts}\n(This product is in this week's tariff news.)` } : c))
    .forEach((c) => byKind.set(c.kind, [...(byKind.get(c.kind) ?? []), c]))
  return Array.from(byKind.values()).flatMap((list) => list.sort((a, b) => b.score - a.score).slice(0, PER_KIND))
}

// Saves one idea, replacing an unused one for the same story; returns it with its id
// Inserts ideas; before supabase/migrations/social_ideas_sources.sql is applied, without their
// sources (with a warning) rather than not at all
const insertIdeas = async (db: SupabaseClient, ideas: Idea[], warnings: string[]) => {
  const first = await db.from(IDEAS_TABLE).insert(ideas).select("id, position")
  if (!first.error || !/sources/.test(first.error.message)) return first
  warnings.push("Sources weren't saved: apply supabase/migrations/social_ideas_sources.sql.")
  return db.from(IDEAS_TABLE).insert(ideas.map(({ sources, ...idea }) => idea)).select("id, position")
}

export const saveIdea = async (db: SupabaseClient, idea: Idea): Promise<{ idea: Idea; error: string | null; warnings: string[] }> => {
  const warnings: string[] = []
  await db.from(IDEAS_TABLE).delete().eq("dedupe_key", idea.dedupe_key).eq("status", "new")
  const { data: rows, error } = await insertIdeas(db, [idea], warnings)
  const data = rows?.[0]
  if (error || !data) return { idea, error: `Couldn't save (${error?.message}). Has supabase/migrations/social_ideas.sql been applied?`, warnings }
  return { idea: { ...idea, id: (data as { id: string }).id }, error: null, warnings }
}

export interface RunResult {
  ideas: Idea[]
  candidates: number
  shortlisted: number
  usage?: ClaudeUsage
  warnings: string[]
}

export const runDailyIdeas = async ({
  db,
  count = 8,
  theme = "dark",
  save = true,
  log = () => {},
}: {
  db: SupabaseClient
  count?: number
  theme?: Theme
  save?: boolean
  log?: (line: string) => void
}): Promise<RunResult> => {
  const warnings: string[] = []
  const runOn = todayIso()

  const since = new Date(Date.now() - DEDUPE_DAYS * 86400e3).toISOString().slice(0, 10)
  // Earlier days' stories, and posts already made by hand today
  const recent = await db.from(IDEAS_TABLE).select("dedupe_key, run_on, position").gte("run_on", since)
  if (recent.error) warnings.push(`Couldn't read recent ideas (${recent.error.message}); nothing is deduplicated.`)
  const recentKeys = new Set(
    ((recent.data ?? []) as { dedupe_key: string; run_on: string; position: number }[])
      .filter((r) => r.run_on < runOn || r.position < 0)
      .map((r) => r.dedupe_key)
  )

  // This week's tariff news, from the /tariff-updates feed: posts of its own, and a boost for
  // products it names
  let news: UpdateRow[] = []
  try {
    news = await recentUpdates(db, 7)
  } catch (e) {
    warnings.push((e as Error).message)
  }
  const newsCodes = news.flatMap((u) => u.hts_codes).filter((c) => c.replace(/\D/g, "").length >= 4)
  const newsTitles = news.map((u) => u.title)

  const candidates = await mineCandidates({ theme, log })
  const official = new Map<string, Awaited<ReturnType<typeof officialSources>>>()
  for (const u of news) {
    const score = newsScore(u)
    if (score === null) continue
    official.set(u.id, await officialSources(db, u))
    const post = newsPost(u, theme, {}, official.get(u.id))
    candidates.push({ id: `news:${post.key}`, kind: "news", dedupeKey: `news:${u.slug}:${newsPhase(u)}`, score, facts: `${post.title}\n${newsFacts(u)}`, post, update: u })
  }
  const short = shortlist(candidates, recentKeys, newsCodes)
  log(`shortlist: ${short.length}`)

  const user = [
    `Today is ${runOn}. Pick the ${count} best posts from these ${short.length} candidates.`,
    newsTitles.length ? `This week's tariff news, for context:\n${newsTitles.map((t: string) => `- ${t}`).join("\n")}` : "",
    ...short.map((c) => `### ${c.id}\nKind: ${c.kind} · Template: ${c.post.template}\n${c.facts}`),
  ]
    .filter(Boolean)
    .join("\n\n")

  let picks: Pick[] = []
  let usage: ClaudeUsage | undefined
  try {
    const res = await callJson<{ picks: Pick[] }>({ system: SYSTEM, user, schema: SCHEMA, maxTokens: 16000, effort: "medium", model: MODEL })
    picks = res.data.picks
    usage = res.usage
  } catch (e) {
    warnings.push(`Claude failed (${(e as Error).message}); using the top-scored candidates with the code's own words.`)
    picks = short
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((c) => ({ id: c.id, headline: "", product: "", why: `Top-scored ${c.kind} candidate.`, linkedin: "", x: "", rate_before: "", rate_after: "", rate_note: "" }))
  }

  const byId = new Map(short.map((c) => [c.id, c]))
  const ideas: Idea[] = []
  picks.slice(0, count).forEach((pick) => {
    const c = byId.get(pick.id)
    if (!c) return warnings.push(`Claude picked an unknown candidate: ${pick.id}`)
    const key = HEADLINE_KEY[c.post.template]
    // News is rebuilt with Claude's words, which newsPost checks against the update itself
    const base = c.update
      ? newsPost(c.update, theme, { headline: pick.headline, rate_before: pick.rate_before, rate_after: pick.rate_after, rate_note: pick.rate_note }, official.get(c.update.id))
      : c.post
    const props = { ...base.props } as Record<string, unknown>
    if (pick.product && "product" in props && pick.product.length <= 40 && numbersCheck(pick.product, c.facts)) props.product = pick.product
    if (c.update) {
      // newsPost already took the headline if its numbers check out
    } else if (pick.headline && numbersCheck(pick.headline, c.facts)) props[key] = pick.headline
    else if (pick.headline) warnings.push(`${c.id}: Claude's headline had a number not in the facts; kept the drafted one.`)
    const drafted = captionsFor(c.post.template, props as unknown as Post["props"])
    const captions = {
      linkedin: pick.linkedin && numbersCheck(pick.linkedin, c.facts) ? pick.linkedin : drafted.linkedin,
      x: pick.x && numbersCheck(pick.x, c.facts) ? pick.x : drafted.x,
    }
    if (pick.linkedin && captions.linkedin !== pick.linkedin) warnings.push(`${c.id}: LinkedIn caption had a number not in the facts; used the drafted one.`)
    if (pick.x && captions.x !== pick.x) warnings.push(`${c.id}: X caption had a number not in the facts; used the drafted one.`)
    ideas.push({
      run_on: runOn,
      position: ideas.length,
      kind: c.kind,
      template: c.post.template,
      title: c.post.title,
      why: pick.why,
      score: Math.round(c.score * 10) / 10,
      dedupe_key: c.dedupeKey,
      props: props as unknown as Post["props"],
      sources: base.sources,
      captions,
      status: "new",
      model: usage?.model ?? null,
    })
  })

  if (save && ideas.length) {
    // A rerun replaces the day's ideas that haven't been used or skipped
    // (posts made by hand from the News tab have position -1 and stay)
    await db.from(IDEAS_TABLE).delete().eq("run_on", runOn).eq("status", "new").gte("position", 0)
    const { data, error } = await insertIdeas(db, ideas, warnings)
    if (error) warnings.push(`Couldn't save ideas (${error.message}). Has supabase/migrations/social_ideas.sql been applied?`)
    else data?.forEach((row: { id: string; position: number }) => (ideas[row.position].id = row.id))
  }
  return { ideas, candidates: candidates.length, shortlisted: short.length, usage, warnings }
}
