import type { Metadata } from "next";
import { CompareHub } from "@/components/compare";

export const metadata: Metadata = {
  title: "Compare US Tariff Calculators | HTS Hero",
  description:
    "HTS Hero compared with Flexport, Avalara, Zonos, Descartes and other US tariff calculators: features, pricing and who each one suits.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return <CompareHub />;
}
