import { getFirstChapterOfSection } from "@/libs/hts";
import type { SectionChapterMetadata } from "@/libs/hts-section-chapter";
import { usitcHtsFileViewerTabUrl } from "@/libs/usitc-hts-file-url";

interface SectionChapterNoteLinksProps {
  sectionChapter: SectionChapterMetadata;
  chapter: number;
  /** When false, uses tighter spacing for embedded panels (e.g. classification step). */
  compact?: boolean;
}

export function SectionChapterNoteLinks({
  sectionChapter,
  chapter,
  compact = false,
}: SectionChapterNoteLinksProps) {
  const firstChapter = getFirstChapterOfSection(sectionChapter.sectionNumber);
  const sectionNoteChapter = firstChapter ?? chapter;
  const chapterNum = chapter;
  const showSeparateSection = sectionNoteChapter !== chapterNum;

  const gridGap = compact ? "gap-2" : "gap-3";
  const cardPad = compact ? "px-3 py-2.5" : "px-4 py-3";
  const iconWrap = compact ? "w-8 h-8" : "w-9 h-9";

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gridGap} w-full`}>
      {showSeparateSection && (
        <a
          href={usitcHtsFileViewerTabUrl(`Chapter ${sectionNoteChapter}`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`grow group flex items-center gap-3 ${cardPad} rounded-xl border border-base-content/10 hover:border-primary/30 hover:bg-primary/[0.03] transition-all`}
        >
          <span
            className={`shrink-0 ${iconWrap} rounded-lg bg-primary/10 flex items-center justify-center`}
          >
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-primary group-hover:underline">
              Section {sectionChapter.sectionNumber} Notes
            </span>
            <span className="text-xs text-base-content/40 line-clamp-2">
              {sectionChapter.sectionDescription}
            </span>
          </div>
          <svg
            className="w-4 h-4 text-base-content/20 ml-auto shrink-0 group-hover:text-primary transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}

      <a
        href={usitcHtsFileViewerTabUrl(`Chapter ${chapterNum}`)}
        target="_blank"
        rel="noopener noreferrer"
        className={`grow group flex items-center gap-3 ${cardPad} rounded-xl border border-base-content/10 hover:border-primary/30 hover:bg-primary/[0.03] transition-all`}
      >
        <span
          className={`shrink-0 ${iconWrap} rounded-lg bg-primary/10 flex items-center justify-center`}
        >
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-primary group-hover:underline">
            Chapter {chapterNum} Notes
            {!showSeparateSection && (
              <> (includes Section {sectionChapter.sectionNumber} Notes)</>
            )}
          </span>
          <span className="text-xs text-base-content/40 line-clamp-2">
            {sectionChapter.chapterDescription}
          </span>
        </div>
        <svg
          className="w-4 h-4 text-base-content/20 ml-auto shrink-0 group-hover:text-primary transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
}
