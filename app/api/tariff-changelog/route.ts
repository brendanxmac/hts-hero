import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createAdminClient, createClient } from "../supabase/server"
import { CHANGELOG_ADMIN_EMAIL, parseChangelogInput } from "@/libs/supabase/tariff-changelog"

// Admin-only writes to the tariff calculator changelog. Reads happen on the pages themselves.

async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.email === CHANGELOG_ADMIN_EMAIL
}

const refreshPages = () => {
  revalidatePath("/duty-calculator")
  revalidatePath("/duty-calculator/changelog")
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 403 })

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized()

  const { input, error } = parseChangelogInput(await req.json())
  if (error) return NextResponse.json({ error }, { status: 400 })

  const { data, error: dbError } = await createAdminClient()
    .from("tariff_changelog")
    .insert(input)
    .select()
    .single()
  if (dbError) {
    console.error("Failed to create changelog entry:", dbError)
    return NextResponse.json({ error: "Couldn't save the entry." }, { status: 500 })
  }
  refreshPages()
  return NextResponse.json({ entry: data })
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized()

  const body = await req.json()
  const id = typeof body?.id === "string" ? body.id : null
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 })

  const { input, error } = parseChangelogInput(body, { partial: true })
  if (error) return NextResponse.json({ error }, { status: 400 })

  const { data, error: dbError } = await createAdminClient()
    .from("tariff_changelog")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (dbError) {
    console.error("Failed to update changelog entry:", dbError)
    return NextResponse.json({ error: "Couldn't save the entry." }, { status: 500 })
  }
  refreshPages()
  return NextResponse.json({ entry: data })
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 })

  const { error } = await createAdminClient().from("tariff_changelog").delete().eq("id", id)
  if (error) {
    console.error("Failed to delete changelog entry:", error)
    return NextResponse.json({ error: "Couldn't delete the entry." }, { status: 500 })
  }
  refreshPages()
  return NextResponse.json({ ok: true })
}
