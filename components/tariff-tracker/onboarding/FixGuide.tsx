"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, ExclamationTriangleIcon, SparklesIcon, TableCellsIcon, TrashIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { Countries } from "@/constants/countries";
import { useHts } from "@/contexts/HtsContext";
import { HtsElement } from "@/interfaces/hts";
import { canonicalHtsCode, htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { findCountry } from "../parse";
import { describe } from "../report";
import { useTracker } from "../TrackerContext";
import { CodeSuggestionSelect, HighlightedCode } from "./CodeSuggestionSelect";
import { codeSuggestions, countrySuggestion, isHs6Like, MAX_SUGGESTIONS } from "./fixes";
import { cardDone, cardRows, describingColumn, FixCard, fixCards } from "./guide";
import { delay } from "./parts";
import { SheetRow } from "./sheet";

// The guided way to fix an upload's problems, one card at a time (the spreadsheet, SheetGrid, is
// the other way, one click away). The same mistake on many rows comes first, fixed once for all of
// them; then each row left, with its own context from the file (read in the browser, never kept).
// Picking a suggestion fixes the card and moves on; number keys pick the first suggestions.

const n = (count: number) => count.toLocaleString("en-US");
const ORIGINS = Countries.filter((c) => c.code !== "US");
const LIST_ID = "tt-guide-countries";
const OPTIONS = 6;
const ADVANCE_MS = 450;

interface Props {
  rows: string[][];
  header: string[] | null;
  columns: { code: number; country: number };
  sheet: SheetRow<HtsElement>[];
  onEdit: (row: number, column: number, value: string) => void;
  onEditMany: (column: number, rows: number[], value: string) => void;
  onDelete: (rows: number[]) => void;
  onOpenSheet: () => void;
  onFinish: () => void;
  ready: number;
}

// One option to pick, numbered for the keyboard
const Option = ({ index, onPick, children }: { index: number; onPick: () => void; children: ReactNode }) => (
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

// What the file says about a row, beside the code and country (never kept)
const RowContext = ({ rows, header, row, skip }: { rows: string[][]; header: string[] | null; row: number; skip: number[] }) => {
  const cells = (rows[row] ?? [])
    .map((value, i) => ({ value, label: header?.[i] || `Column ${i + 1}`, i }))
    .filter((c) => c.value?.trim() && !skip.includes(c.i));
  if (!cells.length) return null;
  return (
    <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 rounded-xl bg-tt-soft px-4 py-3 text-sm">
      {cells.slice(0, 5).map((c) => (
        <div key={c.i} className="contents">
          <dt className="text-base-content/55">{c.label}</dt>
          <dd className="m-0 truncate font-medium text-base-content">{c.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const FixGuide = ({ rows, header, columns, sheet, onEdit, onEditMany, onDelete, onOpenSheet, onFinish, ready }: Props) => {
  const { findElement } = useTracker();
  const { htsElements } = useHts();
  const codeOk = (digits: string) => (digits.length === 8 || digits.length === 10) && !!findElement(digits);
  // The cards, worked out once as the flow opens (fixing rows doesn't reshuffle them)
  // The one code a written code can only mean (a dropped leading zero), else null: only then is one
  // fix safe for every row that wrote it
  const onlyFix = (code: string) => {
    if (isHs6Like(code)) return null;
    const found = codeSuggestions(code, htsElements, (el) => el.htsno);
    return found.length === 1 ? found[0].htsno : null;
  };
  const [cards, setCards] = useState<FixCard[]>(() => fixCards(sheet, codeOk, onlyFix));
  const [at, setAt] = useState(0);
  // Which way the last move went: the next card slides in from that side
  const [dir, setDir] = useState<"forward" | "back">("forward");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const doneFlags = cards.map((c) => cardDone(c, sheet, codeOk));
  // The latest, for a move that happens a beat after the fix
  const latest = useRef(doneFlags);
  latest.current = doneFlags;
  const doneCount = doneFlags.filter(Boolean).length;
  const finished = at >= cards.length;
  const card = finished ? null : cards[at];
  const descCol = useMemo(() => describingColumn(rows, header, [columns.code, columns.country]), [rows, header, columns]);

  // On to the next card still to do (after this one, then from the top); the end when none is
  const next = (from = at) => {
    clearTimeout(timer.current);
    const flags = cards.map((c) => cardDone(c, sheet, codeOk));
    const after = flags.findIndex((d, i) => i > from && !d);
    setDir("forward");
    setAt(after !== -1 ? after : cards.length);
  };
  // After a fix: a beat to see it land, then on to the next card still to do (one a group fix
  // already finished is passed by)
  const advanceSoon = () => {
    clearTimeout(timer.current);
    setDir("forward");
    timer.current = setTimeout(
      () =>
        setAt((current) => {
          const after = latest.current.findIndex((d, i) => i > current && !d);
          return after !== -1 ? after : latest.current.length;
        }),
      ADVANCE_MS,
    );
  };

  const describeEl = (el: HtsElement) => describe(el, htsElements);
  const sample = card ? sheet[cardRows(card)[0]] : null;
  const codes = useMemo(
    () => (card && card.kind !== "country" && sample && !codeOk(htsCodeDigitsOnly(sample.code)) ? codeSuggestions(sample.code, htsElements, describeEl) : []),
    [card, sample?.code, htsElements], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const pickCode = (htsno: string) => {
    if (!card) return;
    if (card.kind === "row") onEdit(card.row, columns.code, htsno);
    else onEditMany(columns.code, card.rows, htsno);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, { help: "guide_code", rows: cardRows(card).length });
    // A row with another problem stays to be finished
    if (card.kind !== "row" || findCountry(sample?.country ?? "")) advanceSoon();
  };

  // Number keys pick the first suggestions (not while typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select, [role='listbox']")) return;
      const k = Number(e.key);
      if (k >= 1 && k <= Math.min(OPTIONS, codes.length)) {
        e.preventDefault();
        pickCode(codes[k - 1].htsno);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ── The end ──
  if (finished || !card) {
    const left = sheet.filter((r) => r.kind === "error").length;
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <span
          className={`tt-ob-pop flex h-14 w-14 items-center justify-center rounded-full ${left ? "bg-warning/15 text-warning" : "bg-success text-success-content"}`}
          aria-hidden
        >
          {left ? <ExclamationTriangleIcon className="h-7 w-7" /> : <CheckCircleIcon className="h-8 w-8" />}
        </span>
        <h1
          id="tt-onboarding-title"
          tabIndex={-1}
          className={`${tt.display} tt-ob-rise m-0 text-[2rem] font-semibold leading-tight text-base-content outline-hidden`}
        >
          {left ? `${n(left)} ${left === 1 ? "row still needs" : "rows still need"} a fix` : "All fixed. Nice work."}
        </h1>
        <p className="tt-ob-rise m-0 text-base text-base-content/75" style={delay(80)}>
          {left
            ? "Track what's ready now, and fix the rest whenever you like. Or go back and finish them."
            : `${n(ready)} ${ready === 1 ? "import is" : "imports are"} ready to track.`}
        </p>
        <div className="tt-ob-rise flex w-full flex-col gap-3" style={delay(160)}>
          <button
            type="button"
            className={`${ui.button({ variant: "primary", size: "lg" })} h-14 w-full text-lg`}
            onClick={onFinish}
            disabled={!ready}
            autoFocus
          >
            Track {n(ready)} {ready === 1 ? "import" : "imports"}
            <ArrowRightIcon className="h-5 w-5" aria-hidden />
          </button>
          {left > 0 && (
            <button
              type="button"
              className={`${ui.link} self-center text-sm`}
              onClick={() => {
                setCards(fixCards(sheet, codeOk, onlyFix));
                setAt(0);
              }}
            >
              Go through the {n(left)} left
            </button>
          )}
          <button type="button" className={`${ui.link} self-center text-sm`} onClick={onOpenSheet}>
            See everything in a spreadsheet
          </button>
        </div>
      </div>
    );
  }

  const done = doneFlags[at];
  // Enter in a field moves on once the card is fixed (a beat later, after a picked suggestion lands)
  const onFieldKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    setTimeout(() => latest.current[at] && next(), 0);
  };
  const rowsOf = cardRows(card);
  const country = card.kind === "country" ? countrySuggestion(card.value) : sample && !findCountry(sample.country) ? countrySuggestion(sample.country) : null;

  return (
    // A steady height, so the page doesn't re-center as cards of different heights come and go
    <div className="mx-auto flex min-h-[min(80vh,48rem)] w-full max-w-2xl flex-col justify-start gap-6">
      {/* Where they are: issue k of n, and the way to the spreadsheet */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-base-content">
            Issue {n(at + 1)} of {n(cards.length)}
            <span className="ml-2 font-normal text-base-content/55">
              {n(doneCount)} fixed · {n(ready)} {ready === 1 ? "import" : "imports"} ready
            </span>
          </span>
          <button type="button" className={`${ui.link} inline-flex items-center gap-1.5 text-sm`} onClick={onOpenSheet}>
            <TableCellsIcon className="h-4 w-4" aria-hidden />
            Edit in a spreadsheet
          </button>
        </div>
        <div className="flex h-1.5 gap-1" aria-hidden>
          {cards.map((_, i) => (
            <span key={i} className={`h-full flex-1 rounded-full transition-colors ${doneFlags[i] ? "bg-success" : i === at ? "bg-primary" : "bg-base-300"}`} />
          ))}
        </div>
      </div>

      <section
        key={at}
        className={`${tt.panel} ${dir === "forward" ? "tt-ob-from-right" : "tt-ob-from-left"} flex flex-col gap-5 p-6`}
        aria-labelledby="tt-onboarding-title"
      >
        {/* What it's about */}
        <div className="flex flex-col gap-2">
          <span className={tt.eyebrow(done ? "success" : "warning")}>
            {done ? "Fixed" : card.kind === "row" ? `Row ${card.row + 1}` : `Same fix for ${n(rowsOf.length)} rows`}
          </span>
          <h1 id="tt-onboarding-title" tabIndex={-1} className={`${tt.display} m-0 text-[1.6rem] font-semibold leading-tight text-base-content outline-hidden`}>
            {card.kind === "country" ? (
              <>&ldquo;{card.value}&rdquo; isn&apos;t a country we recognize</>
            ) : card.kind === "code" ? (
              <>
                {n(rowsOf.length)} rows use <span className={mono.className}>{canonicalHtsCode(card.value) ?? card.value}</span>
              </>
            ) : (
              (card.reason ?? "Needs a fix")
            )}
          </h1>
          {card.kind === "code" && sample?.reason && (
            <p className="m-0 text-sm text-base-content/70">{sample.reason}. There&apos;s only one code it can be, so it can go on all of them.</p>
          )}
          {/* A heading-only code: each product its own pick, never one for all */}
          {card.kind === "row" && sample && isHs6Like(sample.code) && !done && (
            <p className="m-0 rounded-xl border border-warning/30 bg-warning/5 px-3.5 py-2.5 text-sm text-base-content/80">
              {/* Zeros on the end of a 6-digit code: what it may have been */}
              {htsCodeDigitsOnly(sample.code).length > 6 && "It may be the 6-digit HS code "}
              <strong className="text-base-content">{canonicalHtsCode(htsCodeDigitsOnly(sample.code).slice(0, 6))}</strong>{" "}
              {htsCodeDigitsOnly(sample.code).length > 6 && "with zeros added to the end, which "}
              covers{" "}
              {codes.length >= MAX_SUGGESTIONS
                ? `${MAX_SUGGESTIONS} or more US lines`
                : `${n(codes.length)} ${codes.length === 1 ? "US line" : "different US lines"}`}
              . Pick the one for this product
              {descCol !== null && rows[card.row]?.[descCol] ? (
                <>
                  : <strong className="text-base-content">{rows[card.row][descCol]}</strong>
                </>
              ) : (
                ""
              )}
              . Other rows with the same code get their own pick.
            </p>
          )}
          {card.kind === "country" && (
            <p className="m-0 text-sm text-base-content/70">It&apos;s on {n(rowsOf.length)} rows. Change it once and it changes on every one.</p>
          )}
        </div>

        {/* Context from the file: which products these are */}
        {card.kind === "row" ? (
          <RowContext rows={rows} header={header} row={card.row} skip={[columns.code, columns.country]} />
        ) : (
          descCol !== null && (
            <ul className="m-0 flex list-none flex-col gap-1 rounded-xl bg-tt-soft px-4 py-3 text-sm">
              {rowsOf.slice(0, 5).map((r) => (
                <li key={r} className="flex gap-3">
                  <span className={`${mono.className} w-14 shrink-0 text-xs text-base-content/50`}>Row {r + 1}</span>
                  <span className="truncate text-base-content">{rows[r]?.[descCol] || "—"}</span>
                </li>
              ))}
              {rowsOf.length > 5 && <li className="pl-[4.25rem] text-xs text-base-content/55">and {n(rowsOf.length - 5)} more</li>}
            </ul>
          )
        )}

        {done && (
          <p className="m-0 flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircleIcon className="h-5 w-5" aria-hidden />
            {card.kind === "row" ? "This row reads now." : `Fixed on ${rowsOf.length === 1 ? "the row" : `all ${n(rowsOf.length)} rows`}.`}
            <span className="font-normal text-base-content/60">Press Enter or Next to go on.</span>
          </p>
        )}
        {/* The fields stay while it's fixed: a value can be valid on the way to another ("Niger", "Nigeria") */}
        <>
          {/* The likely fixes, biggest first */}
          {!done && card.kind === "country" && country && (
            <Option
              index={0}
              onPick={() => {
                onEditMany(columns.country, card.rows, country.name);
                trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, { help: "guide_country_group", rows: card.rows.length });
                advanceSoon();
              }}
            >
              <span className="font-semibold text-base-content">
                Change all {n(card.rows.length)} to {country.flag} {country.name}
              </span>
            </Option>
          )}
          {!done && codes.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-base-content">
                <SparklesIcon className="h-4 w-4 text-primary" aria-hidden />
                {isHs6Like(sample?.code ?? "") ? "Choose the full US code" : "Did you mean"}
                {card.kind === "code" && <span className="font-normal text-base-content/60">for all {n(rowsOf.length)} rows</span>}
              </span>
              {codes.slice(0, OPTIONS).map((c, i) => (
                <Option key={c.digits} index={i} onPick={() => pickCode(c.htsno)}>
                  <HighlightedCode written={sample?.code ?? ""} htsno={c.htsno} />
                  <span className="line-clamp-2 text-xs text-base-content/65">{c.description}</span>
                </Option>
              ))}
              {codes.length > OPTIONS && (
                <CodeSuggestionSelect written={sample?.code ?? ""} codes={codes.slice(OPTIONS)} onPick={pickCode} label="More codes" />
              )}
            </div>
          )}

          {/* Or type it */}
          <div className="grid gap-3 sm:grid-cols-2">
            {card.kind === "row" && (
              <label className="flex flex-col gap-1.5">
                <span className={ui.fieldLabel}>HTS code</span>
                <input
                  className={`${ui.input} ${mono.className} font-semibold`}
                  defaultValue={sample?.code}
                  placeholder="8 or 10 digits"
                  // Into the field only when there's nothing to pick (the number keys pick suggestions)
                  autoFocus={!codeOk(htsCodeDigitsOnly(sample?.code ?? "")) && codes.length === 0}
                  spellCheck={false}
                  onChange={(e) => onEdit(card.row, columns.code, e.target.value)}
                  onKeyDown={onFieldKey}
                />
              </label>
            )}
            {card.kind !== "code" && (
              <label className="flex flex-col gap-1.5">
                <span className={ui.fieldLabel}>{card.kind === "country" ? `Country for all ${n(rowsOf.length)}` : "Country of origin"}</span>
                <input
                  className={ui.input}
                  defaultValue={card.kind === "country" ? card.value : sample?.country}
                  placeholder="Name or two-letter code"
                  autoFocus={card.kind === "row" && codeOk(htsCodeDigitsOnly(sample?.code ?? "")) && !findCountry(sample?.country ?? "")}
                  list={LIST_ID}
                  onChange={(e) =>
                    card.kind === "row" ? onEdit(card.row, columns.country, e.target.value) : onEditMany(columns.country, card.rows, e.target.value)
                  }
                  onKeyDown={onFieldKey}
                />
              </label>
            )}
            {!done && card.kind === "row" && country && (
              <button
                type="button"
                className={`${ui.badge("primary")} cursor-pointer self-start hover:bg-primary/15 sm:col-start-2`}
                onClick={() => {
                  onEdit(card.row, columns.country, country.name);
                  if (codeOk(htsCodeDigitsOnly(sample?.code ?? ""))) advanceSoon();
                }}
              >
                Use {country.flag} {country.name}
              </button>
            )}
          </div>
        </>
      </section>

      {/* Moving through */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className={`${ui.button({ variant: "ghost" })} gap-1.5`}
          onClick={() => {
            setDir("back");
            setAt((i) => Math.max(0, i - 1));
          }}
          disabled={at === 0}
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Back
        </button>
        <div className="flex items-center gap-2">
          {!done && (
            <button
              type="button"
              className={`${ui.button()} gap-1.5 hover:border-error/40! hover:text-error`}
              onClick={() => {
                onDelete(rowsOf);
                advanceSoon();
              }}
            >
              <TrashIcon className="h-4 w-4" aria-hidden />
              {rowsOf.length === 1 ? "Delete row" : `Delete ${n(rowsOf.length)} rows`}
            </button>
          )}
          <button type="button" className={ui.button({ variant: done ? "primary" : "secondary" })} onClick={() => next()}>
            {done ? "Next" : "Skip for now"}
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <datalist id={LIST_ID}>
        {ORIGINS.map((c) => (
          <option key={c.code} value={c.name} />
        ))}
      </datalist>
    </div>
  );
};
