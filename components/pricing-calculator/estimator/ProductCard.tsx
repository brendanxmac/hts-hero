"use client";

import { ReactNode, useId } from "react";

// One product in the estimate: a header with an on/off switch, and its options while it's on
export const ProductCard = ({
  name,
  summary,
  enabled,
  fixedLabel,
  onToggle,
  children,
}: {
  name: string;
  summary: string;
  enabled: boolean;
  // Set for a product that's always on at no charge (the free calculator): shown instead of a switch
  fixedLabel?: string;
  onToggle?: (enabled: boolean) => void;
  children?: ReactNode;
}) => {
  const titleId = useId();
  // The free calculator is always on but isn't a choice, so only switchable cards get the ring
  const highlighted = enabled && !fixedLabel;
  return (
    <div
      className={`rounded-2xl border bg-base-100 shadow-xs transition-shadow ${
        highlighted ? "border-transparent ring-2 ring-primary" : "border-base-300"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-4 px-5 py-5 sm:px-6 ${enabled && children ? "border-b border-base-300" : ""}`}
      >
        <div className="min-w-0">
          <h3 id={titleId} className="text-lg font-semibold text-base-content sm:text-xl">
            {name}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-base-content/60">{summary}</p>
        </div>
        {fixedLabel ? (
          <span className="shrink-0 rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success ring-1 ring-success/30">
            {fixedLabel}
          </span>
        ) : (
          onToggle && (
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-labelledby={titleId}
              onClick={() => onToggle(!enabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 ${
                enabled ? "bg-primary" : "bg-base-300 hover:bg-base-content/20"
              }`}
            >
              <span
                aria-hidden
                className={`inline-block h-6 w-6 rounded-full bg-base-100 shadow-xs ring-1 ring-base-content/5 transition-transform ${
                  enabled ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          )
        )}
      </div>
      {enabled && children && <div className="flex flex-col gap-6 px-5 py-6 sm:px-6">{children}</div>}
    </div>
  );
};
