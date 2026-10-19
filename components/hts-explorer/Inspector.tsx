"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { toRoman } from "@javascript-packages/roman-numerals";
import { Menu } from "@headlessui/react";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ChevronDownIcon,
  CursorArrowRaysIcon,
  DocumentTextIcon,
  LinkIcon,
  ListBulletIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "@heroicons/react/16/solid";
import { useHts } from "@/contexts/HtsContext";
import { useHtsSections } from "@/contexts/HtsSectionsContext";
import { HtsElement, HtsSectionAndChapterBase, Navigatable } from "@/interfaces/hts";
import { getHtsElementParents, getTariffElement } from "@/libs/hts";
import { getSectionAndChapterForElement } from "@/libs/hts-section-chapter";
import { isValidTenDigitHtsInput } from "@/libs/hts-code";
import { microEstimate } from "@/libs/hts-micro-estimate";
import { normalizeUsitcHtsFileName, openUsitcHtsFileInNewTab, sectionNotesUsitcFileName } from "@/libs/usitc-hts-file-url";
import { NoteI, notes, NoteType } from "@/public/notes/notes";
import { estimateSurface, markCalculatorHandoff } from "@/components/duty-calculator/lib/analytics";
import { todayIso } from "@/components/duty-calculator/lib/format";
import { MicroCalculator } from "@/components/hts-code-page/MicroCalculator";
import { RelatedCrossRulingsSection } from "@/components/RelatedCrossRulingsSection";
import { UsitcHtsDocumentLink } from "@/components/UsitcHtsDocumentLink";
import { copyToClipboard } from "@/utilities/data";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CodeNotes, CodePath } from "./CodePath";
import { RatesPanel } from "./RatesPanel";
import { isTariffLevel, sectionOfChapter, useExplorer } from "./useExplorer";

// The panel beside the outline: whatever is selected there (or in the search results), in full.
// It scrolls on its own, back to its top for each new selection, so the outline never moves.
export const Inspector = ({ className = "" }: { className?: string }) => {
  const { selected, selectedKey } = useExplorer();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
    // On a phone the panel sits under the list, so take the reader to it
    if (!first.current && selectedKey && window.innerWidth < 1024) ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    first.current = false;
  }, [selectedKey]);

  return (
    <div ref={ref} className={className}>
      {!selected ? (
        <NothingSelected />
      ) : selected.element.type === Navigatable.CHAPTER ? (
        <ChapterDetail chapter={selected.element as HtsSectionAndChapterBase} />
      ) : (
        <LineDetail key={selectedKey} element={selected.element as HtsElement} />
      )}
    </div>
  );
};

const NothingSelected = () => {
  const { applyCode } = useExplorer();
  const tips = [
    "Open a section, then a chapter, to drill down. Each level opens in place, so you never lose your spot.",
    "Select any line to see its rates, a duty estimate, notes and CBP rulings here.",
    applyCode
      ? "Press Use on any 8- or 10-digit code to put it in the calculator."
      : "Search by product or code above to jump straight to a line.",
  ];
  return (
    <div className={`${tt.panel} flex flex-col gap-5 px-6 py-7 lg:px-8`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
        <CursorArrowRaysIcon className="h-5 w-5" />
      </span>
      <div>
        <h3 className={`${tt.display} text-xl font-semibold text-base-content`}>Pick a line to see it here</h3>
        <p className="mt-1 text-sm text-base-content/70">The Harmonized Tariff Schedule, from its 22 sections down to every 10-digit code.</p>
      </div>
      <ol className="flex flex-col gap-3">
        {tips.map((tip, i) => (
          <li key={tip} className="flex items-start gap-3 text-sm text-base-content">
            <span className={`${tt.display} flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tt-soft text-xs font-semibold`}>
              {i + 1}
            </span>
            {tip}
          </li>
        ))}
      </ol>
    </div>
  );
};

const ChapterDetail = ({ chapter }: { chapter: HtsSectionAndChapterBase }) => {
  const { sections } = useHtsSections();
  const { htsElements } = useHts();
  const { showInSchedule } = useExplorer();
  const section = sectionOfChapter(sections, chapter.number);
  const notesFile = section ? sectionNotesUsitcFileName(section.number) : null;
  const headings = useMemo(
    () => htsElements.filter((e) => Number(e.chapter) === chapter.number && e.indent === "0").length,
    [htsElements, chapter.number]
  );

  return (
    <div className={`${tt.panel} flex flex-col gap-5 px-6 py-6 lg:px-8 lg:py-7`}>
      <div>
        <span className={tt.eyebrow("primary")}>
          Chapter {chapter.number}
          {section && ` · Section ${toRoman(section.number)}`}
        </span>
        <h3 className={`${tt.display} mt-1 text-2xl font-semibold leading-tight tracking-tight text-base-content`}>{chapter.description}</h3>
        {section && <p className="mt-1.5 text-sm text-base-content/70">{section.description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ChapterNotes chapter={chapter.number} />
        {notesFile && section && (
          <UsitcHtsDocumentLink fileName={notesFile} className={ui.button({ variant: "secondary", size: "sm" })} title={`Section ${section.number} notes (USITC)`}>
            <DocumentTextIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
            Section {toRoman(section.number)} notes
          </UsitcHtsDocumentLink>
        )}
        {showInSchedule && (
          <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={showInSchedule}>
            <ListBulletIcon className="h-3.5 w-3.5" aria-hidden />
            Show in the schedule
          </button>
        )}
      </div>
      <p className={`${tt.tile} px-4 py-3 text-sm text-base-content/80`}>
        {headings} {headings === 1 ? "heading" : "headings"} in this chapter. Open them in the list to drill down to a code.
      </p>
    </div>
  );
};

const openNote = (note: NoteI | undefined, missing: string) => {
  const file = note ? normalizeUsitcHtsFileName(note.fileName) : null;
  if (file) openUsitcHtsFileInNewTab(file);
  else toast.error(missing);
};

// A chapter's notes. Chapters 98 and 99 are split into subchapters, each with its own notes.
const ChapterNotes = ({ chapter }: { chapter: number }) => {
  const subchapterNotes = useMemo(
    () => notes.filter((n) => n.title.includes(`Chapter ${chapter}`) && (n.type === NoteType.CHAPTER || n.type === NoteType.SUBCHAPTER)),
    [chapter]
  );

  if (chapter !== 98 && chapter !== 99) {
    return (
      <button
        type="button"
        className={ui.button({ variant: "secondary", size: "sm" })}
        onClick={() => openNote(notes.find((n) => n.title === `Chapter ${chapter}`), "No notes found for this chapter")}
      >
        <DocumentTextIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
        Chapter notes
      </button>
    );
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className={ui.button({ variant: "secondary", size: "sm" })}>
        <DocumentTextIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
        Chapter notes
        <ChevronDownIcon className="h-3.5 w-3.5 text-base-content/60" aria-hidden />
      </Menu.Button>
      <Menu.Items className="absolute left-0 z-20 mt-2 max-h-80 w-80 overflow-y-auto rounded-2xl border border-base-300 bg-base-100 p-1.5 shadow-xl focus:outline-hidden">
        {subchapterNotes.length > 0 ? (
          subchapterNotes.map((note) => (
            <Menu.Item key={note.title}>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => openNote(note, "No document available for this note")}
                  className={`flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left ${active ? "bg-tt-soft" : ""}`}
                >
                  <span className="text-sm font-semibold text-base-content">{note.title}</span>
                  <span className="text-xs text-base-content/60">{note.description}</span>
                </button>
              )}
            </Menu.Item>
          ))
        ) : (
          <p className="px-3 py-2.5 text-sm text-base-content/60">No notes found</p>
        )}
      </Menu.Items>
    </Menu>
  );
};

// One line of the schedule: what it is and what sits above it, what to do with it, then a duty
// estimate, its rates, path, notes and CBP rulings
const LineDetail = ({ element }: { element: HtsElement }) => {
  const { htsElements } = useHts();
  const { sections } = useHtsSections();
  const { breadcrumbs, applyCode } = useExplorer();
  const { htsno, chapter } = element;

  const parents = useMemo(() => getHtsElementParents(element, htsElements), [element, htsElements]);
  const tariffElement = getTariffElement(element, htsElements, breadcrumbs) || element;
  const sectionChapter = useMemo(() => getSectionAndChapterForElement(sections, chapter), [sections, chapter]);
  const usable = isTariffLevel(element);
  const hasRates = Boolean(tariffElement.general || tariffElement.special || tariffElement.other || tariffElement.additionalDuties);
  // The engine estimates Chapters 1–97; 98 and 99 are the provisions it adds on top
  const estimable = usable && parseInt(htsno.slice(0, 2), 10) < 98;

  return (
    <div className="flex flex-col gap-4">
      <header className={`${tt.panel} flex flex-col gap-4 px-6 py-6 lg:px-7`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <span className={`${tt.eyebrow("primary")} pt-1.5`}>
              {usable ? "HTS code" : element.indent === "0" ? "Heading" : "Subheading"}
              {chapter ? ` · Chapter ${chapter}` : ""}
            </span>
            {htsno && <CopyLink htsno={htsno} />}
          </div>
          {/* What it sits under, since a line's own words ("Other") often mean little alone */}
          {parents.length > 0 && (
            <p className="text-sm leading-snug text-base-content/60">
              {parents.map((p, i) => (
                <span key={p.uuid}>
                  {i > 0 && <span className="mx-1.5 text-base-content/50">›</span>}
                  {p.description}
                </span>
              ))}
            </p>
          )}
          <h3 className="flex flex-col gap-1.5">
            {htsno && (
              <span className={`${mono.className} text-3xl font-semibold leading-none tracking-tight text-primary`}>{htsno}</span>
            )}
            <span className={`${tt.display} text-xl font-semibold leading-snug text-base-content`}>{element.description}</span>
          </h3>
        </div>
        <LineActions element={element} usable={usable} />
        {applyCode && !usable && (
          <p className="text-sm text-base-content/70">
            Duty is set on 8- and 10-digit codes. Open this line in the list to pick one under it.
          </p>
        )}
      </header>

      {estimable && (
        <div className="flex flex-col gap-2">
          <Estimate element={element} tariffElement={tariffElement} onUseCode={applyCode ? () => applyCode(element) : undefined} />
          <p className="px-2 text-xs text-base-content/60">
            We can make mistakes and don&apos;t guarantee complete or correct calculations. If you see an issue, please{" "}
            <a href="mailto:support@htshero.com" className="font-semibold text-primary hover:underline">
              let us know
            </a>{" "}
            and we&apos;ll correct it for everyone.
          </p>
        </div>
      )}

      {/* One column, each panel its full height, so none leaves a gap beside a taller one */}
      {hasRates && <RatesPanel element={element} tariffElement={tariffElement} />}
      {sectionChapter && <CodePath element={element} sectionChapter={sectionChapter} />}
      {sectionChapter && chapter && <CodeNotes sectionChapter={sectionChapter} chapter={Number(chapter)} />}

      {htsno && (
        <section aria-labelledby="explorer-rulings" className={`${tt.panel} overflow-hidden`}>
          <div className="border-b border-base-300 px-6 py-4">
            <h4 id="explorer-rulings" className={tt.title}>
              Related CROSS rulings
            </h4>
            <p className="mt-0.5 text-xs text-base-content/60">
              How CBP classified similar products under{" "}
              <span className={`${mono.className} font-semibold text-base-content`}>{htsno}</span>. Open one to read the ruling.
            </p>
          </div>
          <div className="p-5">
            <RelatedCrossRulingsSection htsno={htsno} bare initialCount={4} />
          </div>
        </section>
      )}
    </div>
  );
};

// A link back to this line in the explorer, for sharing
const CopyLink = ({ htsno }: { htsno: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const link = `${window.location.origin}/explore?${new URLSearchParams({ code: htsno })}`;
    if (await copyToClipboard(link)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };
  return (
    <button type="button" className={`${ui.button({ variant: "ghost", size: "sm" })} -mr-2 -mt-1`} onClick={copy}>
      {copied ? <CheckIcon className="h-3.5 w-3.5 text-success" aria-hidden /> : <LinkIcon className="h-3.5 w-3.5" aria-hidden />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
};

// Use it (over a calculator) or calculate its duty, confirm it's the right code with the
// classification assistant, or (from a search) find it in the schedule
const LineActions = ({ element, usable }: { element: HtsElement; usable: boolean }) => {
  const { applyCode, showInSchedule } = useExplorer();
  const htsno = element.htsno?.trim();
  // The assistant confirms full 10-digit codes
  const confirmable = htsno && isValidTenDigitHtsInput(htsno) && !htsno.startsWith("98") && !htsno.startsWith("99");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {usable && applyCode && (
        <button type="button" className={ui.button({ variant: "primary" })} onClick={() => applyCode(element)}>
          <PlusIcon className="h-4 w-4" aria-hidden />
          Use this code
        </button>
      )}
      {usable && !applyCode && htsno && !htsno.startsWith("98") && !htsno.startsWith("99") && (
        <Link
          href={`/duty-calculator?code=${htsno}`}
          rel="nofollow"
          onClick={() => markCalculatorHandoff(htsno, estimateSurface("explorer"))}
          className={ui.button({ variant: "primary" })}
        >
          Calculate total duty
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      )}
      {confirmable && (
        <Link
          href={`/classifications/new?${new URLSearchParams({ code: htsno })}`}
          target="_blank"
          className={ui.button({ variant: "secondary" })}
          title="Check this code against your product with the classification assistant"
        >
          <ShieldCheckIcon className="h-4 w-4 text-success" aria-hidden />
          Confirm this classification
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-base-content/60" aria-hidden />
        </Link>
      )}
      {showInSchedule && (
        <button type="button" className={ui.button({ variant: "ghost" })} onClick={showInSchedule}>
          <ListBulletIcon className="h-4 w-4" aria-hidden />
          Show in the schedule
        </button>
      )}
    </div>
  );
};

// The quick duty estimate from the code pages, starting on China, the most-looked-up origin
const Estimate = ({
  element,
  tariffElement,
  onUseCode,
}: {
  element: HtsElement;
  tariffElement: HtsElement;
  onUseCode?: () => void;
}) => {
  const baseRates = { general: tariffElement.general, special: tariffElement.special, other: tariffElement.other };
  const initial = useMemo(
    () => microEstimate({ htsCode: element.htsno, baseRates, country: "CN", asOf: todayIso() }),
    // Once per code; the detail is keyed by it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return <MicroCalculator htsno={element.htsno} baseRates={baseRates} initial={initial} inExplorer onUseCode={onUseCode} />;
};
