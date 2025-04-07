"use client";

import {
  HtsElement,
  HtsElementType,
  HtsSection,
  HtsSectionAndChapterBase,
} from "../interfaces/hts";
import { Breadcrumbs } from "./Breadcrumbs";
import { Sections } from "./Sections";
import { Chapter } from "./Chapter";
import { Element } from "./Element";

interface ElementsProps {
  sections: HtsSection[];
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
}

type NavigatableElementType =
  | { type: HtsElementType.SECTION; sections: HtsSection[] }
  | HtsSectionAndChapterBase
  | HtsElement;

export interface NavigatableElement {
  title: string;
  element: NavigatableElementType;
}

export const Elements = ({
  sections,
  breadcrumbs,
  setBreadcrumbs,
}: ElementsProps) => {
  const currentElement = breadcrumbs[breadcrumbs.length - 1];

  if (!currentElement) {
    return;
  }

  return (
    <div className="flex flex-col">
      {breadcrumbs.length > 1 && (
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          setBreadcrumbs={setBreadcrumbs}
        />
      )}

      {currentElement.element.type === HtsElementType.SECTION ? (
        <Sections
          sections={sections}
          breadcrumbs={breadcrumbs}
          setBreadcrumbs={setBreadcrumbs}
        />
      ) : currentElement.element.type === HtsElementType.CHAPTER ? (
        <Chapter
          chapter={currentElement.element as HtsSectionAndChapterBase}
          breadcrumbs={breadcrumbs}
          setBreadcrumbs={setBreadcrumbs}
        />
      ) : (
        <Element
          element={currentElement.element as HtsElement}
          breadcrumbs={breadcrumbs}
          setBreadcrumbs={setBreadcrumbs}
        />
      )}
    </div>
  );
};
