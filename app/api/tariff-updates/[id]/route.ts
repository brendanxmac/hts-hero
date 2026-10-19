import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { getHtsElementsServer } from "@/libs/hts-server"
import { refreshImpacts } from "@/libs/tariff-updates/impacts"
import { readUpdateScope } from "@/libs/tariff-updates/scope"
import { approveImpact, impactAlertable, planImpactAlerts } from "@/libs/tariff-updates/alerts"
import { sendApproved } from "@/libs/email/outbox"
import { REVISION_DIFF_ADMIN_EMAIL } from "@/libs/hts-revision-diff/constants"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// The update's impact check: which of the users' imports it may affect (tariff_update_impacts),
// imports by product with how many accounts have each, and what approving now would send
export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const [{ data, error }, { data: update }] = await Promise.all([
    db.from("tariff_update_impacts").select("user_id, product_key, level, before_pct, after_pct, delta_usd, computed_at").eq("update_id", params.id),
    db.from("tariff_updates").select("impact_approved_at, impact_approved_by, impact_alerted, last_activity_at, status, kind").eq("id", params.id).single(),
  ])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = data ?? []
  const levels = { confirmed: 0, likely: 0, possible: 0 }
  for (const r of rows) levels[r.level as keyof typeof levels]++
  // Each affected product (code + country), with its level and how many accounts import it
  const products = new Map<string, { key: string; level: string; accounts: number; beforePct: number | null; afterPct: number | null; deltaUsd: number | null }>()
  for (const r of rows.filter((r) => r.level !== "possible")) {
    const p = products.get(r.product_key) ?? { key: r.product_key, level: r.level, accounts: 0, beforePct: r.before_pct, afterPct: r.after_pct, deltaUsd: r.delta_usd }
    p.accounts++
    if (r.level === "confirmed") p.level = "confirmed"
    products.set(r.product_key, p)
  }
  const plans = await planImpactAlerts(db, params.id, await getHtsElementsServer())
  return NextResponse.json({
    levels,
    accounts: new Set(rows.map((r) => r.user_id)).size,
    alertable: new Set(rows.filter((r) => r.level !== "possible").map((r) => r.user_id)).size,
    deltaUsd: rows.filter((r) => r.level === "confirmed").reduce((sum, r) => sum + Number(r.delta_usd ?? 0), 0),
    computedAt: rows.reduce((latest: string | null, r) => (!latest || r.computed_at > latest ? r.computed_at : latest), null),
    products: Array.from(products.values()).sort((a, b) => (a.level === b.level ? b.accounts - a.accounts : a.level === "confirmed" ? -1 : 1)),
    pending: plans.filter((p) => p.imports.length || p.beyond.length || p.removed.length).length,
    eligible: !!update && impactAlertable(update),
    approvedAt: update?.impact_approved_at ?? null,
    approvedBy: update?.impact_approved_by ?? null,
    alerted: update?.impact_alerted ?? null,
  })
}

// Edits an update from /tariff-sources: its title and summary (kept from then on), whether it's
// published, and its review flag
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const body = await req.json().catch(() => ({}))
  try {
    let result: unknown = null
    // The impact check approved: alert every affected account, now
    if (body.action === "approve-impact") {
      const alerted = await approveImpact(db, params.id, await getHtsElementsServer(), { approvedBy: REVISION_DIFF_ADMIN_EMAIL })
      const sent = alerted.messages ? await sendApproved(db, { deadline: Date.now() + 90_000 }) : null
      return NextResponse.json({ ok: true, alerted, sent })
    }
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
