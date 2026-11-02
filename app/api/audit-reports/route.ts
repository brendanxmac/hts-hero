import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { AUDIT_REPORT_KINDS, type AuditReportKind } from "@/libs/admin/audit-reports"
import { sendTransactional } from "@/libs/email/outbox"
import { createAdminClient, createClient } from "../supabase/server"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// What users send from the entry audit (supabase/migrations/audit_reports.sql): POST from any
// signed-in account, saved and emailed to Brendan at once (with a button to reply to the user).
// GET (the open ones, or ?status=resolved) and PATCH { id, status } are the admin's, for /audit-reports.

const NOTIFY = "brendan@htshero.com"
const NOTE_MAX = 2000

const text = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null)

export async function POST(req: NextRequest) {
  const {
    data: { user },
  } = await createClient().auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to send this" }, { status: 401 })
  const body = (await req.json().catch((): null => null)) as Record<string, unknown> | null
  const kind = body?.kind as AuditReportKind
  if (!body || !AUDIT_REPORT_KINDS[kind]) return NextResponse.json({ error: "Bad request" }, { status: 400 })
  const details = body.details && typeof body.details === "object" ? body.details : {}
  if (JSON.stringify(details).length > 50_000) return NextResponse.json({ error: "Too much detail" }, { status: 400 })
  const row = {
    user_id: user.id,
    user_email: user.email ?? null,
    kind,
    entry_id: text(body.entryId, 40),
    hts_code: text(body.htsCode, 20),
    country: text(body.country, 2),
    case_number: text(body.caseNumber, 20),
    note: text(body.note, NOTE_MAX),
    details,
  }

  const db = createAdminClient()
  const { error } = await db.from("audit_reports").insert(row)
  if (error) {
    console.error("Failed to save audit report:", error)
    return NextResponse.json({ error: "Couldn't send this. Please try again." }, { status: 500 })
  }
  try {
    await sendTransactional(db, {
      recipient: NOTIFY,
      template: "internal_notice",
      props: {
        eyebrow: "Duty Guard · Entry audit",
        title: `${AUDIT_REPORT_KINDS[kind].label}${row.case_number ? `: ${row.case_number}` : ""}`,
        rows: [
          { label: "From", value: user.email ?? user.id },
          { label: "Import", value: row.hts_code ? `${row.hts_code} · ${row.country ?? ""}` : "Not given" },
          ...(row.case_number ? [{ label: "Case", value: row.case_number }] : []),
          { label: "Note", value: row.note ?? "No note" },
          ...(typeof (details as Record<string, unknown>).summary === "string" ? [{ label: "Audit", value: (details as Record<string, string>).summary }] : []),
          { label: "Review", value: "Open /audit-reports in the admin" },
        ],
        ...(user.email ? { replyTo: { name: user.email, email: user.email } } : {}),
      },
    })
  } catch (e) {
    // Saved: it's in the admin queue either way
    console.error("Failed to email audit report:", e)
  }
  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const status = req.nextUrl.searchParams.get("status") === "resolved" ? "resolved" : "open"
  const { data, error } = await db.from("audit_reports").select("*").eq("status", status).order("created_at", { ascending: false }).limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data })
}

export async function PATCH(req: NextRequest) {
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const { id, status } = ((await req.json().catch(() => ({}))) ?? {}) as { id?: string; status?: string }
  if (!id || (status !== "open" && status !== "resolved")) return NextResponse.json({ error: "Bad request" }, { status: 400 })
  const { error } = await db
    .from("audit_reports")
    .update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null })
    .eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
