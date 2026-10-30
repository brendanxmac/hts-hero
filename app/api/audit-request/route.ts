import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/api/supabase/server";
import { AUDIT_TOPICS, parseAuditRequest } from "@/libs/audit-request";
import { sendTransactional } from "@/libs/email/outbox";

export const dynamic = "force-dynamic";

// Audit requests from /duty-audits go to this inbox
const NOTIFY = "brendan@htshero.com";

// Saves an audit request, then emails the team and confirms to the requester. Saving comes first
// so a lead is never lost to a failed email.
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

  const db = createAdminClient();
  const { error: dbError } = await db.from("audit_requests").insert({
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
  const rows = [
    { label: "Name", value: r.name },
    { label: "Email", value: r.email },
    { label: "Company", value: r.company },
    { label: "US imports a year", value: r.importValue },
    { label: "Look at", value: topics.join(", ") || "Not specified" },
    { label: "Notes", value: r.notes || "None" },
  ];

  try {
    // A notice to Brendan (with a button to reply to the requester) and a confirmation to the requester
    await Promise.all([
      sendTransactional(
        db,
        {
          recipient: NOTIFY,
          template: "internal_notice",
          props: { eyebrow: "New tariff audit request", title: `Tariff audit request: ${r.company}`, rows, replyTo: { name: r.name, email: r.email } },
        }
      ),
      sendTransactional(db, {
        recipient: r.email,
        template: "audit_request_received",
        props: {
          name: r.name.split(" ")[0] || r.name,
          company: r.company,
          footer: { reason: "You're getting this because you requested a tariff audit from HTS Hero with this email." },
        },
      }),
    ]);
  } catch (e) {
    console.error("Failed to email audit request:", e);
    // Saved but not emailed is still a lead; only fail when both went wrong
    if (dbError) return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
