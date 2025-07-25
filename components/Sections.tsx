"use client";

import { HtsSection } from "../interfaces/hts";
import { Section } from "./Section";
import { NavigatableElement } from "./Elements";
import { useState } from "react";

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
  const [allExpanded, setAllExpanded] = useState(true);

  if (sections.length === 0) return null;

  return (
    <div className="h-full flex flex-col gap-2">
      <button
        className="btn btn-sm btn-primary w-fit self-end"
        onClick={() => setAllExpanded(!allExpanded)}
      >
        {allExpanded ? "Collapse All Sections" : "Expand All Sections"}
      </button>

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
  );
};
