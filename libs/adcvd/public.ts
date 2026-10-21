import { unstable_cache } from "next/cache"
import { createPublicClient } from "@/app/api/supabase/server"
import { LIVE_STATUSES, type CaseRow } from "./types"

// AD/CVD cases for public pages (the /hts code pages): every live case's scope codes, read once
// an hour for all pages, then filtered per code.

export type PublicCase = Pick<CaseRow, "case_number" | "kind" | "country" | "product" | "status" | "hts_main" | "scope_doc" | "order_on" | "initiated_on">

const liveCases = unstable_cache(
  async (): Promise<PublicCase[]> => {
    const db = createPublicClient()
    const rows: PublicCase[] = []
    for (let from = 0; from < 10_000; from += 1000) {
      const { data, error } = await db
        .from("adcvd_cases")
        .select("case_number, kind, country, product, status, hts_main, scope_doc, order_on, initiated_on")
        .in("status", LIVE_STATUSES)
        .neq("hts_main", "{}")
        .range(from, from + 999)
      if (error) {
        console.error("Loading AD/CVD cases:", error.message)
        break
      }
      rows.push(...((data ?? []) as PublicCase[]))
      if ((data ?? []).length < 1000) break
    }
    return rows
  },
  ["adcvd-live-cases"],
  { revalidate: 3600 }
)

// Live cases whose scope lists this code, a heading above it, or (for a heading) a code under it.
// One entry per product, with every country it covers. Never throws.
export const getCasesNamingCode = async (htsno: string) => {
  const digits = htsno.replace(/\D/g, "")
  if (digits.length < 6) return []
  const cases = await liveCases().catch((): PublicCase[] => [])
  const named = cases.filter((c) => c.hts_main.some((s) => digits.startsWith(s) || s.startsWith(digits)))
  const byProduct = new Map<string, PublicCase[]>()
  for (const c of named) {
    const key = (c.product ?? c.case_number).toLowerCase().replace(/^certain\s+/, "")
    byProduct.set(key, [...(byProduct.get(key) ?? []), c])
  }
  return Array.from(byProduct.values())
    .map((group) => ({
      product: group[0].product ?? "Product",
      countries: Array.from(new Set(group.map((c) => c.country).filter((c): c is string => !!c))).sort(),
      cases: group.map((c) => c.case_number).sort(),
      investigation: group.every((c) => c.status === "investigation"),
      scope_doc: group.find((c) => c.scope_doc)?.scope_doc ?? null,
    }))
    .sort((a, b) => b.countries.length - a.countries.length)
}
export type CodeCase = Awaited<ReturnType<typeof getCasesNamingCode>>[number]
