"use client";

import { ArrowLeftIcon } from "@heroicons/react/16/solid";
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
    <div className="flex gap-3 items-start justify-start">
      <div
        className="btn btn-xs btn-square btn-primary shrink-0 flex items-center gap-2"
        onClick={() => {
          setBreadcrumbs(breadcrumbs.slice(0, -1));
        }}
      >
        <button className="text-sm">
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 breadcrumbs text-sm py-0 overflow-hidden">
        <ul className="flex flex-wrap gap-0">
          {breadcrumbs.map((breadcrumb, i) => {
            return (
              <li key={`breadcrumb-${i}`}>
                {i === breadcrumbs.length - 1 ? (
                  <span className="btn btn-xs btn-link text-primary no-underline hover:no-underline">
                    {breadcrumb.title}
                  </span>
                ) : (
                  <button
                    className="btn btn-xs btn-link flex items-center hover:text-secondary hover:scale-105 px-1"
                    onClick={() => {
                      setBreadcrumbs(breadcrumbs.slice(0, i + 1));
                    }}
                  >
                    {breadcrumb.title}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
