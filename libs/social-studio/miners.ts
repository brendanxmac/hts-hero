import type { Theme } from "../../social/brand"
import { captionsFor } from "../../social/captions"
import type { Post } from "../../social/types"
import { buildCountryPosts, buildFactPosts, FACT_KINDS, FactKind, ytdChanges } from "./build"
import { dotted, productData, ProductData, rateHistory, topImportedCodes } from "./data"
import type { UpdateRow } from "./news"
import { bigNumberPost, cheaperSuppliers, quizPost, rivalOf, sourcingPost, spreadPost, timelinePost, tradeShiftPost } from "./posts"

// Insight miners: code that scans the data for posts worth making and scores each one. Every
// figure is the engine's or Census's; the score only decides which candidates Claude sees.
// Scores compare within a kind, not across kinds; ideas.ts takes the best few of each.

export interface Candidate {
  id: string
  kind: string // "sourcing", "spread", "rate-history"…
  dedupeKey: string // the same story on another day has the same key
  score: number
  // The post's facts in words, for Claude, and the haystack its numbers are checked against
  facts: string
  post: Post
  htsCode?: string
  // News candidates: the tariff update the post is about
  update?: UpdateRow
}

// More weight for products the US buys more of: $1M → 1, $1B → 4
const weight = (usd?: number) => 1 + Math.log10(Math.max((usd ?? 0) / 1e6, 1))

const candidate = (kind: string, dedupeKey: string, score: number, post: Post | null, htsCode?: string): Candidate | null =>
  post
    ? {
        id: `${kind}:${post.key}`,
        kind,
        dedupeKey,
        score,
        facts: `${post.title}\n${captionsFor(post.template, post.props).linkedin}`,
        post,
        htsCode,
      }
    : null

const productCandidates = (d: ProductData, theme: Theme, withHistory: boolean): Candidate[] => {
  const main = d.sides.get(d.main)!
  const w = weight(main.importValue)
  const out: (Candidate | null)[] = []

  const cheaper = cheaperSuppliers(d)
  if (cheaper.length && main.ratePct - cheaper[0].ratePct >= 10) {
    out.push(candidate("sourcing", `sourcing:${d.htsno}:${d.main}`, (main.ratePct - cheaper[0].ratePct) * w, sourcingPost(d, theme), d.htsno))
  }

  const rates = Array.from(d.sides.values()).map((s) => s.ratePct)
  const spread = Math.max(...rates) - Math.min(...rates)
  if (spread >= 15 && rates.length >= 6) out.push(candidate("spread", `spread:${d.htsno}`, spread * w, spreadPost(d, theme), d.htsno))

  const rival = rivalOf(d)
  if (rival && Math.abs(rival.ratePct - main.ratePct) >= 15) {
    out.push(candidate("quiz", `quiz:${d.htsno}`, Math.abs(rival.ratePct - main.ratePct) * w, quizPost(d, theme), d.htsno))
  }

  // A trade shift worth telling: a big supplier that fell and one that rose, paying different rates
  const movers = Array.from(d.sides.values()).filter((s) => (s.importValue ?? 0) >= 20e6 && (s.priorValue ?? 0) >= 5e6)
  const change = (s: (typeof movers)[number]) => ((s.importValue! - s.priorValue!) / s.priorValue!) * 100
  const fell = movers.filter((s) => change(s) <= -25).sort((a, b) => change(a) - change(b))[0]
  const rose = movers.filter((s) => change(s) >= 25).sort((a, b) => change(b) - change(a))[0]
  if (fell && rose && fell.ratePct - rose.ratePct >= 5) {
    out.push(candidate("trade-shift", `shift:${d.htsno}`, (change(rose) - change(fell)) * w * 0.2 + (fell.ratePct - rose.ratePct), tradeShiftPost(d, theme), d.htsno))
  }

  if (main.ratePct >= 50) out.push(candidate("big-number", `big:${d.htsno}:${d.main}`, main.ratePct * w * 0.5, bigNumberPost(d, theme), d.htsno))

  if (withHistory) {
    const h = rateHistory(d, d.main)
    const pcts = h.points.map((x) => x.pct)
    const swing = Math.max(...pcts) - Math.min(...pcts)
    // A change in the last 30 days is news
    const recent = h.events.some((e) => Date.parse(d.asOf) - Date.parse(e.date) <= 30 * 86400e3)
    if (h.changes >= 2 && swing >= 10) {
      out.push(candidate("rate-history", `history:${d.htsno}:${d.main}`, (swing + h.changes * 4 + (recent ? 40 : 0)) * w, timelinePost(d, h, theme), d.htsno))
    }
  }
  return out.filter((c): c is Candidate => c !== null)
}

export const mineCandidates = async ({
  theme = "dark",
  poolSize = 150,
  historyFor = 150,
  log = () => {},
}: {
  theme?: Theme
  poolSize?: number
  // Rate histories cost the most; only the top codes get one
  historyFor?: number
  log?: (line: string) => void
}): Promise<Candidate[]> => {
  const out: Candidate[] = []
  const pool = topImportedCodes(poolSize)
  let i = 0
  for (const { code } of pool) {
    try {
      const d = await productData({ htsCode: dotted(code), maxOrigins: 12 })
      out.push(...productCandidates(d, theme, i < historyFor))
    } catch {
      // Codes no longer in the HTS, or with lines under them: skip
    }
    i++
  }
  log(`products: ${out.length} candidates from ${pool.length} codes`)

  // Countries whose imports moved most this year
  const movers = ytdChanges()
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 4)
  for (const m of movers) {
    const built = await buildCountryPosts({ country: m.code, theme })
    built.posts.forEach((post) => {
      const c = candidate("country", `country:${post.key}`, Math.abs(m.change), post)
      if (c) out.push(c)
    })
  }

  // Schedule-wide facts; dedupe rotates them, so each comes back now and then
  for (const kind of Object.keys(FACT_KINDS) as FactKind[]) {
    const built = await buildFactPosts({ kind, theme })
    const c = candidate("fact", `fact:${kind}`, 10, built.posts[0])
    if (c) out.push(c)
  }
  log(`total: ${out.length} candidates`)
  return out
}
