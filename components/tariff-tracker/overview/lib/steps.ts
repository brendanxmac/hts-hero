// The Overview's path to lower duty (DESIGN_SYSTEM.md §15): five steps, of which only the next
// one is shown, with a payoff. Step 5 (auditing past entries) is coming soon, never "next".

export type StepId = "products" | "alerts" | "values" | "savings" | "audit";

export interface Step {
  id: StepId;
  number: number;
  label: string;
  done: boolean;
  soon?: boolean;
}

export const pathSteps = ({
  products,
  alertsOn,
  valuesSet,
  savingsSeen,
}: {
  products: number;
  alertsOn: boolean;
  // Products with a value of their own
  valuesSet: number;
  // Has seen their potential savings with the trial or a plan
  savingsSeen: boolean;
}): { steps: Step[]; next: Step | null } => {
  const steps: Step[] = [
    { id: "products", number: 1, label: "Add your products", done: products > 0 },
    { id: "alerts", number: 2, label: "Turn on alerts", done: alertsOn },
    { id: "values", number: 3, label: "Set product values", done: products > 0 && valuesSet >= products },
    { id: "savings", number: 4, label: "Detect savings", done: savingsSeen },
    { id: "audit", number: 5, label: "Audit past entries", done: false, soon: true },
  ];
  return { steps, next: steps.find((s) => !s.done && !s.soon) ?? null };
};
