"use client";

import { useEffect, useMemo, useRef } from "react";
import type { HtsElement } from "@/interfaces/hts";
import { useHtsSections } from "@/contexts/HtsSectionsContext";
import { getSectionAndChapterForElement } from "@/libs/hts-section-chapter";
import { SectionChapterNoteLinks } from "@/components/SectionChapterNoteLinks";

interface VerticalCandidateLegalNotesTabProps {
  candidates: HtsElement[];
}

export function VerticalCandidateLegalNotesTab({
  candidates,
}: VerticalCandidateLegalNotesTabProps) {
  const { sections, loading, getSections } = useHtsSections();
  const loadAttemptedRef = useRef(false);

  useEffect(() => {
    if (sections.length > 0 || loading || loadAttemptedRef.current) {
      return;
    }
    loadAttemptedRef.current = true;
    void getSections();
  }, [sections.length, loading, getSections]);

  const groups = useMemo(() => {
    const byChapter = new Map<
      number,
      { chapter: number; htsnos: string[] }
    >();

    for (const c of candidates) {
      const ch = c.chapter;
      if (!byChapter.has(ch)) {
        byChapter.set(ch, { chapter: ch, htsnos: [] });
      }
      if (c.htsno?.trim()) {
        byChapter.get(ch)!.htsnos.push(c.htsno.trim());
      }
    }

    for (const g of Array.from(byChapter.values())) {
      g.htsnos = Array.from(new Set(g.htsnos));
    }

    return Array.from(byChapter.values()).sort((a, b) => a.chapter - b.chapter);
  }, [candidates]);

  if (candidates.length === 0) {
    return (
      <div className="rounded-lg border border-base-300 overflow-hidden">
        <div className="flex">
          <div className="w-1 bg-base-300 shrink-0" />
          <div className="p-4 flex-1">
            <p className="text-xs text-base-content/40 italic">
              Add candidates to see section and chapter note links.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && sections.length === 0) {
    return (
      <p className="text-xs text-base-content/50">Loading section data…</p>
    );
  }

  if (!loading && sections.length === 0) {
    return (
      <p className="text-xs text-base-content/50">
        Section and chapter metadata is not available yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-base-content/70">
        Official USITC notes for the options shown. Links are grouped
        when candidates share the same chapter.
      </p>
      <div className="flex flex-col gap-3">
        {groups.map(({ chapter, htsnos }) => {
          const sectionChapter = getSectionAndChapterForElement(
            sections,
            chapter
          );

          return (
            <div
              key={chapter}
              className="rounded-lg border border-base-300 overflow-hidden"
            >
              <div className="flex">
                <div className="w-1 bg-primary/30 shrink-0" />
                <div className="p-4 flex-1 min-w-0 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs font-semibold text-base-content/70">Notes for</span>
                    {htsnos.length > 0 ? (
                      htsnos.map((code) => (
                        <span
                          key={code}
                          className="text-xs font-mono px-1.5 py-0.5 rounded-md bg-base-200/80 text-primary/90 font-semibold"
                        >
                          {code}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-base-content/40 italic">
                        No HTS number on candidate
                      </span>
                    )}
                  </div>

                  {!sectionChapter ? (
                    <p className="text-xs text-base-content/45">
                      No section metadata found for chapter {chapter}.
                    </p>
                  ) : (
                    <SectionChapterNoteLinks
                      sectionChapter={sectionChapter}
                      chapter={chapter}
                      compact
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
