"use client";

import Link from "next/link";
import { ClassificationI } from "../../interfaces/hts";

export interface HierarchyItem {
  label: string;
  code?: string;
  description: string;
  isCurrent?: boolean;
  href?: string;
  navId?: string;
}

interface Props {
  classification?: ClassificationI;
  items?: HierarchyItem[];
  onItemClick?: (navId: string) => void;
  continueLineAfterLast?: boolean;
}

function buildItemsFromClassification(
  classification: ClassificationI
): HierarchyItem[] {
  const { preliminaryLevels, levels } = classification;
  const items: HierarchyItem[] = [];

  if (preliminaryLevels) {
    const sectionLevel = preliminaryLevels.find((l) => l.level === "section");
    if (sectionLevel && sectionLevel.candidates.length > 0) {
      const top = sectionLevel.candidates[0];
      items.push({
        label: "Section",
        code: `Section ${top.identifier}`,
        description: top.description,
        href: `/section/${top.identifier}`,
        navId: "classification-section",
      });
    }

    const chapterLevel = preliminaryLevels.find((l) => l.level === "chapter");
    if (chapterLevel && chapterLevel.candidates.length > 0) {
      const top = chapterLevel.candidates[0];
      items.push({
        label: "Chapter",
        code: `Chapter ${top.identifier}`,
        description: top.description,
        href: `/chapter/${top.identifier}`,
        navId: "classification-chapter",
      });
    }
  }

  levels.forEach((level, index) => {
    const selection = level.selection;
    if (!selection) return;

    const isLast = index === levels.length - 1 && classification.isComplete;

    items.push({
      label: selection.htsno || `Level ${index + 1}`,
      code: selection.htsno || undefined,
      description: selection.description,
      isCurrent: isLast,
      href: selection.htsno ? `/hts/${selection.htsno}` : undefined,
      navId: `classification-level-${index}`,
    });
  });

  return items;
}

export const ClassificationHierarchy = ({
  classification,
  items: externalItems,
  onItemClick,
  continueLineAfterLast = false,
}: Props) => {
  const items = externalItems ?? (classification ? buildItemsFromClassification(classification) : []);

  if (items.length === 0) {
    return (
      <p className="text-sm text-base-content/50 italic">
        Classification hierarchy will appear as classification progresses.
      </p>
    );
  }

  return (
    <ol className="relative ml-3 border-l-2 border-base-content/10 flex flex-col gap-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1 && !continueLineAfterLast;
        const isClickable = onItemClick && item.navId;

        const interactable = isClickable || (item.href && !onItemClick);

        const content = (
          <div className={`flex flex-col gap-0.5 -ml-1 px-3 py-2 rounded-lg border border-transparent transition-colors duration-150 ${interactable ? "hover:bg-primary/[0.06] hover:border-primary/10" : ""}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${interactable ? "text-primary" : "text-base-content/60"}`}>
              {item.label}
            </span>
            <span className="text-sm leading-snug text-base-content/60">
              {item.description}
            </span>
          </div>
        );

        return (
          <li
            key={index}
            className={`relative pl-7 ${isLast ? "" : "pb-1"}`}
          >
            {/* Circle indicator */}
            {item.isCurrent ? (
              <span className="absolute -left-[11px] top-2.5 w-5 h-5 rounded-full bg-primary border-2 border-base-100 shadow-md shadow-primary/30" />
            ) : (
              <span className="absolute -left-[9px] top-3 w-4 h-4 rounded-full bg-base-content border-2 border-base-300" />
            )}

            {isClickable ? (
              <button
                type="button"
                onClick={() => onItemClick(item.navId!)}
                className="w-full text-left cursor-pointer"
              >
                {content}
              </button>
            ) : item.href && !onItemClick ? (
              <Link href={item.href} className="block">
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ol>
  );
};
