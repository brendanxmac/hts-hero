import { NextRequest, NextResponse } from "next/server"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { REVISION_DIFF_ADMIN_EMAIL } from "@/libs/hts-revision-diff/constants"
import { requireSocialStudio } from "@/libs/social-studio/access"
import {
  audienceCounts,
  AUDIENCES,
  isMarketingFile,
  listMarketingEmails,
  renderMarketingPreview,
  sendMarketing,
  sendMarketingTest,
  type Audience,
  type Draft,
} from "@/libs/email/marketing"

export const dynamic = "force-dynamic"
// A send to every user builds the list, makes missing subscription rows and sends for as long as
// it can; the outbox cron finishes the rest
export const maxDuration = 300

// The Content Studio's Marketing Emails tab (libs/email/marketing.ts).
// GET: every email under emails/marketing/. GET ?file=: how many each audience would reach.
export async function GET(req: NextRequest) {
  const { db, denied } = await requireSocialStudio()
  if (denied) return denied
  try {
    const file = req.nextUrl.searchParams.get("file")
    if (file) {
      if (!isMarketingFile(file)) return NextResponse.json({ error: "No such email" }, { status: 404 })
      return NextResponse.json({ counts: await audienceCounts(db, file) })
    }
    // In development, pick up files added since the server started (the list after next shows them)
    if (process.env.NODE_ENV === "development") {
      const { writeMarketingManifest } = await import("@/libs/email/marketing-manifest.mjs")
      writeMarketingManifest()
    }
    return NextResponse.json({ emails: listMarketingEmails() })
  } catch (e) {
    return errorResponse(e)
  }
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

// { action: "preview" | "test" | "send", file, subject, preview, audience? }
export async function POST(req: NextRequest) {
  const started = Date.now()
  const { db, denied } = await requireSocialStudio()
  if (denied) return denied
  try {
    const body = await req.json()
    if (!isMarketingFile(body.file)) return NextResponse.json({ error: "No such email" }, { status: 404 })
    const draft: Draft = { file: body.file, subject: clean(body.subject, 200), preview: clean(body.preview, 300) }
    if (body.action === "preview") {
      const { subject, html } = await renderMarketingPreview(draft)
      return NextResponse.json({ subject, html })
    }
    if (!draft.subject) return NextResponse.json({ error: "Write a subject first" }, { status: 400 })
    if (body.action === "test") {
      await sendMarketingTest(draft, REVISION_DIFF_ADMIN_EMAIL)
      return NextResponse.json({ ok: true, to: REVISION_DIFF_ADMIN_EMAIL })
    }
    if (body.action === "send") {
      if (!AUDIENCES.includes(body.audience)) return NextResponse.json({ error: "Pick who gets it" }, { status: 400 })
      // Stops sending with a minute to spare; whatever is left goes with the outbox cron
      return NextResponse.json(await sendMarketing(db, draft, body.audience as Audience, { deadline: started + (maxDuration - 60) * 1000 }))
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e) {
    return errorResponse(e)
  }
}
