import { NextRequest, NextResponse } from "next/server"
import type { WebhookEventPayload } from "resend"
import { createAdminClient } from "@/app/api/supabase/server"
import { resend } from "@/libs/email/outbox"
import { stopAddress } from "@/libs/email/subscribers"

export const dynamic = "force-dynamic"

// Resend's email events (Resend → Webhooks, pointed here, signing secret in RESEND_WEBHOOK_SECRET):
// - every delivery, open, click, bounce and spam complaint is kept in email_events, and the first
//   of each is stamped on its outbox message (email_messages.provider_id is Resend's email id)
// - a spam complaint or a hard bounce stops all email to that address, like an unsubscribe
// Opens and clicks only arrive for domains with tracking turned on in Resend.

interface EmailEventData {
  email_id: string
  to?: string[]
  bounce?: { type: string; subType: string; message: string }
  click?: { link: string }
}

const STAMPS: Record<string, string> = {
  "email.delivered": "delivered_at",
  "email.opened": "opened_at",
  "email.clicked": "clicked_at",
  "email.bounced": "bounced_at",
  "email.complained": "complained_at",
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return new NextResponse("RESEND_WEBHOOK_SECRET is not set", { status: 500 })

  const payload = await req.text()
  let event: WebhookEventPayload
  try {
    event = resend().webhooks.verify({
      payload,
      headers: {
        id: req.headers.get("svix-id") ?? "",
        timestamp: req.headers.get("svix-timestamp") ?? "",
        signature: req.headers.get("svix-signature") ?? "",
      },
      webhookSecret: secret,
    })
  } catch {
    return new NextResponse("Invalid signature", { status: 400 })
  }

  const column = STAMPS[event.type]
  if (!column) return NextResponse.json({ ignored: event.type })
  // Every type in STAMPS carries an email's data
  const data = event.data as EmailEventData
  const db = createAdminClient()

  const { error } = await db.from("email_events").upsert(
    {
      // Resend retries until it gets a 2xx; the delivery id keeps a retry from counting twice
      delivery_id: req.headers.get("svix-id"),
      provider_id: data.email_id,
      type: event.type,
      recipient: data.to?.[0] ?? null,
      detail: data.click ? { link: data.click.link } : (data.bounce ?? {}),
      occurred_at: event.created_at,
    },
    { onConflict: "delivery_id", ignoreDuplicates: true }
  )
  if (error) {
    console.error("Saving a Resend event:", error.message)
    return new NextResponse("Could not save the event", { status: 500 })
  }
  await db.from("email_messages").update({ [column]: event.created_at }).eq("provider_id", data.email_id).is(column, null)

  const hardBounce = data.bounce?.type === "Permanent"
  if (event.type === "email.complained" || hardBounce) {
    for (const address of data.to ?? []) await stopAddress(db, address)
  }
  return NextResponse.json({ ok: true })
}
