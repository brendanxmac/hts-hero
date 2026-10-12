import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/api/supabase/server";
import { AUDIT_TOPICS, parseAuditRequest } from "@/libs/audit-request";
import { sendEmail } from "@/libs/resend";

export const dynamic = "force-dynamic";

// Audit requests from /tariff-audit go to this inbox
const NOTIFY = "brendan@htshero.com";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Saves an audit request, then emails the team. Saving comes first so a lead is never lost to a
// failed email.
export async function POST(req: NextRequest) {
  const body: Record<string, unknown> | null = await req.json().catch((): null => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  // The form's hidden field: only bots fill it in. Answer as if it worked.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseAuditRequest(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const r = parsed.request;

  const { error: dbError } = await createAdminClient()
    .from("audit_requests")
    .insert({
      name: r.name,
      email: r.email,
      company: r.company,
      import_value: r.importValue,
      topics: r.topics,
      notes: r.notes || null,
      page_url: req.headers.get("referer"),
      user_agent: req.headers.get("user-agent"),
    });
  if (dbError) console.error("Failed to save audit request:", dbError);

  const topics = r.topics.map((id) => AUDIT_TOPICS.find((t) => t.id === id)?.label ?? id);
  const lines = [
    ["Name", r.name],
    ["Email", r.email],
    ["Company", r.company],
    ["US imports a year", r.importValue],
    ["Look at", topics.join(", ") || "Not specified"],
    ["Notes", r.notes || "None"],
  ];

  try {
    await sendEmail({
      to: NOTIFY,
      replyTo: r.email,
      subject: `Tariff audit request: ${r.company}`,
      text: lines.map(([k, v]) => `${k}: ${v}`).join("\n"),
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>New tariff audit request</h2>
        ${lines
          .map(([k, v]) => `<p style="margin: 6px 0;"><strong>${k}:</strong> <span style="white-space: pre-wrap;">${escapeHtml(v)}</span></p>`)
          .join("")}
      </div>`,
    });
  } catch (e) {
    console.error("Failed to email audit request:", e);
    // Saved but not emailed is still a lead; only fail when both went wrong
    if (dbError) return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
