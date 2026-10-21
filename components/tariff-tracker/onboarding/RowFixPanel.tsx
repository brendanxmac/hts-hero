"use client";

import { KeyboardEvent, ReactNode, useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { useHts } from "@/contexts/HtsContext";
import { HtsElement } from "@/interfaces/hts";
import { canonicalHtsCode, htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { CountryField } from "@/components/duty-calculator/fields/CountryField";
import { findCountry } from "../parse";
import { describe } from "../report";
import { useTracker } from "../TrackerContext";
import { CodeSuggestionSelect, HighlightedCode } from "./CodeSuggestionSelect";
import {
  codeSuggestions,
  countrySuggestion,
  isHs6Like,
  MAX_SUGGESTIONS,
} from "./fixes";
import { SheetRow } from "./sheet";

// Beside the sheet (SheetReview): the picked row that needs a fix, with all the help there is for
// it. What's wrong, the row's own context from the file (read in the browser, never kept), the
// likely codes (numbered: 1-6 pick one) and country, its code and country to edit, and the way to
// the previous and next issue. A 6-digit HS code is one product's pick at a time, never a fix for
// every row that wrote it. Keyed by row, so each row opens fresh.

const n = (count: number) => count.toLocaleString("en-US");
const OPTIONS = 6;
const ADVANCE_MS = 450;

const Option = ({
  index,
  onPick,
  children,
}: {
  index: number;
  onPick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onPick}
    className="group flex w-full items-start gap-3 rounded-xl border border-base-300 bg-base-100 p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
  >
    <span
      className={`${mono.className} flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-base-300 text-xs font-bold text-base-content/55 group-hover:border-primary/40 group-hover:text-primary`}
    >
      {index + 1}
    </span>
    <span className="flex min-w-0 flex-col gap-0.5">{children}</span>
  </button>
);

export const RowFixPanel = ({
  row,
  rows,
  header,
  columns,
  descCol,
  position,
  onEdit,
  onDelete,
  onInclude,
  onPrev,
  onNext,
  onClose,
}: {
  row: SheetRow<HtsElement>;
  rows: string[][];
  header: string[] | null;
  columns: { code: number; country: number };
  // The column that says what the product is (guide.ts describingColumn)
  descCol: number | null;
  // Which issue this is, of how many still to fix (null: not one of them)
  position: { index: number; total: number } | null;
  onEdit: (column: number, value: string) => void;
  onDelete: () => void;
  onInclude: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) => {
  const { findElement } = useTracker();
  const { htsElements } = useHts();
  // What was wrong as the row was opened: the title stays put while it's fixed
  const [opened] = useState(() => row.reason ?? "");
  const codeOk = (code: string) => {
    const digits = htsCodeDigitsOnly(code);
    return (
      (digits.length === 8 || digits.length === 10) && !!findElement(digits)
    );
  };
  const codeBad = row.kind === "error" && !codeOk(row.code);
  const countryBad = row.kind === "error" && !findCountry(row.country);
  const codes = useMemo(
    () =>
      codeBad
        ? codeSuggestions(row.code, htsElements, (el) =>
            describe(el, htsElements),
          )
        : [],
    [codeBad, row.code, htsElements],
  );
  const country = countryBad ? countrySuggestion(row.country) : null;
  const fixed = row.kind === "ok";
  const setAside = row.kind === "ignored" || row.kind === "above";

  // A picked suggestion that leaves the row reading: a beat to see it, then the next issue
  const pickCode = (htsno: string) => {
    onEdit(columns.code, htsno);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, {
      help: "panel_code",
    });
    if (!countryBad) setTimeout(onNext, ADVANCE_MS);
  };
  const pickCountry = (name: string) => {
    onEdit(columns.country, name);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, {
      help: "panel_country",
    });
    if (!codeBad) setTimeout(onNext, ADVANCE_MS);
  };

  // 1-6 pick a code while the panel has focus (in the grid, a digit types into the cell)
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (
      (e.target as HTMLElement).closest(
        "input, select, textarea, [role='listbox']",
      )
    ) {
      if (e.key === "Enter" && fixed) onNext();
      return;
    }
    const k = Number(e.key);
    if (k >= 1 && k <= Math.min(OPTIONS, codes.length)) {
      e.preventDefault();
      pickCode(codes[k - 1].htsno);
    } else if (e.key === "Escape") onClose();
  };

  const context = (rows[row.index] ?? [])
    .map((value, i) => ({ value, label: header?.[i] || `Column ${i + 1}`, i }))
    .filter(
      (c) => c.value?.trim() && c.i !== columns.code && c.i !== columns.country,
    )
    .slice(0, 5);
  const product = descCol !== null ? rows[row.index]?.[descCol] : null;

  return (
    <aside
      onKeyDown={onKey}
      className={`${tt.panel} group/panel flex h-[min(72vh,46rem)] flex-col overflow-hidden`}
      aria-label={`Fix row ${row.index + 1}`}
    >
      {/* Which row, which issue, and the way through them */}
      <div className="flex items-center justify-between gap-2 border-b border-base-300 px-4 py-2.5">
        <span className="text-sm font-semibold text-base-content">
          Row {row.index + 1}
          {position && (
            <span className="ml-2 font-normal text-base-content/55">
              Issue {n(position.index + 1)} of {n(position.total)}
            </span>
          )}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-md p-1.5 text-base-content/55 hover:bg-tt-soft hover:text-base-content"
            aria-label="Previous issue"
            title="Previous issue"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-md p-1.5 text-base-content/55 hover:bg-tt-soft hover:text-base-content"
            aria-label="Next issue"
            title="Next issue"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-base-content/55 hover:bg-tt-soft hover:text-base-content"
            aria-label="Close"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        {/* What's wrong (or that it's fixed) */}
        <div className="flex flex-col gap-1.5">
          <span
            className={tt.eyebrow(
              fixed ? "success" : setAside ? "neutral" : "warning",
            )}
          >
            {fixed ? "Fixed" : setAside ? "Set aside" : "Needs a fix"}
          </span>
          <h2
            className={`${tt.display} m-0 text-lg font-semibold leading-snug text-base-content`}
          >
            {setAside
              ? row.kind === "above"
                ? "Above the header row"
                : row.reason
              : opened || "Ready"}
          </h2>
          {fixed && (
            <p className="m-0 flex items-center gap-1.5 text-sm font-semibold text-success">
              <CheckCircleIcon className="h-4 w-4" aria-hidden />
              This row reads now.
            </p>
          )}
        </div>

        {/* A heading-only code: this product's own pick */}
        {codeBad && isHs6Like(row.code) && (
          <p className="m-0 rounded-xl border border-warning/30 bg-warning/5 px-3.5 py-2.5 text-sm text-base-content/80">
            {/* Zeros on the end of a 6-digit code: what it may have been */}
            {htsCodeDigitsOnly(row.code).length > 6 && "It may be the 6-digit HS code "}
            <strong className="text-base-content">
              {canonicalHtsCode(htsCodeDigitsOnly(row.code).slice(0, 6))}
            </strong>{" "}
            {htsCodeDigitsOnly(row.code).length > 6 && "with zeros added to the end, which "}
            covers{" "}
            {codes.length >= MAX_SUGGESTIONS
              ? `${MAX_SUGGESTIONS} or more US lines`
              : `${n(codes.length)} ${codes.length === 1 ? "US line" : "different US lines"}`}
            . Pick the one for this product
            {product ? (
              <>
                : <strong className="text-base-content">{product}</strong>
              </>
            ) : (
              ""
            )}
            . Rows with the same code each get their own pick.
          </p>
        )}

        {/* The row, as the file has it */}
        {context.length > 0 && (
          <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 rounded-xl bg-tt-soft px-4 py-3 text-sm">
            {context.map((c) => (
              <div key={c.i} className="contents">
                <dt className="text-base-content/55">{c.label}</dt>
                <dd className="m-0 truncate font-medium text-base-content">
                  {c.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* The likely fixes */}
        {codes.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-base-content">
              <SparklesIcon className="h-4 w-4 text-primary" aria-hidden />
              {isHs6Like(row.code) ? "Choose the full US code" : "Did you mean"}
              <span className="hidden font-normal text-base-content/50 group-focus-within/panel:inline">
                · press 1–{Math.min(OPTIONS, codes.length)}
              </span>
            </span>
            {codes.slice(0, OPTIONS).map((c, i) => (
              <Option key={c.digits} index={i} onPick={() => pickCode(c.htsno)}>
                <HighlightedCode written={row.code} htsno={c.htsno} />
                <span className="line-clamp-2 text-xs text-base-content/65">
                  {c.description}
                </span>
              </Option>
            ))}
            {codes.length > OPTIONS && (
              <CodeSuggestionSelect
                written={row.code}
                codes={codes.slice(OPTIONS)}
                onPick={pickCode}
                label="More codes"
              />
            )}
          </div>
        )}
        {country && (
          <button
            type="button"
            className="flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
            onClick={() => pickCountry(country.name)}
          >
            <SparklesIcon className="h-4 w-4" aria-hidden />
            Use {country.flag} {country.name}
          </button>
        )}

        {/* Or type it */}
        {!setAside && (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={ui.fieldLabel}>HTS code</span>
              <input
                className={`${ui.input} ${mono.className} font-semibold ${codeBad ? "border-warning!" : ""}`}
                value={row.code}
                placeholder="8 or 10 digits"
                spellCheck={false}
                onChange={(e) => onEdit(columns.code, e.target.value)}
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={`tt-panel-country-${row.index}`}
                className={ui.fieldLabel}
              >
                Country of origin
              </label>
              {/* The calculator's country search, flags and all; a country we can't read stays as the prompt */}
              <div
                className={countryBad ? "rounded-md ring-1 ring-warning" : ""}
              >
                <CountryField
                  id={`tt-panel-country-${row.index}`}
                  max={1}
                  selected={
                    findCountry(row.country) ? [findCountry(row.country)!] : []
                  }
                  onChange={(next) =>
                    next[0]
                      ? pickCountry(next[0].name)
                      : onEdit(columns.country, "")
                  }
                  suggested={country ? [country] : []}
                  placeholder={
                    row.country.trim()
                      ? `"${row.country.trim()}": search countries`
                      : "Search countries"
                  }
                />
              </div>
            </div>
          </div>
        )}
        {row.kind === "error" && !codeBad && !countryBad && (
          <p className="m-0 flex items-start gap-1.5 text-xs text-base-content/65">
            <ExclamationTriangleIcon
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning"
              aria-hidden
            />
            {row.reason}
          </p>
        )}
      </div>

      {/* What to do with it */}
      <div className="flex items-center justify-between gap-2 border-t border-base-300 px-4 py-3">
        <button
          type="button"
          className={`${ui.button({ size: "sm" })} gap-1.5 hover:border-error/40! hover:text-error`}
          onClick={onDelete}
        >
          <TrashIcon className="h-4 w-4" aria-hidden />
          Delete row
        </button>
        {row.kind === "ignored" ? (
          <button
            type="button"
            className={ui.button({ size: "sm" })}
            onClick={onInclude}
          >
            It&apos;s an import, include it
          </button>
        ) : (
          <button
            type="button"
            className={ui.button({
              variant: fixed ? "primary" : "secondary",
              size: "sm",
            })}
            onClick={onNext}
          >
            {fixed ? "Next issue" : "Skip for now"}
            <ChevronRightIcon className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </aside>
  );
};
