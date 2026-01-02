"use client";

import { TrashIcon } from "@heroicons/react/24/solid";

interface SectionChapterCandidateProps {
  number: number;
  description: string;
  type: "section" | "chapter";
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
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 bg-base-100 border border-base-content/15 ${
        disabled ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      <div className="relative z-10 p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Number Badge */}
            <span className="shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold bg-primary/20 text-primary border border-primary/30">
              {label} {number}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-lg bg-base-content/10 hover:bg-error/15 border border-transparent hover:border-error/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
              title="Remove"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <TrashIcon className="h-4 w-4 text-base-content/60 hover:text-error" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-base leading-relaxed font-bold">{description}</p>

        {/* Reasoning (if provided) */}
        {reasoning && (
          <div className="mt-4 border-t border-base-content/10 pt-4">
            <div className="relative overflow-hidden rounded-xl bg-base-200/50 border border-base-content/10 p-4">
              <p className="text-sm text-base-content/80 leading-relaxed">
                {reasoning}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

