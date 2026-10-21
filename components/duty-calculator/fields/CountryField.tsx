"use client";

import { Fragment, KeyboardEvent, useMemo, useRef, useState } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Countries, Country } from "@/constants/countries";
import * as ui from "@/components/ui/styles";

interface Props {
  id: string;
  selected: Country[];
  onChange: (countries: Country[]) => void;
  // Most countries that can be selected; the first is the main one
  max: number;
  // No box of its own: it sits inside a host that draws one (the calculator's input bar)
  bare?: boolean;
  // In the empty search, in place of the default prompt
  placeholder?: string;
  // Shown first, under "Suggested", before anything is typed (and the list opens on focus)
  suggested?: Country[];
}

const ORIGIN_COUNTRIES = Countries.filter((c) => c.code !== "US");

// Countries of origin as removable chips inside a searchable field
export const CountryField = ({
  id,
  selected,
  onChange,
  max,
  bare = false,
  placeholder,
  suggested = [],
}: Props) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // Just picked one: the list stays shut (and doesn't open on focus) until the field is clicked
  // or typed in again; picking in a multiple Combobox would otherwise leave it open
  const [picked, setPicked] = useState(false);
  // With room for one country, picking another replaces it
  const single = max === 1;
  const full = !single && selected.length >= max;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q)
      return [
        ...suggested,
        ...ORIGIN_COUNTRIES.filter(
          (c) => !suggested.some((s) => s.code === c.code),
        ),
      ];
    return ORIGIN_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q,
    ).sort((a, b) => {
      // Names that start with the query first
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });
  }, [query, suggested]);

  const remove = (code: string) => {
    onChange(selected.filter((c) => c.code !== code));
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace in an empty search removes the last country
    if (e.key === "Backspace" && !query && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
    // The arrows open the list again after a pick
    if (e.key === "ArrowDown" || e.key === "ArrowUp") setPicked(false);
  };

  return (
    <Combobox
      immediate={suggested.length > 0 && !picked}
      value={selected}
      by="code"
      multiple
      onChange={(next: Country[]) => {
        if (single) {
          onChange(next.slice(-1));
          setQuery("");
          setPicked(true);
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
          className={`${bare ? "h-7 flex-nowrap overflow-hidden" : `${ui.inputBox} ${single ? "flex-nowrap overflow-hidden" : "flex-wrap"} px-2 py-1`} flex items-center gap-1.5 cursor-text`}
          onPointerDown={() => setPicked(false)}
          onClick={() => inputRef.current?.focus()}
        >
          {selected.map((country, i) => (
            <span
              key={country.code}
              className={
                bare
                  ? "inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap font-semibold text-base-content"
                  : `inline-flex items-center gap-1.5 rounded border py-1 pl-2 pr-1 text-sm font-medium ${
                      i === 0 && selected.length > 1
                        ? "border-primary/30 bg-primary/10 text-base-content"
                        : "border-base-300 bg-base-200 text-base-content"
                    }`
              }
            >
              <span className="text-base leading-none" aria-hidden>
                {country.flag}
              </span>
              {bare ? (
                <span className="truncate">{country.name}</span>
              ) : (
                country.name
              )}
              <button
                type="button"
                className="rounded-sm p-0.5 text-base-content/60 hover:bg-base-300 hover:text-base-content"
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
            className={`${bare ? (selected.length ? "h-7 w-2 min-w-2 px-0" : "h-7 min-w-0 px-0 font-semibold placeholder:font-normal") : single && selected.length ? "h-8 w-2 min-w-2 px-0 text-base" : "min-w-28 h-8 px-1.5 text-base"} flex-1 bg-transparent text-base-content outline-hidden placeholder:text-base-content/60`}
            placeholder={
              selected.length === 0
                ? (placeholder ??
                  (bare ? "Choose a country" : "Search countries"))
                : ""
            }
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPicked(false);
            }}
            onKeyDown={onKeyDown}
          />
        </div>

        {!picked && (
          <Combobox.Options
            className={`${ui.popover} absolute z-30 mt-2 w-full min-w-64 max-h-72 overflow-auto focus:outline-hidden`}
          >
            {full && (
              <div className={`${ui.caption} px-3 py-2`}>
                You can compare up to {max} countries. Remove one to add
                another.
              </div>
            )}
            {results.length === 0 ? (
              <div className="px-3 py-3 text-sm text-base-content/60">
                No countries match
              </div>
            ) : (
              results.map((country, i) => {
                const isSelected = selected.some(
                  (c) => c.code === country.code,
                );
                const heading =
                  !query.trim() &&
                  suggested.length > 0 &&
                  (i === 0 || i === suggested.length)
                    ? i === 0
                      ? "Suggested"
                      : "All countries"
                    : null;
                return (
                  <Fragment key={country.code}>
                    {heading && (
                      <div
                        className={`${ui.caption} px-3 pb-1 pt-2 font-semibold`}
                      >
                        {heading}
                      </div>
                    )}
                    <Combobox.Option
                      value={country}
                      disabled={full && !isSelected}
                      className={({ active, disabled }) =>
                        `flex items-center gap-3 rounded-md px-3 py-2 text-base ${
                          disabled
                            ? "opacity-40 cursor-not-allowed"
                            : "cursor-pointer"
                        } ${active && !disabled ? "bg-primary/10" : ""}`
                      }
                    >
                      <span className="text-lg leading-none" aria-hidden>
                        {country.flag}
                      </span>
                      <span
                        className={`flex-1 text-base-content ${isSelected ? "font-semibold" : ""}`}
                      >
                        {country.name}
                      </span>
                      {isSelected ? (
                        <CheckIcon
                          className="w-4 h-4 text-primary"
                          aria-label="Selected"
                        />
                      ) : (
                        <span className="text-xs font-medium text-base-content/60">
                          {country.code}
                        </span>
                      )}
                    </Combobox.Option>
                  </Fragment>
                );
              })
            )}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};
