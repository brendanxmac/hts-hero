import Link from "next/link";
import { DocumentTextIcon } from "@heroicons/react/16/solid";
import type { SectionChapterMetadata } from "@/libs/hts-section-chapter";
import { SectionChapterNoteLinks } from "./SectionChapterNoteLinks";
import { ExplorerDetailSection } from "./ExplorerDetailSection";

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
    <ExplorerDetailSection
      className="min-w-0 md:flex-1"
      title="Notes"
      icon={<DocumentTextIcon className="h-4 w-4" />}
      description={
        <>
          Official USITC notes that may affect classification under HTS{" "}
          {htsno ? (
            <span className="font-mono font-semibold text-primary">{htsno}</span>
          ) : (
            "this code"
          )}
          .
        </>
      }
    // footer={
    //   <>
    //     <div>
    //       <p className="text-sm font-semibold text-base-content">
    //         Unsure if these notes affect your product?
    //       </p>
    //       <p className="text-xs text-base-content/50">
    //         Discover potentially relevant legal notes and see how they might
    //         affect an HTS code.
    //       </p>
    //     </div>
    //     <Link href="/classifications/new" className="btn btn-primary">
    //       Discover potentially relevant notes
    //       <span aria-hidden="true">&rarr;</span>
    //     </Link>
    //   </>
    // }
    >
      <div className="flex flex-col gap-3">
        <SectionChapterNoteLinks
          sectionChapter={sectionChapter}
          chapter={chapter}
        />
      </div>
    </ExplorerDetailSection>
  );
}
