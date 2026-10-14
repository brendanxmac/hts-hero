"use client";

import { ReactNode } from "react";
import { ChevronRightIcon, PlusIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useClassification } from "@/contexts/ClassificationContext";
import { HtsElement } from "@/interfaces/hts";
import { MarkdownProse } from "@/components/MarkdownProse";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { isTariffLevel, useExplorer } from "./useExplorer";

// One line of the schedule in a list: its code and description, what's under it, and a way in.
// Over a calculator, codes with a duty get a "Use" button that puts them straight in the input
// bar. In a classification, headings can be added to or removed from its candidates.
export const CodeRow = ({
  element,
  onOpen,
  above,
  meta,
  highlighted = false,
  selected = false,
}: {
  element: HtsElement;
  onOpen: () => void;
  // Shown over the code, like where a search result sits in the schedule
  above?: ReactNode;
  // Shown before the arrow, like how many codes are under it
  meta?: ReactNode;
  // Picked with the keyboard
  highlighted?: boolean;
  // Shown in the panel beside the list
  selected?: boolean;
}) => {
  const { applyCode } = useExplorer();
  const { classification } = useClassification();
  const { htsno, description } = element;
  // A short rate only; Chapter 99 lines carry sentences in the rate column
  const rate = element.general && element.general.length <= 14 ? element.general : null;
  const recommended = classification?.levels[0]?.analysisElement?.uuid === element.uuid;

  return (
    <li
      className={`group relative flex items-stretch transition-colors ${selected ? "bg-primary/10" : highlighted ? "bg-tt-soft" : "hover:bg-tt-soft"}`}
      data-highlighted={highlighted || undefined}
    >
      {selected && <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-primary" aria-hidden />}
      <CandidateToggle element={element} />
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        aria-current={selected || undefined}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 px-5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {above}
          <div className="flex min-w-0 flex-col gap-0.5 2xl:flex-row 2xl:items-baseline 2xl:gap-4">
            {/* A line with no code of its own ("Men's or boys'") just groups the codes under it */}
            <span className={`${mono.className} shrink-0 text-sm 2xl:w-36 font-semibold tabular-nums text-primary ${htsno ? "" : "hidden 2xl:block"}`}>
              {htsno}
            </span>
            <span className={`min-w-0 text-sm leading-snug ${htsno ? "text-base-content" : "font-semibold text-base-content/70"}`}>
              {description}
            </span>
          </div>
          {recommended && classification?.levels[0]?.analysisReason && (
            <div className={`${tt.tile} mt-2 p-4 2xl:ml-40`}>
              <span className={`${tt.eyebrow("primary")} mb-1 flex items-center gap-1.5`}>
                <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
                HTS Hero Analysis
              </span>
              <MarkdownProse size="sm" className="prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1 first:prose-headings:mt-0">
                {classification.levels[0].analysisReason}
              </MarkdownProse>
            </div>
          )}
        </div>

        {meta}
        {rate && (
          <span className="hidden shrink-0 rounded-full bg-tt-soft px-2.5 py-0.5 text-xs font-semibold tabular-nums text-base-content group-hover:bg-base-100 sm:inline">
            {rate}
          </span>
        )}
        {applyCode && isTariffLevel(element) && (
          <button
            type="button"
            className={`${ui.button({ variant: "secondary", size: "sm" })} group-hover:border-primary/40 group-hover:text-primary`}
            onClick={(e) => {
              e.stopPropagation();
              applyCode(element);
            }}
            title={`Use ${htsno} in the calculator`}
          >
            <PlusIcon className="h-3.5 w-3.5" aria-hidden />
            Use
          </button>
        )}
        <ChevronRightIcon
          className="h-5 w-5 shrink-0 text-base-content/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </div>
    </li>
  );
};

// In a classification, a heading can be added to (or taken out of) the first level's candidates
export const CandidateToggle = ({ element }: { element: HtsElement }) => {
  const { classification, updateLevel } = useClassification();
  const level = classification?.levels[0];
  if (!level || element.indent !== "0" || element.chapter == 98 || element.chapter == 99) return null;

  const isCandidate = level.candidates.some((c) => c.uuid === element.uuid);
  return (
    <button
      type="button"
      className={`flex w-12 shrink-0 items-center justify-center border-r border-base-300 transition-colors ${
        isCandidate ? "bg-error/10 text-error hover:bg-error/20" : "bg-success/10 text-success hover:bg-success/20"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        updateLevel(0, {
          candidates: isCandidate
            ? level.candidates.filter((c) => c.uuid !== element.uuid)
            : [...level.candidates, element],
        });
      }}
      title={isCandidate ? "Remove from candidates" : "Add to candidates"}
    >
      {isCandidate ? <XMarkIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
    </button>
  );
};

// A list of rows in a panel
export const rowList = "divide-y divide-base-300";
