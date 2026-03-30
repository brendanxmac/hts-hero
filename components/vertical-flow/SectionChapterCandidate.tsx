"use client";

import { PreliminaryLevelType } from "../../interfaces/hts";

interface SectionChapterCandidateProps {
  number: number;
  description: string;
  type: PreliminaryLevelType;
  reasoning?: string;
  disabled?: boolean;
  onRemove: () => void;
}

export const SectionChapterCandidate = ({
  number,
  description,
  type,
  reasoning,
  disabled = false,
  onRemove,
}: SectionChapterCandidateProps) => {
  const label = type === "section" ? "Section" : "Chapter";

  return (
    <div
      className={`rounded-lg border border-base-300 bg-base-100 transition-colors duration-150 ${disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="shrink-0 px-2 py-0.5 rounded-md text-xs md:text-sm font-bold bg-primary/10 text-primary border border-primary/20">
            {label} {number}
          </span>
        </div>
        <p className="text-sm md:text-base lg:text-lg leading-relaxed font-medium text-base-content/80">
          {description}
        </p>

        {reasoning && (
          <div className="mt-3 pt-3 border-t border-base-300">
            <p className="text-xs text-base-content/50 leading-relaxed">
              {reasoning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
