"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Format, FORMATS, Theme } from "@/social/brand"
import { captionsFor } from "@/social/captions"
import type { Post } from "@/social/types"
import type { Idea } from "@/libs/social-studio/ideas"
import type { OddColumn, OddRate } from "@/libs/social-studio/unusual"
import { btn, Callout, CopyCommand, EmptyState, Field, Help, inputCls, PageHeader, Panel, Pill, Segmented, Spinner, Tabs } from "../hts-revision-diff/ui"
import { Select } from "@/components/ui/Select"
import IdeaCard from "./IdeaCard"
import PostCard from "./PostCard"

// Makes branded posts from the tariff engine, Census data and the /tariff-updates feed. Ideas:
// what the daily miners and Claude found worth posting. News: a post for any tariff update.
// Product, Country, Facts and Odd rates: make posts by hand. Every number is computed; you edit the words,
// then download PNGs or MP4s (rendered in the browser).

type Tab = "ideas" | "news" | "product" | "country" | "facts" | "odd"

// One odd rate and every line that has it
interface OddGroup {
  rate: OddRate
  codes: string[]
}

// The odd rates, one row per distinct rate in a column, in the order the server ranked them
const groupOddRates = (rates: OddRate[]) => {
  const groups = new Map<string, OddGroup>()
  rates.forEach((r) => {
    const key = `${r.column}|${r.rate}`
    const group = groups.get(key)
    if (group) group.codes.push(r.htsno)
    else groups.set(key, { rate: r, codes: [r.htsno] })
  })
  return Array.from(groups.values())
}

const ODD_SHOWN = 60

interface NewsRow {
  slug: string
  title: string
  kind: string
  authority: string
  stage: string
  effective_on: string | null
  last_activity_at: string
  phase: "announced" | "in-effect"
  score: number | null
  idea: Idea | null // the post saved for it, if any
}

interface Built {
  title: string
  posts: Post[]
  notes: string[]
}

const PRODUCT_PRESETS = [
  { label: "E-bikes · China", htsCode: "8711.60.0050", countries: "CN", productName: "E-bikes" },
  { label: "Laptops · China", htsCode: "8471.30.0100", countries: "CN", productName: "Laptops" },
  { label: "Lithium-ion batteries", htsCode: "8507.60.0030", countries: "CN", productName: "Lithium-ion batteries" },
]

const COUNTRY_PRESETS = ["CN", "VN", "MX", "IN", "CH", "TH"]

const FACTS: { kind: string; label: string }[] = [
  { kind: "highest-base", label: "Highest base duty rates in the HTS" },
  { kind: "fastest-growing", label: "Fastest-growing US suppliers this year" },
  { kind: "biggest-falls", label: "Biggest falls among US suppliers this year" },
  { kind: "biggest-suppliers", label: "Biggest US suppliers" },
  { kind: "top-products", label: "Most-imported products" },
]

const STATUS_TONE = { new: "info", used: "success", skipped: "neutral" } as const

// What an action costs: Claude calls are billed to the Anthropic API key (ANTHROPIC_API_KEY);
// everything else runs on HTS Hero's own data and in the browser, for free
const Cost = ({ claude }: { claude?: string }) =>
  claude ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning" title="Calls Claude, billed to the Anthropic API key">
      Claude · {claude}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success" title="No Claude call, no cost">
      Free
    </span>
  )

const money = (usd: number) => (usd < 0.01 ? `${(usd * 100).toFixed(2)}¢` : `$${usd.toFixed(3)}`)

const withTheme = (post: Post, theme: Theme): Post => ({ ...post, props: { ...post.props, theme } } as Post)

export default function SocialStudio() {
  const [tab, setTab] = useState<Tab>("ideas")
  const [theme, setTheme] = useState<Theme>("dark")
  const [format, setFormat] = useState<Format>("portrait")

  // Ideas
  const [ideas, setIdeas] = useState<Idea[] | null>(null)
  const [ideasError, setIdeasError] = useState<string | null>(null)
  const [finding, setFinding] = useState(false)
  const [runNotes, setRunNotes] = useState<string[]>([])

  // Made by hand
  const [htsCode, setHtsCode] = useState(PRODUCT_PRESETS[0].htsCode)
  const [countries, setCountries] = useState(PRODUCT_PRESETS[0].countries)
  const [productName, setProductName] = useState(PRODUCT_PRESETS[0].productName)
  const [country, setCountry] = useState("VN")
  const [fact, setFact] = useState(FACTS[0].kind)
  // Posts made by hand, kept per tab so switching tabs doesn't lose them
  const [builtByTab, setBuiltByTab] = useState<Partial<Record<Tab, Built>>>({})
  const built = builtByTab[tab] ?? null
  const setBuilt = (update: Built | null | ((b: Built | null) => Built | null)) =>
    setBuiltByTab((all) => ({ ...all, [tab]: (typeof update === "function" ? update(all[tab] ?? null) : update) ?? undefined }))
  const [loading, setLoading] = useState(false)
  const [news, setNews] = useState<NewsRow[] | null>(null)
  const [newsSlug, setNewsSlug] = useState<string | null>(null)
  const [newsWarning, setNewsWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [oddRates, setOddRates] = useState<OddRate[] | null>(null)
  const [oddColumn, setOddColumn] = useState<OddColumn | "all">("general")
  const [oddAll, setOddAll] = useState(false)
  const [oddQuery, setOddQuery] = useState("")
  const [oddPicked, setOddPicked] = useState<string | null>(null)

  const loadIdeas = useCallback(async () => {
    setIdeasError(null)
    try {
      const res = await fetch("/api/social-studio/ideas", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? res.statusText)
      setIdeas(data.ideas)
    } catch (e) {
      setIdeasError((e as Error).message)
      setIdeas((current) => current ?? [])
    }
  }, [])

  useEffect(() => {
    loadIdeas()
  }, [loadIdeas])

  useEffect(() => {
    if (tab !== "news" || news) return
    fetch("/api/social-studio/news", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.updates) return setError(d.error)
        setNews(d.updates)
        setNewsWarning(d.warning)
      })
      .catch((e) => setError(e.message))
  }, [tab, news])

  useEffect(() => {
    if (tab !== "odd" || oddRates) return
    fetch("/api/social-studio/odd-rates", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d.rates ? setOddRates(d.rates) : setError(d.error)))
      .catch((e) => setError(e.message))
  }, [tab, oddRates])

  const findIdeas = async () => {
    setFinding(true)
    setRunNotes([])
    try {
      const res = await fetch("/api/social-studio/ideas", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? res.statusText)
      setRunNotes([
        `${data.ideas.length} ideas from ${data.shortlisted} shortlisted of ${data.candidates} candidates${data.usage ? ` · this run cost ${money(data.usage.cost_usd)} in Claude usage` : ""}`,
        ...data.warnings,
      ])
      // Saved ideas come back from the table; unsaved ones (no table yet) are shown as they are
      if (data.ideas.every((i: Idea) => i.id)) await loadIdeas()
      else setIdeas(data.ideas)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setFinding(false)
    }
  }

  const setIdea = (i: number, patch: Partial<Idea>) => setIdeas((list) => list && list.map((x, j) => (j === i ? { ...x, ...patch } : x)))



  const build = async (body: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/social-studio/build", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, theme }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? res.statusText)
      setBuilt(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // A post for one tariff update, saved as an idea (making it again replaces an unused one)
  const makeNews = async (slug: string) => {
    setNewsSlug(slug)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/social-studio/build", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "news", slug, theme }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? res.statusText)
      setNewsIdea(slug, data.idea)
      if (data.costUsd !== null) toast.success(`Post saved · Claude ${money(data.costUsd)}`)
      data.notes.forEach((n: string) => toast(n))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const setNewsIdea = (slug: string, idea: Idea) => setNews((rows) => rows && rows.map((r) => (r.slug === slug ? { ...r, idea } : r)))

  const buildProduct = (preset?: (typeof PRODUCT_PRESETS)[number]) => {
    const req = preset ?? { htsCode, countries, productName }
    if (preset) {
      setHtsCode(preset.htsCode)
      setCountries(preset.countries)
      setProductName(preset.productName)
    }
    build({ mode: "product", htsCode: req.htsCode, countries: req.countries.split(/[\s,]+/).filter(Boolean), productName: req.productName })
  }

  const changeTheme = (next: Theme) => {
    setTheme(next)
    setBuilt((b) => b && { ...b, posts: b.posts.map((p) => withTheme(p, next)) })
    setIdeas((list) => list && list.map((idea) => ({ ...idea, props: { ...idea.props, theme: next } as Idea["props"] })))
  }

  const oddGroups = groupOddRates(oddRates ?? [])
  const oddQ = oddQuery.trim().toLowerCase()
  const oddShown = oddGroups.filter(
    (g) =>
      (oddColumn === "all" || g.rate.column === oddColumn) &&
      (oddAll || g.rate.calculable) &&
      (!oddQ || `${g.rate.rate} ${g.rate.product} ${g.rate.why} ${g.codes.join(" ")}`.toLowerCase().includes(oddQ))
  )
  const oddNotCalculated = oddGroups.filter((g) => !g.rate.calculable).length

  const days = Array.from(new Set((ideas ?? []).map((i) => i.run_on)))

  const viewBar = (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented<Format>
        value={format}
        onChange={setFormat}
        options={(Object.keys(FORMATS) as Format[]).map((f) => ({ value: f, label: FORMATS[f].label, title: FORMATS[f].use }))}
      />
      <Segmented<Theme> value={theme} onChange={changeTheme} options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
      <span className="text-sm text-base-content/55">
        {FORMATS[format].use} · {FORMATS[format].width}×{FORMATS[format].height}
      </span>
    </div>
  )

  return (
    <>
      <PageHeader
        title="Content Studio"
        meta="Branded posts from the tariff engine and Census data. Every number is computed; edit the words, then download."
      >
        <Help label="What costs money">
          <p>
            <Cost claude="about 5–7¢" /> Daily ideas, automatically every morning (about $2 a month), and each <b>Find ideas now</b>
          </p>
          <p>
            <Cost claude="under 1¢" /> <b>Make post</b> or <b>Remake</b> on the News tab
          </p>
          <p>
            <Cost /> Everything else: the Product, Country, Facts and Odd Rates tabs, previews, editing, saving, Mark used / Skip, and PNG and MP4 downloads
            (rendered in your browser)
          </p>
          <p className="text-xs">Claude calls are billed to the Anthropic API key (ANTHROPIC_API_KEY), not a Claude subscription.</p>
        </Help>
        <Tabs<Tab>
          value={tab}
          onChange={(t) => {
            setTab(t)
            setError(null)
            // Picks up posts saved from the News tab
            if (t === "ideas") loadIdeas()
          }}
          tabs={[
            { value: "ideas", label: "Ideas", count: ideas?.filter((i) => i.status === "new").length },
            { value: "news", label: "News" },
            { value: "product", label: "Product" },
            { value: "country", label: "Country" },
            { value: "facts", label: "Facts" },
            { value: "odd", label: "Odd Rates" },
          ]}
        />
      </PageHeader>

      {tab === "ideas" && (
        <>
          <Panel
            title="Daily Ideas"
            actions={
              <div className="flex items-center gap-2">
                <Cost claude="about 5–7¢" />
                <button className={btn.secondary} disabled={finding} onClick={findIdeas}>
                  {finding && <Spinner />} {finding ? "Finding ideas…" : "Find ideas now"}
                </button>
              </div>
            }
            bodyClassName="flex flex-col gap-3 px-6 py-4 text-sm text-base-content/70"
          >
            <p>
              8 new ideas every morning: sourcing gaps, rate swings, trade shifts and fun facts from the 150 most-imported products and the biggest suppliers.
              Mark the one you post as used and skip the rest.
            </p>
            <Help label="How ideas are found">
              <p>
                Every morning the miners scan the 150 most-imported products and the biggest suppliers for sourcing gaps, rate swings, trade shifts and fun
                facts. Claude picks 8 varied ideas and writes their words; any number it writes that isn&apos;t in the data falls back to the drafted text.
                Stories offered in the last 30 days aren&apos;t repeated.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                Same run from the terminal: <CopyCommand command="npm run social:ideas" />
              </div>
            </Help>
            {runNotes.map((n) => (
              <Callout key={n} tone={n.startsWith("Couldn't") || n.includes("failed") ? "warning" : "info"}>
                {n}
              </Callout>
            ))}
            {ideasError && (
              <Callout tone="warning" title="Ideas can't be saved or listed yet">
                {ideasError} Paste <code>supabase/migrations/social_ideas.sql</code> into the Supabase SQL editor. Until then, &quot;Find ideas now&quot; still shows
                today&apos;s ideas without saving them.
              </Callout>
            )}
          </Panel>
          {ideas && ideas.length > 0 && viewBar}
          {ideas === null && <Spinner />}
          {ideas?.length === 0 && !ideasError && <EmptyState title="No ideas yet">They arrive every morning, or find some now.</EmptyState>}
          {days.map((day) => (
            <div key={day} className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-base-content/60 tracker:pt-2 tracker:text-lg tracker:text-base-content tracker:[font-family:var(--font-tracker-display)]">
                {new Date(`${day}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h2>
              {ideas!.map((idea, i) =>
                idea.run_on !== day ? null : (
                  <IdeaCard key={idea.id ?? `${idea.dedupe_key}-${i}`} idea={idea} format={format} onChange={(next) => setIdea(i, next)} />
                )
              )}
            </div>
          ))}
        </>
      )}

      {tab === "news" && (
        <Panel
          title="Tariff Updates, Last 30 Days"
          count={news?.length}
          actions={
            <span className="flex items-center gap-2 text-xs text-base-content/50">
              Make post and Remake: <Cost claude="under 1¢ each" />
            </span>
          }
          bodyClassName="divide-y divide-base-content/10 tracker:divide-base-300"
        >
          {!news && !error && (
            <div className="p-4">
              <Spinner />
            </div>
          )}
          {error && (
            <div className="p-4">
              <Callout tone="error">{error}</Callout>
            </div>
          )}
          {newsWarning && (
            <div className="p-4">
              <Callout tone="warning">{newsWarning}</Callout>
            </div>
          )}
          {news?.map((u) => (
            <div key={u.slug} className={`flex items-center gap-4 px-4 py-2.5 text-sm tracker:px-6 tracker:py-3 ${newsSlug === u.slug ? "bg-base-content/[0.04] tracker:bg-tt-soft-high" : ""}`}>
              <span className="w-20 shrink-0 text-xs text-base-content/45">
                {new Date(u.last_activity_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{u.title}</div>
                <div className="text-xs text-base-content/50">
                  {u.authority.replace(/_/g, " ")} · {u.kind.replace(/_/g, " ")} · {u.stage.replace(/_/g, " ")}
                  {u.effective_on ? ` · effective ${u.effective_on}` : ""}
                </div>
              </div>
              <Pill tone={u.phase === "in-effect" ? "success" : "info"}>{u.phase === "in-effect" ? "In effect" : "Announced"}</Pill>
              {u.score !== null && !u.idea && <Pill tone="warning">Idea-worthy</Pill>}
              {u.idea ? (
                <>
                  <Pill tone={u.idea.status === "used" ? "success" : u.idea.status === "skipped" ? "neutral" : "info"}>
                    {u.idea.status === "used" ? "Posted" : u.idea.status === "skipped" ? "Skipped" : "Post saved"}
                  </Pill>
                  <button className={btn.xsSecondary} onClick={() => setNewsSlug(newsSlug === u.slug ? null : u.slug)}>
                    {newsSlug === u.slug ? "Close" : "Open post"}
                  </button>
                  <button className={btn.xsGhost} disabled={loading} title="Write it again from the update" onClick={() => makeNews(u.slug)}>
                    {loading && newsSlug === u.slug && <Spinner />} Remake
                  </button>
                </>
              ) : (
                <button className={btn.xsSecondary} disabled={loading} onClick={() => makeNews(u.slug)}>
                  {loading && newsSlug === u.slug && <Spinner />} Make post
                </button>
              )}
            </div>
          ))}
        </Panel>
      )}

      {tab === "news" && (() => {
        const open = news?.find((u) => u.slug === newsSlug && u.idea)
        return open?.idea ? (
          <>
            {viewBar}
            <IdeaCard key={open.idea.id ?? open.slug} idea={open.idea} format={format} onChange={(next) => setNewsIdea(open.slug, next)} />
          </>
        ) : null
      })()}

      {tab === "product" && (
        <Panel title="A Product" bodyClassName="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="HTS code" className="w-44">
              <input className={`${inputCls} w-full font-mono`} value={htsCode} onChange={(e) => setHtsCode(e.target.value)} placeholder="8711.60.0050" />
            </Field>
            <Field label="Countries" hint="First is the one you source from; blank uses the top supplier" className="w-72">
              <input className={`${inputCls} w-full`} value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="CN, VN" />
            </Field>
            <Field label="Short product name" hint="Blank uses the HTS description" className="w-56">
              <input className={`${inputCls} w-full`} value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="E-bikes" />
            </Field>
            <button className={btn.primary} disabled={loading || !htsCode.trim()} onClick={() => buildProduct()}>
              {loading && <Spinner />} Make posts
            </button>
            <Cost />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/55">
            Try:
            {PRODUCT_PRESETS.map((p) => (
              <button key={p.label} className={btn.xsSecondary} disabled={loading} onClick={() => buildProduct(p)}>
                {p.label}
              </button>
            ))}
          </div>
          {error && <Callout tone="error">{error}</Callout>}
        </Panel>
      )}

      {tab === "country" && (
        <Panel title="A Country" bodyClassName="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Country" hint="Two-letter code or name" className="w-56">
              <input className={`${inputCls} w-full`} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="VN" />
            </Field>
            <button className={btn.primary} disabled={loading || !country.trim()} onClick={() => build({ mode: "country", country })}>
              {loading && <Spinner />} Make posts
            </button>
            <Cost />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/55">
            Try:
            {COUNTRY_PRESETS.map((c) => (
              <button
                key={c}
                className={btn.xsSecondary}
                disabled={loading}
                onClick={() => {
                  setCountry(c)
                  build({ mode: "country", country: c })
                }}
              >
                {c}
              </button>
            ))}
          </div>
          {error && <Callout tone="error">{error}</Callout>}
        </Panel>
      )}

      {tab === "facts" && (
        <Panel title="A Fact Across the Schedule" bodyClassName="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Fact" className="w-96">
              <Select
                value={fact}
                onChange={(v) => setFact(v)}
                options={FACTS.map((f) => ({ value: f.kind, label: f.label }))}
                label="Fact"
                size="sm"
                className="w-full"
              />
            </Field>
            <button className={btn.primary} disabled={loading} onClick={() => build({ mode: "fact", kind: fact })}>
              {loading && <Spinner />} Make post
            </button>
            <Cost />
          </div>
          {error && <Callout tone="error">{error}</Callout>}
        </Panel>
      )}

      {tab === "odd" && (
        <Panel
          title="Odd Rates in the HTS"
          count={oddRates ? oddShown.length : undefined}
          actions={
            <div className="flex items-center gap-2">
              <Cost />
              <button className={btn.secondary} disabled={loading || !oddRates} onClick={() => {
                  setOddPicked(null)
                  build({ mode: "odd-rates-roundup" })
                }}>
                {loading && !oddPicked && <Spinner />} Make roundup
              </button>
            </div>
          }
          bodyClassName="flex flex-col gap-3 px-6 py-5 text-sm"
        >
          <p className="text-base-content/70">
            Duty rates charged per jewel, by the degree of a sugar&apos;s polarity, in fractions or on one part of the goods, found in the HTS the
            site has loaded. A post quotes the rate word for word and shows HTS Hero working it out on a $10,000 shipment. Only rates HTS Hero
            calculates get posts{oddRates ? `; ${oddNotCalculated} it can't calculate yet are hidden unless you show them` : ""}.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented<OddColumn | "all">
              value={oddColumn}
              onChange={setOddColumn}
              options={[
                { value: "general", label: "General", title: "What most countries pay" },
                { value: "other", label: "Column 2", title: "Cuba, North Korea, Russia, Belarus" },
                { value: "all", label: "Both" },
              ]}
            />
            <input className={`${inputCls} w-64`} value={oddQuery} onChange={(e) => setOddQuery(e.target.value)} placeholder="Search: jewel, sugar, 9105…" />
            <label className="flex items-center gap-2 text-xs text-base-content/60">
              <input type="checkbox" className="checkbox checkbox-xs" checked={oddAll} onChange={(e) => setOddAll(e.target.checked)} />
              Show rates HTS Hero can&apos;t calculate yet
            </label>
          </div>
          {error && <Callout tone="error">{error}</Callout>}
          {!oddRates && !error && <Spinner />}
          {oddRates && oddShown.length === 0 && <EmptyState title="No odd rates match">Try another search or column.</EmptyState>}
          <div className="divide-y divide-base-content/10 rounded-lg border border-base-content/10 tracker:divide-base-300 tracker:rounded-xl tracker:border-base-300">
            {oddShown.slice(0, ODD_SHOWN).map((g) => {
              const key = `${g.rate.column}|${g.rate.htsno}`
              return (
                <div key={`${g.rate.column}|${g.rate.rate}`} className={`flex items-start gap-4 px-3 py-2.5 ${oddPicked === key ? "bg-base-content/[0.04]" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">&ldquo;{g.rate.rate}&rdquo;</div>
                    <div className="text-xs text-base-content/55">
                      {g.rate.product} · <span className="font-mono">{g.codes[0]}</span>
                      {g.codes.length > 1 ? ` +${g.codes.length - 1} more` : ""} · {g.rate.column === "other" ? "Column 2" : "General"} · {g.rate.why}
                    </div>
                  </div>
                  {g.rate.calculable ? (
                    <button
                      className={btn.xsSecondary}
                      disabled={loading}
                      onClick={() => {
                        setOddPicked(key)
                        build({ mode: "odd-rate", htsCode: g.rate.htsno, column: g.rate.column })
                      }}
                    >
                      {loading && oddPicked === key && <Spinner />} Make post
                    </button>
                  ) : (
                    <Pill tone="neutral" title="The calculator can't work this rate out yet, so it gets no post">
                      Not calculated yet
                    </Pill>
                  )}
                </div>
              )
            })}
          </div>
          {oddShown.length > ODD_SHOWN && (
            <div className="text-xs text-base-content/50">
              Showing the {ODD_SHOWN} most post-worthy of {oddShown.length}. Search to find others.
            </div>
          )}
        </Panel>
      )}

      {tab !== "ideas" && tab !== "news" && built && (
        <>
          {viewBar}
          <div className="text-sm font-medium text-base-content/60">
            {built.title} · {built.posts.length} posts
          </div>
          {built.notes.map((n) => (
            <Callout key={n} tone="warning">
              {n}
            </Callout>
          ))}
          {built.posts.map((post, i) => (
            <PostCard
              key={post.key}
              post={post}
              format={format}
              captions={captionsFor(post.template, post.props)}
              onProps={(props) => setBuilt((b) => b && { ...b, posts: b.posts.map((p, j) => (j === i ? ({ ...p, props } as Post) : p)) })}
            />
          ))}
        </>
      )}
    </>
  )
}
