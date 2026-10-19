import type { CaseRow } from "@/libs/adcvd/types"

// What /adcvd loads for its tables (the scope text and events load when a case is opened)
export type CaseListRow = Pick<
  CaseRow,
  | "case_number"
  | "kind"
  | "country"
  | "product"
  | "status"
  | "initiated_on"
  | "order_on"
  | "last_continued_on"
  | "ended_on"
  | "hts_main"
  | "hts_also"
  | "hts_excluded"
  | "hts_outdated"
  | "scope_method"
  | "scope_doc"
  | "rates"
  | "problems"
  | "first_seen_on"
  | "last_activity_on"
  | "itc_numbers"
  | "third_countries"
>

export interface UsageRow {
  month: string
  for_month: string | null
  pipeline: "adcvd" | "tariff_updates"
  step: string
  model: string
  cost_usd: number
  input_tokens: number
  output_tokens: number
}
