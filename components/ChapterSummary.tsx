"use client";

import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { usePathname } from "next/navigation";
import { Navigatable, HtsSectionAndChapterBase } from "../interfaces/hts";
import { NavigatableElement } from "./Elements";
import { trackExplorerNavigatedToLevel } from "../libs/explorer-navigation";

interface Props {
  chapter: HtsSectionAndChapterBase;
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
  isModal?: boolean;
}

export const ChapterSummary = ({
  chapter,
  breadcrumbs,
  setBreadcrumbs,
  isModal = false,
}: Props) => {
  const pathname = usePathname();
  const { number, description } = chapter;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        trackExplorerNavigatedToLevel({
          pathname,
          isModal,
          navigation_kind: "deeper_chapter",
          from_depth: breadcrumbs.length,
          to_depth: breadcrumbs.length + 1,
          chapter_number: number,
        });
        setBreadcrumbs([
          ...breadcrumbs,
          {
            title: `Chapter ${number.toString()}`,
            element: {
              type: Navigatable.CHAPTER,
              ...chapter,
            },
          },
        ]);
      }}
      className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-base-200/40 border border-base-content/5 hover:bg-base-200/80 hover:border-primary/20 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm">
          {number}
        </span>
        <span className="text-sm font-medium text-base-content/80 group-hover:text-base-content transition-colors">
          {description}
        </span>
      </div>

      <ChevronRightIcon className="shrink-0 w-5 h-5 text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
    </div>
  );
};
