"use client";

import { ClassificationProgression } from "../../interfaces/hts";

interface Props {
  levels: ClassificationProgression[];
}

/**
 * Collapsed summary for Classification Details section
 * Shows the HTS code path with each selected code and full description
 */
export function ClassificationDetailsSummary({ levels }: Props) {
  // Filter to only levels that have a selection
  const selectionsWithData = levels
    .filter((level) => level.selection?.htsno)
    .map((level) => ({
      htsno: level.selection!.htsno,
      description: level.selection!.description,
    }));

  if (selectionsWithData.length === 0) {
    return (
      <div className="text-sm text-base-content/50 italic">
        No selections made yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {selectionsWithData.map((selection) => (
        <div key={selection.htsno} className="flex items-start gap-3">
          {/* HTS Code */}
          <span className="shrink-0 font-mono text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
            {selection.htsno}
          </span>
          {/* Description - wraps to new lines */}
          <span className="text-sm text-base-content/70 leading-relaxed pt-0.5">
            {selection.description}
          </span>
        </div>
      ))}
    </div>
  );
}
