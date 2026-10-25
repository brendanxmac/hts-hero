"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { HtsElement } from "@/interfaces/hts";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { Columns } from "../csv";
import { findCountry } from "../parse";
import {
  columnLetter,
  DetectedColumns,
  headerAbove,
  SheetTable,
} from "../spreadsheet";
import { countrySuggestion } from "./fixes";
import { ADD_STEP, delay, useCountUp } from "./parts";
import { useReview } from "./ReviewPanel";
import { NO_EDITS, readSheet, SheetEdits, sheetParsed } from "./sheet";
import { SheetGrid } from "./SheetGrid";
import { FixGuide } from "./FixGuide";
import { RowFixPanel } from "./RowFixPanel";
import { describingColumn } from "./guide";
import { NewProduct } from "../catalog";
import { Select } from "@/components/ui/Select";
import { useUser } from "@/contexts/UserContext";
import { keepToFinish, replaceToFinish, RowToFinish } from "./toFinish";
import { LeaveRowsDialog } from "./LeaveRowsDialog";

// After a spreadsheet is read: the whole sheet, full width, to check and fix in place (SheetGrid).
// Above it, what was read (file, sheet, columns), how it stands (ready, to fix, set aside), and the
// fixes that apply to many rows at once. Title rows, the header, repeats of it and totals are set
// aside by themselves (sheet.ts readSheet).

const n = (count: number) => count.toLocaleString("en-US");

// Which columns hold the code and the country, picked or changed by hand
export const ColumnPicker = ({
  rows,
  found,
  onChange,
}: {
  rows: string[][];
  found: DetectedColumns;
  onChange: (next: DetectedColumns) => void;
}) => {
  const width = Math.max(0, ...rows.slice(0, 50).map((r) => r.length));
  const header = found.headerIndex >= 0 ? rows[found.headerIndex] : null;
  const sample = rows
    .slice(found.headerIndex + 1)
    .filter((r) => r.some(Boolean))
    .slice(0, 4);
  const option = (i: number) => {
    const name = header?.[i];
    const example = sample.find((r) => r[i])?.[i];
    return `${columnLetter(i)}${name ? ` · ${name}` : ""}${example ? ` (e.g. ${example.slice(0, 24)})` : ""}`;
  };
  const pick = (column: "code" | "country", value: string) =>
    onChange({
      ...found,
      columns: {
        ...found.columns,
        [column]: value === "" ? undefined : Number(value),
      } as Columns,
    });
  const lit = [found.columns.code, found.columns.country];

  return (
    <div className={`${tt.panel} flex flex-col gap-4 p-4`}>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["code", "country"] as const).map((column) => (
          <div key={column} className="flex flex-col gap-1.5">
            <span className={ui.fieldLabel}>
              {column === "code"
                ? "HTS code column"
                : "Country of origin column"}
            </span>
            <Select<number | "">
              value={found.columns[column] ?? ""}
              onChange={(v) => pick(column, String(v))}
              label={
                column === "code"
                  ? "HTS code column"
                  : "Country of origin column"
              }
              buttonClassName="w-full"
              placeholder="Choose a column"
              options={Array.from({ length: width }, (_, i) => ({
                value: i,
                label: option(i),
              }))}
            />
          </div>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-base-content/80">
        <input
          type="checkbox"
          className={ui.checkbox}
          checked={found.headerIndex >= 0}
          onChange={(e) =>
            onChange({
              ...found,
              // Above the first code in the code column, else the first filled row
              headerIndex: e.target.checked
                ? found.columns.code !== undefined &&
                  headerAbove(rows, found.columns.code) >= 0
                  ? headerAbove(rows, found.columns.code)
                  : Math.max(
                      0,
                      rows.findIndex((r) => r.some(Boolean)),
                    )
                : -1,
            })
          }
        />
        It has a header row
        {found.headerIndex >= 0 ? ` (row ${found.headerIndex + 1})` : ""}
      </label>
      {/* The first rows, with the columns that will be read lit up */}
      <div className="overflow-x-auto rounded-xl border border-base-300">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {Array.from({ length: Math.min(width, 8) }, (_, i) => (
                <th
                  key={i}
                  className={`border-b border-base-300 px-2.5 py-1.5 text-left font-semibold ${lit.includes(i) ? "bg-primary/15 text-primary" : "text-base-content/50"}`}
                >
                  {columnLetter(i)}
                  {header?.[i] ? ` · ${header[i]}` : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sample.map((r, ri) => (
              <tr key={ri}>
                {Array.from({ length: Math.min(width, 8) }, (_, i) => (
                  <td
                    key={i}
                    className={`max-w-40 truncate border-b border-base-300 px-2.5 py-1.5 ${lit.includes(i) ? "bg-primary/8 font-semibold text-base-content" : "text-base-content/50"}`}
                  >
                    {r[i]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// A headline number on the summary, counting up as it comes in
const SummaryStat = ({
  value,
  label,
  tone,
  wait,
}: {
  value: number;
  label: string;
  tone: string;
  wait: number;
}) => {
  const shown = useCountUp(value, { wait: wait + 100, duration: 700 });
  return (
    <div
      className={`${tt.panel} tt-ob-rise flex flex-col gap-2 p-5`}
      style={delay(wait)}
    >
      <span
        className={`${tt.display} text-[3rem] font-semibold leading-none tabular-nums ${tone}`}
      >
        {n(Math.round(shown))}
      </span>
      <span className="text-sm text-base-content/65">{label}</span>
    </div>
  );
};


export const SheetReview = ({
  file,
  sheets,
  sheet: sheetIndex,
  onSheet,
  columns,
  onColumns,
  picking,
  onPicking,
  onReplace,
  onBack,
  onAdd,
  findElement,
  pasted = false,
  finishing = false,
}: {
  file: string;
  // The rows left from an earlier sheet (toFinish.ts), back to fix: no summary, straight to the
  // grid, and what's still unfixed after goes back on the list in place of it
  finishing?: boolean;
  // Pasted into the box rather than uploaded: the same review, worded for a paste
  pasted?: boolean;
  sheets: SheetTable[];
  sheet: number;
  onSheet: (i: number) => void;
  columns: DetectedColumns;
  onColumns: (next: DetectedColumns) => void;
  picking: boolean;
  onPicking: (on: boolean) => void;
  onReplace: () => void;
  onBack: () => void;
  onAdd: (products: NewProduct[]) => void;
  findElement: (digits: string) => HtsElement | undefined;
}) => {
  const replace = pasted ? "Paste a different list" : "Use a different file";
  const rows = sheets[sheetIndex]?.rows ?? [];
  const ready =
    columns.columns.code !== undefined && columns.columns.country !== undefined;
  const cols: Columns = {
    code: columns.columns.code,
    country: columns.columns.country,
  };

  const { user } = useUser();
  // The user's edits, for this sheet and these columns only. Rows back to finish were imports
  // when they were left, so none is set aside now
  const fresh = (): SheetEdits =>
    finishing
      ? {
          ...NO_EDITS,
          included: rows
            .map((_, i) => i)
            .filter((i) => i > columns.headerIndex),
        }
      : NO_EDITS;
  const [edits, setEdits] = useState<SheetEdits>(fresh);
  const [touched, setTouched] = useState<Set<number>>(new Set());
  const [basis, setBasis] = useState({ rows, columns });
  if (basis.rows !== rows || basis.columns !== columns) {
    setBasis({ rows, columns });
    setEdits(fresh());
    setTouched(new Set());
  }

  const sheet = useMemo(
    () =>
      ready
        ? readSheet(rows, columns.headerIndex, cols, edits, findElement)
        : [],
    [rows, columns, edits, findElement, ready],
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const review = useReview(useMemo(() => sheetParsed(sheet), [sheet]));
  const counts = useMemo(() => {
    const c = { ok: 0, error: 0, aside: 0, deleted: 0 };
    sheet.forEach((r) =>
      r.kind === "ok"
        ? c.ok++
        : r.kind === "error"
          ? c.error++
          : r.kind === "ignored" || r.kind === "above"
            ? c.aside++
            : r.kind === "skipped"
              ? c.deleted++
              : 0,
    );
    return c;
  }, [sheet]);
  // Every row, as the sheet has it (no filters): the ones set aside stay, dimmed, and the fix
  // panel steps through the ones to fix. Only blank rows, the header and deleted rows are left out.
  const shown = useMemo(
    () =>
      sheet
        .filter(
          (r) =>
            r.kind !== "blank" && r.kind !== "header" && r.kind !== "skipped",
        )
        .map((r) => r.index),
    [sheet],
  );

  const touch = (row: number) =>
    setTouched((prev) => (prev.has(row) ? prev : new Set(prev).add(row)));
  const edit = (row: number, column: number, value: string) => {
    setEdits((e) => ({
      ...e,
      cells: { ...e.cells, [`${row}:${column}`]: value },
    }));
    touch(row);
  };
  // Deleting takes the row out of the sheet (and every view); the last one can be undone
  const [lastDeleted, setLastDeleted] = useState<number | null>(null);
  const skip = (row: number, on: boolean) => {
    setEdits((e) => ({
      ...e,
      skipped: on ? [...e.skipped, row] : e.skipped.filter((r) => r !== row),
    }));
    setLastDeleted(on ? row : null);
    touch(row);
  };
  const include = (row: number) => {
    setEdits((e) => ({ ...e, included: [...e.included, row] }));
    touch(row);
  };

  // The row picked in the grid: a row that needs a fix (or set aside, or just fixed) opens the panel
  const [selected, setSelected] = useState<number | null>(null);
  const latestSheet = useRef(sheet);
  latestSheet.current = sheet;
  const issues = sheet.filter((r) => r.kind === "error").map((r) => r.index);
  // Only a row the sheet shows (not one just deleted)
  const panelRow =
    selected !== null &&
    shown.includes(selected) &&
    sheet[selected] &&
    (sheet[selected].kind !== "ok" || touched.has(selected)) &&
    sheet[selected].kind !== "header" &&
    sheet[selected].kind !== "blank"
      ? sheet[selected]
      : null;
  // The sheet opens on the first row to fix, its panel open (once: closing the panel keeps it closed)
  const autoPicked = useRef(false);
  const firstIssue = issues[0];
  useEffect(() => {
    if (autoPicked.current || !ready || picking || firstIssue === undefined)
      return;
    autoPicked.current = true;
    setSelected(firstIssue);
  }, [ready, picking, firstIssue]);
  // Opening the panel brings the sheet and the panel into view together
  const sheetBox = useRef<HTMLDivElement>(null);
  const panelOpen = !!panelRow;
  useEffect(() => {
    if (panelOpen)
      sheetBox.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
  }, [panelOpen]);
  const issuePosition =
    selected !== null && issues.includes(selected)
      ? { index: issues.indexOf(selected), total: issues.length }
      : null;
  // The next (or previous) row that still needs a fix, from the sheet as it is by then (a fix just
  // made counts); round to the top at the end; none left, nothing
  const nextIssue = (from: number) => {
    const left = latestSheet.current
      .filter((r) => r.kind === "error" && r.index !== from)
      .map((r) => r.index);
    return left.find((i) => i > from) ?? left[0] ?? null;
  };
  const prevIssue = (from: number) => {
    const left = latestSheet.current
      .filter((r) => r.kind === "error" && r.index !== from)
      .map((r) => r.index);
    return (
      [...left].reverse().find((i) => i < from) ?? left[left.length - 1] ?? null
    );
  };
  // Deleting the picked row moves on to the next that needs a fix
  const deleteRow = (row: number) => {
    if (row === selected) setSelected(nextIssue(row));
    skip(row, true);
  };
  const descCol = useMemo(
    () =>
      describingColumn(
        rows,
        columns.headerIndex >= 0 ? rows[columns.headerIndex] : null,
        [cols.code, cols.country],
      ),
    [rows, columns],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  // The same unrecognized country on many rows, replaced everywhere at once
  const bulk = useMemo(() => {
    const byValue = new Map<string, number[]>();
    sheet.forEach((r) => {
      if (r.kind !== "error" || !r.country.trim() || findCountry(r.country))
        return;
      byValue.set(r.country, [...(byValue.get(r.country) ?? []), r.index]);
    });
    return [...byValue.entries()]
      .map(([value, list]) => ({ value, list, to: countrySuggestion(value) }))
      .filter((b) => b.to && b.list.length > 1)
      .sort((a, b) => b.list.length - a.list.length);
  }, [sheet]);

  // One country fix on every row with the same unrecognized value (offered in the fix panel)
  const applyBulk = (b: (typeof bulk)[number]) => {
    setEdits((e) => ({
      ...e,
      cells: {
        ...e.cells,
        ...Object.fromEntries(
          b.list.map((r) => [`${r}:${cols.country}`, b.to!.name]),
        ),
      },
    }));
    setTouched((prev) => new Set([...prev, ...b.list]));
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, {
      help: "sheet_country_bulk",
      rows: b.list.length,
    });
  };
  const panelBulk = panelRow
    ? bulk.find((b) => b.list.includes(panelRow.index))
    : undefined;

  const header = columns.headerIndex >= 0 ? rows[columns.headerIndex] : null;
  const name = (i: number | undefined) =>
    i === undefined
      ? ""
      : `column ${columnLetter(i)}${header?.[i] ? ` (${header[i]})` : ""}`;
  const products = review.products;

  // Tracking the rows that read: the ones still to fix are kept (toFinish.ts) with what was wrong
  // and the product's description, so they can be finished later from the Tracker
  const start = (ready: NewProduct[]) => {
    const left = sheet
      .filter((r) => r.kind === "error")
      .map((r): RowToFinish => ({
        code: r.code.trim(),
        country: r.country.trim(),
        reason: r.reason ?? "",
        description:
          (descCol !== null ? rows[r.index]?.[descCol]?.trim() : "") ||
          undefined,
        from: finishing ? rows[r.index]?.[3] || undefined : file,
      }));
    if (finishing) replaceToFinish(user?.id, left);
    else keepToFinish(user?.id, left);
    if (left.length)
      trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
        step: finishing ? "finish_saved" : "sheet_rows_kept",
        rows: left.length,
        imports: ready.length,
      });
    onAdd(ready);
  };
  // Leaving rows unfixed asks first, nudging to fix them; back to finish, they already wait
  const [confirming, setConfirming] = useState(false);
  const askStart = () => {
    if (finishing || counts.error === 0) return start(products);
    setConfirming(true);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
      step: "sheet_leave_rows_asked",
      rows: counts.error,
      imports: products.length,
    });
  };
  const confirm = (
    <LeaveRowsDialog
      open={confirming}
      left={counts.error}
      ready={products.length}
      onClose={() => setConfirming(false)}
      onFix={() => {
        setConfirming(false);
        setStage("sheet");
        setSelected(issues[0] ?? null);
        trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
          step: "sheet_leave_rows_fix",
          rows: counts.error,
        });
      }}
      onStart={() => {
        setConfirming(false);
        trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
          step: "sheet_leave_rows_start",
          rows: counts.error,
        });
        start(products);
      }}
    />
  );

  // Before the sheet: a summary when rows need a look (fix them, or track the rest now). Every row
  // reads: no review at all, straight on to tracking them. The columns still need picking: the sheet.
  const [stage, setStage] = useState<"summary" | "guide" | "sheet">(
    finishing ? "sheet" : "summary",
  );
  const autoAdded = useRef(false);
  const clean = ready && !picking && counts.error === 0 && products.length > 0;
  useEffect(() => {
    if (stage !== "summary" || !clean || autoAdded.current) return;
    autoAdded.current = true;
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
      step: "sheet_clean",
      imports: products.length,
    });
    onAdd(products);
  }, [stage, clean, products, onAdd]);

  if (stage === "summary" && clean) return null;
  if (stage === "summary" && ready && !picking && counts.error > 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-7">
        <button
          type="button"
          onClick={onReplace}
          className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-base-content/60 hover:text-base-content"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          {replace}
        </button>
        {/* The upload landed: the file fills in, then ticks */}
        <div className="tt-ob-pop flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 px-4 py-3">
          <span
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-100 text-base-content/60 shadow-[var(--tt-shadow)]"
            aria-hidden
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span
              className="tt-ob-pop absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-content ring-2 ring-base-100"
              style={delay(650)}
            >
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-base-content">
                {file}
              </span>
              <span
                className="tt-ob-rise shrink-0 text-xs font-semibold text-success"
                style={delay(650)}
              >
                {pasted ? "Pasted" : "Uploaded"} · {n(counts.ok + counts.error)}{" "}
                rows read
              </span>
            </span>
            <span
              className="h-1.5 overflow-hidden rounded-full bg-success/15"
              aria-hidden
            >
              <span className="tt-ob-fill block h-full rounded-full bg-success" />
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <span
            className={`${tt.eyebrow("warning")} tt-ob-rise`}
            style={delay(750)}
          >
            Step {ADD_STEP} · Almost there
          </span>
          <h1
            id="tt-onboarding-title"
            tabIndex={-1}
            className={`${tt.display} tt-ob-rise m-0 text-[2rem] font-semibold leading-tight tracking-tight text-base-content outline-hidden`}
            style={delay(800)}
          >
            {n(counts.error)} {counts.error === 1 ? "row needs" : "rows need"} a
            quick look.
          </h1>
          <p
            className="tt-ob-rise m-0 text-base leading-relaxed text-base-content/75"
            style={delay(860)}
          >
            HTS codes from {name(columns.columns.code)}, countries from{" "}
            {name(columns.columns.country)}.{" "}
            {products.length > counts.error
              ? "Most of it is ready; a few rows couldn't be matched to a duty rate yet."
              : "Some rows couldn't be matched to a duty rate yet, and they're quick to fix here."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SummaryStat
            value={products.length}
            label={products.length === 1 ? "Import ready" : "Imports ready"}
            tone="text-success"
            wait={950}
          />
          <SummaryStat
            value={counts.error}
            label={counts.error === 1 ? "Row to fix" : "Rows to fix"}
            tone="text-warning"
            wait={1030}
          />
          <SummaryStat
            value={counts.aside}
            label="Set aside (titles, headers, totals)"
            tone="text-base-content/45"
            wait={1110}
          />
        </div>

        <div className="tt-ob-rise flex flex-col gap-3" style={delay(1200)}>
          <button
            type="button"
            className={`${ui.button({ variant: "primary", size: "lg" })} h-14 w-full text-lg`}
            onClick={() => {
              setStage("sheet");
              trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
                step: "sheet_review",
                rows: counts.error,
              });
            }}
            autoFocus
          >
            Review and fix {n(counts.error)}{" "}
            {counts.error === 1 ? "row" : "rows"}
            <ArrowRightIcon className="h-5 w-5" aria-hidden />
          </button>
          <span className="text-center text-xs text-base-content/60">
            It only takes a minute: we suggest the fix for most of them.{" "}
            <button
              type="button"
              className={`${ui.link} text-xs`}
              onClick={() => {
                setStage("guide");
                trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
                  step: "sheet_guide",
                  rows: counts.error,
                });
              }}
            >
              Or go through them one at a time
            </button>
          </span>
          {products.length > 0 && (
            <button
              type="button"
              className={`${ui.link} self-center text-sm`}
              onClick={askStart}
            >
              Skip them for now and track the {n(products.length)} ready{" "}
              {products.length === 1 ? "import" : "imports"}
            </button>
          )}
        </div>
        {confirm}
      </div>
    );
  }

  // The guided fix, one card at a time
  if (stage === "guide" && ready) {
    return (
      <>
        <FixGuide
          rows={rows}
          header={header}
          columns={{ code: cols.code!, country: cols.country! }}
          sheet={sheet}
          onEdit={edit}
          onEditMany={(column, list, value) => {
            setEdits((e) => ({
              ...e,
              cells: {
                ...e.cells,
                ...Object.fromEntries(
                  list.map((r) => [`${r}:${column}`, value]),
                ),
              },
            }));
            setTouched((prev) => new Set([...prev, ...list]));
          }}
          onDelete={(list) => {
            setEdits((e) => ({
              ...e,
              skipped: [...new Set([...e.skipped, ...list])],
            }));
            setTouched((prev) => new Set([...prev, ...list]));
          }}
          onOpenSheet={() => setStage("sheet")}
          onFinish={askStart}
          ready={products.length}
        />
        {confirm}
      </>
    );
  }

  // What starting says, in the footer and once every row is fixed
  const startLabel = finishing
    ? products.length
      ? `Track the ${n(products.length)} fixed`
      : "Done for now"
    : !products.length
      ? "Track my imports"
      : counts.error > 0
        ? `Start with the ${n(products.length)} ready`
        : `Track ${n(products.length)} ${products.length === 1 ? "import" : "imports"}`;

  // Exactly the screen's height (data-fit, read by ImportTakeover): the page never scrolls, the
  // sheet and its panel scroll inside, and the header stays at the top however short the sheet is
  return (
    <div data-fit className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4">
      {/* The header: the step; the file, its sheet and columns; then what's kept, and a way to start over */}
      <div className="flex shrink-0 flex-col gap-1.5">
        <span className={tt.eyebrow(finishing ? "warning" : "primary")}>
          {finishing ? "Imports to finish" : `Step ${ADD_STEP} · Check your sheet`}
        </span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={onBack}
            className="-ml-1.5 rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden />
          </button>
          <h1
            id="tt-onboarding-title"
            tabIndex={-1}
            className={`${tt.display} -ml-2 m-0 text-2xl font-semibold leading-tight tracking-tight text-base-content outline-hidden`}
          >
            {finishing ? "Finish your imports" : file}
          </h1>
          {sheets.length > 1 && (
            <Select<number>
              value={sheetIndex}
              onChange={onSheet}
              label="Sheet"
              size="sm"
              variant="pill"
              options={sheets.map((s, i) => ({
                value: i,
                label: `Sheet: ${s.name}`,
              }))}
            />
          )}
          <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-base-content/75">
            {finishing ? (
              <span>
                These rows didn&apos;t read when you added your imports. Fix one
                and it&apos;s tracked; the rest wait here.
              </span>
            ) : ready && !picking ? (
              <>
                <CheckIcon className="h-4 w-4 text-success" aria-hidden />
                HTS codes from{" "}
                <strong className="text-base-content">
                  {name(columns.columns.code)}
                </strong>
                , countries from{" "}
                <strong className="text-base-content">
                  {name(columns.columns.country)}
                </strong>
                .
                <button
                  type="button"
                  className={`${ui.link} text-sm`}
                  onClick={() => onPicking(true)}
                >
                  Change
                </button>
              </>
            ) : (
              <span>
                {ready
                  ? "Check the columns below."
                  : "We couldn't tell which columns are which. Pick them below."}
              </span>
            )}
          </p>
        </div>
        <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/65">
          <span className="flex items-center gap-1.5">
            <ShieldCheckIcon className="h-4 w-4 shrink-0 text-success" aria-hidden />
            {counts.error > 0
              ? "Read in your browser. Only codes and countries are kept, plus product names on rows left to fix (on this device)."
              : "Read in your browser. Only HTS codes and countries are kept."}
          </span>
          {!finishing && (
            <button
              type="button"
              onClick={onReplace}
              className={`${ui.link} shrink-0 text-xs`}
            >
              {replace}
            </button>
          )}
        </p>
      </div>

      {picking && (
        <div className="flex max-h-[45%] shrink-0 flex-col gap-2 overflow-y-auto">
          <ColumnPicker rows={rows} found={columns} onChange={onColumns} />
          {ready && (
            <button
              type="button"
              className={`${ui.button({ size: "sm" })} self-start`}
              onClick={() => onPicking(false)}
            >
              Done
            </button>
          )}
        </div>
      )}

      {ready && (
        <>
          {/* The sheet, and beside it the picked row's fix panel. Over the sheet, in its card: the
              title and what to do */}
          <div ref={sheetBox} className="flex min-h-48 flex-1 items-stretch gap-4">
            <SheetGrid
              above={
                <>
                  <div className="flex flex-col gap-1">
                    <span
                      className={`${tt.display} text-base font-semibold text-base-content`}
                    >
                      Your Imports
                    </span>
                    {counts.error > 0 ? (
                      <p className="m-0 text-sm text-base-content/70">
                        Click a row to see what&apos;s wrong and fix it, or
                        track the rest now and fix these later.
                      </p>
                    ) : (
                      <p className="m-0 flex items-start gap-1.5 text-sm text-base-content/70">
                        <CheckCircleIcon
                          className="mt-0.5 h-4 w-4 shrink-0 text-success"
                          aria-hidden
                        />
                        <span>
                          Every row reads.{" "}
                          {touched.size > 0 ? "Nice work: " : ""}
                          {n(products.length)}{" "}
                          {products.length === 1 ? "import is" : "imports are"}{" "}
                          ready to track.
                        </span>
                      </p>
                    )}
                    {counts.deleted > 0 && (
                      <p className="m-0 flex flex-wrap items-center gap-x-3 text-sm text-base-content/70">
                        <TrashIcon
                          className="h-4 w-4 text-base-content/45"
                          aria-hidden
                        />
                        {lastDeleted !== null && edits.skipped.includes(lastDeleted)
                          ? `Row ${lastDeleted + 1} deleted.`
                          : `${n(counts.deleted)} ${counts.deleted === 1 ? "row" : "rows"} deleted.`}
                        {lastDeleted !== null &&
                          edits.skipped.includes(lastDeleted) && (
                            <button
                              type="button"
                              className={`${ui.link} text-sm`}
                              onClick={() => skip(lastDeleted, false)}
                            >
                              Undo
                            </button>
                          )}
                        {counts.deleted > 1 && (
                          <button
                            type="button"
                            className={`${ui.link} text-sm`}
                            onClick={() => {
                              setEdits((e) => ({ ...e, skipped: [] }));
                              setLastDeleted(null);
                            }}
                          >
                            Restore all {n(counts.deleted)}
                          </button>
                        )}
                      </p>
                    )}
                  </div>
                </>
              }
              sheet={sheet}
              shown={shown}
              header={header}
              columns={{ code: cols.code!, country: cols.country! }}
              onEdit={edit}
              onSkip={(row, on) => (on ? deleteRow(row) : skip(row, false))}
              selected={selected}
              onSelect={setSelected}
            />
            {panelRow ? (
              <div className="tt-ob-from-right flex min-w-0 flex-1 flex-col">
                <RowFixPanel
                  key={panelRow.index}
                  row={panelRow}
                  rows={rows}
                  columns={{ code: cols.code!, country: cols.country! }}
                  descCol={descCol}
                  position={issuePosition}
                  everywhere={
                    panelBulk
                      ? {
                          count: panelBulk.list.length,
                          apply: () => applyBulk(panelBulk),
                        }
                      : undefined
                  }
                  onEdit={(column, value) =>
                    edit(panelRow.index, column, value)
                  }
                  onDelete={() => deleteRow(panelRow.index)}
                  onInclude={() => include(panelRow.index)}
                  onPrev={() => setSelected(prevIssue(panelRow.index))}
                  onNext={() => setSelected(nextIssue(panelRow.index))}
                  onClose={() => setSelected(null)}
                />
              </div>
            ) : issues.length === 0 && products.length > 0 ? (
              // Every row fixed: the way on, though never automatic, so the changes can be looked over first
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto rounded-xl border border-success/30 bg-success/5 p-6 text-center">
                <span
                  className="tt-ob-pop flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-content"
                  aria-hidden
                >
                  <CheckCircleIcon className="h-8 w-8" />
                </span>
                <div className="tt-ob-rise flex flex-col gap-1.5">
                  <span
                    className={`${tt.display} text-2xl font-semibold leading-tight text-base-content`}
                  >
                    {touched.size > 0 ? "All fixed. Nice work." : "Every row reads."}
                  </span>
                  <span className="text-sm text-base-content/70">
                    Click any row to look over your changes, or carry on.
                  </span>
                </div>
                <button
                  type="button"
                  className={`${ui.button({ variant: "primary", size: "lg" })} tt-ob-rise px-7`}
                  style={delay(120)}
                  onClick={askStart}
                >
                  {startLabel}
                  <ArrowRightIcon className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : (
              // No row picked: the panel's place, saying how to open it
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-base-300 p-6 text-center">
                <p className="m-0 text-sm text-base-content/70">
                  {!shown.length
                    ? `We found the columns, but no rows under them. Check you picked the right ${pasted ? "columns" : "sheet"}.`
                    : issues.length
                      ? "Click a row to see what's wrong and fix it."
                      : "Every row reads. Click one to check or change it."}
                </p>
                {issues.length > 0 && (
                  <button
                    type="button"
                    className={ui.button({ size: "sm" })}
                    onClick={() => setSelected(issues[0])}
                  >
                    Fix the first one
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Always in view at the foot of the page, so starting never waits on the fixes: rows still
              to fix don't hold the rest back, and the button says so */}
          <div className={`${tt.panel} mt-auto flex shrink-0 flex-wrap items-center justify-between gap-3 px-5 py-3.5`}>
            <span className="text-sm text-base-content/65">
              {finishing
                ? counts.error > 0
                  ? `The ${n(counts.error)} ${counts.error === 1 ? "row" : "rows"} left stay here until you fix ${counts.error === 1 ? "it" : "them"}.`
                  : "Every row reads."
                : products.length > REVERSE_TRIAL.imports
                  ? `All ${n(products.length)} are saved; your free trial tracks ${REVERSE_TRIAL.imports}, the highest-duty first.`
                  : counts.error > 0 && products.length > 0
                    ? `No need to fix them all first. The ${n(counts.error)} ${counts.error === 1 ? "row" : "rows"} left can be added any time.`
                    : counts.error > 0
                      ? `Fix a row or two to start tracking.`
                      : "Repeated rows are counted once."}
            </span>
            <button
              type="button"
              className={`${ui.button({ variant: "primary", size: "lg" })} px-7`}
              disabled={!products.length && !finishing}
              onClick={askStart}
            >
              {startLabel}
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </>
      )}
      {confirm}
    </div>
  );
};
