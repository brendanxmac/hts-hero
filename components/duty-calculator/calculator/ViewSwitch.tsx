"use client";

import { Segmented } from "../fields/Segmented";
import { TariffFinder, View } from "../lib/useTariffFinder";

// Simple / Detailed / Compare

const VIEWS: { id: View; label: string }[] = [
  { id: "simple", label: "Simple" },
  { id: "detailed", label: "Detailed" },
  { id: "compare", label: "Compare" },
];

export const ViewSwitch = ({ f, className = "" }: { f: TariffFinder; className?: string }) => (
  <div className={`min-w-0 w-full sm:w-72 ${className}`}>
    <Segmented label="View" options={VIEWS} value={f.view} onChange={f.changeView} compact />
  </div>
);
