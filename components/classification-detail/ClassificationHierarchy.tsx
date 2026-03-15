"use client";

import Link from "next/link";
import { ClassificationI } from "../../interfaces/hts";
import { CheckCircleIcon } from "@heroicons/react/16/solid";

interface Props {
  classification: ClassificationI;
}

export const ClassificationHierarchy = ({ classification }: Props) => {
  const { preliminaryLevels, levels } = classification;

  const hasContent =
    (preliminaryLevels && preliminaryLevels.length > 0) || levels.length > 0;

  if (!hasContent) {
    return (
      <p className="text-sm text-base-content/50 italic">
        Classification hierarchy will appear as classification progresses.
      </p>
    );
  }

  interface TimelineItem {
    label: string;
    code?: string;
    description: string;
    isCurrent: boolean;
    isCompleted: boolean;
    href?: string;
  }

  const timelineItems: TimelineItem[] = [];

  if (preliminaryLevels) {
    const sectionLevel = preliminaryLevels.find((l) => l.level === "section");
    if (sectionLevel && sectionLevel.candidates.length > 0) {
      const topCandidate = sectionLevel.candidates[0];
      timelineItems.push({
        label: "Section",
        code: `Section ${topCandidate.identifier}`,
        description: topCandidate.description,
        isCurrent: false,
        isCompleted: true,
        href: `/section/${topCandidate.identifier}`,
      });
    }

    const chapterLevel = preliminaryLevels.find((l) => l.level === "chapter");
    if (chapterLevel && chapterLevel.candidates.length > 0) {
      const topCandidate = chapterLevel.candidates[0];
      timelineItems.push({
        label: "Chapter",
        code: `Chapter ${topCandidate.identifier}`,
        description: topCandidate.description,
        isCurrent: false,
        isCompleted: true,
        href: `/chapter/${topCandidate.identifier}`,
      });
    }
  }

  levels.forEach((level, index) => {
    const selection = level.selection;
    if (!selection) return;

    const isLast = index === levels.length - 1 && classification.isComplete;

    timelineItems.push({
      label: selection.htsno
        ? selection.htsno
        : `Level ${index + 1}`,
      code: selection.htsno || undefined,
      description: selection.description,
      isCurrent: isLast,
      isCompleted: true,
      href: selection.htsno
        ? `/hts/${selection.htsno}`
        : undefined,
    });
  });

  if (timelineItems.length === 0) {
    return (
      <p className="text-sm text-base-content/50 italic">
        Classification hierarchy will appear as levels are completed.
      </p>
    );
  }

  return (
    <ol className="relative ml-3 border-l-2 border-base-content/10 flex flex-col gap-0">
      {timelineItems.map((item, index) => {
        const isLast = index === timelineItems.length - 1;

        return (
          <li
            key={index}
            className={`relative pl-7 ${isLast ? "" : "pb-4"}`}
          >
            {item.isCurrent ? (
              <span className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-primary border-2 border-base-100 shadow-md shadow-primary/30" />
            ) : (
              <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-success/80 border-2 border-base-100">
                <CheckCircleIcon className="w-full h-full text-base-100" />
              </span>
            )}
            <div
              className={`flex flex-col gap-0.5 ${
                item.isCurrent
                  ? "bg-primary/[0.06] -ml-1 px-3 py-2 rounded-lg border border-primary/15"
                  : ""
              }`}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-xs font-bold link link-primary uppercase tracking-wider"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
                  {item.label}
                </span>
              )}
              <span
                className={`text-sm leading-snug ${
                  item.isCurrent
                    ? "text-base-content font-medium"
                    : "text-base-content/60"
                }`}
              >
                {item.description}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
