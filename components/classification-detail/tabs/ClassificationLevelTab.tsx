"use client";

import { useMemo } from "react";
import { ClassificationRecord, HtsElement } from "../../../interfaces/hts";
import { VerticalSectionDiscovery } from "../../vertical-flow/VerticalSectionDiscovery";
import { VerticalChapterDiscovery } from "../../vertical-flow/VerticalChapterDiscovery";
import { VerticalClassificationStep } from "../../vertical-flow/VerticalClassificationStep";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../../contexts/SectionChapterDiscoveryContext";
import { useHts } from "../../../contexts/HtsContext";
import {
  getDirectChildrenElements,
  getElementsInChapter,
} from "../../../libs/hts";
import { CheckCircleIcon } from "@heroicons/react/16/solid";
import { getSubGroupName } from "../useClassificationNav";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_ESTIMATED_LEVELS = 4;
const MAX_DEPTH_WALK = 8;

/**
 * Walk down the HTS tree from `element` following the first child at each
 * indent level to estimate how many more selection levels remain.
 */
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

// ---------------------------------------------------------------------------
// ClassificationProgress
// ---------------------------------------------------------------------------

function ClassificationProgress({
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

    // Estimate remaining levels from the last selection
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

    // +1 for the current level that exists but has no selection yet
    const currentLevelPending =
      classification.levels.length > levelsWithSelection ? 1 : 0;
    const futureRemaining = Math.max(
      0,
      estimatedRemaining - currentLevelPending
    );

    const total =
      prelimTotal +
      classification.levels.length +
      futureRemaining;

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completedSteps: completed,
      estimatedTotal: total,
      percentage: pct,
    };
  }, [classification, htsElements]);

  const isComplete = classification?.isComplete ?? false;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-base-content/50">
          {isComplete ? (
            <span className="text-base-content font-semibold">
              Classification Complete
            </span>
          ) : (
            <>
              {/* Step {currentStepNumber} of ~{estimatedTotal} */}
              Classification Progress
            </>
          )}
        </span>
        <span className={`text-[11px] font-semibold text-base-content/40 tabular-nums ${isComplete ? "text-success text-xs" : "text-base-content/40"}`}>
          {isComplete ? classification.levels[classification.levels.length - 1].selection.htsno : `${percentage}%`}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-base-300 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${isComplete ? "bg-success" : "bg-primary"
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StepHeader
// ---------------------------------------------------------------------------

const StepHeader = ({
  stepNumber,
  title,
  description,
  status,
}: {
  stepNumber: number;
  title: string;
  description?: string;
  status: "complete" | "loading" | "action-required" | "pending";
}) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40">
        Step {stepNumber}
      </span>
      {status === "complete" && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 text-[10px] font-semibold text-success">
          <CheckCircleIcon className="w-3 h-3" />
          Done
        </span>
      )}
      {status === "loading" && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
          <span className="loading loading-spinner w-2.5 h-2.5" />
          In Progress
        </span>
      )}
      {status === "action-required" && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-warning/10 text-[10px] font-semibold text-warning">
          Action Required
        </span>
      )}
    </div>
    <h2 className="text-lg md:text-2xl font-bold text-base-content">
      {title}
    </h2>
    <p className="text-sm text-base-content/50 mt-0.5">{description}</p>
  </div>
);

// ---------------------------------------------------------------------------
// ClassificationLevelTab
// ---------------------------------------------------------------------------

interface SectionProps {
  type: "section";
  classificationRecord?: ClassificationRecord;
  onOpenExplore: () => void;
  levelIndex?: never;
}

interface ChapterProps {
  type: "chapter";
  classificationRecord?: ClassificationRecord;
  onOpenExplore: () => void;
  levelIndex?: never;
}

interface LevelProps {
  type: "level";
  levelIndex: number;
  classificationRecord?: ClassificationRecord;
  onOpenExplore: () => void;
}

type Props = SectionProps | ChapterProps | LevelProps;

export const ClassificationLevelTab = (props: Props) => {
  const { classification } = useClassification();
  const { sectionDiscoveryComplete, chapterDiscoveryComplete } =
    useSectionChapterDiscovery();
  const { type, classificationRecord, onOpenExplore } = props;

  if (type === "section") {
    const sectionLevel = classification.preliminaryLevels?.find(
      (l) => l.level === "section"
    );
    const isComplete =
      sectionDiscoveryComplete && (sectionLevel?.candidates.length ?? 0) > 0;
    const candidateCount = sectionLevel?.candidates.length ?? 0;

    const status = isComplete ? "complete" : "loading";
    const description = isComplete
      ? `We found ${candidateCount} HTS section${candidateCount !== 1 ? "s" : ""} relevant to your item. These contain the chapters we'll explore in the next step.`
      : "Analyzing your item description to identify the most relevant HTS sections...";

    return (
      <div>
        <ClassificationProgress currentStepNumber={1} />
        <StepHeader
          stepNumber={1}
          title="Section Discovery"
          description={description}
          status={status}
        />
        <VerticalSectionDiscovery />
      </div>
    );
  }

  if (type === "chapter") {
    const chapterLevel = classification.preliminaryLevels?.find(
      (l) => l.level === "chapter"
    );
    const isComplete =
      chapterDiscoveryComplete && (chapterLevel?.candidates.length ?? 0) > 0;
    const candidateCount = chapterLevel?.candidates.length ?? 0;

    const status = isComplete ? "complete" : "loading";
    const description = isComplete
      ? `We found ${candidateCount} HTS chapter${candidateCount !== 1 ? "s" : ""} within the previously identified sections that are relevant to your item.`
      : "Narrowing down to the most relevant chapters within the identified sections...";

    return (
      <div>
        <ClassificationProgress currentStepNumber={2} />
        <StepHeader
          stepNumber={2}
          title="Chapter Discovery"
          description={description}
          status={status}
        />
        <VerticalChapterDiscovery />
      </div>
    );
  }

  if (type === "level") {
    const { levelIndex } = props;
    const level = classification.levels[levelIndex];
    const stepNumber = levelIndex + 3;

    if (!level) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-base-content/50">
            This classification level has not been reached yet. Complete the
            previous levels first.
          </p>
        </div>
      );
    }

    const getLevelTitle = () => {
      return "Select the candidate that best fits your item"
    };

    const hasSelection = Boolean(level.selection);
    const hasCandidates = (level.candidates?.length ?? 0) > 0;

    const getStatus = (): "complete" | "loading" | "action-required" | "pending" => {
      if (hasSelection) return "complete";
      if (hasCandidates) return "action-required";
      return "loading";
    };

    const getDescription = () => {
      if (hasCandidates) {
        return `Select the candidate that best matches your item.`;
      }
      return "Finding the best candidates for this level...";
    };

    return (
      <div>
        <ClassificationProgress currentStepNumber={stepNumber} />
        <StepHeader
          stepNumber={stepNumber}
          title={getLevelTitle()}
          status={getStatus()}
        />
        <VerticalClassificationStep
          classificationLevel={levelIndex}
          classificationRecord={classificationRecord!}
          onOpenExplore={onOpenExplore}
          disableAutoScroll
        />
      </div>
    );
  }

  return null;
};
