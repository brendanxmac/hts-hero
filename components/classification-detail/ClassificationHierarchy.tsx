"use client";

import Link from "next/link";
import { ClassificationI } from "../../interfaces/hts";
import {
  getPreferredPreliminarySectionChapterIds,
  preliminaryNavDisplay,
} from "../../libs/classification-helpers";

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

  // Section/chapter from preliminaryLevels (new flow)
  if (preliminaryLevels?.length) {
    const { sectionId: preferredSectionId, chapterId: preferredChapterId } =
      getPreferredPreliminarySectionChapterIds(classification);

    const sectionLevel = preliminaryLevels.find((l) => l.level === "section");
    if (sectionLevel && sectionLevel.candidates.length > 0) {
      const top = sectionLevel.candidates[0];
      const row = preliminaryNavDisplay(
        "section",
        sectionLevel.candidates,
        preferredSectionId,
        top,
      );
      const sectionNum = preferredSectionId ?? top.identifier;
      if (row.htsno) {
        items.push({
          label: "Section",
          code: row.htsno,
          description: row.selectionDescription ?? "",
          href: `/section/${sectionNum}`,
          navId: "classification-section",
        });
      }
    }

    const chapterLevel = preliminaryLevels.find((l) => l.level === "chapter");
    if (chapterLevel && chapterLevel.candidates.length > 0) {
      const top = chapterLevel.candidates[0];
      const row = preliminaryNavDisplay(
        "chapter",
        chapterLevel.candidates,
        preferredChapterId,
        top,
      );
      const chapterNum = preferredChapterId ?? top.identifier;
      if (row.htsno) {
        items.push({
          label: "Chapter",
          code: row.htsno,
          description: row.selectionDescription ?? "",
          href: `/chapter/${chapterNum}`,
          navId: "classification-chapter",
        });
      }
    }
  }

  // Levels (works for both new and old classifications)
  const classificationLevels = levels ?? [];
  classificationLevels.forEach((level, index) => {
    const selection = level.selection;
    if (!selection) return;

    const isLast = index === levels.length - 1 && classification.isComplete;

    items.push({
      label: selection.htsno || '',
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
            <span className="text-sm leading-snug text-base-content">
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
              <span className="absolute -left-[9px] top-5 w-4 h-4 rounded-full bg-base-content border-2 border-base-300" />
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
