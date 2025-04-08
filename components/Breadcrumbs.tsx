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
      <div className="btn btn-xs btn-square btn-primary shrink-0 flex items-center gap-2">
        <button
          className="text-sm"
          onClick={() => {
            setBreadcrumbs(breadcrumbs.slice(0, -1));
          }}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 breadcrumbs text-sm py-0">
        <ul className="flex flex-wrap gap-0">
          {breadcrumbs.map((breadcrumb, i) => {
            return (
              <li key={`breadcrumb-${i}`}>
                <button
                  className="btn btn-xs btn-link flex items-center gap-2 hover:text-secondary hover:scale-110"
                  onClick={() => {
                    setBreadcrumbs(breadcrumbs.slice(0, i + 1));
                  }}
                >
                  {breadcrumb.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
