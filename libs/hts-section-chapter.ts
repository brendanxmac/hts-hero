import type { HtsSection } from "../interfaces/hts";

export type SectionChapterMetadata = {
  sectionNumber: number;
  sectionDescription: string;
  chapterDescription: string;
};

export function getSectionAndChapterForElement(
  sections: HtsSection[],
  chapterNumber: number
): SectionChapterMetadata | null {
  for (const section of sections) {
    const chapter = section.chapters.find((ch) => ch.number === chapterNumber);
    if (chapter) {
      return {
        sectionNumber: section.number,
        sectionDescription: section.description,
        chapterDescription: chapter.description,
      };
    }
  }
  return null;
}
