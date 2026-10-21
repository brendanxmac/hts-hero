import { NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { impactAlertable } from "@/libs/tariff-updates/alerts"

export const dynamic = "force-dynamic"

// For the admin's Tariff impact tab in the Tracker: the updates still waiting for review (or
// hidden), which users don't see, and where each update's impact check stands, so impacts can be
// checked on the admin's own catalog before approving an alert. Everyone else gets a 404.
const COLUMNS =
  "id, slug, title, summary, kind, authority, countries, hts_codes, products, effective_on, stage, first_seen_at, last_activity_at, scope_codes, scope_excluded_codes, scope_conditional_exclusions, scope_countries, scope_excluded_countries, scope_headings, status, needs_review, impact_approved_at, impact_alerted"

export async function GET() {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { data, error } = await db
    .from("tariff_updates")
    .select(COLUMNS)
    .neq("kind", "hts_revision")
    .order("last_activity_at", { ascending: false })
    .limit(1000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = data ?? []
  return NextResponse.json({
    // Not on the public list
    pending: rows.filter((u) => u.status !== "published" || u.needs_review),
    checks: Object.fromEntries(
      rows.map((u) => [u.id, { approvedAt: u.impact_approved_at, alerted: u.impact_alerted, eligible: impactAlertable(u), inReview: u.needs_review, hidden: u.status !== "published" }])
    ),
  })
}
