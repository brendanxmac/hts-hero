import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { getHtsElementsServer } from "@/libs/hts-server"
import { refreshImpacts } from "@/libs/tariff-updates/impacts"
import { readUpdateScope } from "@/libs/tariff-updates/scope"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Which of the users' imports the update may affect (tariff_update_impacts), for its review
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { data, error } = await db.from("tariff_update_impacts").select("user_id, product_key, level, delta_usd, computed_at").eq("update_id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = data ?? []
  const levels = { confirmed: 0, likely: 0, possible: 0 }
  for (const r of rows) levels[r.level as keyof typeof levels]++
  const accounts = (level?: string) => new Set(rows.filter((r) => !level || r.level === level).map((r) => r.user_id)).size
  return NextResponse.json({
    levels,
    accounts: accounts(),
    alertable: new Set(rows.filter((r) => r.level !== "possible").map((r) => r.user_id)).size,
    deltaUsd: rows.filter((r) => r.level === "confirmed").reduce((sum, r) => sum + Number(r.delta_usd ?? 0), 0),
    computedAt: rows.reduce((latest: string | null, r) => (!latest || r.computed_at > latest ? r.computed_at : latest), null),
  })
}

// Edits an update from /tariff-sources: its title and summary (kept from then on), whether it's
// published, and its review flag
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const body = await req.json()
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim()
  if (typeof body.summary === "string" && body.summary.trim()) patch.summary = body.summary.trim()
  if (patch.title || patch.summary) patch.edited = true
  if (body.status === "published" || body.status === "hidden") patch.status = body.status
  if (typeof body.needs_review === "boolean") patch.needs_review = body.needs_review
  if (body.needs_review === false) patch.review_notes = null
  const { error } = await db.from("tariff_updates").update(patch).eq("id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTariffUpdates()
  return NextResponse.json({ ok: true })
}

const codeList = (v: unknown) =>
  Array.isArray(v) ? Array.from(new Set(v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean))) : []

// The update's scope, from review:
// { action: "read-scope" } has the reader read its PDFs again (replacing an admin's scope);
// { action: "save-scope", codes, excludedCodes, countries, excludedCountries, headings } sets it
// by hand (kept from then on). Either way the users' matches are worked out again.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const body = await req.json().catch(() => ({}))
  try {
    let result: unknown = null
    if (body.action === "read-scope") {
      result = await readUpdateScope(db, params.id, { force: true })
    } else if (body.action === "save-scope") {
      const iso = (v: unknown) => codeList(v).map((c) => c.toUpperCase()).filter((c) => c === "ALL" || /^[A-Z]{2}$/.test(c))
      const { error } = await db
        .from("tariff_updates")
        .update({
          scope_codes: codeList(body.codes),
          scope_excluded_codes: codeList(body.excludedCodes),
          scope_countries: iso(body.countries),
          scope_excluded_countries: iso(body.excludedCountries).filter((c) => c !== "ALL"),
          scope_headings: codeList(body.headings),
          scope_source: "admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
      if (error) throw new Error(error.message)
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
    const impacts = await refreshImpacts(db, await getHtsElementsServer(), { deadline: Date.now() + 45_000, updateIds: [params.id] })
    revalidateTariffUpdates()
    return NextResponse.json({ ok: true, result, impacts })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
