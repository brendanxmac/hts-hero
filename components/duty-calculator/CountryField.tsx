"use client";

import { KeyboardEvent, useMemo, useRef, useState } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Countries, Country } from "../../constants/countries";
import styles from "./theme.module.css";

interface Props {
  id: string;
  selected: Country[];
  onChange: (countries: Country[]) => void;
  // Most countries that can be selected; the first is the main one
  max: number;
}

const ORIGIN_COUNTRIES = Countries.filter((c) => c.code !== "US");

// Countries of origin as removable chips inside a searchable field
export const CountryField = ({ id, selected, onChange, max }: Props) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // With room for one country, picking another replaces it
  const single = max === 1;
  const full = !single && selected.length >= max;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ORIGIN_COUNTRIES;
    return ORIGIN_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q
    ).sort((a, b) => {
      // Names that start with the query first
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });
  }, [query]);

  const remove = (code: string) => {
    onChange(selected.filter((c) => c.code !== code));
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace in an empty search removes the last country
    if (e.key === "Backspace" && !query && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  return (
    <Combobox
      value={selected}
      by="code"
      multiple
      onChange={(next: Country[]) => {
        if (single) {
          onChange(next.slice(-1));
          setQuery("");
          inputRef.current?.blur();
          return;
        }
        if (next.length > max) return;
        onChange(next);
        setQuery("");
        // Nothing more can be added, so close the list
        if (next.length === max) inputRef.current?.blur();
      }}
    >
      <div className="relative">
        <div
          className={`${styles.input} flex flex-wrap items-center gap-1.5 cursor-text`}
          style={{ height: "auto", minHeight: 46, padding: "5px 8px" }}
          onClick={() => inputRef.current?.focus()}
        >
          {selected.map((country, i) => (
            <span
              key={country.code}
              className={`inline-flex items-center gap-1.5 rounded-lg border py-1 pl-2 pr-1 text-[14px] font-medium ${i === 0 && selected.length > 1
                ? "border-[var(--dc-accent-border)] bg-[var(--dc-accent-soft)] text-[var(--dc-text)]"
                : "border-[var(--dc-border)] bg-[var(--dc-surface-2)] text-[var(--dc-text)]"
                }`}
            >
              <span className="text-base leading-none" aria-hidden>
                {country.flag}
              </span>
              {country.name}
              <button
                type="button"
                className="rounded p-0.5 text-[var(--dc-text-3)] hover:bg-[var(--dc-surface-3)] hover:text-[var(--dc-text)]"
                aria-label={`Remove ${country.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(country.code);
                }}
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <Combobox.Input
            id={id}
            ref={inputRef}
            className="flex-1 min-w-[120px] h-8 bg-transparent px-1.5 text-[15px] text-[var(--dc-text)] outline-none placeholder:text-[var(--dc-text-3)]"
            placeholder={
              selected.length === 0
                ? "Search countries"
                : full
                  ? ""
                  : ""
            }
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>

        <Combobox.Options className="absolute z-30 mt-2 w-full min-w-[260px] max-h-72 overflow-auto rounded-xl border border-[var(--dc-border)] bg-[var(--dc-surface)] p-1.5 shadow-[var(--dc-shadow-pop)] focus:outline-none">
          {full && (
            <div className="px-3 py-2 text-[12.5px] text-[var(--dc-text-3)]">
              You can compare up to {max} countries. Remove one to add another.
            </div>
          )}
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-[var(--dc-text-3)]">No countries match</div>
          ) : (
            results.map((country) => {
              const isSelected = selected.some((c) => c.code === country.code);
              return (
                <Combobox.Option
                  key={country.code}
                  value={country}
                  disabled={full && !isSelected}
                  className={({ active, disabled }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-[14.5px] ${disabled ? "opacity-45 cursor-not-allowed" : "cursor-pointer"
                    } ${active && !disabled ? "bg-[var(--dc-accent-soft)]" : ""}`
                  }
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {country.flag}
                  </span>
                  <span className={`flex-1 text-[var(--dc-text)] ${isSelected ? "font-semibold" : ""}`}>
                    {country.name}
                  </span>
                  {isSelected ? (
                    <CheckIcon className="w-4 h-4 text-[var(--dc-accent)]" aria-label="Selected" />
                  ) : (
                    <span className="text-xs font-medium text-[var(--dc-text-3)]">{country.code}</span>
                  )}
                </Combobox.Option>
              );
            })
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};
