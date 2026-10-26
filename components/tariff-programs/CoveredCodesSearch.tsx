"use client";

import { ReactNode, useMemo, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { CodeList, type CodeListItem } from "./CodeList";

// The search box over a Chapter 99 heading's covered codes. The page's own list (children, in the
// HTML) shows until someone types; then the matches from every code the heading lists, which load
// from /api/tariff-programs/heading-codes on first use. Every word must appear in the code or its
// name, ignoring case, dots and spaces, so "7318.15" and "731815" both find 7318.15.80.

const RESULTS_SHOWN = 100;
const squash = (s: string) => s.toLowerCase().replace(/[.\s]/g, "");

export function CoveredCodesSearch({ heading, total, children }: { heading: string; total: number; children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [codes, setCodes] = useState<CodeListItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (codes || loading) return;
    setLoading(true);
    fetch(`/api/tariff-programs/heading-codes?code=${encodeURIComponent(heading)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { codes: CodeListItem[] }) => setCodes(d.codes))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };

  const matches = useMemo(() => {
    const words = query.trim().split(/\s+/).filter(Boolean).map(squash);
    if (!codes || words.length === 0) return [];
    return codes.filter((c) => {
      const text = squash(`${c.code} ${c.name ?? ""}`);
      return words.every((w) => text.includes(w));
    });
  }, [codes, query]);

  const searching = query.trim().length > 0;

  return (
    <>
      <div className="flex flex-col gap-2 border-b border-base-300 bg-tt-soft px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <label className={`${ui.input} flex items-center gap-2 sm:max-w-sm`}>
          <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-base-content/60" aria-hidden />
          <input
            type="search"
            className="min-w-0 flex-1 bg-transparent outline-hidden [&::-webkit-search-cancel-button]:hidden"
            placeholder={`Search all ${total.toLocaleString("en-US")} codes`}
            aria-label={`Search the codes ${heading} covers`}
            value={query}
            onFocus={load}
            onChange={(e) => {
              load();
              setQuery(e.target.value);
            }}
          />
          {query && (
            <button type="button" className="rounded-sm text-base-content/60 hover:text-base-content" onClick={() => setQuery("")}>
              <XMarkIcon className="h-4 w-4" aria-hidden />
              <span className="sr-only">Clear the search</span>
            </button>
          )}
        </label>
        <span className="text-xs text-base-content/60" aria-live="polite">
          {searching
            ? failed
              ? "The search couldn't load. Try again later."
              : !codes
                ? "Loading every code…"
                : matches.length === 0
                  ? `No code ${heading} covers matches "${query.trim()}"`
                  : matches.length > RESULTS_SHOWN
                    ? `${matches.length.toLocaleString("en-US")} matches, first ${RESULTS_SHOWN} shown`
                    : `${matches.length.toLocaleString("en-US")} match${matches.length === 1 ? "" : "es"}`
            : `Search by code or product, like "7318" or "screws"`}
        </span>
      </div>
      {/* The page's own list stays in place (and in the HTML) while searching, just out of sight */}
      <div className={searching ? "hidden" : ""}>{children}</div>
      {searching && codes && matches.length > 0 && (
        <div className="max-h-[36rem] overflow-y-auto">
          <CodeList items={matches.slice(0, RESULTS_SHOWN)} />
        </div>
      )}
    </>
  );
}
