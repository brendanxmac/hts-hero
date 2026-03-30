"use client";

import { useMemo } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useHts } from "../../contexts/HtsContext";
import { HtsElement } from "../../interfaces/hts";
import {
  getDirectChildrenElements,
  getElementsInChapter,
} from "../../libs/hts";
import { CheckCircleIcon } from "@heroicons/react/16/solid";

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

export function ClassificationProgress({
  currentStepNumber,
}: {
  currentStepNumber: number;
}) {
  const { classification } = useClassification();
  const { htsElements } = useHts();

  const { completedSteps, estimatedTotal, percentage } = useMemo(() => {
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

  const isComplete = classification?.isComplete ?? false;
  const finalCode =
    // const finalDescription =
    //   classification?.levels[classification.levels.length - 1]?.selection
    //     ?.description;
    classification?.levels[classification.levels.length - 1]?.selection?.htsno;

  if (isComplete) {
    return (
      <div className="mb-6 rounded-xl border border-success/20 bg-gradient-to-r from-success/[0.06] via-success/[0.03] to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-success/15 shrink-0">
            <CheckCircleIcon className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 justify-between flex-wrap">
              <span className="text-sm font-semibold text-success">
                Classification Complete
              </span>
              {finalCode && (
                <span className="font-mono text-sm font-bold text-base-content">
                  {finalCode}
                </span>
              )}
            </div>
            {/* {finalDescription && (
              <p className="text-xs text-base-content/50 mt-0.5 line-clamp-1">
                {finalDescription}
              </p>
            )} */}
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-success/20 overflow-hidden">
          <div className="h-full w-full rounded-full bg-success" />
        </div>
      </div>
    );
  }

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
