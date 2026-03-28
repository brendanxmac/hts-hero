import Link from "next/link";
import { getFirstChapterOfSection } from "@/libs/hts";
import type { SectionChapterMetadata } from "@/libs/hts-section-chapter";
import { usitcHtsFileViewerTabUrl } from "@/libs/usitc-hts-file-url";

interface SectionChapterNotesSectionProps {
  sectionChapter: SectionChapterMetadata;
  htsno: string;
  chapter: number;
}

export function SectionChapterNotesSection({
  sectionChapter,
  htsno,
  chapter,
}: SectionChapterNotesSectionProps) {
  const firstChapter = getFirstChapterOfSection(sectionChapter.sectionNumber);
  const sectionNoteChapter = firstChapter ?? chapter;
  const chapterNum = chapter;
  const showSeparateSection = sectionNoteChapter !== chapterNum;

  return (
    <section className="rounded-2xl border-2 border-base-content/10 bg-base-100 overflow-hidden shadow-sm mb-8">
      <div className="bg-base-200/40 px-6 py-4 border-b border-base-content/10">
        <h2 className="text-base font-bold text-base-content flex items-center gap-2">
          <svg
            className="w-5 h-5 text-base-content/50 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Section and Chapter Notes Affecting {htsno}
        </h2>
      </div>
      <div className="p-6">
        <p className="text-sm text-base-content/60 mb-4">
          Official USITC notes that may affect the classification of goods under
          HTS {htsno}:
        </p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            {showSeparateSection && (
              <a
                href={usitcHtsFileViewerTabUrl(`Chapter ${sectionNoteChapter}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="grow group flex items-center gap-3 px-4 py-3 rounded-xl border border-base-content/10 hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
              >
                <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
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
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-primary group-hover:underline">
                    Section {sectionChapter.sectionNumber} Notes
                  </span>
                  <span className="text-xs text-base-content/40">
                    {sectionChapter.sectionDescription}
                  </span>
                </div>
                <svg
                  className="w-4 h-4 text-base-content/20 ml-auto group-hover:text-primary transition-colors"
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
              className="grow group flex items-center gap-3 px-4 py-3 rounded-xl border border-base-content/10 hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
            >
              <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
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
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary group-hover:underline">
                  Chapter {chapterNum} Notes
                  {!showSeparateSection && (
                    <> (includes Section {sectionChapter.sectionNumber} Notes)</>
                  )}
                </span>
                <span className="text-xs text-base-content/40">
                  {sectionChapter.chapterDescription}
                </span>
              </div>
              <svg
                className="w-4 h-4 text-base-content/20 ml-auto group-hover:text-primary transition-colors"
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
        </div>
      </div>

      <div className="border-t border-base-content/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-base-content">
            Unsure if These Notes Affect your Product?
          </p>
          <p className="text-xs text-base-content/50">
            Discover potentially relevant legal notes and
            explains how they might affect an HTS Code.
          </p>
        </div>
        <Link href="/classifications/new" className="btn btn-primary">
          Discover Potentially Relevant Notes
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </section>
  );
}
