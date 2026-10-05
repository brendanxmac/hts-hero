import type { HtsElement } from "@/interfaces/hts";
import { formatSummaryDate, HtsDutySummary } from "@/libs/hts-duty-summary";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import type { SectionChapter } from "./types";

// The top of the page: the code, its readable name, and where it sits in the schedule
export function CodeHero({
  element,
  productName,
  summary,
  parents,
  sectionChapter,
  subCodeCount,
}: {
  element: HtsElement;
  productName: string;
  summary: HtsDutySummary | null;
  parents: HtsElement[];
  sectionChapter: SectionChapter;
  subCodeCount: number;
}) {
  const path = [
    ...(sectionChapter ? [sectionChapter.sectionDescription, sectionChapter.chapterDescription] : []),
    ...parents.map((p) => p.description),
  ];

  return (
    <div className="flex flex-col gap-3">
      <span className={ui.kicker}>
        HTS Code{element.chapter ? ` · Chapter ${element.chapter}` : ""}
        {summary && <> · Updated {formatSummaryDate(summary.asOf)}</>}
      </span>
      <h1 className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className={`${mono.className} text-3xl sm:text-4xl font-semibold leading-none tracking-tight text-primary`}>
          {element.htsno}
        </span>
        <span className="text-2xl lg:text-3xl font-semibold leading-tight tracking-tight text-base-content">
          {productName}
        </span>
      </h1>
      <p className="max-w-3xl text-sm leading-relaxed text-base-content/70">
        HTS Code {element.htsno} covers any article best defined as{" "}
        {path.map((text, i) => (
          <span key={i}>
            {i > 0 && <Chevron />}
            {text}
          </span>
        ))}
        <Chevron />
        <strong className="font-semibold text-base-content">{element.description}</strong>
        {" "}in the Harmonized Tariff Schedule
        {subCodeCount > 0 && (
          <> — covering {subCodeCount} sub-classification{subCodeCount !== 1 ? "s" : ""}</>
        )}
        .
      </p>
    </div>
  );
}

const Chevron = () => (
  <span className="mx-1.5 text-base-content/60" aria-hidden="true">›</span>
);
