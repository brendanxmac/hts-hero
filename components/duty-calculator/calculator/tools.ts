import { CalculatorIcon, EyeIcon } from "@heroicons/react/20/solid";

// The tools on the Tariff Finder page, as tabs

export type Tool = "calculator" | "watcher";

export const TOOLS: { id: Tool; label: string; note: string; Icon: typeof CalculatorIcon }[] = [
  { id: "calculator", label: "Tariff Calculator", note: "Duty on one shipment", Icon: CalculatorIcon },
  { id: "watcher", label: "Tariff Watcher", note: "Rates for all your products", Icon: EyeIcon },
];
