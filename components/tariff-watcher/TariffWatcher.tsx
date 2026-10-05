"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TableCellsIcon,
} from "@heroicons/react/20/solid";
import { Country } from "../../constants/countries";
import { HtsElement } from "../../interfaces/hts";
import { Menu } from "@headlessui/react";
import { useHts } from "../../contexts/HtsContext";
import { htsCodeDigitsOnly } from "../../libs/hts-code";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { Segmented } from "../duty-calculator/controls";
import { formatDate, formatMoney, formatPct } from "../duty-calculator/format";
import { mono } from "../ui/font";
import { COLUMN_LABEL } from "../duty-calculator/Results";
import { VerifiedNotice } from "../duty-calculator/shared";
import { TariffFinder } from "../duty-calculator/useTariffFinder";
import styles from "../ui/theme.module.css";
import { downloadReport, ExportFormat } from "./export";
import { parseWatchList, WatchError } from "./parse";
import { BASE_PART, programName, shortProgram, UNITS, VALUE, watchProduct, WatchRow } from "./report";

// Tariff Watcher: the current duty rate for every product on a list, one after another.
// The list is "HTS code, country" per line; the report updates as it's edited.

const pct = (value: number) => formatPct(Math.round(value * 100) / 100);

export const EXAMPLE_LIST = ["8413919015,BR", "8409999190,AR", "8483308089,AT", "8708801690,AU"].join("\n");

// Same series as the calculator's Cost Breakdown
const CHART = ["var(--dc-chart-1)", "var(--dc-chart-2)", "var(--dc-chart-3)", "var(--dc-chart-4)", "var(--dc-chart-5)"];

type Sort = "list" | "highest" | "country";
const SORTS: { id: Sort; label: string }[] = [
  { id: "list", label: "List order" },
  { id: "highest", label: "Highest rate" },
  { id: "country", label: "Country" },
];

export const TariffWatcher = ({
  f,
  text,
  onTextChange,
  onOpenInCalculator,
}: {
  f: TariffFinder;
  text: string;
  onTextChange: (text: string) => void;
  onOpenInCalculator: (element: HtsElement, country: Country) => void;
}) => {
  const { htsElements } = useHts();
  // Big lists stay responsive while typing; the report catches up
  const listText = useDeferredValue(text);

  const byDigits = useMemo(() => {
    const map = new Map<string, HtsElement>();
    htsElements.forEach((el) => {
      const digits = htsCodeDigitsOnly(el.htsno);
      if (digits.length === 8 || digits.length === 10) map.set(digits, el);
    });
    return map;
  }, [htsElements]);

  const parsed = useMemo(
    () => (byDigits.size ? parseWatchList(listText, (digits) => byDigits.get(digits)) : { entries: [], errors: [] }),
    [listText, byDigits]
  );

  const rows = useMemo(
    () => parsed.entries.map((entry) => watchProduct(entry, htsElements, f.entryDate)),
    [parsed, htsElements, f.entryDate]
  );

  // Counted once the list settles
  const lastTracked = useRef("");
  useEffect(() => {
    const key = `${parsed.entries.length}/${parsed.errors.length}`;
    if (!parsed.entries.length || lastTracked.current === key) return;
    const timeout = setTimeout(() => {
      lastTracked.current = key;
      trackEvent(MixpanelEvent.TARIFF_WATCHER_LIST_CHANGED, {
        products: parsed.entries.length,
        errors: parsed.errors.length,
      });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [parsed]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
      <ListRail f={f} text={text} onTextChange={onTextChange} count={parsed.entries.length} errors={parsed.errors} />
      <div className="min-w-0">
        {f.loading ? (
          <div className={`${styles.card} p-5 flex flex-col gap-3`} aria-busy="true" aria-label="Loading HTS data">
            <div className={`${styles.skeleton} h-7 w-48`} />
            <div className={`${styles.skeleton} h-24 w-full`} />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={`${styles.skeleton} h-14 w-full`} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyReport
            hasText={Boolean(text.trim())}
            onExample={() => {
              onTextChange(EXAMPLE_LIST);
              trackEvent(MixpanelEvent.TARIFF_WATCHER_EXAMPLE_USED);
            }}
          />
        ) : (
          <Report f={f} rows={rows} skipped={parsed.errors.length} onOpenInCalculator={onOpenInCalculator} />
        )}
      </div>
    </div>
  );
};

// ── The list ──

const ListRail = ({
  f,
  text,
  onTextChange,
  count,
  errors,
}: {
  f: TariffFinder;
  text: string;
  onTextChange: (text: string) => void;
  count: number;
  errors: WatchError[];
}) => {
  const [showErrors, setShowErrors] = useState(true);
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-4">
      <div>
        <h2 className="text-[22px] font-semibold tracking-tight">Your products</h2>
        <p className="mt-1 text-[14px] text-[var(--dc-text-2)]">One per line: HTS code, country</p>
      </div>
      <div className={`${styles.card} p-4 flex flex-col gap-4`} style={{ borderRadius: 12 }}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor="tw-list"
              className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--dc-text-3)]"
            >
              Watch list
            </label>
            {text.trim() ? (
              <button
                type="button"
                className="text-[12px] font-medium text-[var(--dc-text-3)] hover:text-[var(--dc-text)]"
                onClick={() => onTextChange("")}
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                className={`${styles.link} text-[12px]`}
                onClick={() => {
                  onTextChange(EXAMPLE_LIST);
                  trackEvent(MixpanelEvent.TARIFF_WATCHER_EXAMPLE_USED);
                }}
              >
                Use an example
              </button>
            )}
          </div>
          <textarea
            id="tw-list"
            className={`${styles.input} ${mono.className} py-3 leading-[1.7] resize-y`}
            style={{ height: "auto", minHeight: 240, fontSize: 13.5 }}
            rows={12}
            spellCheck={false}
            autoComplete="off"
            placeholder={EXAMPLE_LIST}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            aria-describedby="tw-list-status"
          />
          <p id="tw-list-status" className="text-[12px] text-[var(--dc-text-3)]" aria-live="polite">
            {count === 0 && errors.length === 0
              ? "Paste from a spreadsheet: code and country columns work too."
              : `${count} ${count === 1 ? "product" : "products"}${errors.length ? ` · ${errors.length} ${errors.length === 1 ? "line" : "lines"} skipped` : ""
              }`}
          </p>
        </div>

        {errors.length > 0 && (
          <div className="rounded-md border border-[var(--dc-warning-border)] bg-[var(--dc-warning-soft)]">
            <button
              type="button"
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-[12.5px] font-semibold text-[var(--dc-warning)]"
              onClick={() => setShowErrors((x) => !x)}
              aria-expanded={showErrors}
            >
              <span className="inline-flex items-center gap-1.5">
                <ExclamationTriangleIcon className="w-4 h-4" aria-hidden />
                {errors.length === 1 ? "1 line couldn't be read" : `${errors.length} lines couldn't be read`}
              </span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showErrors ? "rotate-180" : ""}`} />
            </button>
            {showErrors && (
              <ul className="px-3 pb-2.5 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {errors.map((e) => (
                  <li key={e.line} className="text-[12px] leading-snug text-[var(--dc-text-2)]">
                    <span className={`${mono.className} font-semibold text-[var(--dc-text)]`}>Line {e.line}:</span>{" "}
                    {e.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1 pt-3 border-t border-[var(--dc-border)]">
          <label
            htmlFor="tw-date"
            className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--dc-text-3)]"
          >
            Rates as of
          </label>
          <input
            id="tw-date"
            type="date"
            className={`${styles.input} ${styles.num}`}
            style={{ fontSize: 14 }}
            value={f.entryDate}
            onChange={(e) => f.setEntryDate(e.target.value)}
          />
          <p className="text-[11.5px] leading-snug text-[var(--dc-text-3)]">Shared with the calculator&apos;s entry date</p>
        </div>
      </div>
    </div>
  );
};

// ── Before there's anything to show ──

const EmptyReport = ({ hasText, onExample }: { hasText: boolean; onExample: () => void }) => (
  <section className={`${styles.card} p-6 sm:p-10`}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10 items-center">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight">
          {hasText ? "None of these lines could be read yet" : "See the tariff rate for every product you import"}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--dc-text-2)]">
          Add your HTS codes and countries of origin, one pair per line. You&apos;ll get each product&apos;s total duty
          rate, the tariffs that make it up, and anything that could lower it.
        </p>
        <button type="button" className={`${styles.buttonPrimary} mt-6`} onClick={onExample}>
          Try an example list
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-surface-2)] p-5">
        <div className={styles.eyebrow}>Format</div>
        <pre className={`${mono.className} mt-3 text-[14px] leading-[1.8] text-[var(--dc-text)]`}>{EXAMPLE_LIST}</pre>
        <p className="mt-3 text-[12.5px] leading-snug text-[var(--dc-text-3)]">
          8 or 10 digits, with or without dots. The country is its two-letter code or its name.
        </p>
      </div>
    </div>
  </section>
);

// ── The report ──

const Report = ({
  f,
  rows,
  skipped,
  onOpenInCalculator,
}: {
  f: TariffFinder;
  rows: WatchRow[];
  skipped: number;
  onOpenInCalculator: (element: HtsElement, country: Country) => void;
}) => {
  const [sort, setSort] = useState<Sort>("list");
  const [open, setOpen] = useState<Record<number, boolean>>({});

  // One color per program across the whole report, in order of first appearance
  const colors = useMemo(() => {
    const map: Record<string, string> = { [BASE_PART]: CHART[0] };
    let next = 1;
    rows.forEach((r) =>
      r.parts.forEach((p) => {
        if (!map[p.key]) map[p.key] = CHART[next++ % CHART.length] ?? CHART[1];
      })
    );
    return map;
  }, [rows]);

  const sorted = useMemo(() => {
    const copy = rows.slice();
    if (sort === "highest") copy.sort((a, b) => b.totalPct - a.totalPct);
    if (sort === "country") copy.sort((a, b) => a.entry.country.name.localeCompare(b.entry.country.name));
    return copy;
  }, [rows, sort]);

  const maxPct = Math.max(...rows.map((r) => r.totalPct), 1);
  const perUnit = rows.some((r) => r.result.requiresQuantity);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="tw-report-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id="tw-report-heading" className="text-[22px] font-semibold tracking-tight">
            Tariff report
          </h2>
          <p className="mt-1 text-[14px] text-[var(--dc-text-2)]">
            {rows.length} {rows.length === 1 ? "product" : "products"} · Rates as of {formatDate(f.entryDate)}
            {skipped > 0 && (
              <span className="text-[var(--dc-warning)]">
                {" "}
                · {skipped} {skipped === 1 ? "line" : "lines"} skipped
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap w-full sm:w-auto items-center gap-2">
          <div className="w-full sm:w-[360px] whitespace-nowrap">
            <Segmented
              label="Sort products"
              options={SORTS}
              value={sort}
              onChange={(next: Sort) => {
                setSort(next);
                trackEvent(MixpanelEvent.TARIFF_WATCHER_SORTED, { sort: next });
              }}
              compact
            />
          </div>
          <ExportMenu
            onExport={(format) => {
              downloadReport(sorted, f.entryDate, format);
              trackEvent(MixpanelEvent.TARIFF_WATCHER_EXPORTED, { products: sorted.length, format });
            }}
          />
        </div>
      </div>

      <VerifiedNotice f={f} />

      <Summary rows={rows} />

      <div className={`${styles.card} overflow-hidden`}>
        {/* Column headings and the color key */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 border-b border-[var(--dc-border)]">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-[var(--dc-text-2)]">
            {Object.keys(colors).map((key) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: colors[key] }} aria-hidden />
                {key}
              </span>
            ))}
          </div>
          {perUnit && (
            <span className="text-[12px] text-[var(--dc-text-3)]">
              Per-unit rates shown for {formatMoney(VALUE).replace(".00", "")} and {UNITS.toLocaleString("en-US")} units
            </span>
          )}
        </div>
        <div
          className={`hidden md:grid ${ROW_GRID} px-5 py-2.5 bg-[var(--dc-surface-2)] border-b border-[var(--dc-border)]`}
          aria-hidden
        >
          {["Product", "Origin", "Tariffs", "Duty rate", ""].map((label, i) => (
            <span key={i} className={`${styles.eyebrow} ${i === 3 ? "text-right" : ""}`}>
              {label}
            </span>
          ))}
        </div>

        <ul className="divide-y divide-[var(--dc-border)]">
          {sorted.map((row) => (
            <RowView
              key={`${row.entry.line}-${row.entry.text}`}
              row={row}
              colors={colors}
              maxPct={maxPct}
              open={Boolean(open[row.entry.line])}
              onToggle={() => setOpen((prev) => ({ ...prev, [row.entry.line]: !prev[row.entry.line] }))}
              onOpenInCalculator={() => onOpenInCalculator(row.entry.element, row.entry.country)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
};

const Summary = ({ rows }: { rows: WatchRow[] }) => {
  const average = rows.reduce((sum, r) => sum + r.totalPct, 0) / rows.length;
  const highest = rows.reduce((top, r) => (r.totalPct > top.totalPct ? r : top), rows[0]);
  const countries = new Set(rows.map((r) => r.entry.country.code)).size;
  const couldBeLower = rows.filter((r) => r.bestSavingPct > 0.005).length;
  const tiles: { label: string; value: string; note: string; accent?: boolean }[] = [
    {
      label: "Products",
      value: String(rows.length),
      note: `From ${countries} ${countries === 1 ? "country" : "countries"}`,
    },
    { label: "Average duty rate", value: pct(average), note: "Across the list", accent: true },
    {
      label: "Highest rate",
      value: pct(highest.totalPct),
      note: `${highest.entry.element.htsno} · ${highest.entry.country.flag} ${highest.entry.country.name}`,
    },
    {
      label: "Could be lower",
      value: String(couldBeLower),
      note: couldBeLower ? "Have an exemption worth checking" : "No exemptions to check",
    },
  ];
  return (
    // 1px gaps over the border color draw the dividers, like the calculator's summary
    <div className={`${styles.card} overflow-hidden`}>
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--dc-border)]">
        {tiles.map((t) => (
          <div key={t.label} className="bg-[var(--dc-surface)] p-5">
            <dt className={styles.eyebrow}>{t.label}</dt>
            <dd
              className={`${styles.num} mt-2 text-[26px] leading-none font-semibold tracking-tight ${t.accent ? "text-[var(--dc-accent)]" : ""
                }`}
            >
              {t.value}
            </dd>
            <dd className="mt-2 text-[12.5px] text-[var(--dc-text-3)] truncate" title={t.note}>
              {t.note}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

const ROW_GRID = "md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,1.7fr)_96px_28px] md:gap-5 md:items-center";

const RowView = ({
  row,
  colors,
  maxPct,
  open,
  onToggle,
  onOpenInCalculator,
}: {
  row: WatchRow;
  colors: Record<string, string>;
  maxPct: number;
  open: boolean;
  onToggle: () => void;
  onOpenInCalculator: () => void;
}) => {
  const { entry } = row;
  const detailsId = `tw-row-${entry.line}`;
  return (
    <li>
      <button
        type="button"
        className={`w-full grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 ${ROW_GRID} px-5 py-4 text-left text-[var(--dc-text)] transition-colors hover:bg-[var(--dc-surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--dc-accent)] ${open ? "bg-[var(--dc-surface-2)]" : ""
          }`}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={detailsId}
      >
        {/* Product */}
        <span className="min-w-0 flex flex-col gap-0.5">
          <span className={`${mono.className} text-[14px] font-semibold text-[var(--dc-text)]`}>
            {entry.element.htsno}
          </span>
          <span className="text-[12.5px] leading-snug text-[var(--dc-text-3)] line-clamp-2" title={row.description}>
            {row.description}
          </span>
        </span>

        {/* Duty rate, beside the product on phones */}
        <span className="md:order-4 flex flex-col items-end gap-1 md:self-center">
          <span className={`${styles.num} text-[20px] leading-none font-semibold tracking-tight`}>{pct(row.totalPct)}</span>
          {row.bestSavingPct > 0.005 && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[var(--dc-positive-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--dc-positive)]">
              <SparklesIcon className="w-3 h-3" aria-hidden />
              Could be lower
            </span>
          )}
        </span>

        {/* Origin */}
        <span className="md:order-2 col-span-2 md:col-span-1 flex items-center gap-2 min-w-0 text-[14px]">
          <span className="text-lg leading-none" aria-hidden>
            {entry.country.flag}
          </span>
          <span className="truncate">{entry.country.name}</span>
        </span>

        {/* Tariffs: a bar scaled to the highest rate on the list, and the rate of each part */}
        <span className="md:order-3 col-span-2 md:col-span-1 flex flex-col gap-2 min-w-0">
          <span className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--dc-surface-3)]" aria-hidden>
            <span className="flex h-full" style={{ width: `${Math.max((row.totalPct / maxPct) * 100, row.totalPct > 0 ? 2 : 0)}%` }}>
              {row.parts.map((p) => (
                <span
                  key={p.key}
                  className="h-full"
                  style={{ width: `${(p.pct / row.totalPct) * 100}%`, background: colors[p.key] }}
                />
              ))}
            </span>
          </span>
          <span className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-[var(--dc-text-2)]">
            {row.parts.length === 0 ? (
              <span className="text-[var(--dc-text-3)]">Duty free</span>
            ) : (
              row.parts.map((p) => (
                <span key={p.key} className="inline-flex items-center gap-1.5 whitespace-nowrap" title={p.key}>
                  <span className="h-2 w-2 rounded-[2px]" style={{ background: colors[p.key] }} aria-hidden />
                  {p.key === BASE_PART ? "Base" : shortProgram(p.key)}
                  <span className={`${styles.num} font-semibold text-[var(--dc-text)]`}>{pct(p.pct)}</span>
                </span>
              ))
            )}
          </span>
        </span>

        <ChevronDownIcon
          className={`hidden md:block md:order-5 w-5 h-5 justify-self-end text-[var(--dc-text-3)] transition-transform ${open ? "rotate-180" : ""
            }`}
          aria-hidden
        />
      </button>

      {open && (
        <div id={detailsId} className="px-5 pb-5 pt-1 bg-[var(--dc-surface-2)]">
          <RowDetails row={row} onOpenInCalculator={onOpenInCalculator} />
        </div>
      )}
    </li>
  );
};

const RowDetails = ({ row, onOpenInCalculator }: { row: WatchRow; onOpenInCalculator: () => void }) => {
  const { result } = row;
  const applied = result.lines.filter((l) => l.status === "applies");
  const notApplied = result.lines.length - applied.length;
  const open = result.questions.filter((q) => !q.answered);
  const heading = (id: string) => result.lines.find((l) => `confirm:${l.code}` === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
      <div className={`${styles.card} overflow-hidden`} style={{ borderRadius: 12, boxShadow: "none" }}>
        <table className="w-full text-left border-collapse text-[13px]">
          <caption className="sr-only">Charges for {row.entry.element.htsno}</caption>
          <tbody className={styles.num}>
            <tr>
              <td className="px-4 py-2.5 align-top">
                <span className={`${mono.className} font-semibold text-[var(--dc-accent)]`}>Base</span>
                <span className="ml-2 text-[var(--dc-text-2)]">{COLUMN_LABEL[result.column]}</span>
              </td>
              <td className="px-4 py-2.5 text-right text-[var(--dc-text-2)]">{result.base.reasons[0] ?? "Free"}</td>
            </tr>
            {applied.map((line) => (
              <tr key={line.code} className="border-t border-[var(--dc-border)]">
                <td className="px-4 py-2.5 align-top">
                  <span className={`${mono.className} font-semibold text-[var(--dc-accent)]`}>{line.code}</span>
                  <span className="ml-2 text-[var(--dc-text)]">{line.name}</span>
                  <span className="block text-[12px] text-[var(--dc-text-3)]">{programName(line.program)}</span>
                </td>
                <td className="px-4 py-2.5 text-right align-top whitespace-nowrap">
                  {line.ratePct !== undefined ? pct(line.ratePct) : "—"}
                </td>
              </tr>
            ))}
            <tr className="border-t border-[var(--dc-border-strong)] bg-[var(--dc-surface-2)]">
              <td className="px-4 py-2.5 font-semibold">Total duty rate</td>
              <td className="px-4 py-2.5 text-right font-bold">{pct(row.totalPct)}</td>
            </tr>
          </tbody>
        </table>
        {notApplied > 0 && (
          <p className="px-4 py-2 border-t border-[var(--dc-border)] text-[12px] text-[var(--dc-text-3)]">
            {notApplied} more {notApplied === 1 ? "heading was" : "headings were"} checked and don&apos;t apply
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {open.length > 0 ? (
          <div>
            <div className="text-[13.5px] font-semibold">
              {open.length === 1 ? "1 question could change this" : `${open.length} questions could change this`}
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {open.slice(0, 4).map((q) => (
                <li key={q.input.id} className="text-[12.5px] leading-snug text-[var(--dc-text-2)]">
                  {heading(q.input.id) ? (
                    <>
                      <span className={`${mono.className} font-semibold`}>{heading(q.input.id)?.code}</span>{" "}
                      {heading(q.input.id)?.name}
                    </>
                  ) : (
                    q.input.label
                  )}
                </li>
              ))}
              {open.length > 4 && (
                <li className="text-[12.5px] text-[var(--dc-text-3)]">and {open.length - 4} more</li>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-[13px] text-[var(--dc-text-2)]">No questions could change this rate.</p>
        )}
        {result.warnings.map((w) => (
          <p key={w} className="flex gap-1.5 text-[12.5px] leading-snug text-[var(--dc-warning)]">
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-px" aria-hidden />
            {w}
          </p>
        ))}
        <button type="button" className={`${styles.buttonPrimary} self-start`} onClick={onOpenInCalculator}>
          Open in calculator
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Export ──

const EXPORTS: { format: ExportFormat; label: string; note: string; Icon: typeof TableCellsIcon }[] = [
  { format: "xlsx", label: "Excel (.xlsx)", note: "Formatted, with a notes sheet", Icon: TableCellsIcon },
  { format: "csv", label: "CSV (.csv)", note: "For any spreadsheet or system", Icon: DocumentTextIcon },
];

const ExportMenu = ({ onExport }: { onExport: (format: ExportFormat) => void }) => (
  <Menu as="div" className="relative flex-1 sm:flex-none">
    <Menu.Button className={`${styles.button} w-full justify-center`}>
      <ArrowDownTrayIcon className="w-4 h-4" />
      Export
      <ChevronDownIcon className="w-4 h-4 -mr-1 text-[var(--dc-text-3)]" />
    </Menu.Button>
    <Menu.Items className="absolute right-0 z-30 mt-2 w-[250px] rounded-[10px] border border-[var(--dc-border)] bg-[var(--dc-surface)] p-1.5 shadow-[var(--dc-shadow-pop)] focus:outline-none">
      {EXPORTS.map(({ format, label, note, Icon }) => (
        <Menu.Item key={format}>
          {({ active }) => (
            <button
              type="button"
              className={`w-full flex items-start gap-3 rounded-md px-3 py-2.5 text-left text-[var(--dc-text)] ${
                active ? "bg-[var(--dc-accent-soft)]" : ""
              }`}
              onClick={() => onExport(format)}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0 text-[var(--dc-accent)]" aria-hidden />
              <span className="flex flex-col">
                <span className="text-[14px] font-semibold">{label}</span>
                <span className="text-[12.5px] text-[var(--dc-text-3)]">{note}</span>
              </span>
            </button>
          )}
        </Menu.Item>
      ))}
    </Menu.Items>
  </Menu>
);
