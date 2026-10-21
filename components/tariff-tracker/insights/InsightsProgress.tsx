"use client";

import * as ui from "@/components/ui/styles";
import { useInsights } from "./InsightsContext";

// While the catalog's history and savings are still being worked out
export const InsightsProgress = ({ label }: { label: string }) => {
  const { progress, products } = useInsights();
  if (progress >= 1) return null;
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-base-300" aria-hidden>
        {/* Runtime width (DESIGN_SYSTEM §10) */}
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <span className={ui.caption}>
        {label} {products.length.toLocaleString("en-US")} products · {Math.round(progress * 100)}%
      </span>
    </div>
  );
};
