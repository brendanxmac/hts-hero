"use client";

import { ClassificationRecord } from "../../../interfaces/hts";
import { VerticalSectionDiscovery } from "../../vertical-flow/VerticalSectionDiscovery";
import { VerticalChapterDiscovery } from "../../vertical-flow/VerticalChapterDiscovery";
import { VerticalClassificationStep } from "../../vertical-flow/VerticalClassificationStep";
import { useClassification } from "../../../contexts/ClassificationContext";

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
  const { type, classificationRecord, onOpenExplore } = props;

  if (type === "section") {
    const sectionLevel = classification.preliminaryLevels?.find(
      (l) => l.level === "section"
    );

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-base-content">
            Section Discovery
          </h2>
          <p className="text-sm text-base-content/60 mt-1">
            Identify the most relevant HTS section for this item.
          </p>
        </div>
        <VerticalSectionDiscovery
          startExpanded={!sectionLevel || sectionLevel.candidates.length === 0}
        />
      </div>
    );
  }

  if (type === "chapter") {
    const chapterLevel = classification.preliminaryLevels?.find(
      (l) => l.level === "chapter"
    );

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-base-content">
            Chapter Discovery
          </h2>
          <p className="text-sm text-base-content/60 mt-1">
            Narrow down to the correct HTS chapter for this item.
          </p>
        </div>
        <VerticalChapterDiscovery
          startExpanded={
            !chapterLevel || chapterLevel.candidates.length === 0
          }
        />
      </div>
    );
  }

  if (type === "level") {
    const { levelIndex } = props;
    const level = classification.levels[levelIndex];

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

    const getLevelTitle = (index: number) => {
      const selection = level.selection;
      if (index === 0) return "Heading Selection (4-digit)";
      if (index === 1) return "Subheading Selection (6-digit)";

      if (selection && !selection.htsno) return "Pre-Qualifier Selection";

      const htsno = selection?.htsno || "";
      const digits = htsno.replace(/\./g, "").length;
      if (digits === 8) return "US Subheading Selection (8-digit)";
      if (digits === 10) return "Statistical Suffix Selection (10-digit)";

      return `Level ${index + 1} Selection`;
    };

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-base-content">
            {getLevelTitle(levelIndex)}
          </h2>
          <p className="text-sm text-base-content/60 mt-1">
            {level.selection
              ? "This level is complete. You can review or change your selection."
              : "Select the most appropriate candidate for this classification level."}
          </p>
        </div>
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
