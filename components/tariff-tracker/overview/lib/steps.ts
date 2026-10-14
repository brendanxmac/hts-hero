// The Overview's path to lower duty (DESIGN_SYSTEM.md §15): four steps, the next one up front with
// its payoff and the rest as a checklist under it. (Alerts are out of the path for now.)

export type StepId = "products" | "values" | "savings" | "audit";

export interface Step {
  id: StepId;
  number: number;
  label: string;
  done: boolean;
  soon?: boolean;
}

export const pathSteps = ({
  products,
  valuesSet,
  savingsSeen,
  entriesAudited,
}: {
  products: number;
  // Products with a value of their own
  valuesSet: number;
  // Has checked an import's savings (or has a plan) and opened Savings
  savingsSeen: boolean;
  // Has audited an entry
  entriesAudited: boolean;
}): { steps: Step[]; next: Step | null } => {
  const steps: Step[] = [
    { id: "products", number: 1, label: "Add your products", done: products > 0 },
    { id: "values", number: 2, label: "Set product values", done: products > 0 && valuesSet >= products },
    { id: "savings", number: 3, label: "See potential savings", done: savingsSeen },
    { id: "audit", number: 4, label: "Audit past entries", done: entriesAudited },
  ];
  return { steps, next: steps.find((s) => !s.done && !s.soon) ?? null };
};
