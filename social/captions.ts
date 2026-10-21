import type { TemplateId, TemplatePropsMap } from "./types"

// First-draft post text for LinkedIn and X, from the same props the image draws, so an edited
// headline carries into the caption. Copy rules: the numbers are the engine's and Census's,
// trade shifts are patterns (never "because of the tariff"), savings are only ever potential.

export interface Captions {
  linkedin: string
  x: string
}

const pct = (n: number) => `${Math.round(n * 10) / 10}%`
const usd = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(1).replace(/\.0$/, "")}B` : n >= 1e6 ? `$${Math.round(n / 1e6)}M` : `$${Math.max(1, Math.round(n / 1e3))}K`
const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n))}%`
const date = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

const CTA = "Look up any HTS code's tariff from any country, free: htshero.com"
const TAGS = "#tariffs #imports #trade #customs"

const linkedin = (hook: string, lines: string[], close?: string) =>
  [hook, "", ...lines.map((l) => `→ ${l}`), "", ...(close ? [close, ""] : []), CTA, "", TAGS].join("\n")

// X: the hook, one fact, the link; trimmed to 280
const x = (hook: string, fact: string) => {
  const text = `${hook}\n\n${fact}\n\nhtshero.com`
  return text.length <= 280 ? text : `${hook}\n\nhtshero.com`
}

export const captionsFor = <T extends TemplateId>(template: T, props: TemplatePropsMap[T]): Captions => {
  switch (template) {
    case "RateTimeline": {
      const p = props as TemplatePropsMap["RateTimeline"]
      const first = p.points[0]
      const last = p.points[p.points.length - 1]
      const lines = [
        `${date(first.from)}: ${pct(first.pct)}`,
        ...p.events.map((e) => `${date(e.date)}: ${e.label}`),
        `Today: ${pct(last.pct)}`,
      ]
      return {
        linkedin: linkedin(p.headline, lines, `${p.product} (HTS ${p.htsCode}) from ${p.country.name}, every change since ${date(first.from)}.`),
        x: x(p.headline, `${p.events.length} changes since ${date(first.from)}. HTS ${p.htsCode}.`),
      }
    }
    case "BigNumber": {
      const p = props as TemplatePropsMap["BigNumber"]
      const lines = p.parts.length > 1 ? p.parts.map((part) => `${part.label}: ${pct(part.pct)}`) : []
      return {
        linkedin: linkedin(`${p.value}. ${p.label}.`, lines, p.footnote),
        x: x(`${p.value}. ${p.label}.`, lines.join(" + ")),
      }
    }
    case "HeadToHead": {
      const p = props as TemplatePropsMap["HeadToHead"]
      const side = (s: typeof p.left) =>
        `${s.country.name}: ${pct(s.ratePct)} tariff${s.importValue !== undefined ? `, ${usd(s.importValue)} of US imports in ${p.year}` : ""}${
          s.importChangePct !== undefined && Number.isFinite(s.importChangePct) ? ` (${signed(s.importChangePct)})` : ""
        }`
      return {
        linkedin: linkedin(p.headline, [side(p.left), side(p.right)], `Same product: ${p.product}, HTS ${p.htsCode}.`),
        x: x(p.headline, `${p.product}, HTS ${p.htsCode}.`),
      }
    }
    case "Ranking": {
      const p = props as TemplatePropsMap["Ranking"]
      const lines = p.rows.map((r) => `${r.country.name}: ${pct(r.ratePct)}`)
      return {
        linkedin: linkedin(p.headline, lines, `Same product (HTS ${p.htsCode}), very different bills depending on where it's made.`),
        x: x(p.headline, p.rows.slice(0, 4).map((r) => `${r.country.flag} ${pct(r.ratePct)}`).join("  ")),
      }
    }
    case "TradeShift": {
      const p = props as TemplatePropsMap["TradeShift"]
      const lines = p.rows.map(
        (r) => `${r.country.name}: ${usd(r.priorValue)} → ${usd(r.importValue)}${r.priorValue > 0 ? ` (${signed(((r.importValue - r.priorValue) / r.priorValue) * 100)})` : ""}, tariff today ${pct(r.ratePct)}`
      )
      return {
        linkedin: linkedin(p.headline, lines, `US imports of ${p.product.toLowerCase()} (HTS ${p.htsCode}), ${p.prior} vs ${p.year}. Source: US Census Bureau.`),
        x: x(p.headline, lines.slice(0, 2).join("\n")),
      }
    }
    case "SourcingSaver": {
      const p = props as TemplatePropsMap["SourcingSaver"]
      const best = p.options[0]
      const lines = [
        `${p.from.country.name}: ${pct(p.from.ratePct)}`,
        ...p.options.map(
          (o) => `${o.country.name}: ${pct(o.ratePct)}${o.importValue ? ` (the US bought ${usd(o.importValue)} from here in ${p.year})` : ""}`
        ),
      ]
      const hook = `${p.headline} You could save up to ${best.savingPts}% in duty by sourcing from ${best.country.name}.`
      return {
        linkedin: linkedin(hook, lines, `${p.product}, HTS ${p.htsCode}. Duty only: landed cost, quality and rules of origin vary by supplier.`),
        x: x(hook, `${p.from.country.name} ${pct(p.from.ratePct)} vs ${best.country.name} ${pct(best.ratePct)}. HTS ${p.htsCode}.`),
      }
    }
    case "CountrySnapshot": {
      const p = props as TemplatePropsMap["CountrySnapshot"]
      const lines = [
        ...p.stats.map((s) => `${s.label}: ${s.value}${s.detail ? ` (${s.detail})` : ""}`),
        ...p.products.slice(0, 3).map((x) => `${x.label}: ${usd(x.value)} in ${p.year}, tariff today ${x.rate}`),
      ]
      return {
        linkedin: linkedin(`${p.country.flag} ${p.headline}`, lines),
        x: x(`${p.country.flag} ${p.headline}`, lines.slice(0, 2).join("\n")),
      }
    }
    case "RateSpread": {
      const p = props as TemplatePropsMap["RateSpread"]
      const sorted = [...p.rows].sort((a, b) => a.ratePct - b.ratePct)
      const lo = sorted[0]
      const hi = sorted[sorted.length - 1]
      return {
        linkedin: linkedin(p.headline, [`Lowest: ${lo.country.name}, ${pct(lo.ratePct)}`, `Highest: ${hi.country.name}, ${pct(hi.ratePct)}`, `${p.rows.length} origins compared`], `${p.product}, HTS ${p.htsCode}.`),
        x: x(p.headline, `${lo.country.flag} ${pct(lo.ratePct)} → ${hi.country.flag} ${pct(hi.ratePct)}. HTS ${p.htsCode}.`),
      }
    }
    case "TopList": {
      const p = props as TemplatePropsMap["TopList"]
      const lines = p.rows.map((r, i) => `${i + 1}. ${r.flag ? `${r.flag} ` : ""}${r.label}: ${r.value}`)
      return {
        linkedin: [p.headline, ...(p.subhead ? [p.subhead] : []), "", ...lines, "", ...(p.footnote ? [p.footnote, ""] : []), CTA, "", TAGS].join("\n"),
        x: x(p.headline, lines.slice(0, 3).join("\n")),
      }
    }
    case "Quiz": {
      const p = props as TemplatePropsMap["Quiz"]
      const names = p.options.map((o) => `${o.country.flag} ${o.country.name}`).join(" or ")
      return {
        linkedin: [`${p.question}`, "", names, "", "Guess before you scroll 👇", "", ".", ".", ".", "", p.reveal, "", `${p.product}, HTS ${p.htsCode}.`, "", CTA, "", TAGS].join("\n"),
        x: x(`${p.question} ${names}?`, "Answer in the video."),
      }
    }
    case "News": {
      const p = props as TemplatePropsMap["News"]
      const where = p.countries.length ? p.countries.map((c) => c.name).join(", ") : "All countries"
      const lines = [
        ...(p.rateAfter ? [`Rate: ${p.rateBefore ? `${p.rateBefore} → ` : ""}${p.rateAfter}${p.rateNote ? ` ${p.rateNote}` : ""}`] : []),
        `Who: ${where}`,
        ...(p.products ? [`What: ${p.products}`] : []),
        ...(p.effectiveOn ? [`When: ${date(p.effectiveOn)}`] : []),
        ...(p.imports ? [`${usd(p.imports.value)} of US imports in ${p.imports.year} under the HTS codes named`] : []),
      ]
      const link = `htshero.com/tariff-updates/${p.slug}`
      return {
        linkedin: [`${p.authority}: ${p.headline}`, "", ...lines.map((l) => `→ ${l}`), "", `Follow every tariff action: ${link}`, "", TAGS].join("\n"),
        x: x(`${p.authority}: ${p.headline}`, `${p.rateAfter ? `${p.rateBefore ? `${p.rateBefore} → ` : ""}${p.rateAfter}. ` : ""}${link}`).replace(/\n\nhtshero\.com$/, ""),
      }
    }
  }
  return { linkedin: "", x: "" }
}
