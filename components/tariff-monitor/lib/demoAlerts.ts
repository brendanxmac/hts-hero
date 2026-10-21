// Example alerts for the landing page's animations. The tariff changes and dates are real (from
// the tariff changelog); the product counts and yearly costs are illustrative.

import type { ProgramName } from "@/components/ui/marketing";

export type AlertKind = "increase" | "decrease";

export interface DemoAlert {
  id: string;
  program: ProgramName;
  title: string;
  change: string;
  kind: AlertKind;
  products: number;
  cost: string;
  date: string;
  channel: "Email" | "Slack" | "Teams" | "In-app";
}

export const DEMO_ALERTS: DemoAlert[] = [
  { id: "338", program: "Section 338", title: "Listed products of Canada", change: "+50%", kind: "increase", products: 3, cost: "+$228,500 / yr", date: "Aug 22, 2026", channel: "Slack" },
  { id: "232-uas", program: "Section 232", title: "Drones and drone parts", change: "+25%", kind: "increase", products: 2, cost: "+$61,000 / yr", date: "Sep 3, 2026", channel: "Email" },
  { id: "pharma", program: "Exemption", title: "Clinical-trial pharmaceuticals", change: "−100%", kind: "decrease", products: 1, cost: "−$40,000 / yr", date: "Sep 29, 2026", channel: "Teams" },
  { id: "301-br", program: "Section 301", title: "Products of Brazil", change: "+25%", kind: "increase", products: 5, cost: "+$94,200 / yr", date: "Jul 22, 2026", channel: "In-app" },
  { id: "201", program: "Section 201", title: "Quartz surface products", change: "+25%", kind: "increase", products: 1, cost: "+$18,750 / yr", date: "Aug 15, 2026", channel: "Email" },
];
