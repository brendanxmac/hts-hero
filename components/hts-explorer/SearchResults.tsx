"use client";

import { Fragment, useEffect, useRef } from "react";
import { toRoman } from "@javascript-packages/roman-numerals";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { useHts } from "@/contexts/HtsContext";
import { useHtsSections } from "@/contexts/HtsSectionsContext";
import { HtsElement } from "@/interfaces/hts";
import { getHtsElementParents, getSectionAndChapterFromChapterNumber } from "@/libs/hts";
import { mono } from "@/components/ui/font";
import { CodeRow, rowList } from "./CodeRow";
import { EmptyMessage } from "./EmptyMessage";
import { lineKey, useExplorer } from "./useExplorer";

// Lines matching the search, each with where it sits in the schedule above it; the one selected
// shows in the panel beside them
export const SearchResults = ({
  query,
  results,
  highlighted,
  onOpen,
}: {
  query: string;
  results: HtsElement[];
  // The result picked with the arrow keys
  highlighted: number;
  onOpen: (element: HtsElement) => void;
}) => {
  const listRef = useRef<HTMLUListElement>(null);
  const previous = useRef(highlighted);

  // Keep the result picked with the keyboard in view (not the first one a new search starts on)
  useEffect(() => {
    if (highlighted !== previous.current) {
      listRef.current?.querySelector("[data-highlighted]")?.scrollIntoView({ block: "nearest" });
    }
    previous.current = highlighted;
  }, [highlighted]);

  const { selectedKey } = useExplorer();

  return results.length > 0 ? (
    <ul ref={listRef} className={rowList}>
      {results.map((element, i) => (
        <CodeRow
          key={element.uuid}
          element={element}
          highlighted={i === highlighted}
          selected={selectedKey === lineKey(element)}
          onOpen={() => onOpen(element)}
          above={<WhereItSits element={element} />}
        />
      ))}
    </ul>
  ) : (
    <EmptyMessage
      title="No codes found"
      description={`Nothing in the schedule matches "${query}". Try another word, or fewer digits of the code.`}
    />
  );
};

// "XI › Ch 61 › 6109 › 6109.10.00", trimmed to fit
const WhereItSits = ({ element }: { element: HtsElement }) => {
  const { htsElements } = useHts();
  const { sections } = useHtsSections();
  const sectionAndChapter = getSectionAndChapterFromChapterNumber(sections, Number(element.chapter));
  const parents = getHtsElementParents(element, htsElements);
  const steps = [
    ...(sectionAndChapter
      ? [
          { label: toRoman(sectionAndChapter.section.number), title: sectionAndChapter.section.description },
          { label: `Ch ${sectionAndChapter.chapter.number}`, title: sectionAndChapter.chapter.description },
        ]
      : []),
    ...parents.map((p) => ({ label: p.htsno || p.description, title: p.description, code: Boolean(p.htsno) })),
  ];

  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-base-content/60">
      {steps.map((step, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRightIcon className="h-3 w-3 shrink-0 text-base-content/50" aria-hidden />}
          <span title={step.title} className={`max-w-56 truncate ${"code" in step && step.code ? mono.className : ""}`}>
            {step.label}
          </span>
        </Fragment>
      ))}
    </span>
  );
};
