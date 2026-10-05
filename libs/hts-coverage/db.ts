import type { RevisionDb } from "../hts-revision-diff/access"

export const must = <R>(result: { data: R | null; error: { message: string } | null }, what: string): R => {
  if (result.error) throw new Error(`${what}: ${result.error.message}`)
  return result.data as R
}

// PostgREST returns at most 1,000 rows per request
export const selectAll = async <R>(db: RevisionDb, table: string, columns = "*"): Promise<R[]> => {
  const out: R[] = []
  for (let from = 0; ; from += 1000) {
    const result = await db.from(table).select(columns).order("htsno").range(from, from + 999)
    const page = must(result as unknown as { data: R[] | null; error: { message: string } | null }, `Load ${table}`)
    out.push(...page)
    if (page.length < 1000) return out
  }
}
