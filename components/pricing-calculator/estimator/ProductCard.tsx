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
      className={`rounded-2xl border bg-white shadow-sm transition-shadow ${
        highlighted ? "border-transparent ring-2 ring-teal-500" : "border-slate-200"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-4 px-5 py-5 sm:px-6 ${enabled && children ? "border-b border-slate-200" : ""}`}
      >
        <div className="min-w-0">
          <h3 id={titleId} className="text-lg font-semibold text-slate-900 sm:text-xl">
            {name}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{summary}</p>
        </div>
        {fixedLabel ? (
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
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
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 ${
                enabled ? "bg-teal-600" : "bg-slate-200 hover:bg-slate-300"
              }`}
            >
              <span
                aria-hidden
                className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform ${
                  enabled ? "translate-x-[1.375rem]" : "translate-x-0.5"
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
