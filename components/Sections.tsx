"use client";

import { HtsSection } from "../interfaces/hts";
import { Section } from "./Section";
import { NavigatableElement } from "./Elements";
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
  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col">
      {sections.map((section) => {
        return (
          <Section
            key={`section-${section.number}`}
            section={section}
            breadcrumbs={breadcrumbs}
            setBreadcrumbs={setBreadcrumbs}
          />
        );
      })}
    </div>
  );
};
