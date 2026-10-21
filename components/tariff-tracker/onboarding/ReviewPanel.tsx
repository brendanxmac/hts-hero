"use client";

import { useMemo, useState } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { Countries } from "@/constants/countries";
import { HtsElement } from "@/interfaces/hts";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { itemKey, NewProduct, realItems } from "../catalog";
import { ParsedImport } from "../csv";
import { problemGroups } from "./problems";
import type { CatalogError } from "../parse";
import { FixEditor } from "./FixEditor";
import type { Fix, Fixes } from "./fixes";
import { useTracker } from "../TrackerContext";

// What a paste or an upload will add, before it's added: how many rows were read, how many
// different imports they make (an invoice repeats the same import on many lines), which are already
// tracked, and which rows couldn't be read and why. Shared by the paste and spreadsheet steps.

const n = (count: number) => count.toLocaleString("en-US");
const SHOWN = 6;

export interface Review {
  // The new imports, once each
  products: NewProduct[];
  rows: number;
  alreadyTracked: number;
  errors: ParsedImport<HtsElement>["errors"];
}

export const useReview = (parsed: ParsedImport<HtsElement>): Review => {
  const { items } = useTracker();
  return useMemo(() => {
    // The user's own imports: an example product added for real counts as new
    const have = new Set(realItems(items).map(itemKey));
    const seen = new Set<string>();
    const products: NewProduct[] = [];
    let alreadyTracked = 0;
    parsed.entries.forEach((e) => {
      const product: NewProduct = {
        code: htsCodeDigitsOnly(e.element.htsno),
        country: e.country.code,
        adjustments: e.adjustments,
      };
      const key = itemKey(product);
      if (seen.has(key)) return;
      seen.add(key);
      if (have.has(key)) alreadyTracked++;
      else products.push(product);
    });
    return {
      products,
      rows: parsed.entries.length + parsed.errors.length,
      alreadyTracked,
      errors: parsed.errors,
    };
  }, [parsed, items]);
};

const Stat = ({ value, label, tone = "text-base-content" }: { value: number; label: string; tone?: string }) => (
  <div className="flex flex-col gap-0.5 rounded-xl bg-tt-soft px-3 py-2.5">
    <span className={`${tt.display} text-xl font-semibold tabular-nums leading-tight ${tone}`}>{n(value)}</span>
    <span className="text-[0.7rem] text-base-content/60">{label}</span>
  </div>
);

// `fixing`: the rows as first read and their fixes, to fix them in place (FixEditor)
export interface Fixing {
  original: CatalogError[];
  fixes: Fixes;
  skipped: number;
  onFix: (line: number, fix: Fix | undefined) => void;
  onFixMany: (fixes: Fixes) => void;
}

export const ReviewPanel = ({ review, rowWord = "line", fixing }: { review: Review; rowWord?: "line" | "row"; fixing?: Fixing }) => {
  const { findElement } = useTracker();
  const [allErrors, setAllErrors] = useState(false);
  const { products, rows, alreadyTracked, errors } = review;
  if (rows === 0) return null;
  const repeats = rows - errors.length - products.length - alreadyTracked - (fixing?.skipped ?? 0);
  const fixable = !!fixing && fixing.original.length > 0;

  return (
    <div className="tt-enter flex flex-col gap-3" aria-live="polite">
      <div className="grid grid-cols-3 gap-2">
        <Stat value={rows} label={`${rowWord === "row" ? "Rows" : "Lines"} read`} />
        <Stat value={products.length} label="New imports" tone="text-success" />
        <Stat value={errors.length} label="Need a fix" tone={errors.length ? "text-warning" : "text-base-content/40"} />
      </div>
      {(repeats > 0 || alreadyTracked > 0) && (
        <p className="m-0 text-xs text-base-content/60">
          {repeats > 0 && `${n(repeats)} repeated ${repeats === 1 ? rowWord : `${rowWord}s`} counted once. `}
          {alreadyTracked > 0 && `${n(alreadyTracked)} already in your imports.`}
        </p>
      )}

      {products.length > 0 && (
        <ul className={`${tt.panel} m-0 flex list-none flex-col p-0`}>
          {products.slice(0, SHOWN).map((p) => {
            const element = findElement(p.code);
            const country = Countries.find((c) => c.code === p.country);
            return (
              <li key={itemKey(p)} className="flex items-center gap-3 border-b border-base-300 px-3.5 py-2 text-sm last:border-b-0">
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" aria-hidden />
                <span className={`${mono.className} w-28 shrink-0 font-semibold text-base-content`}>{element?.htsno ?? p.code}</span>
                <span className="min-w-0 flex-1 truncate text-base-content">{country ? `${country.flag} ${country.name}` : p.country}</span>
              </li>
            );
          })}
          {products.length > SHOWN && <li className="px-3.5 py-2 text-xs text-base-content/60">and {n(products.length - SHOWN)} more</li>}
        </ul>
      )}

      {(errors.length > 0 || fixable) && (
        <div className={`${ui.notice(errors.length ? "warning" : "success")} flex flex-col gap-3`} role={errors.length ? "alert" : "status"}>
          {errors.length === 0 ? (
            <p className="m-0 flex items-center gap-1.5 text-sm font-semibold text-base-content">
              <CheckCircleIcon className="h-4 w-4 text-success" aria-hidden />
              All fixed. Every {rowWord} is ready to add.
            </p>
          ) : (
            <p className="m-0 flex items-center gap-1.5 text-sm font-semibold text-base-content">
              <ExclamationTriangleIcon className="h-4 w-4 text-warning" aria-hidden />
              {errors.length === 1 ? `1 ${rowWord} couldn't be added` : `${n(errors.length)} ${rowWord}s couldn't be added`}
              <span className="font-normal text-base-content/60">
                · {fixable ? "fix them below, or add the rest now" : products.length ? "add the rest now and fix these later" : "here's what to fix"}
              </span>
            </p>
          )}
          {/* What's wrong, by cause, with the fix for each */}
          {errors.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {problemGroups(errors).map((g) => (
                <li key={g.kind} className="flex flex-col gap-0.5 text-sm">
                  <span className="font-semibold text-base-content">
                    {n(g.errors.length)} × {g.title(g.errors.length, rowWord)}
                  </span>
                  <span className="text-xs leading-relaxed text-base-content/75">{g.fix(g.errors)}</span>
                  <span className={`${mono.className} text-[0.7rem] text-base-content/55`}>
                    {rowWord === "row" ? "Rows" : "Lines"}{" "}
                    {g.errors
                      .slice(0, 6)
                      .map((e) => e.line)
                      .join(", ")}
                    {g.errors.length > 6 ? ` and ${n(g.errors.length - 6)} more` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {fixing && fixable ? (
            <FixEditor errors={fixing.original} fixes={fixing.fixes} onFix={fixing.onFix} onFixMany={fixing.onFixMany} rowWord={rowWord} />
          ) : (
            <>
              <button type="button" className={`${ui.link} self-start text-xs`} onClick={() => setAllErrors((x) => !x)}>
                {allErrors ? "Hide the details" : `See every ${rowWord} and its problem`}
              </button>
              {allErrors && (
                <ul className="m-0 flex max-h-48 list-none flex-col gap-1 overflow-y-auto p-0">
                  {errors.map((e) => (
                    <li key={e.line} className="text-xs leading-snug text-base-content/70">
                      <span className={`${mono.className} font-semibold text-base-content`}>
                        {rowWord === "row" ? "Row" : "Line"} {e.line}:
                      </span>{" "}
                      {e.message} <span className="text-base-content/45">({e.text.slice(0, 60)})</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {products.length > REVERSE_TRIAL.imports && (
        <p className="m-0 text-xs text-base-content/60">
          All {n(products.length)} are saved. Your free trial tracks {REVERSE_TRIAL.imports} of them with alerts, the highest-duty first.
        </p>
      )}
    </div>
  );
};
