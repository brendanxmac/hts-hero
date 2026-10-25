import type { SupabaseClient } from "@supabase/supabase-js"
import { COMMERCE_COUNTRIES, countryFromName } from "./countries"
import { caseDocuments } from "./fr"
import { applyEvent } from "./notices"
import { circumventionCountries, eventOf, titleParts } from "./parse"
import type { CaseRow, EventRow, EventType } from "./types"

// A case's status and milestones worked out again from scratch: every notice in its Federal
// Register docket (back to 1994, titles only, no AI) together with what we've read ourselves (ITC
// votes, and the annual lists that name it as live), oldest first. Also fills in its product and,
// when its country code isn't known, its country.

type Db = SupabaseClient

const countryKnown = (c: CaseRow) => !!COMMERCE_COUNTRIES[c.commerce_country]

export const fillHistory = async (db: Db, c: CaseRow) => {
  const [docs, { data: own }] = await Promise.all([
    caseDocuments(c.case_number),
    db.from("adcvd_events").select("published_on, event, title, agency").eq("case_number", c.case_number),
  ])
  const steps: { date: string; event: EventType; title: string }[] = [
    ...docs.map((d) => ({ date: d.publication_date, event: eventOf(d.title, "commerce"), title: d.title })),
    // Ours: the ITC's votes and the list appearances (and final-period rows) aren't in the Commerce docket
    ...((own ?? []) as Pick<EventRow, "published_on" | "event" | "title" | "agency">[])
      .filter((e) => e.agency === "itc" || ["review_opportunity", "review_init", "sunset_init", "suspension", "final_period"].includes(e.event))
      .map((e) => ({ date: e.published_on, event: e.event, title: e.title })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  let next: CaseRow = { ...c, status: "unknown", initiated_on: null, order_on: null, last_continued_on: null, ended_on: null }
  for (const step of steps) {
    next = applyEvent(next, step.event, step.date, step.title)
    // The product and (when the code isn't known) country, from the newest notice naming them
    const { product, countries } = titleParts(step.title)
    if (product) next.product = product
    if (!countryKnown(c) && countries.length === 1) next.country = countryFromName(countries[0]) ?? next.country
    // Countries an affirmative circumvention ruling extends the order to
    if (step.event === "circumvention" && /Affirmative/i.test(step.title)) {
      const reached = circumventionCountries(step.title).map(countryFromName).filter((x): x is string => !!x && x !== next.country)
      next.third_countries = Array.from(new Set([...next.third_countries, ...reached]))
    }
  }
  if (!steps.length) return { notices: 0, changed: [] as string[] }
  const fields = {
    third_countries: next.third_countries,
    product: next.product ?? c.product,
    country: next.country ?? c.country,
    status: next.status,
    initiated_on: next.initiated_on,
    order_on: next.order_on,
    last_continued_on: next.last_continued_on,
    ended_on: next.ended_on,
    first_seen_on: next.first_seen_on,
    last_activity_on: next.last_activity_on,
  }
  await db.from("adcvd_cases").update({ ...fields, updated_at: new Date().toISOString() }).eq("case_number", c.case_number)
  return { notices: docs.length, changed: (Object.keys(fields) as (keyof typeof fields)[]).filter((k) => JSON.stringify(fields[k]) !== JSON.stringify(c[k])) }
}
