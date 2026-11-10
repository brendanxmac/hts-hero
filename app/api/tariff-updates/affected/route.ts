import { NextRequest, NextResponse } from "next/server"
import { createAdminClient, createClient } from "../../supabase/server"
import { itemKey, readLists, realItems, unionItems } from "@/components/tariff-tracker/catalog"
import { matchCatalog, type MatchableUpdate } from "@/libs/tariff-updates/match"

// Whether a published tariff update affects the signed-in user's imports, for the "Check if you or
// your clients are affected" button on /tariff-updates/[slug]. The same answer Duty Guard's Tariff
// Updates gives: confirmed by the duty engine (tariff_update_impacts), or likely from the codes and
// countries the update names (libs/tariff-updates/match.ts). Counts only, never the imports.

export const dynamic = "force-dynamic"

const UPDATE_COLUMNS =
  "id, slug, kind, authority, effective_on, hts_codes, countries, scope_codes, scope_excluded_codes, scope_conditional_exclusions, scope_countries, scope_excluded_countries, scope_headings"

export interface AffectedCheck {
  // The user's imports (code and country), examples left out
  imports: number
  // Confirmed or likely: the update names the import's code and country, or the engine shows it applying
  affected: number
  // From a country it names, but no code it lists
  possible: number
  // Every import list (one per client, say) with its affected and possible counts, affected first;
  // across all lists above, each import counted once
  lists: { id: string; name: string; imports: number; affected: number; possible: number }[]
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 })

  const { data } = await createClient().auth.getUser()
  const user = data.user
  if (!user) return NextResponse.json({ error: "Sign in to check your imports" }, { status: 401 })

  const db = createAdminClient()
  const { data: update, error } = await db.from("tariff_updates").select(UPDATE_COLUMNS).eq("status", "published").eq("slug", slug).maybeSingle()
  if (error) return NextResponse.json({ error: "Couldn't load the update" }, { status: 500 })
  if (!update) return NextResponse.json({ error: "No such update" }, { status: 404 })

  const [{ data: catalog, error: catalogError }, { data: confirmedRows, error: impactsError }] = await Promise.all([
    db.from("tracker_catalogs").select("items, adjustments").eq("user_id", user.id).maybeSingle(),
    db.from("tariff_update_impacts").select("product_key").eq("user_id", user.id).eq("update_id", update.id).in("level", ["confirmed", "likely"]),
  ])
  if (catalogError || impactsError) return NextResponse.json({ error: "Couldn't load your imports" }, { status: 500 })

  // Every list's imports, each once (the stored catalog's own `items`)
  const stored = catalog ? readLists(JSON.stringify(catalog.items), JSON.stringify(catalog.adjustments)) : null
  const items = stored ? realItems(unionItems(stored.lists, stored.covered)) : []
  const keys = new Set(items.map((i) => `${i.code}-${i.country}`))
  const matched = matchCatalog([update as unknown as MatchableUpdate], items).get(update.slug)
  const affected = new Set([...(confirmedRows ?? []).map((r) => r.product_key).filter((k) => keys.has(k)), ...(matched?.likely ?? [])])
  const possible = new Set((matched?.possible ?? []).filter((k) => !affected.has(k)))

  const lists = (stored?.lists ?? [])
    .map((l) => {
      const own = new Set(realItems(l.items).map(itemKey))
      const count = (s: Set<string>) => Array.from(s).filter((k) => own.has(k)).length
      return { id: l.id, name: l.name, imports: own.size, affected: count(affected), possible: count(possible) }
    })
    .sort((a, b) => b.affected - a.affected || b.possible - a.possible)

  const body: AffectedCheck = { imports: keys.size, affected: affected.size, possible: possible.size, lists }
  return NextResponse.json(body)
}
