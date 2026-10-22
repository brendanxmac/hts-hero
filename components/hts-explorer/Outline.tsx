"use client";

import { ReactNode, useEffect, useMemo, useRef } from "react";
import { toRoman } from "@javascript-packages/roman-numerals";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { useHts } from "@/contexts/HtsContext";
import { useHtsSections } from "@/contexts/HtsSectionsContext";
import { HtsElement, HtsSection, HtsSectionAndChapterBase } from "@/interfaces/hts";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { CandidateToggle } from "./CodeRow";
import { chapterKey, lineKey, sectionKey, useExplorer } from "./useExplorer";

// The whole schedule as one outline: sections open to chapters, chapters to headings, headings
// to the lines under them, all in place. Opening or selecting a row never moves the list; the
// selection shows in the panel beside it. Only rows brought in from elsewhere (a search result,
// the path, a link) are scrolled to, and only when they're out of sight.

// Each chapter's lines arranged under their headings, built once per chapter on first opening.
// The schedule is in order, so a line's parent is the nearest line above it with a lower indent.
type ChapterLines = { roots: HtsElement[]; children: Map<string, HtsElement[]> };

const arrange = (lines: HtsElement[]): ChapterLines => {
  const roots: HtsElement[] = [];
  const children = new Map<string, HtsElement[]>();
  const above: HtsElement[] = [];
  for (const line of lines) {
    while (above.length && Number(above[above.length - 1].indent) >= Number(line.indent)) above.pop();
    const parent = above[above.length - 1];
    if (parent) {
      if (!children.has(parent.uuid)) children.set(parent.uuid, []);
      children.get(parent.uuid)!.push(line);
    } else {
      roots.push(line);
    }
    above.push(line);
  }
  return { roots, children };
};

type Row =
  | { kind: "section"; key: string; depth: number; section: HtsSection }
  | { kind: "chapter"; key: string; depth: number; chapter: HtsSectionAndChapterBase }
  | { kind: "line"; key: string; depth: number; line: HtsElement; chapter: number; count: number };

export const Outline = () => {
  const { htsElements } = useHts();
  const { sections } = useHtsSections();
  const { expanded, reveal, setReveal, selectedKey } = useExplorer();
  const listRef = useRef<HTMLUListElement>(null);

  // Chapter number → its lines, filled as chapters are opened
  const byChapter = useMemo(() => new Map<number, ChapterLines>(), [htsElements]);
  const linesOf = (chapter: number) => {
    if (!byChapter.has(chapter)) byChapter.set(chapter, arrange(htsElements.filter((e) => Number(e.chapter) === chapter)));
    return byChapter.get(chapter)!;
  };

  // The rows on screen, in order
  const rows: Row[] = [];
  for (const section of sections) {
    rows.push({ kind: "section", key: sectionKey(section.number), depth: 0, section });
    if (!expanded.has(sectionKey(section.number))) continue;
    for (const chapter of section.chapters) {
      rows.push({ kind: "chapter", key: chapterKey(chapter.number), depth: 1, chapter });
      if (!expanded.has(chapterKey(chapter.number))) continue;
      const { roots, children } = linesOf(chapter.number);
      const walk = (lines: HtsElement[], depth: number) => {
        for (const line of lines) {
          const under = children.get(line.uuid) ?? [];
          rows.push({ kind: "line", key: lineKey(line), depth, line, chapter: chapter.number, count: under.length });
          if (under.length && expanded.has(lineKey(line))) walk(under, depth + 1);
        }
      };
      walk(roots, 2);
    }
  }

  // Bring a row chosen elsewhere into view, once it's drawn, if it's out of sight
  useEffect(() => {
    if (!reveal) return;
    const row = listRef.current?.querySelector<HTMLElement>(`[data-row="${reveal.key}"]`);
    if (!row) return;
    setReveal(null);
    if (!isInView(row)) row.scrollIntoView({ block: "center" });
  });

  // Coming back from a search, show where the selection is
  useEffect(() => {
    if (selectedKey && !reveal) setReveal({ key: selectedKey, at: Date.now() });
    // On arrival only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ul ref={listRef} className="py-1.5">
      {rows.map((row) =>
        row.kind === "section" ? (
          <SectionRow key={row.key} row={row} />
        ) : row.kind === "chapter" ? (
          <ChapterRow key={row.key} row={row} />
        ) : (
          <LineRow key={row.key} row={row} />
        )
      )}
    </ul>
  );
};

// Whether a row is fully visible in whatever scrolls it (the dialog's column, or the page)
const isInView = (row: HTMLElement) => {
  const rect = row.getBoundingClientRect();
  let el = row.parentElement;
  while (el) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") {
      const box = el.getBoundingClientRect();
      return rect.top >= box.top && rect.bottom <= box.bottom;
    }
    el = el.parentElement;
  }
  // The page, under the outline's sticky header
  return rect.top >= 120 && rect.bottom <= window.innerHeight;
};

// The shared shape of a row: indent guides, an arrow to open it, then its content
const RowShell = ({
  rowKey,
  depth,
  expandable,
  open,
  selected,
  onToggle,
  onSelect,
  before,
  children,
  after,
  label,
}: {
  rowKey: string;
  depth: number;
  expandable: boolean;
  open: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  before?: ReactNode;
  children: ReactNode;
  after?: ReactNode;
  label: string;
}) => (
  <li
    data-row={rowKey}
    className={`group relative flex items-stretch pr-3 transition-colors ${
      selected ? "bg-primary/10" : "hover:bg-tt-soft"
    }`}
  >
    {/* The selection's mark down the left edge */}
    {selected && <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-primary" aria-hidden />}
    {before}
    <span className="w-3 shrink-0" aria-hidden />
    {/* One guide per level, so it's clear what each line sits under */}
    {Array.from({ length: depth }, (_, i) => (
      <span key={i} className="relative w-6 shrink-0" aria-hidden>
        <span className="absolute inset-y-0 left-3 w-px bg-base-300" />
      </span>
    ))}
    {expandable ? (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`${open ? "Close" : "Open"} ${label}`}
        className="flex w-6 shrink-0 items-start justify-center pt-3 text-base-content/60 hover:text-primary"
      >
        <ChevronRightIcon className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
    ) : (
      <span className="w-6 shrink-0" aria-hidden />
    )}
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected || undefined}
      className="flex min-w-0 flex-1 items-start gap-3 py-2.5 pl-1 text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
    >
      {children}
    </button>
    {after && <span className="flex shrink-0 items-start gap-2 pt-2">{after}</span>}
  </li>
);

const SectionRow = ({ row }: { row: Extract<Row, { kind: "section" }> }) => {
  const { expanded, toggle } = useExplorer();
  const { section } = row;
  const open = expanded.has(row.key);
  const first = section.chapters[0]?.number;
  const last = section.chapters[section.chapters.length - 1]?.number;
  return (
    <RowShell
      rowKey={row.key}
      depth={row.depth}
      expandable
      open={open}
      selected={false}
      onToggle={() => toggle(row.key)}
      onSelect={() => toggle(row.key)}
      label={`Section ${toRoman(section.number)}`}
    >
      <span
        className={`${tt.display} mt-px flex h-6 min-w-9 shrink-0 items-center justify-center rounded-lg px-1.5 text-xs ${weight(open)} ${
          open ? "bg-primary text-primary-content" : "bg-tt-soft text-base-content/70 group-hover:bg-base-100"
        }`}
      >
        {toRoman(section.number)}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm leading-snug text-base-content ${weight(open)}`}>{section.description}</span>
        <span className="block text-xs text-base-content/60">{first === last ? `Chapter ${first}` : `Chapters ${first}–${last}`}</span>
      </span>
    </RowShell>
  );
};

// Only what's open (and the line selected) is bold, extra bold, so the way down to a line stands
// out; the rest is regular
const weight = (open: boolean) => (open ? "font-extrabold" : "font-normal");

const ChapterRow = ({ row }: { row: Extract<Row, { kind: "chapter" }> }) => {
  const { expanded, toggle, selectedKey, navigate, trailToChapter } = useExplorer();
  const { chapter } = row;
  const selected = selectedKey === row.key;
  const open = expanded.has(row.key);
  return (
    <RowShell
      rowKey={row.key}
      depth={row.depth}
      expandable
      open={expanded.has(row.key)}
      selected={selected}
      onToggle={() => toggle(row.key)}
      onSelect={() =>
        selected
          ? toggle(row.key)
          : navigate(trailToChapter(chapter), "deeper_chapter", { chapter_number: chapter.number }, false)
      }
      label={`Chapter ${chapter.number}`}
    >
      <span
        className={`${tt.display} mt-px flex h-6 w-12 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-xs tabular-nums ${weight(open)} ${
          selected ? "bg-primary text-primary-content" : "bg-primary/10 text-primary"
        }`}
      >
        Ch {chapter.number}
      </span>
      <span className={`min-w-0 flex-1 text-sm leading-snug text-base-content ${weight(open)}`}>
        {chapter.description}
      </span>
    </RowShell>
  );
};

const LineRow = ({ row }: { row: Extract<Row, { kind: "line" }> }) => {
  const { expanded, toggle, selectedKey, navigate, trailTo } = useExplorer();
  const { line, count } = row;
  const selected = selectedKey === row.key;
  const open = count > 0 && expanded.has(row.key);
  // The line being looked at is bold too, at the end of the bold path down to it
  const bold = open || selected;
  // A short rate only; Chapter 99 lines carry sentences in the rate column
  const rate = line.general && line.general.length <= 14 ? line.general : null;
  const select = () => {
    if (selected) {
      if (count) toggle(row.key);
      return;
    }
    const trail = trailTo(line);
    if (trail)
      navigate(trail, line.indent === "0" ? "deeper_heading" : "deeper_child", { hts_code: line.htsno || null, chapter_number: row.chapter }, false);
  };

  return (
    <RowShell
      rowKey={row.key}
      depth={row.depth}
      expandable={count > 0}
      open={expanded.has(row.key)}
      selected={selected}
      onToggle={() => toggle(row.key)}
      onSelect={select}
      label={line.htsno || line.description}
      // In a classification, headings can be added to its candidates
      before={<CandidateToggle element={line} />}
      after={
        <>
          {rate && (
            <span className="hidden rounded-full bg-tt-soft px-2 py-0.5 text-xs tabular-nums text-base-content/80 group-hover:bg-base-100 xl:inline">
              {rate}
            </span>
          )}
        </>
      }
    >
      {line.htsno ? (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 2xl:flex-row 2xl:gap-3">
          <span className={`${mono.className} shrink-0 text-sm tabular-nums text-primary 2xl:w-32 ${weight(bold)}`}>{line.htsno}</span>
          <span className={`min-w-0 text-sm leading-snug text-base-content ${weight(bold)}`}>{line.description}</span>
        </span>
      ) : (
        // A line with no code of its own ("Men's or boys'") just groups the lines under it
        <span className={`min-w-0 flex-1 text-sm leading-snug text-base-content/70 ${weight(bold)}`}>{line.description}</span>
      )}
      {count > 0 && !expanded.has(row.key) && (
        <span className="mt-0.5 shrink-0 text-xs tabular-nums text-base-content/60">{count}</span>
      )}
    </RowShell>
  );
};
