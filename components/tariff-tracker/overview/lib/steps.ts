// The Overview's path to tariff health (DESIGN_SYSTEM.md §15): adding imports comes first; the
// rest can be done in any order, so they aren't numbered. The first one not done yet is suggested
// up front with its payoff, and the whole path is a track beside it.

export type StepId = "products" | "values" | "alerts" | "savings" | "audit"

export interface Step {
  id: StepId
  label: string
  done: boolean
  soon?: boolean
}

export const pathSteps = ({
  products,
  valuesSet,
  alertsSet,
  savingsSeen,
  entriesAudited,
}: {
  products: number
  // Products with a value of their own
  valuesSet: number
  // Has said where alerts go (signed in, settings saved)
  alertsSet: boolean
  // Has checked an import's savings (or has a plan) and opened Savings
  savingsSeen: boolean
  // Has audited an entry
  entriesAudited: boolean
}): { steps: Step[]; next: Step | null } => {
  const steps: Step[] = [
    {
      id: "products",
      label: "Add your products",
      done: products > 0,
    },
    {
      id: "alerts",
      label: "Set up alerts",
      done: alertsSet,
    },
    {
      id: "values",
      label: "Set import values",
      done: products > 0 && valuesSet >= products,
    },
    {
      id: "savings",
      label: "See potential savings",
      done: savingsSeen,
    },
    {
      id: "audit",
      label: "Audit past entries",
      done: entriesAudited,
    },
  ]
  return { steps, next: steps.find((s) => !s.done && !s.soon) ?? null }
}
