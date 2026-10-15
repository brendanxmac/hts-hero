"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Format, FORMATS, Theme } from "@/social/brand"
import { captionsFor } from "@/social/captions"
import type { Post } from "@/social/types"
import type { Idea } from "@/libs/social-studio/ideas"
import { btn, Callout, CopyCommand, EmptyState, Field, inputCls, PageHeader, Panel, Pill, Segmented, Spinner, Tabs } from "../hts-revision-diff/ui"
import { Select } from "@/components/ui/Select"
import IdeaCard from "./IdeaCard"
import PostCard from "./PostCard"

// Makes branded posts from the tariff engine, Census data and the /tariff-updates feed. Ideas:
// what the daily miners and Claude found worth posting. News: a post for any tariff update.
// Product, Country and Facts: make posts by hand. Every number is computed; you edit the words,
// then download PNGs or MP4s (rendered in the browser).

type Tab = "ideas" | "news" | "product" | "country" | "facts"

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

  const findIdeas = async () => {
    setFinding(true)
    setRunNotes([])
    try {
      const res = await fetch("/api/social-studio/ideas", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? res.statusText)
      setRunNotes([
        `${data.ideas.length} ideas from ${data.shortlisted} shortlisted of ${data.candidates} candidates${data.usage ? ` · Claude $${data.usage.cost_usd}` : ""}`,
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Social studio"
        meta="Branded posts from the tariff engine and Census data. Every number is computed; edit the words, then download."
      />
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
        ]}
      />

      {tab === "ideas" && (
        <>
          <Panel
            title="Daily ideas"
            actions={
              <button className={btn.primary} disabled={finding} onClick={findIdeas}>
                {finding && <Spinner />} {finding ? "Finding ideas…" : "Find ideas now"}
              </button>
            }
            bodyClassName="flex flex-col gap-3 p-4 text-sm text-base-content/70"
          >
            <p>
              Every morning the miners scan the 150 most-imported products and the biggest suppliers for sourcing gaps, rate swings, trade shifts and
              fun facts. Claude picks 8 varied ideas and writes their words; any number it writes that isn&apos;t in the data falls back to the
              drafted text. Stories offered in the last 30 days aren&apos;t repeated.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              Same run from the terminal: <CopyCommand command="npm run social:ideas" />
            </div>
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
              <h2 className="text-sm font-semibold text-base-content/60">
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
        <Panel title="Tariff updates, last 30 days" count={news?.length} bodyClassName="divide-y divide-base-content/10">
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
            <div key={u.slug} className={`flex items-center gap-4 px-4 py-2.5 text-sm ${newsSlug === u.slug ? "bg-base-content/[0.04]" : ""}`}>
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
        <Panel title="A product" bodyClassName="flex flex-col gap-4 p-4">
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
        <Panel title="A country" bodyClassName="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Country" hint="Two-letter code or name" className="w-56">
              <input className={`${inputCls} w-full`} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="VN" />
            </Field>
            <button className={btn.primary} disabled={loading || !country.trim()} onClick={() => build({ mode: "country", country })}>
              {loading && <Spinner />} Make posts
            </button>
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
        <Panel title="A fact across the schedule" bodyClassName="flex flex-col gap-4 p-4">
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
          </div>
          {error && <Callout tone="error">{error}</Callout>}
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
    </div>
  )
}
