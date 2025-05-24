"use client";

import {
  HtsElement,
  Navigatable,
  HtsSection,
  HtsSectionAndChapterBase,
} from "../interfaces/hts";
import { Breadcrumbs } from "./Breadcrumbs";
import { Sections } from "./Sections";
import { Chapter } from "./Chapter";
import { Element } from "./Element";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";

interface ElementsProps {
  sections: HtsSection[];
}

export type NavigatableElementType =
  | { type: Navigatable.SECTIONS; sections: HtsSection[] }
  | HtsSectionAndChapterBase
  | HtsElement;

export interface NavigatableElement {
  title: string;
  element: NavigatableElementType;
}

export const Elements = ({ sections }: ElementsProps) => {
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const currentElement = breadcrumbs[breadcrumbs.length - 1];

  if (!currentElement) {
    return;
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {breadcrumbs.length > 1 && (
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          setBreadcrumbs={setBreadcrumbs}
        />
      )}

      {currentElement.element.type === Navigatable.SECTIONS ? (
        <Sections
          sections={sections}
          breadcrumbs={breadcrumbs}
          setBreadcrumbs={setBreadcrumbs}
        />
      ) : currentElement.element.type === Navigatable.CHAPTER ? (
        <Chapter chapter={currentElement.element as HtsSectionAndChapterBase} />
      ) : (
        <Element element={currentElement.element as HtsElement} />
      )}
    </div>
  );
};
