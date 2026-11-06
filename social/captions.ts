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
const LAUNCH_TAGS = "#DutyGuard #tariffs #imports #customs"
// The memo teaser speaks to customs brokers and freight forwarders
const TRADE_PRO_TAGS = "#customsbrokers #freightforwarding #tariffs #customs"

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
      const shown = p.countries.slice(0, 8).map((c) => c.name)
      const where = p.countries.length
        ? `${shown.join(", ")}${p.countries.length > shown.length ? ` +${p.countries.length - shown.length} more` : ""}`
        : "All countries"
      const rate = p.rateAfter ? `${p.rateBefore ? `${p.rateBefore} → ` : ""}${p.rateAfter}${p.rateNote ? ` ${p.rateNote}` : ""}` : ""
      const inEffect = p.stage >= 4 || (!!p.effectiveOn && p.effectiveOn <= p.asOf)
      const lines = [
        ...(rate ? [`Rate: ${rate}`] : []),
        `Countries: ${where}`,
        ...(p.products ? [`Products: ${p.products}`] : []),
        ...(p.htsCount ? [`HTS codes: ${p.htsCount} named in the action`] : []),
        ...(p.effectiveOn ? [`${inEffect ? "In effect since" : "Takes effect"}: ${date(p.effectiveOn)}`] : []),
        ...(p.imports ? [`At stake: ${usd(p.imports.value)} of US imports in ${p.imports.year} under the codes named`] : []),
        `Authority: ${p.authority} (${p.kindLabel.toLowerCase()})`,
      ]
      const link = `https://htshero.com/tariff-updates/${p.slug}`
      const hook = p.headline.includes(p.authority) ? p.headline : `${p.authority}: ${p.headline}`
      // X: the hook, the facts that fit, the link (X counts any link as 23 characters)
      const facts = [
        rate,
        p.countries.length === 1 ? `${p.countries[0].flag} ${p.countries[0].name}` : p.countries.length ? `${p.countries.length} countries` : "",
        p.htsCount ? `${p.htsCount} HTS codes` : "",
        p.effectiveOn ? `${inEffect ? "in effect" : "effective"} ${date(p.effectiveOn)}` : "",
      ].filter(Boolean)
      const tail = `Is your HTS code affected? ${link}`
      const xLength = (t: string) => t.replace(link, "x".repeat(23)).length
      let xText = `${hook}\n\n${facts.join(" · ")}\n\n${tail}`
      while (facts.length && xLength(xText) > 280) {
        facts.pop()
        xText = facts.length ? `${hook}\n\n${facts.join(" · ")}\n\n${tail}` : `${hook}\n\n${tail}`
      }
      return {
        linkedin: [
          hook,
          ...(p.dek ? ["", p.dek] : []),
          "",
          ...lines.map((l) => `→ ${l}`),
          "",
          "See every HTS code it covers, the official notices and where it stands, then check your own codes in seconds:",
          link,
          "",
          TAGS,
        ].join("\n"),
        x: xText,
      }
    }
    case "OddRate": {
      const p = props as TemplatePropsMap["OddRate"]
      const lines = p.steps.map((s) => (s.asks ? `${s.rate}: HTS Hero asks "${s.asks}"` : `${s.rate} ${s.detail ?? ""} = ${s.amount}`.replace(/\s+=/, " =")))
      const working = p.total ? `${p.shipment}: ${p.total} in base duty.` : `${p.shipment}, it asks what the rate needs.`
      return {
        linkedin: linkedin(
          `${p.headline}.`,
          [`The ${p.column.toLowerCase()} for ${p.product} (HTS ${p.htsCode}), word for word: "${p.rate}"`, ...lines],
          [working, p.footnote].filter(Boolean).join(" ")
        ),
        x: x(`${p.headline}.`, `HTS ${p.htsCode}: "${p.rate}"`),
      }
    }
    case "LaunchTeaser": {
      const p = props as TemplatePropsMap["LaunchTeaser"]
      return {
        linkedin: [p.hook, "", p.punch, "", `${p.name}: ${p.tagline}`, "", `${p.date}. Follow along at htshero.com`, "", LAUNCH_TAGS].join("\n"),
        x: `${p.hook} ${p.punch}\n\n${p.name}: ${p.date.toLowerCase()}.\n\nhtshero.com`,
      }
    }
    case "LaunchMemo": {
      const p = props as TemplatePropsMap["LaunchMemo"]
      // Older copy may still carry [brackets]; nothing is hidden any more
      const hide = (line: string) => line.replace(/[[\]]/g, "")
      return {
        linkedin: [`To: ${p.to}`, `Re: ${hide(p.subject)}`, "", hide(p.line1), "", hide(p.line2), "", hide(p.line3), "", `${p.date}. Follow along at htshero.com`, "", TRADE_PRO_TAGS].join("\n"),
        x: `${hide(p.line1)}\n\n${p.date}.\n\nhtshero.com`,
      }
    }
    case "LaunchSlam": {
      const p = props as TemplatePropsMap["LaunchSlam"]
      return {
        linkedin: [`${p.line1} ${p.word1}`, `${p.line2} ${p.word2}`, `${p.line3} ${p.word3}`, "", `${p.name}. ${p.date}.`, "", "Follow along at htshero.com", "", LAUNCH_TAGS].join("\n"),
        x: `${p.line1} ${p.word1}\n${p.line2} ${p.word2}\n${p.line3} ${p.word3}\n\n${p.name}. ${p.date}.\n\nhtshero.com`,
      }
    }
    case "DigestPromo": {
      const p = props as TemplatePropsMap["DigestPromo"]
      return {
        linkedin: [
          "US tariffs aren't changing by the year anymore. They're changing by the week.",
          "",
          "Section 232. Section 301. IEEPA. AD/CVD. Keeping up has become a job of its own.",
          "",
          `So we built ${p.eyebrow.replace(/^The /, "the ")}: one free email every Monday with every new US tariff action.`,
          "",
          "→ What changed, in plain English",
          "→ The goods, HTS codes and countries it covers",
          "→ When it takes effect, and how far it has got",
          "→ A link to the official document behind it",
          "",
          `${p.cta}: ${p.url}`,
          "",
          "Know an importer, broker or trade team who should be in the loop? Tag them below.",
          "",
          "#tariffs #imports #customs #trade #supplychain",
        ].join("\n"),
        x: `${p.line1} ${p.line2}\n\nThe Weekly Tariff Digest: every new US tariff action, in plain English, free.\n\n${p.url}`,
      }
    }
    case "LaunchVideo": {
      const p = props as TemplatePropsMap["LaunchVideo"]
      const lines = { audit: `${p.auditTitle}: ${p.auditLine}`, savings: `${p.savingsTitle}: ${p.savingsLine}`, alerts: `${p.alertsTitle}: ${p.alertsLine}` }
      return {
        linkedin: [p.opener, p.openerSub, "", ...p.order.map((f) => `→ ${lines[f]}`), "", `${p.cta}. ${p.ctaSub}`, "", LAUNCH_TAGS].join("\n"),
        x: `${p.opener} ${p.openerSub}\n\n${p.cta}: htshero.com`,
      }
    }
  }
  return { linkedin: "", x: "" }
}
