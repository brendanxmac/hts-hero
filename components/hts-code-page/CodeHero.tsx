import type { HtsElement } from "@/interfaces/hts";
import { formatDutyPct, formatSummaryDate, HtsDutySummary } from "@/libs/hts-duty-summary";
import type { CodeRateChanges } from "@/libs/hts-rate-changes";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import type { SectionChapter } from "./types";

// The top of the page: the code, its readable name, and where it sits in the schedule
export function CodeHero({
  element,
  productName,
  summary,
  parents,
  sectionChapter,
  subCodeCount,
  lead,
  alternateFormats = false,
  rateChanges,
  answer,
  updatedOn,
}: {
  element: HtsElement;
  productName: string;
  summary: HtsDutySummary | null;
  parents: HtsElement[];
  sectionChapter: SectionChapter;
  subCodeCount: number;
  // A sentence that says what the line is better than its place in the schedule does (a modeled
  // Chapter 99 heading's program, rate and status)
  lead?: string;
  // The other ways the code is typed into a search box (3926909989, 3926.90.9989)
  alternateFormats?: boolean;
  // How often the duty from one country has changed, as a sentence an answer can quote
  rateChanges?: { country: string; changes: CodeRateChanges } | null;
  // The page's lead answer (the "As of …, US imports of … pay …" sentence for China, also in Duty
  // by Country), up top where readers and answer engines look first
  answer?: string | null;
  // When the page's data was last checked, for a page without a duty summary (a Chapter 99 heading)
  updatedOn?: string | null;
}) {
  const formats = alternateFormats ? otherFormats(element.htsno) : [];
  const path = [
    ...(sectionChapter ? [sectionChapter.sectionDescription, sectionChapter.chapterDescription] : []),
    ...parents.map((p) => p.description),
  ];

  return (
    <div className="flex flex-col gap-3">
      <span className={tt.eyebrow("primary")}>
        HTS Code{element.chapter ? ` · Chapter ${element.chapter}` : ""}
        {summary ? <> · Updated {formatSummaryDate(summary.asOf)}</> : updatedOn ? <> · Updated {formatSummaryDate(updatedOn)}</> : null}
      </span>
      <h1 className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className={`${mono.className} text-3xl sm:text-4xl sm:leading-10 font-semibold leading-none tracking-tight text-primary`}>
          {element.htsno}
        </span>
        <span className={`${tt.display} text-2xl lg:text-3xl lg:leading-9 font-semibold leading-tight tracking-tight text-base-content`}>
          {productName}
        </span>
      </h1>
      {formats.length > 0 && (
        <p className="m-0 text-xs text-base-content/60">
          Also written{" "}
          {formats.map((f, i) => (
            <span key={f}>
              {i > 0 && " and "}
              <span className={mono.className}>{f}</span>
            </span>
          ))}
        </p>
      )}
      {lead ? (
        <p className="m-0 text-base leading-relaxed text-base-content/80">{lead}</p>
      ) : (
      <p className="text-sm leading-relaxed text-base-content/70">
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
      )}
      {answer && <p className="m-0 rounded-xl bg-tt-soft px-4 py-3 text-base leading-relaxed text-base-content">{answer}</p>}
      {rateChanges && <RateChangesLine htsno={element.htsno} {...rateChanges} />}
    </div>
  );
}

// "3926.90.99.89" is also searched as 3926909989 and, as CBP writes it, 3926.90.9989
const otherFormats = (htsno: string) => {
  const digits = htsno.replace(/\D/g, "");
  if (digits.length < 6 || !htsno.includes(".")) return [];
  const formats = [digits];
  if (digits.length === 10) formats.push(`${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`);
  return formats.filter((f) => f !== htsno);
};

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

// "From China, the total duty on 7318.15.80 last changed on Apr 6, 2026, from 43.5% to 83.5%. It
// has changed 2 times since Nov 17, 2025."
function RateChangesLine({ htsno, country, changes }: { htsno: string; country: string; changes: CodeRateChanges }) {
  const times = `${changes.changes} time${changes.changes === 1 ? "" : "s"}`;
  return (
    <p className="m-0 text-sm leading-relaxed text-base-content/80">
      {changes.last ? (
        <>
          From {country}, the total duty on {htsno} last changed on{" "}
          <strong className="font-semibold text-base-content">{shortDate(changes.last.date)}</strong>, from{" "}
          {formatDutyPct(changes.last.beforePct)} to{" "}
          <strong className="font-semibold text-base-content">{formatDutyPct(changes.last.afterPct)}</strong>. It has changed{" "}
          {times} since {shortDate(changes.since)}.
        </>
      ) : (
        <>From {country}, the total duty on {htsno} hasn&apos;t changed since {shortDate(changes.since)}.</>
      )}
    </p>
  );
}

const Chevron = () => (
  <span className="mx-1.5 text-base-content/60" aria-hidden="true">›</span>
);
