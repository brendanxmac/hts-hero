"use client";

import { HtsSection } from "../interfaces/hts";
import { Section } from "./Section";
import { NavigatableElement } from "./Elements";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";

interface SectionsProps {
  sections: HtsSection[];
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

export const Sections = ({
  sections,
  breadcrumbs,
  setBreadcrumbs,
}: SectionsProps) => {
  const [allExpanded, setAllExpanded] = useState(false);

  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
            {sections.length} Sections
          </span>
        </div>
      <button
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-all duration-200"
        onClick={() => setAllExpanded(!allExpanded)}
      >
          {allExpanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" />
              Expand All
            </>
          )}
      </button>
      </div>

      {/* Sections List */}
      <div className="flex flex-col gap-3">
      {sections.map((section) => {
        return (
          <Section
            key={`section-${section.number}-${allExpanded}`}
            section={section}
            breadcrumbs={breadcrumbs}
            setBreadcrumbs={setBreadcrumbs}
            allExpanded={allExpanded}
          />
        );
      })}
      </div>
    </div>
  );
};
