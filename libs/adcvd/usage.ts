import type { SupabaseClient } from "@supabase/supabase-js"
import type { ClaudeUsage } from "../hts-revision-diff/types"

// Every Claude call the AD/CVD and tariff updates pipelines make goes in ai_usage, with what it
// cost, so /adcvd can show spend by month, step and model. AD/CVD calls also carry the month of
// notices they were for: that month's budget (adcvd_settings) pauses its AI steps once spent.

export type Pipeline = "adcvd" | "tariff_updates"

export const monthOf = (date: Date | string) => (typeof date === "string" ? date : date.toISOString()).slice(0, 7)

export const logUsage = async (
  db: SupabaseClient,
  usage: ClaudeUsage | null | undefined,
  { pipeline, step, ref, forMonth }: { pipeline: Pipeline; step: string; ref?: string | null; forMonth?: string | null }
) => {
  if (!usage) return
  const { error } = await db.from("ai_usage").insert({
    month: monthOf(new Date()),
    for_month: forMonth ?? null,
    pipeline,
    step,
    model: usage.model,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cache_read_input_tokens: usage.cache_read_input_tokens,
    cache_creation_input_tokens: usage.cache_creation_input_tokens,
    cost_usd: usage.cost_usd,
    ref: ref ?? null,
  })
  // Logging never stops the work it measures; the run's own totals still count the cost
  if (error) console.warn(`ai_usage: ${error.message}`)
}

export class BudgetReached extends Error {
  constructor(month: string, spent: number, budget: number) {
    super(`The AI budget for ${month} is spent ($${spent.toFixed(2)} of $${budget.toFixed(2)}). Raise it on /adcvd to continue.`)
  }
}

export const budgetOf = async (db: SupabaseClient) => {
  const { data } = await db.from("adcvd_settings").select("monthly_budget_usd").eq("id", true).maybeSingle()
  return Number(data?.monthly_budget_usd ?? 10)
}

export const spentFor = async (db: SupabaseClient, forMonth: string) => {
  const { data, error } = await db.from("ai_usage").select("cost_usd").eq("pipeline", "adcvd").eq("for_month", forMonth)
  if (error) throw new Error(`Reading AI spend: ${error.message}`)
  return (data ?? []).reduce((sum, row) => sum + Number(row.cost_usd), 0)
}

// Tracks one month's spend through a run without asking the database before every call
export const budgetTracker = async (db: SupabaseClient, forMonth: string) => {
  const budget = await budgetOf(db)
  let spent = await spentFor(db, forMonth)
  return {
    budget,
    get spent() {
      return spent
    },
    get reached() {
      return spent >= budget
    },
    // Throws once the budget is spent, before the next call
    check() {
      if (spent >= budget) throw new BudgetReached(forMonth, spent, budget)
    },
    async record(usage: ClaudeUsage | null | undefined, step: string, ref?: string | null) {
      if (!usage) return
      spent += usage.cost_usd
      await logUsage(db, usage, { pipeline: "adcvd", step, ref, forMonth })
    },
  }
}
export type Budget = Awaited<ReturnType<typeof budgetTracker>>
