import { NextResponse, NextRequest } from "next/server"
import { createClient, createAdminClient } from "../supabase/server"

const ADMIN_EMAIL = "brendan@htshero.com"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    const title = typeof body?.title === "string" ? body.title.trim() : ""
    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 },
      )
    }

    const scheduled_at = body?.scheduled_at
    if (!scheduled_at) {
      return NextResponse.json(
        { error: "Scheduled date/time is required." },
        { status: 400 },
      )
    }

    const presenter_name =
      typeof body?.presenter_name === "string"
        ? body.presenter_name.trim()
        : ""
    if (!presenter_name) {
      return NextResponse.json(
        { error: "Presenter name is required." },
        { status: 400 },
      )
    }

    const description =
      typeof body?.description === "string" ? body.description.trim() : ""
    if (!description) {
      return NextResponse.json(
        { error: "Description is required." },
        { status: 400 },
      )
    }

    const slug =
      typeof body?.slug === "string" && body.slug.trim()
        ? body.slug.trim()
        : slugify(title)

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("webinars")
      .insert({
        slug,
        title,
        description,
        graphic_url: body?.graphic_url?.trim() || null,
        scheduled_at,
        duration_minutes: body?.duration_minutes || 60,
        presenter_name,
        presenter_title: body?.presenter_title?.trim() || null,
        presenter_avatar_url: body?.presenter_avatar_url?.trim() || null,
        join_link: body?.join_link?.trim() || null,
        promo_video_url: body?.promo_video_url?.trim() || null,
        status: body?.status || "upcoming",
        max_registrants: body?.max_registrants || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to create webinar:", error)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A webinar with that slug already exists." },
          { status: 409 },
        )
      }
      return NextResponse.json(
        { error: "Failed to create webinar." },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, webinar: data })
  } catch (err) {
    console.error("Webinar admin error:", err)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    const id = typeof body?.id === "string" ? body.id.trim() : ""
    if (!id) {
      return NextResponse.json(
        { error: "Webinar ID is required." },
        { status: 400 },
      )
    }

    const updates: Record<string, unknown> = {}

    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim()
    }
    if (typeof body.slug === "string" && body.slug.trim()) {
      updates.slug = body.slug.trim()
    }
    if (typeof body.description === "string") {
      updates.description = body.description.trim()
    }
    if (body.graphic_url !== undefined) {
      updates.graphic_url = body.graphic_url?.trim() || null
    }
    if (body.scheduled_at !== undefined) {
      updates.scheduled_at = body.scheduled_at
    }
    if (body.duration_minutes !== undefined) {
      updates.duration_minutes = body.duration_minutes || 60
    }
    if (typeof body.presenter_name === "string" && body.presenter_name.trim()) {
      updates.presenter_name = body.presenter_name.trim()
    }
    if (body.presenter_title !== undefined) {
      updates.presenter_title = body.presenter_title?.trim() || null
    }
    if (body.join_link !== undefined) {
      updates.join_link = body.join_link?.trim() || null
    }
    if (body.promo_video_url !== undefined) {
      updates.promo_video_url = body.promo_video_url?.trim() || null
    }
    if (body.status !== undefined) {
      updates.status = body.status
    }
    if (body.max_registrants !== undefined) {
      updates.max_registrants = body.max_registrants || null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 },
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("webinars")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Failed to update webinar:", error)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A webinar with that slug already exists." },
          { status: 409 },
        )
      }
      return NextResponse.json(
        { error: "Failed to update webinar." },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, webinar: data })
  } catch (err) {
    console.error("Webinar admin update error:", err)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    )
  }
}
