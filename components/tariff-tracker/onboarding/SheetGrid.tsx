"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import { Countries } from "@/constants/countries";
import { HtsElement } from "@/interfaces/hts";
import { canonicalHtsCode } from "@/libs/hts-code";
import { findCountry } from "../parse";
import { columnLetter } from "../spreadsheet";
import { SheetRow } from "./sheet";

// The uploaded sheet as a spreadsheet: row numbers down the side, the HTS code and country columns
// first (lit, and the only ones that can be edited), then the file's other columns, dimmed, for
// context (never saved). A cell is picked with a click or the arrow keys; typing, Enter or a double
// click edits it; Enter saves and moves down, Tab across, Escape cancels. The picked row is the
// page's (SheetReview), so the fix panel beside the grid can follow it. Rows are drawn as they
// scroll into view (TanStack Virtual), so a sheet of thousands stays quick.

type EditCol = "code" | "country";
const EDIT_COLS: EditCol[] = ["code", "country"];
const ORIGINS = Countries.filter((c) => c.code !== "US");
const COUNTRY_LIST_ID = "tt-sheet-countries";
const GUTTER = 68;
const STATUS = 40;
const CODE_W = 150;
const COUNTRY_W = 180;
const ROW_H = 38;
// The lit tint, made solid: sticky cells sit over the rows scrolling under them, so they can't be
// see-through (primary at 10% over the page's ground)
const LIT_SOLID =
  "bg-[color-mix(in_oklab,var(--color-primary)_12%,var(--color-base-100))]";

interface Props {
  sheet: SheetRow<HtsElement>[];
  // The rows shown (by index), in order
  shown: number[];
  header: string[] | null;
  columns: { code: number; country: number };
  onEdit: (row: number, column: number, value: string) => void;
  onSkip: (row: number, skip: boolean) => void;
  // The picked row (by index), owned by the page: the fix panel beside the grid follows it
  selected: number | null;
  onSelect: (row: number | null) => void;
}

// What's wrong with a row, or why it's set aside (its tooltip; the fix panel says it in full)
const issueOf = (row: SheetRow<HtsElement>) =>
  row.kind === "error"
    ? row.reason
    : row.kind === "ignored"
      ? `Set aside: ${row.reason?.toLowerCase()}`
      : row.kind === "above"
        ? "Set aside: above the header row"
        : "";

const StatusIcon = ({ row }: { row: SheetRow<HtsElement> }) => {
  if (row.kind === "ok")
    return (
      <CheckCircleIcon className="h-4 w-4 text-success" aria-label="Ready" />
    );
  if (row.kind === "error")
    return (
      <ExclamationTriangleIcon
        className="h-4 w-4 text-warning"
        aria-label="Needs a fix"
      />
    );
  return (
    <MinusCircleIcon
      className="h-4 w-4 text-base-content/30"
      aria-label="Left out"
    />
  );
};

export const SheetGrid = ({
  sheet,
  shown,
  header,
  columns,
  onEdit,
  onSkip,
  selected,
  onSelect,
}: Props) => {
  const scroller = useRef<HTMLDivElement>(null);
  // The picked cell: its row comes from the page, its column is the grid's own
  const [col, setCol] = useState<EditCol>("code");
  const pos = selected === null ? -1 : shown.indexOf(selected);
  const cursor = pos >= 0 ? { pos, col } : null;
  const setCursor = (next: { pos: number; col: EditCol }) => {
    setCol(next.col);
    onSelect(shown[next.pos] ?? null);
  };
  const [editing, setEditing] = useState<{ value: string } | null>(null);
  // Back to the grid after a click in a row's card, so the keys keep working
  const refocus = () => scroller.current?.focus({ preventScroll: true });
  // Only the two columns that are kept; what's wrong with a row is in the fix panel beside the grid
  const template = `${GUTTER}px ${STATUS}px ${CODE_W}px ${COUNTRY_W}px`;
  const total = GUTTER + STATUS + CODE_W + COUNTRY_W;

  const current = pos >= 0 ? sheet[shown[pos]] : null;

  const virtualizer = useVirtualizer({
    count: shown.length,
    getScrollElement: () => scroller.current,
    estimateSize: () => ROW_H,
    overscan: 10,
  });
  useEffect(() => {
    if (pos >= 0) virtualizer.scrollToIndex(pos, { align: "auto" });
  }, [pos]); // eslint-disable-line react-hooks/exhaustive-deps

  const colIndex = (col: EditCol) =>
    col === "code" ? columns.code : columns.country;
  const commit = () => {
    if (!editing || !current || !cursor) return;
    onEdit(current.index, colIndex(cursor.col), editing.value);
    setEditing(null);
    scroller.current?.focus({ preventScroll: true });
  };
  const move = (dPos: number, dCol = 0) => {
    if (!cursor || !shown.length) return;
    let c = EDIT_COLS.indexOf(cursor.col) + dCol;
    let p = pos + dPos;
    if (c > 1) {
      c = 0;
      p++;
    } else if (c < 0) {
      c = 1;
      p--;
    }
    setCursor({
      pos: Math.max(0, Math.min(shown.length - 1, p)),
      col: EDIT_COLS[c],
    });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    // Nothing picked yet (it starts that way): the arrows or Tab start at the top
    if (
      !cursor &&
      ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Tab"].includes(
        e.key,
      ) &&
      shown.length
    ) {
      e.preventDefault();
      setCursor({ pos: 0, col: "code" });
      return;
    }
    if (!cursor || !current) return;
    // Keys inside the row card (a select, a button) are its own
    if (!editing && e.target !== e.currentTarget) return;
    if (editing) {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
        move(1);
      } else if (e.key === "Tab") {
        e.preventDefault();
        commit();
        move(0, e.shiftKey ? -1 : 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setEditing(null);
        scroller.current?.focus({ preventScroll: true });
      }
      return;
    }
    const keys: Record<string, () => void> = {
      Escape: () => onSelect(null),
      ArrowDown: () => move(1),
      ArrowUp: () => move(-1),
      ArrowRight: () => move(0, 1),
      ArrowLeft: () => move(0, -1),
      Tab: () => move(0, e.shiftKey ? -1 : 1),
      Enter: () => setEditing({ value: current[cursor.col] }),
      F2: () => setEditing({ value: current[cursor.col] }),
      Backspace: () => onEdit(current.index, colIndex(cursor.col), ""),
      Delete: () => onEdit(current.index, colIndex(cursor.col), ""),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      // Typing over the cell, as in a spreadsheet
      e.preventDefault();
      setEditing({ value: e.key });
    }
  };

  const head = (label: string, sub: string, lit: boolean, key: string) => (
    <div
      key={key}
      className={`flex min-w-0 flex-col justify-center border-b border-r border-base-300 px-2.5 py-1.5 ${lit ? LIT_SOLID : "bg-tt-soft"}`}
    >
      <span
        className={`text-[0.65rem] font-bold ${lit ? "text-primary" : "text-base-content/45"}`}
      >
        {sub}
      </span>
      <span
        className={`truncate text-xs font-semibold ${lit ? "text-primary" : "text-base-content/55"}`}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex shrink-0 flex-col gap-2" style={{ width: total + 2 }}>
      <div
        ref={scroller}
        tabIndex={0}
        role="grid"
        aria-label="Your sheet"
        aria-rowcount={shown.length}
        onKeyDown={onKey}
        className="relative h-[min(72vh,46rem)] overflow-auto rounded-xl border border-base-300 bg-base-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {/* Column headings: the file's letters and names; sticky as the rows scroll */}
        <div
          className="sticky top-0 z-20 grid"
          style={{ gridTemplateColumns: template, minWidth: total }}
          role="row"
        >
          <div className="sticky left-0 z-10 border-b border-r border-base-300 bg-tt-soft" />
          <div className="border-b border-r border-base-300 bg-tt-soft" />
          {head(
            header?.[columns.code] || "HTS code",
            `${columnLetter(columns.code)} · HTS CODE`,
            true,
            "code",
          )}
          {head(
            header?.[columns.country] || "Country of origin",
            `${columnLetter(columns.country)} · COUNTRY`,
            true,
            "country",
          )}
        </div>

        <div
          className="relative"
          style={{ height: virtualizer.getTotalSize(), minWidth: total }}
        >
          {virtualizer.getVirtualItems().map((item) => {
            const row = sheet[shown[item.index]];
            const picked = item.index === pos;
            const tint =
              row.kind === "error"
                ? "bg-warning/5"
                : row.kind === "ok"
                  ? ""
                  : "bg-base-200/60 text-base-content/40";
            const cell = (col: EditCol) => {
              const on = picked && cursor?.col === col;
              const value = row[col];
              const bad =
                row.kind === "error" &&
                (col === "country"
                  ? !findCountry(value)
                  : !/^\d{8}$|^\d{10}$/.test(value.replace(/[.\s]/g, "")) ||
                    row.reason?.includes("current HTS"));
              return (
                <div
                  key={col}
                  role="gridcell"
                  aria-selected={on}
                  onClick={() => {
                    setCursor({ pos: item.index, col });
                    setEditing(null);
                    scroller.current?.focus({ preventScroll: true });
                  }}
                  onDoubleClick={() => {
                    setCursor({ pos: item.index, col });
                    setEditing({ value });
                  }}
                  className={`relative flex min-w-0 items-center border-b border-r border-base-300 px-2.5 ${col === "code" ? `${mono.className} font-semibold` : ""} ${
                    on ? "z-10 outline-2 -outline-offset-2 outline-primary" : ""
                  } ${bad ? "text-warning" : row.kind === "ok" || row.kind === "error" ? "text-base-content" : ""}`}
                >
                  {on && editing ? (
                    <input
                      autoFocus
                      value={editing.value}
                      list={col === "country" ? COUNTRY_LIST_ID : undefined}
                      onChange={(e) => setEditing({ value: e.target.value })}
                      onBlur={commit}
                      className="absolute inset-0 w-full bg-base-100 px-2.5 text-sm text-base-content outline-2 -outline-offset-2 outline-primary"
                      aria-label={
                        col === "code"
                          ? `HTS code, row ${row.index + 1}`
                          : `Country of origin, row ${row.index + 1}`
                      }
                    />
                  ) : (
                    <span className="truncate text-sm">
                      {(col === "code"
                        ? (canonicalHtsCode(value.trim()) ?? value)
                        : value) || (bad ? "Missing" : "")}
                    </span>
                  )}
                </div>
              );
            };
            return (
              <div
                key={row.index}
                className="absolute left-0 top-0"
                style={{
                  transform: `translateY(${item.start}px)`,
                  width: "100%",
                  minWidth: total,
                }}
              >
                <div
                  role="row"
                  className={`group grid ${tint}`}
                  style={{ gridTemplateColumns: template, height: ROW_H }}
                >
                  {/* The row number, and on hover the one-click way to take the row out (or put it back) */}
                  <div
                    className={`sticky left-0 z-[5] flex items-center justify-between gap-1 border-b border-r border-base-300 pl-1 pr-2 text-xs tabular-nums ${
                      picked
                        ? `${LIT_SOLID} font-semibold text-primary`
                        : "bg-tt-soft text-base-content/45"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSkip(row.index, true);
                        refocus();
                      }}
                      className={`rounded-md p-1 text-base-content/45 opacity-0 transition-opacity hover:bg-error/10 hover:text-error focus-visible:opacity-100 group-hover:opacity-100 ${picked ? "opacity-100" : ""}`}
                      title="Delete this row"
                      aria-label={`Delete row ${row.index + 1}`}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                    {row.index + 1}
                  </div>
                  <div
                    className="flex cursor-pointer items-center justify-center border-b border-r border-base-300"
                    onClick={() =>
                      setCursor({ pos: item.index, col: cursor?.col ?? "code" })
                    }
                    title={
                      issueOf(row) ||
                      (row.kind === "ok" ? "Ready to add" : undefined)
                    }
                  >
                    <StatusIcon row={row} />
                  </div>
                  {cell("code")}
                  {cell("country")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="m-0 text-xs text-base-content/55">
        Click a cell and type to change it.{" "}
        <span className="font-semibold">Enter</span> saves,{" "}
        <span className="font-semibold">Tab</span> moves across. Only these two
        columns are kept.
      </p>
      <datalist id={COUNTRY_LIST_ID}>
        {ORIGINS.map((c) => (
          <option key={c.code} value={c.name} />
        ))}
      </datalist>
    </div>
  );
};
