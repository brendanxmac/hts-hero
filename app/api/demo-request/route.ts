import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/api/supabase/server";
import { companyTypeLabel, parseDemoRequest, productsLabel, roleLabel } from "@/libs/demo-request";
import { sendTransactional } from "@/libs/email/outbox";

export const dynamic = "force-dynamic";

// Demo requests from the homepage go to this inbox
const NOTIFY = "brendan@htshero.com";

// Saves a demo request and emails it to Brendan (with a button to reply to the requester). The visitor goes on
// to book on Calendly either way, so this never blocks them: saving comes first so a lead is never
// lost to a failed email, and only both failing is an error.
export async function POST(req: NextRequest) {
  const body: Record<string, unknown> | null = await req.json().catch((): null => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Bad request" }, { status: 400 });
  // The form's hidden field: only bots fill it in. Answer as if it worked.
  if (typeof body.nickname === "string" && body.nickname.trim()) return NextResponse.json({ ok: true });

  const parsed = parseDemoRequest(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const r = parsed.request;

  const db = createAdminClient();
  const { error: dbError } = await db.from("demo_requests").insert({
    name: r.name,
    email: r.email,
    company: r.company,
    company_type: r.companyType,
    role: r.role,
    website: r.website || null,
    products: r.products,
    page_url: req.headers.get("referer"),
    first_touch: body.firstTouch && typeof body.firstTouch === "object" ? body.firstTouch : null,
    user_agent: req.headers.get("user-agent"),
  });
  if (dbError) console.error("Failed to save demo request:", dbError);

  try {
    await sendTransactional(
      db,
      {
        recipient: NOTIFY,
        template: "internal_notice",
        props: {
          eyebrow: "New demo request",
          title: `Demo request: ${r.company}`,
          rows: [
            { label: "Name", value: r.name },
            { label: "Email", value: r.email },
            { label: "Company", value: r.company },
            { label: "What they do", value: companyTypeLabel(r.companyType) },
            { label: "Role", value: roleLabel(r.role) },
            { label: "Website", value: r.website || "Not given" },
            { label: "Products", value: productsLabel(r.products) },
            { label: "Next", value: "They were sent on to book a call on Calendly" },
          ],
          replyTo: { name: r.name, email: r.email },
        },
      },
    );
  } catch (e) {
    console.error("Failed to email demo request:", e);
    if (dbError) return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
