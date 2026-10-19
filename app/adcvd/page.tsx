import AdcvdDashboard from "@/components/adcvd/AdcvdDashboard"
import type { CaseListRow, UsageRow } from "@/components/adcvd/types"
import type { MonthRow } from "@/libs/adcvd/types"
import { guardAdmin } from "@/libs/admin/access"
import { createAdminClient } from "../api/supabase/server"

export const dynamic = "force-dynamic"
// Supabase reads go through fetch: never from Next's data cache (the lookups set their own HTTP caching)
export const fetchCache = "force-no-store"
export const metadata = {
  title: "AD/CVD cases | HTS Hero",
  robots: { index: false, follow: false },
}

const PAGE = 1000
const MAX_ROWS = 20_000

type Db = ReturnType<typeof createAdminClient>

const loadAll = async <T,>(db: Db, table: string, columns: string, orderBy: string) => {
  const rows: T[] = []
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await db.from(table).select(columns).order(orderBy, { ascending: false }).range(from, from + PAGE - 1)
    if (error) return { rows, error: error.message }
    rows.push(...(data as T[]))
    if (data.length < PAGE) break
  }
  return { rows, error: null }
}

const CASE_COLUMNS =
  "case_number, kind, country, product, status, initiated_on, order_on, last_continued_on, ended_on, hts_main, hts_also, hts_excluded, hts_outdated, scope_method, scope_doc, rates, problems, first_seen_on, last_activity_on, itc_numbers, third_countries"

export default async function AdcvdPage() {
  await guardAdmin()
  const db = createAdminClient()
  const [cases, months, usage, settings] = await Promise.all([
    loadAll<CaseListRow>(db, "adcvd_cases", CASE_COLUMNS, "last_activity_on"),
    db.from("adcvd_months").select("*"),
    loadAll<UsageRow>(db, "ai_usage", "month, for_month, pipeline, step, model, cost_usd, input_tokens, output_tokens", "at"),
    db.from("adcvd_settings").select("monthly_budget_usd, last_cron_at, last_cron").eq("id", true).maybeSingle(),
  ])
  const loadError = cases.error ?? months.error?.message ?? usage.error ?? null
  return (
    <AdcvdDashboard
      cases={cases.rows}
      months={(months.data ?? []) as MonthRow[]}
      usage={usage.rows}
      budget={Number(settings.data?.monthly_budget_usd ?? 10)}
      lastCron={settings.data?.last_cron_at ? { at: settings.data.last_cron_at as string, run: settings.data.last_cron as Record<string, unknown> | null } : null}
      loadError={loadError}
    />
  )
}
