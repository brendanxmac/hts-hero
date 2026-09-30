"use client";

import { useMemo, useState } from "react";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Countries, Country } from "../../constants/countries";
import styles from "./theme.module.css";

interface Props {
  id: string;
  selectedCountry: Country | null;
  onSelect: (country: Country | null) => void;
}

const ORIGIN_COUNTRIES = Countries.filter((c) => c.code !== "US");

export const CountryField = ({ id, selectedCountry, onSelect }: Props) => {
  const [query, setQuery] = useState("");

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

  return (
    <Combobox
      value={selectedCountry}
      onChange={(country: Country | null) => {
        onSelect(country);
        setQuery("");
      }}
      nullable
    >
      <div className="relative">
        <div className="relative">
          {selectedCountry && !query && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg leading-none" aria-hidden>
              {selectedCountry.flag}
            </span>
          )}
          <Combobox.Input
            id={id}
            className={styles.input}
            // Inline so it wins over the module's padding
            style={{ paddingRight: 40, paddingLeft: selectedCountry && !query ? 44 : undefined }}
            placeholder="Search countries"
            autoComplete="off"
            displayValue={(c: Country | null) => (c ? c.name : "")}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
          />
          <Combobox.Button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--dc-text-3)] hover:text-[var(--dc-text)]"
            aria-label="Show countries"
          >
            <ChevronUpDownIcon className="w-5 h-5" />
          </Combobox.Button>
        </div>

        <Combobox.Options className="absolute z-30 mt-2 w-full max-h-72 overflow-auto rounded-xl border border-[var(--dc-border)] bg-[var(--dc-surface)] p-1.5 shadow-[var(--dc-shadow-pop)] focus:outline-none">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-[var(--dc-text-3)]">No countries match</div>
          ) : (
            results.map((country) => (
              <Combobox.Option
                key={country.code}
                value={country}
                className={({ active, selected }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer text-[14.5px] ${
                    active ? "bg-[var(--dc-accent-soft)]" : ""
                  } ${selected ? "font-semibold" : ""}`
                }
              >
                <span className="text-lg leading-none" aria-hidden>
                  {country.flag}
                </span>
                <span className="flex-1 text-[var(--dc-text)]">{country.name}</span>
                <span className="text-xs font-medium text-[var(--dc-text-3)]">{country.code}</span>
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};
