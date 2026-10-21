"use client";

import { memo, useMemo, useState } from "react";
import { ArrowUturnLeftIcon, CheckCircleIcon, ExclamationCircleIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { Countries } from "@/constants/countries";
import { useHts } from "@/contexts/HtsContext";
import { HtsElement } from "@/interfaces/hts";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { CatalogError, findCountry, readProduct } from "../parse";
import { describe } from "../report";
import { useTracker } from "../TrackerContext";
import { CodeSuggestionSelect, HighlightedCode } from "./CodeSuggestionSelect";
import { codeSuggestions, countrySuggestion, Fix, Fixes } from "./fixes";

// The rows that couldn't be read, editable right here: the code and the country as they were
// written, checked as they're typed, with one-click suggestions (the full US code under a 6-digit
// HS code, a dropped leading zero, a country written another way) and a way to leave a row out.
// A row turns green as soon as it reads; the review above counts it at once (applyFixes).

const PAGE = 25;
const COUNTRY_LIST_ID = "tt-ob-fix-countries";
const ORIGINS = Countries.filter((c) => c.code !== "US");

type Status = { kind: "skipped" } | { kind: "ok"; description: string; country: string } | { kind: "error"; message: string };

const FixRow = memo(function FixRow({
  error,
  fix,
  rowWord,
  onFix,
}: {
  error: CatalogError;
  fix: Fix;
  rowWord: "line" | "row";
  onFix: (line: number, fix: Fix | undefined) => void;
}) {
  const { findElement } = useTracker();
  const { htsElements } = useHts();
  const set = (patch: Partial<Fix>) => onFix(error.line, { ...fix, ...patch });

  const status: Status = useMemo(() => {
    if (fix.skipped) return { kind: "skipped" };
    const product = readProduct(fix.code, fix.country, findElement);
    if ("message" in product) return { kind: "error", message: product.message };
    return { kind: "ok", description: describe(product.element as HtsElement, htsElements), country: product.country.name };
  }, [fix, findElement, htsElements]);

  // Suggestions only while the field they'd fix is wrong
  const codeWrong = status.kind === "error" && !findElement(fix.code.replace(/\D/g, ""));
  const codes = useMemo(() => (codeWrong ? codeSuggestions(fix.code, htsElements, (el) => describe(el, htsElements)) : []), [codeWrong, fix.code, htsElements]);
  const country = status.kind === "error" && !findCountry(fix.country) ? countrySuggestion(fix.country) : null;

  if (status.kind === "skipped") {
    return (
      <li className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-base-300 px-3.5 py-2.5 text-sm text-base-content/50">
        <span>
          <span className={`${mono.className} font-semibold`}>
            {rowWord === "row" ? "Row" : "Line"} {error.line}
          </span>{" "}
          left out · {error.text.slice(0, 60)}
        </span>
        <button type="button" className={`${ui.link} inline-flex items-center gap-1 text-xs`} onClick={() => set({ skipped: false })}>
          <ArrowUturnLeftIcon className="h-3.5 w-3.5" aria-hidden />
          Undo
        </button>
      </li>
    );
  }

  const ok = status.kind === "ok";
  return (
    <li className={`flex flex-col gap-2.5 rounded-xl border p-3.5 transition-colors ${ok ? "border-success/40 bg-success/5" : "border-base-300 bg-base-100"}`}>
      {/* Which row, and how it stands */}
      <div className="flex items-start gap-2 text-xs">
        <span className={`${mono.className} shrink-0 pt-px font-semibold text-base-content/55`}>
          {rowWord === "row" ? "Row" : "Line"} {error.line}
        </span>
        <span className="flex min-w-0 flex-1 items-start gap-1.5">
          {ok ? (
            <>
              <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" aria-hidden />
              <span className="min-w-0 truncate text-base-content/75" title={status.description}>
                <span className="font-semibold text-success">Fixed</span> · {status.description}
              </span>
            </>
          ) : (
            <>
              <ExclamationCircleIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
              <span className="text-base-content/75">{status.kind === "error" ? status.message : ""}</span>
            </>
          )}
        </span>
        <button
          type="button"
          className="-my-1 shrink-0 rounded-full px-2.5 py-1 font-semibold text-base-content/55 hover:bg-tt-soft hover:text-base-content"
          onClick={() => set({ skipped: true })}
          title="Leave this row out"
        >
          Skip
        </button>
      </div>

      {/* The two things that make an import, side by side */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
        <label className="sr-only" htmlFor={`tt-fix-code-${error.line}`}>
          HTS code, {rowWord} {error.line}
        </label>
        <input
          id={`tt-fix-code-${error.line}`}
          className={`${ui.inputSm} ${mono.className} font-semibold ${!ok && codeWrong ? "border-warning!" : ""}`}
          value={fix.code}
          placeholder="HTS code"
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => set({ code: e.target.value })}
        />
        <label className="sr-only" htmlFor={`tt-fix-country-${error.line}`}>
          Country of origin, {rowWord} {error.line}
        </label>
        <input
          id={`tt-fix-country-${error.line}`}
          className={`${ui.inputSm} ${!ok && fix.country && !findCountry(fix.country) ? "border-warning!" : ""}`}
          value={fix.country}
          placeholder="Country of origin"
          list={COUNTRY_LIST_ID}
          autoComplete="off"
          onChange={(e) => set({ country: e.target.value })}
        />
      </div>

      {/* One click to the likely fix */}
      {!ok && (codes.length > 0 || country) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <SparklesIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
          {codes.length === 1 && (
            <button type="button" className={`${ui.badge("primary")} cursor-pointer hover:bg-primary/15`} onClick={() => set({ code: codes[0].htsno })}>
              Use <HighlightedCode written={fix.code} htsno={codes[0].htsno} /> · {codes[0].description.slice(0, 60)}
            </button>
          )}
          {codes.length > 1 && (
            <CodeSuggestionSelect
              written={fix.code}
              codes={codes}
              onPick={(v) => set({ code: v })}
              label={`Choose the full US code, ${rowWord} ${error.line}`}
            />
          )}
          {country && (
            <button type="button" className={`${ui.badge("primary")} cursor-pointer hover:bg-primary/15`} onClick={() => set({ country: country.name })}>
              Use {country.flag} {country.name}
            </button>
          )}
        </div>
      )}
    </li>
  );
});

export const FixEditor = ({
  errors,
  fixes,
  onFix,
  onFixMany,
  rowWord,
}: {
  // The rows as first read, before any fixes: the list stays put while they're fixed
  errors: CatalogError[];
  fixes: Fixes;
  onFix: (line: number, fix: Fix | undefined) => void;
  onFixMany: (fixes: Fixes) => void;
  rowWord: "line" | "row";
}) => {
  const [shown, setShown] = useState(PAGE);
  const fixOf = (e: CatalogError): Fix => fixes[e.line] ?? { code: e.code ?? "", country: e.country ?? "" };

  // The same unrecognized country on many rows ("Viet Nam" ×40): replaced everywhere at once
  const bulk = useMemo(() => {
    const byValue = new Map<string, CatalogError[]>();
    errors.forEach((e) => {
      const f = fixes[e.line] ?? { code: e.code ?? "", country: e.country ?? "" };
      if (f.skipped || !f.country || findCountry(f.country)) return;
      byValue.set(f.country, [...(byValue.get(f.country) ?? []), e]);
    });
    return [...byValue.entries()]
      .map(([value, rows]) => ({ value, rows, to: countrySuggestion(value) }))
      .filter((b) => b.to && b.rows.length > 1)
      .sort((a, b) => b.rows.length - a.rows.length);
  }, [errors, fixes]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-base-content">Fix them here</span>
        <span className="text-xs text-base-content/60">No need to edit your file and upload it again</span>
      </div>

      {bulk.map((b) => (
        <button
          key={b.value}
          type="button"
          className="flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
          onClick={() => {
            onFixMany(Object.fromEntries(b.rows.map((e) => [e.line, { ...fixOf(e), country: b.to!.name }])));
            trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, { help: "fix_country_bulk", rows: b.rows.length });
          }}
        >
          <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
          Change &ldquo;{b.value}&rdquo; to {b.to!.flag} {b.to!.name} on all {b.rows.length} {rowWord}s
        </button>
      ))}

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {errors.slice(0, shown).map((e) => (
          <FixRow key={e.line} error={e} fix={fixOf(e)} rowWord={rowWord} onFix={onFix} />
        ))}
      </ul>
      {errors.length > shown && (
        <button type="button" className={`${ui.link} self-start text-xs`} onClick={() => setShown((n) => n + PAGE)}>
          Show {Math.min(PAGE, errors.length - shown)} more
        </button>
      )}
      <datalist id={COUNTRY_LIST_ID}>
        {ORIGINS.map((c) => (
          <option key={c.code} value={c.name} />
        ))}
      </datalist>
    </div>
  );
};
