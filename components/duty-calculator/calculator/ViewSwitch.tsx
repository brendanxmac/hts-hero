"use client";

import { Segmented } from "../fields/Segmented";
import { TariffFinder, View } from "../lib/useTariffFinder";

// Simple / Detailed / Compare. Compare can be left out where the origin is fixed.

const VIEWS: { id: View; label: string }[] = [
  { id: "simple", label: "Simple" },
  { id: "detailed", label: "Detailed" },
  { id: "compare", label: "Compare" },
];

export const ViewSwitch = ({
  f,
  className = "",
  allowCompare = true,
}: {
  f: TariffFinder;
  className?: string;
  allowCompare?: boolean;
}) => (
  <div className={`min-w-0 w-full ${allowCompare ? "sm:w-72" : "sm:w-48"} ${className}`}>
    <Segmented
      label="View"
      options={allowCompare ? VIEWS : VIEWS.filter((v) => v.id !== "compare")}
      value={f.view}
      onChange={f.changeView}
      compact
    />
  </div>
);
