import { todayIso } from "../../components/duty-calculator/lib/format"
import type { Theme } from "../../social/brand"
import type { Post, TopListProps } from "../../social/types"
import { importFacts, largestOrdinal } from "../country-pages/importStats"
import stats from "../country-pages/import-stats.json"
import { countryTopImports, TOP_IMPORTS_YEAR } from "../country-pages/topImports"
import { getHtsElementParentsServer, getHtsElementsServer } from "../hts-server"
import { DutyInputError, findOrigin } from "../mcp/duty"
import { dotted, isKnownCountry, pctText, postCountry, productData, productNameOf, rateHistory, round1, SOURCE_CENSUS, topImportedCodes } from "./data"
import { calculatorLink, censusCodeLink, censusCountryLink, censusWorldLink, dedupe, htsLink } from "./sources"
import { bigNumberPost, headToHeadPost, quizPost, rankingPost, sourcingPost, spreadPost, timelinePost, tradeShiftPost } from "./posts"

// The studio's three ways to make posts by hand: from a product (an HTS code and origins), from
// a country, and from facts across the whole tariff schedule.

export interface BuildResult {
  title: string
  posts: Post[]
  notes: string[]
}

// ---------- A product ----------

export interface ProductRequest {
  htsCode: string
  // ISO2 codes or names; the first is the main origin. Empty: the code's top suppliers.
  countries: string[]
  productName?: string
  theme?: Theme
}

export const buildProductPosts = async ({ htsCode, countries, productName, theme = "dark" }: ProductRequest): Promise<BuildResult> => {
  const d = await productData({ htsCode, countries, productName, maxOrigins: 16 })
  const posts = [
    timelinePost(d, rateHistory(d, d.main), theme),
    sourcingPost(d, theme),
    bigNumberPost(d, theme),
    headToHeadPost(d, theme),
    quizPost(d, theme),
    rankingPost(d, theme),
    spreadPost(d, theme),
    tradeShiftPost(d, theme),
  ].filter((p): p is NonNullable<typeof p> => p !== null) as Post[]
  return { title: `${d.product} · HTS ${d.htsno}`, posts, notes: d.notes }
}

// ---------- A country ----------

type CountryStats = { name: string; imports2024: number | null; imports2025: number | null; importsYtd: number | null; importsYtdPriorYear: number | null; rank2025?: number }
const COUNTRY_STATS = stats.countries as Record<string, CountryStats>

export const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(round1(n))}%`
// Millions of USD → "$150B", "$812M"
export const millions = (m: number) => (m >= 1000 ? `$${round1(m / 1000)}B` : `$${Math.round(m)}M`)

// One of a country's top products: its Census import value, and its rate today
const productSources = (t: { label: string; htsno: string; value: number; total: string }, c: { name: string }, code: string) => [
  censusCodeLink(`${t.label}: ${millions(t.value / 1e6)} from ${c.name} in ${TOP_IMPORTS_YEAR}`, t.htsno, TOP_IMPORTS_YEAR),
  calculatorLink(`${t.label} from ${c.name}: ${t.total} today`, t.htsno, code),
]

export const buildCountryPosts = async ({ country, theme = "dark" }: { country: string; theme?: Theme }): Promise<BuildResult> => {
  const code = findOrigin(country).code
  const facts = importFacts(code)
  if (!facts) throw new DutyInputError(`Census has no import figures for ${country}.`)
  const c = postCountry(code)
  const asOf = todayIso()
  const elements = await getHtsElementsServer()
  const top = countryTopImports(code, elements, 8)
  const change2025 = facts.imports2024 ? ((facts.imports2025 - facts.imports2024) / facts.imports2024) * 100 : null
  const source = "US Census Bureau · HTS Hero tariff engine"

  const statTiles = [
    {
      label: `US imports ${TOP_IMPORTS_YEAR}`,
      value: millions(facts.imports2025),
      detail: change2025 !== null ? `${signed(change2025)} on ${TOP_IMPORTS_YEAR - 1}` : undefined,
      tone: "brand" as const,
    },
    { label: "Supplier rank", value: `#${facts.rank2025}`, detail: `${facts.sharePct}% of all US imports` },
    ...(facts.ytd
      ? [
          {
            label: `${facts.ytd.year} so far`,
            value: millions(facts.ytd.imports),
            detail: facts.ytd.changePct !== null ? `${signed(facts.ytd.changePct)} vs same months last year` : `through ${facts.ytd.through}`,
            tone: facts.ytd.changePct !== null && facts.ytd.changePct < 0 ? ("heads-up" as const) : undefined,
          },
        ]
      : []),
  ]

  const posts: Post[] = [
    {
      key: `snapshot-${code}`,
      template: "CountrySnapshot",
      title: `${c.name} by the numbers`,
      props: {
        theme,
        asOf,
        source,
        headline: `${c.name}: the US's ${largestOrdinal(facts.rank2025)} supplier`,
        country: c,
        stats: statTiles,
        products: top.slice(0, 5).map((t) => ({ label: t.label, htsCode: t.htsno, value: t.value, rate: t.total })),
        year: TOP_IMPORTS_YEAR,
      },
      sources: dedupe([
        censusCountryLink(`${c.name}: US imports, rank and this year so far`, code),
        ...top.slice(0, 5).flatMap((t) => productSources(t, c, code)),
      ]),
    },
  ]
  if (top.length >= 3) {
    const max = Math.max(...top.map((t) => t.value))
    posts.push({
      key: `country-top-${code}`,
      template: "TopList",
      title: `What ${c.name}'s top products pay`,
      props: {
        theme,
        asOf,
        source,
        kind: "Top imports",
        headline: `What the US's biggest imports from ${c.name} pay`,
        subhead: `By ${TOP_IMPORTS_YEAR} import value, with today's tariff`,
        rows: top.map((t) => ({ label: t.label, sublabel: millions(t.value / 1e6), value: t.total, share: t.value / max })),
      },
      sources: dedupe(top.flatMap((t) => productSources(t, c, code))),
    })
  }
  if (facts.ytd && facts.ytd.changePct !== null) {
    posts.push({
      key: `country-ytd-${code}`,
      template: "BigNumber",
      title: `${c.name}, imports this year`,
      props: {
        theme,
        asOf,
        source: SOURCE_CENSUS,
        eyebrow: `${c.flag} US imports from ${c.name}`,
        value: signed(facts.ytd.changePct),
        label: `US imports from ${c.name} through ${facts.ytd.through}, against the same months of ${facts.ytd.year - 1}`,
        tone: facts.ytd.changePct >= 0 ? "brand" : "heads-up",
        parts: [],
        footnote: `${millions(facts.ytd.imports)} so far this year. Census general imports, not seasonally adjusted.`,
      },
      sources: dedupe([censusCountryLink(`${c.name}: imports through ${facts.ytd.through} and the same months of ${facts.ytd.year - 1}`, code)]),
    })
  }
  return { title: `${c.flag} ${c.name}`, posts, notes: [] }
}

// ---------- Facts across the schedule ----------

export type FactKind = "highest-base" | "fastest-growing" | "biggest-falls" | "biggest-suppliers" | "top-products"

export const FACT_KINDS: Record<FactKind, string> = {
  "highest-base": "Highest base duty rates in the HTS",
  "fastest-growing": "Fastest-growing US suppliers this year",
  "biggest-falls": "Biggest falls among US suppliers this year",
  "biggest-suppliers": "Biggest US suppliers",
  "top-products": "Most-imported products",
}

// The 40 largest suppliers' change this year, so small countries' swings don't crowd the list
export const ytdChanges = () =>
  Object.entries(COUNTRY_STATS)
    .filter(([code, c]) => isKnownCountry(code) && c.rank2025 && c.rank2025 <= 40 && c.importsYtd && c.importsYtdPriorYear)
    .map(([code, c]) => ({ code, change: ((c.importsYtd! - c.importsYtdPriorYear!) / c.importsYtdPriorYear!) * 100, ytd: c.importsYtd! }))

const percentOf = (general: string) => {
  const m = general.trim().match(/^(\d+(?:\.\d+)?)%$/)
  return m ? Number(m[1]) : null
}

export const buildFactPosts = async ({ kind, theme = "dark" }: { kind: FactKind; theme?: Theme }): Promise<BuildResult> => {
  const asOf = todayIso()
  const list = (props: Omit<TopListProps, "theme" | "asOf">, sources: Parameters<typeof dedupe>[0]): BuildResult => ({
    title: FACT_KINDS[kind],
    posts: [{ key: `fact-${kind}`, template: "TopList", title: FACT_KINDS[kind], props: { theme, asOf, ...props }, sources: dedupe(sources) }],
    notes: [],
  })

  if (kind === "highest-base") {
    const elements = await getHtsElementsServer()
    // One line per 4-digit heading, so six kinds of tobacco don't fill the list
    const seen = new Set<string>()
    const rows = elements
      .filter((e) => e.htsno && !e.htsno.startsWith("99") && e.general && percentOf(e.general) !== null)
      .map((e) => ({ e, pct: percentOf(e.general)! }))
      .sort((a, b) => b.pct - a.pct)
      .flatMap(({ e, pct }) => {
        const heading = e.htsno.slice(0, 4)
        if (seen.has(heading)) return []
        seen.add(heading)
        return [{ name: productNameOf(e, getHtsElementParentsServer(e, elements)), code: e.htsno, pct }]
      })
      .slice(0, 8)
    const max = rows[0]?.pct ?? 1
    return list({
      source: "Harmonized Tariff Schedule (USITC)",
      kind: "Fun fact",
      headline: "The highest base tariffs in the US schedule",
      subhead: "General rates, before any Chapter 99 duties",
      rows: rows.map((r, i) => ({ label: r.name, sublabel: r.code, value: pctText(r.pct), share: r.pct / max, tone: i === 0 ? "up" : "brand" })),
      footnote: "Many of these goods can enter at a lower in-quota or trade-agreement rate.",
    }, rows.map((r) => htsLink(`${r.name}: ${pctText(r.pct)} general rate`, r.code)))
  }

  if (kind === "fastest-growing" || kind === "biggest-falls") {
    const growing = kind === "fastest-growing"
    const rows = ytdChanges()
      .sort((a, b) => (growing ? b.change - a.change : a.change - b.change))
      .slice(0, 8)
    const max = Math.max(...rows.map((r) => Math.abs(r.change)), 1)
    return list({
      source: SOURCE_CENSUS,
      kind: growing ? "Rising" : "Falling",
      headline: growing ? `The US's fastest-growing suppliers in ${stats.ytd.year}` : `Where US imports fell most in ${stats.ytd.year}`,
      subhead: `Imports through ${stats.ytd.through} vs the same months last year, among the 40 largest suppliers`,
      rows: rows.map((r) => ({
        label: postCountry(r.code).name,
        flag: postCountry(r.code).flag,
        sublabel: millions(r.ytd),
        value: signed(r.change),
        share: Math.abs(r.change) / max,
        tone: r.change >= 0 ? "brand" : "heads-up",
      })),
    }, rows.map((r) => censusCountryLink(`${postCountry(r.code).name}: ${signed(r.change)} through ${stats.ytd.through}`, r.code)))
  }

  if (kind === "biggest-suppliers") {
    const rows = Object.entries(COUNTRY_STATS)
      .filter(([code, c]) => isKnownCountry(code) && c.rank2025 && c.imports2025)
      .sort((a, b) => a[1].rank2025! - b[1].rank2025!)
      .slice(0, 8)
    const world = stats.world.imports2025
    const max = rows[0][1].imports2025!
    return list({
      source: SOURCE_CENSUS,
      kind: "Top 8",
      headline: `Where the US bought its goods in ${TOP_IMPORTS_YEAR}`,
      subhead: `${millions(world)} of goods imports in all`,
      rows: rows.map(([code, c]) => ({
        label: postCountry(code).name,
        flag: postCountry(code).flag,
        sublabel: `${round1((c.imports2025! / world) * 100)}% of imports`,
        value: millions(c.imports2025!),
        share: c.imports2025! / max,
      })),
    }, [censusWorldLink(`All US goods imports in ${TOP_IMPORTS_YEAR}: ${millions(world)}`), ...rows.map(([code, c]) => censusCountryLink(`${postCountry(code).name}: ${millions(c.imports2025!)} in ${TOP_IMPORTS_YEAR}`, code))])
  }

  // top-products
  const elements = await getHtsElementsServer()
  const rows = topImportedCodes(30)
    .flatMap(({ code, value }) => {
      const e = elements.find((x) => x.htsno === dotted(code))
      return e ? [{ name: productNameOf(e, getHtsElementParentsServer(e, elements)), code: e.htsno, value }] : []
    })
    .slice(0, 8)
  const max = rows[0]?.value ?? 1
  return list({
    source: SOURCE_CENSUS,
    kind: "Top 8",
    headline: `What the US imported most in ${TOP_IMPORTS_YEAR}`,
    subhead: "By 10-digit HTS code, leaving out fuels, precious metals and US goods returned",
    rows: rows.map((r) => ({ label: r.name, sublabel: r.code, value: millions(r.value / 1e6), share: r.value / max })),
  }, rows.map((r) => censusCodeLink(`${r.name}: ${millions(r.value / 1e6)} of US imports in ${TOP_IMPORTS_YEAR} (all countries)`, r.code, TOP_IMPORTS_YEAR)))
}
