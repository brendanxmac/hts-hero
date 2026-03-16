"use client";

import { ClassificationRecord } from "../../../interfaces/hts";
import { VerticalSectionDiscovery } from "../../vertical-flow/VerticalSectionDiscovery";
import { VerticalChapterDiscovery } from "../../vertical-flow/VerticalChapterDiscovery";
import { VerticalClassificationStep } from "../../vertical-flow/VerticalClassificationStep";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useSectionChapterDiscovery } from "../../../contexts/SectionChapterDiscoveryContext";
import { CheckCircleIcon } from "@heroicons/react/16/solid";
import { ClassificationProgress } from "../../classification-ui/ClassificationProgress";

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
      <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-base-content/40">
        Step {stepNumber}
      </span>
      {status === "complete" && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 text-xs font-semibold text-success">
          <CheckCircleIcon className="w-4 h-4" />
          Done
        </span>
      )}
      {status === "action-required" && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-warning/10 text-xs font-semibold text-warning">
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
      <div >
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
      return "Select the candidate that best fits your item";
    };

    const hasSelection = Boolean(level.selection);
    const hasCandidates = (level.candidates?.length ?? 0) > 0;

    const getStatus = (): "complete" | "loading" | "action-required" | "pending" => {
      if (hasSelection) return "complete";
      if (hasCandidates) return "action-required";
      return "loading";
    };

    return (
      <div>
        <ClassificationProgress currentStepNumber={stepNumber} />
        <StepHeader
          stepNumber={stepNumber}
          title={getLevelTitle()}
          description="Our in-depth analysis can help you select the best option"
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
