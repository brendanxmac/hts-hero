// Example audit flags for the hero's animation. Each reason is a real rule; the entries and amounts
// are illustrative, except steel wire, whose $4,000 matches the engine's own recalculation (see
// libs/tariff-audit-example.ts).

export interface DemoFlag {
  id: string;
  product: string;
  code: string;
  origin: string;
  date: string;
  reason: string;
  amount: number;
  kind: "overpaid" | "refundable" | "underpaid";
}

export const DEMO_FLAGS: DemoFlag[] = [
  { id: "wire", product: "Steel wire", code: "7217.10", origin: "China", date: "Mar 12, 2026", reason: "Section 122 charged on a Section 232 article", amount: 4000, kind: "overpaid" },
  { id: "tees", product: "Cotton T-shirts", code: "6109.10", origin: "Vietnam", date: "Jan 8, 2026", reason: "IEEPA reciprocal duty, now refundable", amount: 5000, kind: "refundable" },
  { id: "alum", product: "Aluminum extrusions", code: "7604.29", origin: "Canada", date: "Jun 15, 2026", reason: "USMCA preference not claimed", amount: 3000, kind: "overpaid" },
  { id: "chairs", product: "Wood chairs", code: "9401.61", origin: "Vietnam", date: "Nov 20, 2025", reason: "Section 232 wood duty not paid", amount: -1850, kind: "underpaid" },
  { id: "coffee", product: "Roasted coffee", code: "0901.21", origin: "Brazil", date: "Nov 17, 2025", reason: "Agricultural exemption back to Nov 13, 2025", amount: 2600, kind: "refundable" },
];
