import type { SupabaseClient } from "@supabase/supabase-js"
import { Countries } from "../../constants/countries"
import { monthRange } from "./notices"
import type { CaseRow, EventRow, EventType } from "./types"

// Significant AD/CVD events (types.ts SIGNIFICANT_EVENTS) as /tariff-updates entries: one per
// proceeding (an investigation, a five-year review, a circumvention inquiry, scope rulings) on one
// product, with every notice that moved it along. Kind and authority "ad_cvd": the Tracker's news
// shows them, but they never send alerts or news emails unless a reader picks AD/CVD.

type Db = SupabaseClient

type Proceeding = "investigation" | "sunset" | "circumvention" | "scope"

const PROCEEDING: Partial<Record<EventType, Proceeding>> = {
  initiation: "investigation",
  prelim: "investigation",
  final: "investigation",
  order: "investigation",
  termination: "investigation",
  suspension: "investigation",
  itc_institution: "investigation",
  itc_prelim: "investigation",
  itc_final: "investigation",
  continuation: "sunset",
  revocation: "sunset",
  circumvention: "circumvention",
  scope_ruling: "scope",
}

// Notices of one proceeding fall within this many days of each other
const PROCEEDING_DAYS = 420

const countryName = (code: string) => Countries.find((c) => c.code === code)?.name ?? code

const listOf = (names: string[]) => (names.length <= 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`)

// "Oleoresin Paprika" → "oleoresin paprika"; keeps acronyms and units ("PET", "225cc")
const inSentence = (product: string) =>
  product
    .split(" ")
    .map((w) => (/^[A-Z][a-z]/.test(w) && !/^[A-Z][a-z]*[A-Z]/.test(w) ? w.toLowerCase() : w))
    .join(" ")

const laws = (kinds: Set<string>) => (kinds.has("AD") && kinds.has("CVD") ? "antidumping and countervailing duty" : kinds.has("CVD") ? "countervailing duty" : "antidumping duty")

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// The headline of a proceeding, from its latest significant notice
export const headline = (event: EventType, product: string, countries: string[], kinds: Set<string>) => {
  const what = `${inSentence(product)} from ${listOf(countries.map(countryName))}`
  const law = laws(kinds)
  switch (event) {
    case "itc_institution":
      return `Petition filed for ${law.replace(/ duty$/, "")} duties on ${what}`
    case "initiation":
      return `Commerce opens ${law} investigation${kinds.size > 1 || countries.length > 1 ? "s" : ""} on ${what}`
    case "prelim":
      return `Commerce sets preliminary ${law} rates on ${what}`
    case "final":
      return `Commerce makes final ${law} determination on ${what}`
    case "itc_prelim":
      return `ITC preliminary vote in ${law} investigation on ${what}`
    case "itc_final":
      return `ITC final vote in ${law} investigation on ${what}`
    case "order":
      return capital(`${law} order on ${what}`)
    case "termination":
      return capital(`${law} investigation on ${what} ends`)
    case "suspension":
      return `Suspension agreement in ${law} case on ${what}`
    case "continuation":
      return capital(`${law} order on ${what} continued for five more years`)
    case "revocation":
      return capital(`${law} order on ${what} revoked`)
    case "circumvention":
      return `Circumvention inquiry under ${law} order on ${what}`
    case "scope_ruling":
      return `Scope ruling under ${law} order on ${what}`
    default:
      return capital(`${law} case on ${what}`)
  }
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)

// Digits to the dotted form the updates' matching reads ("3203008000" → "3203.00.8000")
const dotted = (digits: string) => (digits.length <= 4 ? digits : `${digits.slice(0, 4)}.${digits.slice(4, 6)}${digits.length > 6 ? `.${digits.slice(6)}` : ""}`)

interface Group {
  proceeding: Proceeding
  product: string
  events: EventRow[]
}

// Joins the month's significant events (and their proceeding's earlier or later ones) into updates
export const updateMonth = async (db: Db, month: string) => {
  const { start, end } = monthRange(month)
  const { data, error } = await db
    .from("adcvd_events")
    .select("*")
    .eq("significant", true)
    .gte("published_on", start.toISOString().slice(0, 10))
    .lte("published_on", end.toISOString().slice(0, 10))
  if (error) throw new Error(`Loading events: ${error.message}`)
  const events = (data ?? []) as EventRow[]
  await removeOrphans(db)
  if (!events.length) return { updates: 0 }

  const caseNumbers = Array.from(new Set(events.map((e) => e.case_number).filter((n): n is string => !!n)))
  const { data: caseRows } = await db.from("adcvd_cases").select("*").in("case_number", caseNumbers)
  const cases = new Map(((caseRows ?? []) as CaseRow[]).map((c) => [c.case_number, c]))

  // Group by proceeding and product (the case's product, so ITC and Commerce wording agree)
  const groups = new Map<string, Group>()
  for (const e of events) {
    const proceeding = PROCEEDING[e.event]
    // A petition's ITC notice before Commerce has opened cases: its own product and countries
    const c = e.case_number ? cases.get(e.case_number) : undefined
    const product = c?.product ?? e.product
    if (!proceeding || !product) continue
    const key = `${proceeding}|${slugify(product)}`
    const group = groups.get(key) ?? { proceeding, product, events: [] }
    group.events.push(e)
    groups.set(key, group)
  }

  let written = 0
  for (const group of Array.from(groups.values())) {
    const prefix = `adcvd-${group.proceeding}-${slugify(group.product)}`
    const dates = group.events.map((e) => e.published_on).sort()
    // An existing update for this proceeding: its notices are within PROCEEDING_DAYS of these
    const { data: existing } = await db.from("tariff_updates").select("id, slug, first_seen_at, last_activity_at, edited").like("slug", `${prefix}-%`)
    const near = (existing ?? []).find((u) => {
      const first = new Date(u.first_seen_at).getTime()
      const last = new Date(u.last_activity_at).getTime()
      const lo = new Date(dates[0]).getTime()
      const hi = new Date(dates[dates.length - 1]).getTime()
      return lo <= last + PROCEEDING_DAYS * 86_400_000 && hi >= first - PROCEEDING_DAYS * 86_400_000
    })
    let updateId = near?.id as string | undefined
    if (!updateId) {
      const { data: created, error: createError } = await db
        .from("tariff_updates")
        .insert({
          slug: `${prefix}-${dates[0].slice(0, 7)}`,
          title: group.product,
          summary: "",
          kind: "ad_cvd",
          authority: "ad_cvd",
          stage: "published",
          first_seen_at: `${dates[0]}T10:00:00Z`,
          last_activity_at: `${dates[dates.length - 1]}T10:00:00Z`,
        })
        .select("id")
        .single()
      if (createError) throw new Error(`Creating update: ${createError.message}`)
      updateId = created.id
    }
    await db.from("adcvd_events").update({ update_id: updateId }).in("id", group.events.map((e) => e.id!))
    await refreshUpdate(db, updateId!)
    written++
  }
  return { updates: written }
}

// AD/CVD updates no event points at any more (a notice read again and found not significant, or
// grouped differently): taken down
const removeOrphans = async (db: Db) => {
  const { data: updates } = await db.from("tariff_updates").select("id").eq("authority", "ad_cvd").eq("edited", false)
  const ids = (updates ?? []).map((u) => u.id as string)
  if (!ids.length) return
  const { data: used } = await db.from("adcvd_events").select("update_id").in("update_id", ids)
  const live = new Set((used ?? []).map((e) => e.update_id))
  const orphans = ids.filter((id) => !live.has(id))
  if (orphans.length) await db.from("tariff_updates").delete().in("id", orphans)
}

// Rewrites an update from all of its events and their cases (unless it was edited by hand)
export const refreshUpdate = async (db: Db, updateId: string) => {
  const { data: rows } = await db.from("adcvd_events").select("*").eq("update_id", updateId).order("published_on", { ascending: false })
  const events = (rows ?? []) as EventRow[]
  if (!events.length) return
  const caseNumbers = Array.from(new Set(events.map((e) => e.case_number).filter((c): c is string => !!c)))
  const { data: caseRows } = await db.from("adcvd_cases").select("*").in("case_number", caseNumbers)
  const cases = (caseRows ?? []) as CaseRow[]
  const lead = events[0]
  // Cases' countries, and the countries a petition names before there are cases
  const countries = Array.from(new Set([...cases.map((c) => c.country), ...events.flatMap((e) => e.countries)].filter((c): c is string => !!c))).sort()
  // AD from 731-TA numbers, CVD from 701-TA, when there are no cases yet
  const kinds = new Set<string>([...cases.map((c) => c.kind), ...events.flatMap((e) => e.itc_numbers.map((n) => (n.startsWith("701") ? "CVD" : "AD")))])
  const product = cases.find((c) => c.product)?.product ?? lead.product ?? "Product"
  // What the scope says the goods are classified under ("likely" matches); a petition's codes
  // until there's a scope. "May also enter" codes stay with the case's own flag, as "possible".
  const scoped = cases.flatMap((c) => c.hts_main)
  const codes = Array.from(new Set(scoped.length ? scoped : [...cases.flatMap((c) => c.hts_also), ...events.flatMap((e) => e.hts_codes)]))
    .slice(0, 400)
    .map(dotted)
  const { data: update } = await db.from("tariff_updates").select("edited").eq("id", updateId).single()
  const fields = {
    countries,
    hts_codes: codes,
    products: product,
    effective_on: lead.published_on,
    first_seen_at: `${events[events.length - 1].published_on}T10:00:00Z`,
    last_activity_at: `${lead.published_on}T10:00:00Z`,
    lead_item_id: lead.item_id,
    updated_at: new Date().toISOString(),
    ...(update?.edited
      ? {}
      : {
          title: headline(lead.event, product, countries, kinds),
          summary: lead.summary ?? lead.title,
        }),
  }
  await db.from("tariff_updates").update(fields).eq("id", updateId)
  // The notices themselves show on the update's page as its sources
  const items = Array.from(new Set(events.map((e) => e.item_id).filter((i): i is string => !!i)))
  if (items.length) await db.from("tariff_source_items").update({ update_id: updateId, grouped_by: "adcvd", grouped_at: new Date().toISOString(), stage: "published" }).in("id", items)
}
