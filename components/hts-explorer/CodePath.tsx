"use client";

import { toRoman } from "@javascript-packages/roman-numerals";
import { ArrowTopRightOnSquareIcon, DocumentTextIcon } from "@heroicons/react/16/solid";
import { HtsElement } from "@/interfaces/hts";
import { getFirstChapterOfSection, getHtsElementParents } from "@/libs/hts";
import type { SectionChapterMetadata } from "@/libs/hts-section-chapter";
import { usitcHtsFileViewerTabUrl } from "@/libs/usitc-hts-file-url";
import { useHts } from "@/contexts/HtsContext";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { sectionKey, useExplorer } from "./useExplorer";

// The path through the schedule to a line, each step a way back up to it in the outline
export const CodePath = ({ element, sectionChapter }: { element: HtsElement; sectionChapter: SectionChapterMetadata }) => {
  const { htsElements } = useHts();
  const { trailTo, navigate, setExpanded, setReveal } = useExplorer();
  const parents = getHtsElementParents(element, htsElements);
  const trail = trailTo(element);

  // Each step and how much of the trail it keeps: the sections, the chapter, then each line
  const steps = [
    { code: `Section ${toRoman(sectionChapter.sectionNumber)}`, description: sectionChapter.sectionDescription, keep: 1 },
    { code: `Chapter ${element.chapter}`, description: sectionChapter.chapterDescription, keep: 2 },
    ...[...parents, element].map((line, i) => ({ code: line.htsno, description: line.description, keep: 3 + i })),
  ];

  return (
    <section aria-labelledby="explorer-path" className={`${tt.panel} overflow-hidden`}>
      <div className="border-b border-base-300 px-6 py-4">
        <h4 id="explorer-path" className={tt.title}>
          Path
        </h4>
        <p className="mt-0.5 text-xs text-base-content/60">How the schedule leads to {element.htsno || "this line"}</p>
      </div>
      <ol className="px-3 py-3">
        {steps.map((step, i) => {
          const current = i === steps.length - 1;
          return (
            <li key={i} className="relative">
              {/* The line joining each step to the next */}
              {!current && <span className="absolute bottom-[-0.7rem] left-[0.9rem] top-[1.7rem] w-px bg-base-300" aria-hidden />}
              <button
                type="button"
                disabled={current || !trail}
                onClick={() => {
                  if (!trail) return;
                  // A section isn't something to select: open it in the outline and show it there
                  if (i === 0) {
                    const key = sectionKey(sectionChapter.sectionNumber);
                    setExpanded((prev) => new Set(prev).add(key));
                    setReveal({ key, at: Date.now() });
                    return;
                  }
                  navigate(trail.slice(0, step.keep), "hts_path", {
                    hts_path_index: i,
                    hts_code: element.htsno || null,
                    chapter_number: Number(element.chapter) || null,
                  });
                }}
                className="group relative flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition-colors enabled:hover:bg-tt-soft"
              >
                <span
                  className={`mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                    current ? "bg-primary ring-4 ring-primary/20" : "border-2 border-base-300 bg-base-100 group-hover:border-primary"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0">
                  {step.code && (
                    <span
                      className={`block text-xs font-semibold ${current ? "text-primary" : "text-base-content/70 group-hover:text-primary"} ${
                        /\d\.\d|^\d{4}$/.test(step.code) ? mono.className : ""
                      }`}
                    >
                      {step.code}
                    </span>
                  )}
                  <span className={`block text-sm leading-snug ${current ? "font-semibold text-base-content" : "text-base-content/80"}`}>
                    {step.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

// The USITC's section and chapter notes for a line: official text that may affect its classification
export const CodeNotes = ({ sectionChapter, chapter }: { sectionChapter: SectionChapterMetadata; chapter: number }) => {
  // Section notes are printed with the section's first chapter
  const sectionNoteChapter = getFirstChapterOfSection(sectionChapter.sectionNumber) ?? chapter;
  const links = [
    ...(sectionNoteChapter !== chapter
      ? [{ title: `Section ${toRoman(sectionChapter.sectionNumber)} notes`, description: sectionChapter.sectionDescription, file: `Chapter ${sectionNoteChapter}` }]
      : []),
    {
      title: `Chapter ${chapter} notes${sectionNoteChapter === chapter ? ` (with Section ${toRoman(sectionChapter.sectionNumber)})` : ""}`,
      description: sectionChapter.chapterDescription,
      file: `Chapter ${chapter}`,
    },
  ];

  return (
    <section aria-labelledby="explorer-notes" className={`${tt.panel} overflow-hidden`}>
      <div className="border-b border-base-300 px-6 py-4">
        <h4 id="explorer-notes" className={tt.title}>
          Relevant HTS notes
        </h4>
        <p className="mt-0.5 text-xs text-base-content/60">Official USITC notes that may affect classification</p>
      </div>
      <ul className="divide-y divide-base-300">
        {links.map((link) => (
          <li key={link.title}>
            <a
              href={usitcHtsFileViewerTabUrl(link.file)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-tt-soft"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                <DocumentTextIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-base-content group-hover:text-primary">{link.title}</span>
                <span className="block text-xs leading-snug text-base-content/60 line-clamp-2">{link.description}</span>
              </span>
              <ArrowTopRightOnSquareIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-base-content/60 group-hover:text-primary" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};
