import React from "react"
import { NextResponse, NextRequest } from "next/server"
import { getSignedUrl } from "../supabase/server"
import { sendEmailFromComponent } from "@/libs/resend"
import config from "@/config"
import PlaybookDownloadEmail from "@/emails/playbook-download/PlaybookDownloadEmail"

const PLAYBOOK_BUCKET = "premium-content"
const PLAYBOOK_FILE = "The Audit Ready Classifications Playbook.pdf"
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 8 // 8 hours

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email?.trim() ?? "")
}

function getBaseUrl(): string {
  return `https://${config.domainName}`
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

    // const baseUrl = getBaseUrl()
    // const downloadUrl = `${baseUrl}/audit-playbook-download`
    const downloadUrl = `http://localhost:3000/playbook-download`

    await sendEmailFromComponent({
      to: email,
      subject: "Your free copy: The Audit-Ready Classifications Playbook",
      emailComponent: React.createElement(PlaybookDownloadEmail, {
        downloadUrl,
      }),
      replyTo: "support@htshero.com",
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Audit playbook send email error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
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

    return NextResponse.json({ signedUrl })
  } catch (err) {
    console.error("Audit playbook download error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
