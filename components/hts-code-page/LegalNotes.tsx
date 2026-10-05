import { ArrowTopRightOnSquareIcon, DocumentTextIcon } from "@heroicons/react/20/solid";
import { getFirstChapterOfSection } from "@/libs/hts";
import { usitcHtsFileViewerTabUrl } from "@/libs/usitc-hts-file-url";
import { mono } from "@/components/ui/font";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import type { SectionChapter } from "./types";

// Links to the USITC's section and chapter notes for this line
export function LegalNotes({
  sectionChapter,
  htsno,
  chapter,
}: {
  sectionChapter: NonNullable<SectionChapter>;
  htsno: string;
  chapter: number;
}) {
  // Section notes are printed with the section's first chapter
  const sectionNoteChapter = getFirstChapterOfSection(sectionChapter.sectionNumber) ?? chapter;
  const links = [
    ...(sectionNoteChapter !== chapter
      ? [{ title: `Section ${sectionChapter.sectionNumber} Notes`, description: sectionChapter.sectionDescription, file: `Chapter ${sectionNoteChapter}` }]
      : []),
    {
      title: `Chapter ${chapter} Notes${sectionNoteChapter === chapter ? ` (includes Section ${sectionChapter.sectionNumber} Notes)` : ""}`,
      description: sectionChapter.chapterDescription,
      file: `Chapter ${chapter}`,
    },
  ];

  return (
    <section id="notes" className="scroll-mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center lg:gap-12">
      <SectionHeader kicker="Legal notes" title="Relevant HTS Notes">
        Official USITC notes that may affect classification under HTS{" "}
        {htsno ? <span className={`${mono.className} font-medium text-base-content`}>{htsno}</span> : "this code"}.
      </SectionHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.title}
            href={usitcHtsFileViewerTabUrl(link.file)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ui.card} group flex items-start gap-3 p-4 transition-colors hover:border-primary/40`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden>
              <DocumentTextIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`${ui.cardTitle} block group-hover:text-primary`}>{link.title}</span>
              <span className={`${ui.bodySm} mt-0.5 block line-clamp-2`}>{link.description}</span>
            </span>
            <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0 text-base-content/60 group-hover:text-primary" aria-hidden />
          </a>
        ))}
      </div>
    </section>
  );
}
