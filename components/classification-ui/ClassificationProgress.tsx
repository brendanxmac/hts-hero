"use client";

import { useMemo } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useHts } from "../../contexts/HtsContext";
import { HtsElement } from "../../interfaces/hts";
import {
  getDirectChildrenElements,
  getElementsInChapter,
} from "../../libs/hts";

const DEFAULT_ESTIMATED_LEVELS = 4;
const MAX_DEPTH_WALK = 8;

function estimateRemainingLevels(
  element: HtsElement,
  htsElements: HtsElement[]
): number {
  const chapterElements = getElementsInChapter(htsElements, element.chapter);
  let current = element;
  let depth = 0;

  for (let i = 0; i < MAX_DEPTH_WALK; i++) {
    try {
      const children = getDirectChildrenElements(current, chapterElements);
      if (children.length === 0) break;
      depth++;
      current = children[0];
    } catch {
      break;
    }
  }

  return depth;
}

export function ClassificationProgress() {
  const { classification } = useClassification();
  const { htsElements } = useHts();

  const { percentage } = useMemo(() => {
    if (!classification) {
      return { completedSteps: 0, estimatedTotal: 1, percentage: 0 };
    }

    const hasPrelim = !!classification.preliminaryLevels?.length;

    const sectionDone =
      hasPrelim &&
      (classification.preliminaryLevels?.find((l) => l.level === "section")
        ?.candidates.length ?? 0) > 0;

    const chapterDone =
      hasPrelim &&
      (classification.preliminaryLevels?.find((l) => l.level === "chapter")
        ?.candidates.length ?? 0) > 0;

    const prelimCompleted = (sectionDone ? 1 : 0) + (chapterDone ? 1 : 0);
    const prelimTotal = hasPrelim ? 2 : 0;

    const levelsWithSelection = classification.levels.filter(
      (l) => !!l.selection
    ).length;

    const completed = prelimCompleted + levelsWithSelection;

    if (classification.isComplete) {
      const total = prelimTotal + classification.levels.length;
      return {
        completedSteps: total,
        estimatedTotal: total,
        percentage: 100,
      };
    }

    let estimatedRemaining = DEFAULT_ESTIMATED_LEVELS - levelsWithSelection;

    if (levelsWithSelection > 0 && htsElements.length > 0) {
      const lastSelectedLevel =
        classification.levels[levelsWithSelection - 1];
      if (lastSelectedLevel?.selection) {
        estimatedRemaining = estimateRemainingLevels(
          lastSelectedLevel.selection,
          htsElements
        );
      }
    }

    const currentLevelPending =
      classification.levels.length > levelsWithSelection ? 1 : 0;
    const futureRemaining = Math.max(
      0,
      estimatedRemaining - currentLevelPending
    );

    const total =
      prelimTotal + classification.levels.length + futureRemaining;

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completedSteps: completed,
      estimatedTotal: total,
      percentage: pct,
    };
  }, [classification, htsElements]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-base-content/50">
          Progress
        </span>
        <span className="text-[11px] font-semibold text-base-content/40 tabular-nums">
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-base-300 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
