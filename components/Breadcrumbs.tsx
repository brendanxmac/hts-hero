"use client";

import { ArrowLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { usePathname } from "next/navigation";
import { NavigatableElement } from "./Elements";
import { trackExplorerNavigatedToLevel } from "../libs/explorer-navigation";

interface BreadcrumbsProps {
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
  isModal?: boolean;
}

export const Breadcrumbs = ({
  breadcrumbs,
  setBreadcrumbs,
  isModal = false,
}: BreadcrumbsProps) => {
  const pathname = usePathname();

  if (breadcrumbs.length === 0) return null;

  return (
    <div className="flex items-center gap-3 py-2 px-1 rounded-xl bg-base-200/40 border border-base-content/5">
      {/* Back Button */}
      <button
        className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
        onClick={() => {
          trackExplorerNavigatedToLevel({
            pathname,
            isModal,
            navigation_kind: "back",
            from_depth: breadcrumbs.length,
            to_depth: breadcrumbs.length - 1,
          });
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
                    trackExplorerNavigatedToLevel({
                      pathname,
                      isModal,
                      navigation_kind: "breadcrumb",
                      from_depth: breadcrumbs.length,
                      to_depth: i + 1,
                      breadcrumb_index: i,
                    });
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
