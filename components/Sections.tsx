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
  const [allExpanded, setAllExpanded] = useState(false);

  if (sections.length === 0) return null;

  return (
    <div className="h-full flex flex-col gap-4">
      <button
        className="btn btn-link btn-primary p-0 btn-xs w-fit self-end"
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
