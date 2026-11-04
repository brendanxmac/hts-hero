import { NextRequest, NextResponse } from "next/server"
import { requireSocialStudio } from "@/libs/social-studio/access"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { DutyInputError } from "@/libs/mcp/duty"
import { buildCountryPosts, buildFactPosts, buildOddRatePosts, buildOddRatesRoundup, buildProductPosts, FACT_KINDS, FactKind } from "@/libs/social-studio/build"
import { newsIdea, newsPost, officialSources, UPDATE_COLUMNS, UpdateRow, writeNewsWords } from "@/libs/social-studio/news"

export const dynamic = "force-dynamic"

// Posts made by hand: from a product, a country, a fact across the schedule, or an odd rate
export async function POST(req: NextRequest) {
  const { db, denied } = await requireSocialStudio()
  if (denied) return denied
  try {
    const body = await req.json()
    const theme = body.theme === "light" ? "light" : "dark"
    if (body.mode === "country") return NextResponse.json(await buildCountryPosts({ country: String(body.country ?? ""), theme }))
    if (body.mode === "news") {
      const { data, error } = await db.from("tariff_updates").select(UPDATE_COLUMNS).eq("slug", String(body.slug ?? "")).single()
      if (error) return errorResponse(new Error(`No tariff update ${body.slug}`), 404)
      const update = data as UpdateRow
      const notes: string[] = []
      let words = {}
      let costUsd: number | null = null
      try {
        const written = await writeNewsWords(update)
        words = written.words
        costUsd = written.usage.cost_usd
      } catch (e) {
        notes.push(`Claude couldn't write the headline (${(e as Error).message}); the update's title is used.`)
      }
      // Shown as an idea on the News tab; not stored
      const post = newsPost(update, theme, words, await officialSources(db, update))
      return NextResponse.json({ title: update.title, posts: [post], notes, idea: newsIdea(update, post), costUsd })
    }
    if (body.mode === "odd-rate") {
      return NextResponse.json(await buildOddRatePosts({ htsCode: String(body.htsCode ?? ""), column: body.column === "other" ? "other" : "general", theme }))
    }
    if (body.mode === "odd-rates-roundup") return NextResponse.json(await buildOddRatesRoundup({ theme }))
    if (body.mode === "fact") {
      if (!(body.kind in FACT_KINDS)) return errorResponse(new Error("Unknown fact"), 400)
      return NextResponse.json(await buildFactPosts({ kind: body.kind as FactKind, theme }))
    }
    return NextResponse.json(
      await buildProductPosts({
        htsCode: String(body.htsCode ?? ""),
        countries: Array.isArray(body.countries) ? body.countries.map(String).filter(Boolean) : [],
        productName: body.productName ? String(body.productName) : undefined,
        theme,
      })
    )
  } catch (e) {
    return errorResponse(e, e instanceof DutyInputError ? 400 : 500)
  }
}
