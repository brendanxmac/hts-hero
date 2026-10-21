"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { Countries } from "@/constants/countries";
import { HtsElement } from "@/interfaces/hts";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { readRecentLookups, RecentLookup } from "@/libs/recent-lookups";
import { itemKey, NewProduct, realItems } from "../catalog";
import { Columns, downloadCsvTemplate, ParsedImport, parseTable, tableFromText } from "../csv";
import { parseCatalog } from "../parse";
import { DetectedColumns, detectColumns, pickSheet, readSpreadsheet, SheetTable } from "../spreadsheet";
import { useTracker } from "../TrackerContext";
import { ADD_STEP, delay, HowTo, Key, SheetIllustration, StepHeading } from "./parts";
import { Fixing, ReviewPanel, useReview } from "./ReviewPanel";
import { applyFixes, Fix, Fixes } from "./fixes";
import { SheetReview } from "./SheetReview";
import { AiTidy } from "./AiTidy";

// The three ways to add imports, each a page of its own: what to do on the left, step by step and
// drawn, and on the right the input and, as soon as there's something in it, what will be added.

export type AddMethod = "recent" | "paste" | "file";
export type OnAdd = (products: NewProduct[], method: AddMethod) => void;

const n = (count: number) => count.toLocaleString("en-US");

// How tall the instructions column is while the two columns sit side by side (null when stacked),
// so an input beside it can match it
const useSideBySideHeight = () => {
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const l = left.current;
    const r = right.current;
    if (!l || !r) return;
    const measure = () => setHeight(l.offsetTop === r.offsetTop ? l.offsetHeight : null);
    const observer = new ResizeObserver(measure);
    observer.observe(l);
    measure();
    return () => observer.disconnect();
  }, []);
  return { left, right, height };
};

// The page: back to the other ways, the instructions, the input, and the button that adds them.
// `children` can take the instructions column's height, to match an input to it.
const AddLayout = ({
  eyebrow,
  title,
  lead,
  instructions,
  children,
  count,
  onAdd,
  onBack,
  footnote,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  instructions: ReactNode;
  children: ReactNode | ((sideHeight: number | null) => ReactNode);
  count: number;
  onAdd: () => void;
  onBack: () => void;
  footnote?: ReactNode;
}) => {
  const side = useSideBySideHeight();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-base-content/60 hover:text-base-content"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Back
      </button>
      <div className="grid gap-12 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div ref={side.left} className="flex flex-col gap-8 self-start">
          <StepHeading eyebrow={eyebrow} title={title} lead={lead} size="md" />
          {instructions}
        </div>
        <div ref={side.right} className="tt-ob-rise flex flex-col gap-4" style={delay(120)}>
          {typeof children === "function" ? children(side.height) : children}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-4">
            <span className="text-sm text-base-content/60">{footnote}</span>
            <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} px-7`} disabled={count === 0} onClick={onAdd}>
              {count === 0 ? "Track my imports" : `Track ${n(count)} ${count === 1 ? "import" : "imports"}`}
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Recent searches ──

// The calculator lookups on this device that aren't tracked yet
export const useRecentToAdd = () => {
  const { items } = useTracker();
  const [lookups, setLookups] = useState<RecentLookup[]>([]);
  useEffect(() => setLookups(readRecentLookups()), []);
  return useMemo(() => {
    const have = new Set(realItems(items).map(itemKey));
    return lookups.filter((l) => !have.has(itemKey(l)));
  }, [lookups, items]);
};

export const RecentStep = ({ onAdd, onBack }: { onAdd: OnAdd; onBack: () => void }) => {
  const lookups = useRecentToAdd();
  const [off, setOff] = useState<Set<string>>(new Set());
  const picked = lookups.filter((l) => !off.has(itemKey(l)));
  const toggle = (key: string) =>
    setOff((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <AddLayout
      eyebrow={`Step ${ADD_STEP} · Your recent searches`}
      title="Start with what you've already looked up."
      lead="These are the imports you checked in the duty calculator on this device. Keep the ones you actually import; you can add the rest of your list right after."
      instructions={
        <HowTo
          steps={[
            "Untick anything you don't import.",
            "Track them. Each gets today's duty and alerts on every change.",
            "Add the rest of your list whenever it suits you.",
          ]}
        />
      }
      count={picked.length}
      onAdd={() => {
        onAdd(
          picked.map((l) => ({ code: l.code, country: l.country })),
          "recent",
        );
        trackEvent(MixpanelEvent.TARIFF_TRACKER_LOOKUPS_ADDED, {
          added: picked.length,
          offered: lookups.length,
          from: "onboarding",
        });
      }}
      onBack={onBack}
      footnote={`${n(picked.length)} of ${n(lookups.length)} picked`}
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        {lookups.map((l, i) => {
          const key = itemKey(l);
          const on = !off.has(key);
          const country = Countries.find((c) => c.code === l.country);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(key)}
              className={`tt-ob-rise flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 ${on ? "border-success bg-success/10" : "border-base-300 bg-base-100 hover:border-base-content/30"
                }`}
              style={delay(160 + i * 40)}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${on ? "border-success bg-success text-success-content" : "border-base-300"}`}
                aria-hidden
              >
                {on && <CheckIcon className="h-3.5 w-3.5" />}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className={`${mono.className} text-sm font-bold text-base-content`}>{l.htsno}</span>
                <span className="truncate text-xs text-base-content/70">
                  <span className="text-base-content">
                    {country?.flag} {country?.name ?? l.country}
                  </span>{" "}
                  · {l.pct.toFixed(1)}% duty
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </AddLayout>
  );
};

// Only the code and the country are read: whatever else is in the file (prices, suppliers,
// quantities) is never read into anything, so it can't stop a row and is never kept
export const onlyCodeAndCountry = (columns: Columns): Columns => ({
  code: columns.code,
  country: columns.country,
});

// What happens to the rest of the file, said plainly: people hesitate to hand over a spreadsheet
// full of prices and suppliers. True by construction: the file is read in the browser
// (spreadsheet.ts) and only code + country pairs reach the catalog (onlyCodeAndCountry).
export const PrivacyNote = () => (
  <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/5 p-4">
    <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
    <p className="m-0 text-sm leading-relaxed text-base-content/80">
      <strong className="font-semibold text-base-content">Your file stays private.</strong> It&apos;s read right here in your browser and never uploaded. We
      keep only the HTS codes and countries of origin; prices, suppliers, descriptions and every other column are thrown away, never saved. No need to delete
      anything first.
    </p>
  </div>
);

// The rows that couldn't be read, fixed in place (FixEditor): the fixes, the list with them applied,
// and what the review needs to show the editor. A new list (other text, file, sheet or columns)
// starts over.
const useFixing = (parsed: ParsedImport<HtsElement>, findElement: (digits: string) => HtsElement | undefined) => {
  const [fixes, setFixes] = useState<Fixes>({});
  const [source, setSource] = useState(parsed);
  if (source !== parsed) {
    setSource(parsed);
    setFixes({});
  }
  const applied = useMemo(() => applyFixes(parsed, fixes, findElement), [parsed, fixes, findElement]);
  const onFix = useCallback(
    (line: number, fix: Fix | undefined) =>
      setFixes((prev) => {
        const next = { ...prev };
        if (fix) next[line] = fix;
        else delete next[line];
        return next;
      }),
    [],
  );
  const onFixMany = useCallback((many: Fixes) => setFixes((prev) => ({ ...prev, ...many })), []);
  const fixing: Fixing = { original: parsed.errors, fixes, skipped: applied.skipped, onFix, onFixMany };
  return { fixed: applied.parsed, fixing };
};

// ── Paste ──

// A pasted list: as a table when its columns can be found (any order, extra columns, a header),
// else line by line, code then country
const parsePasted = (text: string, findElement: (digits: string) => HtsElement | undefined): ParsedImport<HtsElement> => {
  const rows = tableFromText(text);
  const found = detectColumns(rows);
  return found ? parseTable(rows, found.headerIndex, onlyCodeAndCountry(found.columns), findElement) : parseCatalog(text, findElement);
};

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

// A paste that's a table (copied cells, or a CSV), to check and fix the way an upload is
// (SheetReview): its columns, if they can be found. A line or two typed by hand stays in the box.
const pastedTable = (text: string): { rows: string[][]; columns: DetectedColumns | null } | null => {
  const rows = tableFromText(text);
  const filled = rows.filter((r) => r.some((c) => c?.trim()));
  if (filled.length < 2 || Math.max(...filled.map((r) => r.length)) < 2) return null;
  return { rows, columns: detectColumns(rows) };
};

const PASTED = "Your pasted list";

export const PasteStep = ({ onAdd, onBack, few = false }: { onAdd: OnAdd; onBack: () => void; few?: boolean }) => {
  const { findElement } = useTracker();
  const [text, setText] = useState("");
  const [table, setTable] = useState<SheetTable[]>([]);
  const [columns, setColumns] = useState<DetectedColumns | null>(null);
  const [picking, setPicking] = useState(false);
  const parsed = useMemo(() => parsePasted(text, findElement), [text, findElement]);
  const { fixed, fixing } = useFixing(parsed, findElement);
  const review = useReview(fixed);
  // This computer's modifier key first, the other platform's after it, for anyone copying on another machine
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(isMac()), []);
  const mod = mac ? "⌘" : "Ctrl";
  const other = mac ? { key: "Ctrl", on: "Windows" } : { key: "⌘", on: "a Mac" };

  // Pasting into an empty box (or over all of it): a table goes to the sheet review
  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const box = e.currentTarget;
    if (box.value && !(box.selectionStart === 0 && box.selectionEnd === box.value.length)) return;
    const found = pastedTable(e.clipboardData.getData("text/plain"));
    if (!found) return;
    e.preventDefault();
    setTable([{ name: PASTED, rows: found.rows }]);
    setColumns(found.columns ?? { headerIndex: 0, columns: {} });
    setPicking(!found.columns);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
      step: "paste_read",
      rows: found.rows.length,
      detected: Boolean(found.columns),
    });
  };

  if (table.length && columns) {
    return (
      <SheetReview
        file={PASTED}
        pasted
        sheets={table}
        sheet={0}
        onSheet={() => undefined}
        columns={columns}
        onColumns={setColumns}
        picking={picking}
        onPicking={setPicking}
        onReplace={() => {
          setTable([]);
          setColumns(null);
          setText("");
        }}
        onBack={onBack}
        onAdd={(products) => onAdd(products, "paste")}
        findElement={findElement}
      />
    );
  }

  return (
    <AddLayout
      eyebrow={`Step ${ADD_STEP} · Paste a list`}
      title={few ? "Start with the ones you know." : "Copy two columns, paste them here."}
      lead={
        few
          ? "Type or paste the imports you know off the top of your head, one per line. A few is plenty to start: add the rest when you have your list."
          : "From any spreadsheet, email or document. We'll find the HTS codes and countries, whatever order they're in."
      }
      instructions={
        <div className="flex flex-col gap-6">
          <HowTo
            steps={[
              "Open the spreadsheet with your products in it.",
              <>
                Select the <strong className="text-base-content">HTS code</strong> and <strong className="text-base-content">country of origin</strong> columns.
                Not side by side? Hold <Key>{mod}</Key> to pick both (<Key>{other.key}</Key> on {other.on}).
              </>,
              <>
                Copy with <Key>{mod}</Key> <Key>C</Key>, click the box and paste with <Key>{mod}</Key> <Key>V</Key>.{" "}
                <span className="text-base-content/60">
                  On {other.on}: <Key>{other.key}</Key> <Key>C</Key> and <Key>{other.key}</Key> <Key>V</Key>.
                </span>
              </>,
            ]}
          />
          <SheetIllustration caption="Only the two highlighted columns matter. Headers and other columns are fine." wait={420} />
          {!few && <AiTidy />}
        </div>
      }
      count={review.products.length}
      onAdd={() => onAdd(review.products, "paste")}
      onBack={onBack}
      footnote="Codes: 8 or 10 digits. Countries: name or two-letter code."
    >
      <>
        <label htmlFor="tt-ob-paste" className="sr-only">
          Your imports, one per line: HTS code and country of origin
        </label>
        <textarea
          id="tt-ob-paste"
          className={`${ui.textarea} ${mono.className} h-52 resize-y py-3.5 text-sm leading-relaxed`}
          spellCheck={false}
          autoComplete="off"
          autoFocus
          placeholder={"HTS Code         Country of Origin\n8413.91.90.15    Brazil\n8409.99.91.90    Argentina\n8482.10.50.44    CN"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={onPaste}
        />
        <ReviewPanel review={review} fixing={fixing} />
      </>
    </AddLayout>
  );
};

// ── Spreadsheet ──

export const Dropzone = ({ file, reading, onFile }: { file: string | null; reading: boolean; onFile: (f: File) => void }) => {
  const [dragging, setDragging] = useState(false);
  return (
    <label
      className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center transition-colors ${file ? "py-6" : "py-10"} ${dragging ? "border-primary bg-primary/5" : "border-base-300 bg-base-100 hover:border-primary/40"
        }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
        {file ? <DocumentIcon className="h-6 w-6" /> : <ArrowUpTrayIcon className="h-6 w-6" />}
      </span>
      <span className="text-base font-semibold text-base-content">{reading ? "Reading…" : (file ?? "Drop your spreadsheet here, or choose a file")}</span>
      <span className="text-xs text-base-content/60">{file ? "Choose another file to replace it" : "Excel (.xlsx) or CSV"}</span>
      <input
        type="file"
        accept=".xlsx,.xls,.csv,.txt,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
};

export const FileStep = ({ onAdd, onBack }: { onAdd: OnAdd; onBack: () => void }) => {
  const { findElement } = useTracker();
  const [file, setFile] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheets, setSheets] = useState<SheetTable[]>([]);
  const [sheet, setSheet] = useState(0);
  const [columns, setColumns] = useState<DetectedColumns | null>(null);
  const [picking, setPicking] = useState(false);
  const read = async (f: File) => {
    setFile(f.name);
    setError(null);
    setReading(true);
    try {
      const tables = await readSpreadsheet(f);
      if (!tables.length) throw new Error("That file looks empty.");
      const at = pickSheet(tables);
      const found = detectColumns(tables[at].rows);
      setSheets(tables);
      setSheet(at);
      setColumns(found ?? { headerIndex: 0, columns: {} });
      setPicking(!found);
      trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
        step: "file_read",
        kind: /\.xlsx$/i.test(f.name) ? "xlsx" : "csv",
        sheets: tables.length,
        detected: Boolean(found),
      });
    } catch (e) {
      setSheets([]);
      setColumns(null);
      setError(e instanceof Error ? e.message : "That file couldn't be read.");
    } finally {
      setReading(false);
    }
  };

  const changeSheet = (i: number) => {
    setSheet(i);
    const found = detectColumns(sheets[i].rows);
    setColumns(found ?? { headerIndex: 0, columns: {} });
    setPicking(!found);
  };

  // Read: the whole sheet, full width, to check and fix in place
  if (file && !reading && !error && sheets.length && columns) {
    return (
      <SheetReview
        file={file}
        sheets={sheets}
        sheet={sheet}
        onSheet={changeSheet}
        columns={columns}
        onColumns={setColumns}
        picking={picking}
        onPicking={setPicking}
        onReplace={() => {
          setFile(null);
          setSheets([]);
          setColumns(null);
        }}
        onBack={onBack}
        onAdd={(products) => onAdd(products, "file")}
        findElement={findElement}
      />
    );
  }

  return (
    <AddLayout
      eyebrow={`Step ${ADD_STEP} · Upload a spreadsheet`}
      title="Drop in your spreadsheet"
      lead="Your product list, a parts master, an invoice export or your broker's entry report. We find the HTS code and country of origin columns and throw everything else away."
      instructions={
        <div className="flex flex-col gap-6">
          <HowTo
            steps={[
              "Find the file your products live in. Excel (.xlsx) or CSV both work.",
              "Check it has an HTS code column and a country of origin column. Any order, any headers. No need to delete the other columns: we skip them.",
              "Drop it in. Repeated lines count once, and anything we can't read is listed so you can fix it.",
            ]}
          />
          <SheetIllustration caption="We read the two highlighted columns. The rest is thrown away, never saved." wait={420} />
          <button
            type="button"
            className={`${ui.link} tt-ob-rise inline-flex items-center gap-1.5 self-start text-sm`}
            style={delay(520)}
            onClick={() => {
              downloadCsvTemplate();
              trackEvent(MixpanelEvent.TARIFF_TRACKER_CSV_TEMPLATE_DOWNLOADED, {
                from: "onboarding",
              });
            }}
          >
            <ArrowDownTrayIcon className="h-4 w-4" aria-hidden />
            Starting from scratch? Download our template
          </button>
        </div>
      }
      count={0}
      onAdd={() => undefined}
      onBack={onBack}
      footnote={reading ? "Reading your file…" : undefined}
    >
      {(sideHeight) => (
        <>
          {/* Until there's a file: the drop target and the privacy promise, as tall as the instructions */}
          <div className="flex flex-col gap-3" style={!file && sideHeight ? { minHeight: sideHeight } : undefined}>
            <Dropzone file={file} reading={reading} onFile={read} />
            <PrivacyNote />
          </div>
          {error && (
            <p className={`${ui.notice("error")} m-0 flex items-start gap-2 text-sm`} role="alert">
              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-error" aria-hidden />
              {error}
            </p>
          )}
        </>
      )}
    </AddLayout>
  );
};
