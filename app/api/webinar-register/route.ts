import { NextResponse, NextRequest } from "next/server"
import { createAdminClient } from "../supabase/server"
import { addOrUpdateMailchimpContact } from "@/libs/mailchimp"
import {
  createWebinarRegistration,
  getRegistrationByEmailAndWebinar,
  getWebinarBySlug,
} from "@/libs/supabase/webinars"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email?.trim() ?? "")
}

function getRequestMetadata(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  const userAgent = req.headers.get("user-agent") ?? null
  return { ip_address: ip, user_agent: userAgent }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body?.email === "string" ? body.email.trim() : ""
    const webinarSlug =
      typeof body?.webinar_slug === "string" ? body.webinar_slug.trim() : ""

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      )
    }

    if (!webinarSlug) {
      return NextResponse.json(
        { error: "Webinar identifier is missing." },
        { status: 400 },
      )
    }

    const supabase = createAdminClient()

    const webinar = await getWebinarBySlug(supabase, webinarSlug)
    if (!webinar) {
      return NextResponse.json({ error: "Webinar not found." }, { status: 404 })
    }

    if (webinar.status === "cancelled") {
      return NextResponse.json(
        { error: "This webinar has been cancelled." },
        { status: 400 },
      )
    }

    const existing = await getRegistrationByEmailAndWebinar(
      supabase,
      email,
      webinar.id,
    )
    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this webinar." },
        { status: 409 },
      )
    }

    const { ip_address, user_agent } = getRequestMetadata(req)

    await createWebinarRegistration(supabase, {
      webinar_id: webinar.id,
      email,
      user_id:
        typeof body?.user_id === "string" ? body.user_id.trim() || null : null,
      ip_address,
      user_agent,
      referrer:
        typeof body?.referrer === "string"
          ? body.referrer.trim() || null
          : null,
      page_url:
        typeof body?.page_url === "string"
          ? body.page_url.trim() || null
          : null,
      utm_source:
        typeof body?.utm_source === "string"
          ? body.utm_source.trim() || null
          : null,
      utm_medium:
        typeof body?.utm_medium === "string"
          ? body.utm_medium.trim() || null
          : null,
      utm_campaign:
        typeof body?.utm_campaign === "string"
          ? body.utm_campaign.trim() || null
          : null,
      utm_term:
        typeof body?.utm_term === "string"
          ? body.utm_term.trim() || null
          : null,
      utm_content:
        typeof body?.utm_content === "string"
          ? body.utm_content.trim() || null
          : null,
    })

    const tagName = `webinar-${webinar.slug}`
    await addOrUpdateMailchimpContact(email, [tagName, "webinar-registered"])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Webinar registration error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
