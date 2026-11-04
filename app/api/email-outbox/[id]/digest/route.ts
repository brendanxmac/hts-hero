import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/libs/admin/access"
import { digestCandidates, repickDigest } from "@/libs/email/news-producer"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const ids = (v: unknown) => (Array.isArray(v) ? Array.from(new Set(v.filter((x): x is string => typeof x === "string"))) : [])

// A weekly digest's updates: every one it could carry, and which it does
export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  try {
    return NextResponse.json(await digestCandidates(db, params.id))
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

// { include, exclude }: the admin's picks for a waiting digest; every reader's message is made again
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { db, denied } = await requireAdmin()
  if (denied) return denied
  const body = await req.json().catch(() => ({}))
  try {
    return NextResponse.json(await repickDigest(db, params.id, { include: ids(body.include), exclude: ids(body.exclude) }))
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
