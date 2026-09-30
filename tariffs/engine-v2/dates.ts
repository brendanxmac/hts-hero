import { EffectivePeriod, IsoDate } from "./types"

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Today's date as "YYYY-MM-DD" in local time
export const todayIsoDate = (): IsoDate => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

// `from` is inclusive, `to` is exclusive. ISO dates compare correctly as strings.
export const isEffectiveOn = (
  effective: EffectivePeriod | undefined,
  date: IsoDate,
) => {
  const from = effective?.from
  const to = effective?.to
  return (!from || from <= date) && (!to || date < to)
}

export const describePeriod = (effective: EffectivePeriod | undefined) =>
  `${effective?.from ?? "start"} → ${effective?.to ?? "now"}`
