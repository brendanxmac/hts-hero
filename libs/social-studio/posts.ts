import type { Theme } from "../../social/brand"
import type { CountrySide, Post, SourceLink, TemplateId, TemplatePropsMap } from "../../social/types"
import { inSentence } from "../hts-duty-summary"
import { pctText, ProductData, RateHistory, round1, Side, SOURCE_BOTH, SOURCE_ENGINE } from "./data"
import { calculatorLink, censusCodeLink, dedupe, htsLink, legalLinks } from "./sources"

// Each template's post for one product, from its figures. A function returns null when the
// product has nothing worth drawing for that template (one origin, no Census figures, no
// cheaper supplier). Headlines are first drafts; the studio and the daily ideas rewrite them.
// Every post lists the sources that verify its figures.

const post = <T extends TemplateId>(key: string, template: T, title: string, props: TemplatePropsMap[T], sources: (SourceLink | null)[]): Post<T> => ({
  key,
  template,
  title,
  props,
  sources: dedupe(sources),
})

const plain = ({ parts, perUnit, priorValue, lines, ...side }: Side): CountrySide => side

// An origin's rate today: the calculator's breakdown, and the legal documents for each duty
const rateSources = (d: ProductData, s: Side) => [
  calculatorLink(`${s.country.name}: ${pctText(s.ratePct)} today`, d.htsno, s.country.code),
  ...legalLinks(`The additional duties on ${s.country.name}`, s.lines),
]

// The base rate and the product's description, in the official schedule
const scheduleSource = (d: ProductData) => htsLink(`HTS ${d.htsno}: the product and its base rate`, d.htsno)

// The Census import figures, this year and the year before (for a family when the line has none)
const importSources = (d: ProductData) => {
  if (!d.imports) return []
  const code = d.htsno.replace(/\D/g, "").slice(0, d.imports.level)
  const family = d.imports.level !== 10 ? ` (its ${d.imports.level}-digit family)` : ""
  return [
    censusCodeLink(`US imports by country in ${d.imports.year}${family}`, code, d.imports.year),
    censusCodeLink(`US imports by country in ${d.imports.prior}${family}`, code, d.imports.prior),
  ]
}

const base = (d: ProductData, theme: Theme, source = SOURCE_ENGINE) => ({ theme, asOf: d.asOf, source })

// The origins the US really buys the product from: at least $1M in the Census year
const realSuppliers = (d: ProductData) =>
  Array.from(d.sides.values()).filter((s) => !d.imports || (s.importValue ?? 0) >= 1_000_000 || d.requested.includes(s.country.code))

// The main origin's rival: the second asked for, else the top supplier whose rate differs most
export const rivalOf = (d: ProductData) => {
  const main = d.sides.get(d.main)!
  return (
    d.sides.get(d.requested[1]) ??
    realSuppliers(d)
      .filter((s) => s.country.code !== d.main)
      .slice(0, 5)
      .sort((a, b) => Math.abs(b.ratePct - main.ratePct) - Math.abs(a.ratePct - main.ratePct))[0]
  )
}

export const timelinePost = (d: ProductData, h: RateHistory, theme: Theme) => {
  if (!h.points.length) return null
  const main = d.sides.get(d.main)!
  const first = h.points[0].pct
  const last = h.points[h.points.length - 1].pct
  // The point furthest from both ends: a peak or a dip worth naming in the headline
  const turn = h.points.reduce((best, x) => (Math.min(Math.abs(x.pct - first), Math.abs(x.pct - last)) > Math.min(Math.abs(best - first), Math.abs(best - last)) ? x.pct : best), first)
  const where = main.country.name
  const headline =
    Math.min(Math.abs(turn - first), Math.abs(turn - last)) > 0.5
      ? `${d.product} from ${where}: ${pctText(first)} → ${pctText(turn)} → ${pctText(last)}`
      : first !== last
        ? `${d.product} from ${where}: ${pctText(first)} → ${pctText(last)}`
        : `${d.product} from ${where} has paid ${pctText(last)} for a year`
  return post(`timeline-${d.htsno}-${d.main}`, "RateTimeline", `${d.product} from ${where}, rate history`, {
    ...base(d, theme),
    headline,
    product: d.product,
    htsCode: d.htsno,
    country: main.country,
    points: h.points,
    end: d.asOf,
    events: h.events,
  }, [
    calculatorLink(`${where}: ${pctText(last)} today`, d.htsno, main.country.code),
    ...h.points.slice(0, -1).map((p) => calculatorLink(`${where}: ${pctText(p.pct)} from ${p.from}`, d.htsno, main.country.code, p.from)),
    ...h.events.flatMap((e, i) => legalLinks(`${e.date}: ${e.label}`, h.eventLines[i] ?? [])),
    scheduleSource(d),
  ])
}

export const bigNumberPost = (d: ProductData, theme: Theme) => {
  const main = d.sides.get(d.main)!
  const where = main.country.name
  return post(`big-${d.htsno}-${d.main}`, "BigNumber", `${d.product} from ${where}, today's rate`, {
    ...base(d, theme),
    eyebrow: `${main.country.flag} ${d.product} from ${where}`,
    value: pctText(main.ratePct),
    label: `The tariff on ${inSentence(d.product)} from ${where} today`,
    tone: main.ratePct >= 25 ? "up" : "brand",
    parts: main.parts,
    footnote: main.perUnit ? "Per-unit base rate, worked out on a $10,000 shipment of 1,000 units." : undefined,
  }, [...rateSources(d, main), scheduleSource(d)])
}

export const headToHeadPost = (d: ProductData, theme: Theme) => {
  const main = d.sides.get(d.main)!
  const rival = rivalOf(d)
  if (!rival) return null
  return post(`h2h-${d.htsno}-${d.main}-${rival.country.code}`, "HeadToHead", `${d.product}: ${main.country.name} vs ${rival.country.name}`, {
    ...base(d, theme, d.imports ? SOURCE_BOTH : SOURCE_ENGINE),
    headline: `${main.country.name} pays ${pctText(main.ratePct)}. ${rival.country.name} pays ${pctText(rival.ratePct)}.`,
    product: d.product,
    htsCode: d.htsno,
    left: plain(main),
    right: plain(rival),
    year: d.imports?.year,
  }, [...rateSources(d, main), ...rateSources(d, rival), ...importSources(d), scheduleSource(d)])
}

export const rankingPost = (d: ProductData, theme: Theme) => {
  const rows = realSuppliers(d)
    .slice(0, 8)
    .sort((a, b) => b.ratePct - a.ratePct)
  if (rows.length < 3) return null
  return post(`ranking-${d.htsno}`, "Ranking", `${d.product}, rates by country`, {
    ...base(d, theme),
    headline: `The tariff on ${inSentence(d.product)}, by country`,
    product: d.product,
    htsCode: d.htsno,
    rows: rows.map(plain),
  }, [...rows.flatMap((r) => rateSources(d, r)), scheduleSource(d)])
}

export const tradeShiftPost = (d: ProductData, theme: Theme) => {
  if (!d.imports) return null
  const rows = Array.from(d.sides.values())
    .filter((s) => s.importValue !== undefined && s.priorValue !== undefined)
    .sort((a, b) => b.importValue! - a.importValue!)
    .slice(0, 6)
    .map((s) => ({ ...plain(s), importValue: s.importValue!, priorValue: s.priorValue! }))
  if (rows.length < 2) return null
  const mover = [...rows].sort((a, b) => Math.abs(b.importValue - b.priorValue) - Math.abs(a.importValue - a.priorValue))[0]
  const change = mover.priorValue > 0 ? Math.round(((mover.importValue - mover.priorValue) / mover.priorValue) * 100) : null
  return post(`shift-${d.htsno}`, "TradeShift", `${d.product}, where the US bought it`, {
    ...base(d, theme, SOURCE_BOTH),
    headline:
      change !== null
        ? `US ${inSentence(d.product)} imports from ${mover.country.name} ${change >= 0 ? "up" : "down"} ${Math.abs(change)}% in ${d.imports.year}`
        : `Where the US bought ${inSentence(d.product)} in ${d.imports.year}`,
    product: d.product,
    htsCode: d.htsno,
    year: d.imports.year,
    prior: d.imports.prior,
    rows,
  }, [...importSources(d), ...Array.from(d.sides.values()).filter((s) => rows.some((r) => r.country.code === s.country.code)).map((s) => calculatorLink(`${s.country.name}: ${pctText(s.ratePct)} today`, d.htsno, s.country.code))])
}

// The cheaper origins the US really buys from, lowest rate first
export const cheaperSuppliers = (d: ProductData) => {
  const main = d.sides.get(d.main)!
  return realSuppliers(d)
    .filter((s) => s.country.code !== d.main && s.ratePct < main.ratePct)
    .sort((a, b) => a.ratePct - b.ratePct || (b.importValue ?? 0) - (a.importValue ?? 0))
}

export const sourcingPost = (d: ProductData, theme: Theme) => {
  const main = d.sides.get(d.main)!
  const options = cheaperSuppliers(d).slice(0, 3)
  if (!options.length) return null
  return post(`sourcing-${d.htsno}-${d.main}`, "SourcingSaver", `Sourcing ${inSentence(d.product)} from ${main.country.name}`, {
    ...base(d, theme, d.imports ? SOURCE_BOTH : SOURCE_ENGINE),
    headline: `Sourcing ${inSentence(d.product)} from ${main.country.name}?`,
    product: d.product,
    htsCode: d.htsno,
    from: plain(main),
    options: options.map((o) => ({ ...plain(o), savingPts: round1(main.ratePct - o.ratePct) })),
    year: d.imports?.year,
  }, [...rateSources(d, main), ...options.flatMap((o) => rateSources(d, o)), ...importSources(d), scheduleSource(d)])
}

export const spreadPost = (d: ProductData, theme: Theme) => {
  const rows = Array.from(d.sides.values())
  const min = Math.min(...rows.map((r) => r.ratePct))
  const max = Math.max(...rows.map((r) => r.ratePct))
  if (rows.length < 4 || max === min) return null
  return post(`spread-${d.htsno}`, "RateSpread", `${d.product}, the spread of rates`, {
    ...base(d, theme),
    headline: `${d.product}: from ${pctText(min)} to ${pctText(max)}, depending on where it's made`,
    product: d.product,
    htsCode: d.htsno,
    rows: rows.map(plain),
  }, [...rows.flatMap((r) => rateSources(d, r)), scheduleSource(d)])
}

export const quizPost = (d: ProductData, theme: Theme) => {
  const main = d.sides.get(d.main)!
  const rival = rivalOf(d)
  if (!rival || rival.ratePct === main.ratePct) return null
  const [hi, lo] = main.ratePct > rival.ratePct ? [main, rival] : [rival, main]
  const ratio = lo.ratePct > 0 ? hi.ratePct / lo.ratePct : null
  const options = [main, rival].sort((a, b) => a.country.name.localeCompare(b.country.name))
  return post(`quiz-${d.htsno}-${d.main}-${rival.country.code}`, "Quiz", `Quiz: ${d.product}, ${main.country.name} or ${rival.country.name}`, {
    ...base(d, theme),
    question: `Which pays the higher US tariff on ${inSentence(d.product)}?`,
    product: d.product,
    htsCode: d.htsno,
    options: options.map((o) => ({ country: o.country, ratePct: o.ratePct })),
    reveal:
      ratio && ratio >= 1.5
        ? `${hi.country.name}: ${pctText(hi.ratePct)}, ${round1(ratio)}× ${lo.country.name}'s ${pctText(lo.ratePct)} on the same product.`
        : `${hi.country.name} pays ${round1(hi.ratePct - lo.ratePct)}% more: ${pctText(hi.ratePct)} vs ${pctText(lo.ratePct)}.`,
  }, [...rateSources(d, main), ...rateSources(d, rival), scheduleSource(d)])
}
