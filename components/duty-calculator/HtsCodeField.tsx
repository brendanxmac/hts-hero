"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Combobox } from "@headlessui/react";
import Fuse from "fuse.js";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { HtsElement } from "../../interfaces/hts";
import { useHts } from "../../contexts/HtsContext";
import { getHtsElementParents } from "../../libs/hts";
import {
  htsCodesEqual,
  isValidEightOrTenDigitDigits,
  normalizeHtsCode,
} from "../../libs/hts-code";
import { mono } from "./font";
import styles from "./theme.module.css";

interface Props {
  id: string;
  selectedElement: HtsElement | null;
  onSelect: (element: HtsElement | null) => void;
  autoFocus?: boolean;
  // Leave out the description under the field, for layouts that show it elsewhere
  hidePath?: boolean;
}

const MAX_RESULTS = 20;

// Strips HTML tags some HTS descriptions contain
const plain = (text: string) => text.replace(/<[^>]+>/g, "").trim();

// Description levels end with ":" in the HTS; drop it when showing the path
const level = (text: string) => plain(text).replace(/:\s*$/, "");

export const HtsCodeField = ({ id, selectedElement, onSelect, autoFocus, hidePath }: Props) => {
  const { htsElements } = useHts();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      htsElements.length > 0
        ? new Fuse(htsElements, {
            keys: ["htsno"],
            threshold: 0.1,
            findAllMatches: true,
            ignoreLocation: true,
          })
        : null,
    [htsElements]
  );

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 120);
    return () => clearTimeout(timeout);
  }, [query]);

  const results = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!fuse || !q) return [];
    return fuse
      .search(q)
      .slice(0, MAX_RESULTS)
      .map((r) => r.item)
      .filter((el) => el.htsno);
  }, [fuse, debouncedQuery]);

  // A pasted or typed full code selects immediately
  const tryExactMatch = (value: string) => {
    const normalized = normalizeHtsCode(value.trim());
    if (!isValidEightOrTenDigitDigits(normalized)) return false;
    const match = htsElements.find((el) => htsCodesEqual(el.htsno, normalized));
    if (!match) return false;
    onSelect(match);
    setQuery("");
    return true;
  };

  const path = useMemo(() => {
    if (!selectedElement) return null;
    const parents = getHtsElementParents(selectedElement, htsElements);
    return [...parents, selectedElement]
      .map((el) => level(el.description))
      .filter(Boolean)
      .join(" › ");
  }, [selectedElement, htsElements]);

  return (
    <div className="flex flex-col gap-2">
      <Combobox
        value={selectedElement}
        onChange={(element: HtsElement | null) => {
          onSelect(element);
          setQuery("");
        }}
        nullable
      >
        <div className="relative">
          <Combobox.Input
            id={id}
            ref={inputRef}
            className={`${styles.input} ${mono.className} text-[15.5px] tracking-tight`}
            style={{ paddingRight: 40 }}
            placeholder="e.g. 7326.90.86.88"
            autoComplete="off"
            spellCheck={false}
            displayValue={(el: HtsElement | null) => el?.htsno ?? query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (selectedElement) onSelect(null);
            }}
            onPaste={(e) => {
              if (tryExactMatch(e.clipboardData.getData("text"))) e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query && tryExactMatch(query)) e.preventDefault();
            }}
          />
          {(selectedElement || query) && (
            <button
              type="button"
              aria-label="Clear HTS code"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--dc-text-3)] hover:text-[var(--dc-text)] hover:bg-[var(--dc-surface-2)]"
              onClick={() => {
                onSelect(null);
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}

          {/* Hidden while the search is debouncing, so an empty list never flashes */}
          {query.trim() && !selectedElement && (results.length > 0 || debouncedQuery === query) && (
            <Combobox.Options
              static
              className="absolute z-30 mt-2 w-full min-w-[320px] max-h-80 overflow-auto rounded-xl border border-[var(--dc-border)] bg-[var(--dc-surface)] p-1.5 shadow-[var(--dc-shadow-pop)] focus:outline-none"
            >
              {results.length === 0 && debouncedQuery === query ? (
                <div className="px-3 py-3 text-sm text-[var(--dc-text-3)]">
                  No HTS codes match &ldquo;{query.trim()}&rdquo;
                </div>
              ) : (
                results.map((el) => (
                  <Combobox.Option
                    key={el.uuid}
                    value={el}
                    className={({ active }) =>
                      `flex flex-col gap-0.5 rounded-lg px-3 py-2 cursor-pointer ${
                        active ? "bg-[var(--dc-accent-soft)]" : ""
                      }`
                    }
                  >
                    <span className={`${mono.className} text-sm font-semibold text-[var(--dc-text)]`}>
                      {el.htsno}
                    </span>
                    <span className="text-[13px] leading-snug text-[var(--dc-text-2)] line-clamp-2">
                      {plain(el.description)}
                    </span>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          )}
        </div>
      </Combobox>

      {path && !hidePath && (
        <p className="text-[13px] leading-snug text-[var(--dc-text-2)] line-clamp-2" title={path}>
          {path}
        </p>
      )}
    </div>
  );
};
