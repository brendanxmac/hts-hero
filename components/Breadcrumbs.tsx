"use client";

import { ArrowLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { NavigatableElement } from "./Elements";

interface BreadcrumbsProps {
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export const Breadcrumbs = ({
  breadcrumbs,
  setBreadcrumbs,
}: BreadcrumbsProps) => {
  if (breadcrumbs.length === 0) return null;

  return (
    <div className="flex items-center gap-3 py-2 px-1 rounded-xl bg-base-200/40 border border-base-content/5">
      {/* Back Button */}
      <button
        className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
        onClick={() => {
          setBreadcrumbs(breadcrumbs.slice(0, -1));
        }}
      >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>

      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-1 overflow-x-auto">
          {breadcrumbs.map((breadcrumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
            return (
            <div key={`breadcrumb-${i}`} className="flex items-center gap-1">
              {isLast ? (
                <span className="px-2 py-1 text-sm font-semibold text-primary whitespace-nowrap">
                    {breadcrumb.title}
                  </span>
                ) : (
                  <button
                  className="px-2 py-1 text-sm font-medium text-base-content/60 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap"
                    onClick={() => {
                      setBreadcrumbs(breadcrumbs.slice(0, i + 1));
                    }}
                  >
                    {breadcrumb.title}
                  </button>
                )}
              {!isLast && (
                <ChevronRightIcon className="w-4 h-4 text-base-content/30 shrink-0" />
              )}
            </div>
            );
          })}
      </div>
    </div>
  );
};
