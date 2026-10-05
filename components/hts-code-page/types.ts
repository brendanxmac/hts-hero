// Shapes shared across the /hts/[code] page's components.

// Where a line sits in the schedule; null when its section and chapter aren't known
export type SectionChapter = {
  sectionNumber: number;
  sectionDescription: string;
  chapterDescription: string;
} | null;

// One question and its answer, shown in the FAQ and in its FAQPage schema
export type FaqEntry = [question: string, answer: string];
