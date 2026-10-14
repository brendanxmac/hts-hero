import type { HtsElement, HtsSection, HtsSectionAndChapterBase, Navigatable } from "@/interfaces/hts";

// One stop on the explorer's trail: the list of sections, a chapter, or a line of the schedule
export type NavigatableElementType =
  | { type: Navigatable.SECTIONS; sections: HtsSection[] }
  | HtsSectionAndChapterBase
  | HtsElement;

export interface NavigatableElement {
  title: string;
  element: NavigatableElementType;
}
