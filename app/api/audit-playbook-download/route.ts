import React from "react"
import { NextResponse, NextRequest } from "next/server"
import { createAdminClient, getSignedUrl } from "../supabase/server"
import { sendEmailFromComponent } from "@/libs/resend"
import { addOrUpdateMailchimpContact } from "@/libs/mailchimp"
import config from "@/config"
import PlaybookDownloadEmail from "@/emails/playbook-download/PlaybookDownloadEmail"
import {
  createEbookDownload,
  generateEbookDownloadToken,
  getEbookDownloadByToken,
  markEbookDownloaded,
} from "@/libs/supabase/ebook"

const PLAYBOOK_BUCKET = "premium-content"
const PLAYBOOK_FILE = "The Audit Ready Classifications Playbook.pdf"
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 8 // 8 hours
const TOKEN_EXPIRY_HOURS = 8

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email?.trim() ?? "")
}

function getBaseUrl(): string {
  return `https://${config.domainName}`
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

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      )
    }

    const token = generateEbookDownloadToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS)

    const { ip_address, user_agent } = getRequestMetadata(req)

    const supabase = createAdminClient()
    await createEbookDownload(supabase, {
      email,
      token,
      expires_at: expiresAt.toISOString(),
      ip_address: ip_address ?? null,
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

    const baseUrl = getBaseUrl()
    const downloadUrl = `${baseUrl}/playbook-download?token=${token}`

    await Promise.all([
      sendEmailFromComponent({
        to: email,
        subject: "Delivered: Audit-Ready Classifications",
        emailComponent: React.createElement(PlaybookDownloadEmail, {
          downloadUrl,
        }),
        replyTo: "support@htshero.com",
      }),
      addOrUpdateMailchimpContact(email, ["playbook-requested"]),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Audit playbook send email error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")

    if (!token?.trim()) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid download link. Please request a new link from your email.",
        },
        { status: 400 },
      )
    }

    const supabase = createAdminClient()
    const record = await getEbookDownloadByToken(supabase, token.trim())

    if (!record) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired download link. You can request a new link from the playbook page if you need another copy.",
        },
        { status: 400 },
      )
    }

    if (record.downloaded) {
      return NextResponse.json(
        {
          error:
            "This download link has already been used. You can request a new link from the playbook page if you need another copy.",
        },
        { status: 400 },
      )
    }

    if (new Date(record.expires_at) <= new Date()) {
      return NextResponse.json(
        {
          error:
            "This download link has expired. You can request a new link from the playbook page if you need another copy.",
        },
        { status: 400 },
      )
    }

    const { signedUrl, error } = await getSignedUrl(
      PLAYBOOK_BUCKET,
      PLAYBOOK_FILE,
      SIGNED_URL_EXPIRY_SECONDS,
    )

    if (error) {
      console.error("Failed to create playbook signed URL:", error)
      return NextResponse.json(
        { error: "Failed to prepare download. Please try again." },
        { status: 500 },
      )
    }

    await markEbookDownloaded(supabase, record.id)

    return NextResponse.json({ signedUrl })
  } catch (err) {
    console.error("Audit playbook download error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
