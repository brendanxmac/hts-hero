import Link from "next/link";
import type { SectionChapterMetadata } from "@/libs/hts-section-chapter";
import { SectionChapterNoteLinks } from "./SectionChapterNoteLinks";

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
          Section and Chapter Notes for {htsno ? <span className="text-primary">{htsno}</span> : 'This Code'}
        </h2>
      </div>
      <div className="p-6">
        <p className="text-sm text-base-content/60 mb-4">
          Official USITC notes that may affect the classification of goods under
          HTS {htsno}:
        </p>
        <div className="flex flex-col gap-3">
          <SectionChapterNoteLinks
            sectionChapter={sectionChapter}
            chapter={chapter}
          />
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
