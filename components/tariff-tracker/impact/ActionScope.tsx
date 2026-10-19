"use client";

import { ReactNode, useMemo, useState } from "react";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { Countries } from "@/constants/countries";
import { scopeOf } from "@/libs/tariff-updates/match";
import type { TrackerUpdate } from "../overview/useTariffUpdates";
import { formatPrefix } from "./format";

// What a tariff action covers, as its scope reads (libs/tariff-updates/match.ts): the countries,
// the HTS codes (a long list folds to its first few), the Chapter 99 numbers it adds, and what it
// leaves out. It's what Your Imports are checked against, so each import's "why" points back here.

const MOST = 12;

const byCode = new Map(Countries.map((c) => [c.code, c]));
const countryOf = (code: string) => byCode.get(code);

const Chips = ({ items, mono = false }: { items: string[]; mono?: boolean }) => {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, MOST);
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {shown.map((item) => (
        <span key={item} className={`${tt.chip()} ${mono ? "font-mono" : ""}`}>
          {item}
        </span>
      ))}
      {items.length > MOST && (
        <button type="button" className={`${ui.link} text-xs`} onClick={() => setAll((a) => !a)}>
          {all ? "Show fewer" : `and ${items.length - MOST} more`}
        </button>
      )}
    </span>
  );
};

export const ActionScope = ({ update }: { update: TrackerUpdate }) => {
  const scope = useMemo(() => scopeOf(update), [update]);
  const countries =
    scope.countries === "all"
      ? null
      : scope.countries.map((c) => {
          const country = countryOf(c);
          return country ? `${country.flag} ${country.name}` : c;
        });
  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "Countries",
      value: countries?.length ? <Chips items={countries} /> : <span className={tt.body}>{scope.countries === "all" ? "Every country" : "Not named"}</span>,
    },
    {
      label: "HTS codes",
      value: scope.allProducts ? (
        <span className={tt.body}>Every product from these countries{scope.excludedCodes.length ? ", except those below" : ""}</span>
      ) : scope.codes.length ? (
        <Chips items={scope.codes.map(formatPrefix)} mono />
      ) : (
        <span className={tt.body}>None named{update.products ? `: it covers ${update.products}` : ""}</span>
      ),
    },
    ...(scope.headings.length ? [{ label: "Chapter 99", value: <Chips items={scope.headings} mono /> }] : []),
    ...(scope.excludedCodes.length ? [{ label: "Except codes", value: <Chips items={scope.excludedCodes.map(formatPrefix)} mono /> }] : []),
    ...(scope.excludedCountries.length
      ? [{ label: "Except", value: <Chips items={scope.excludedCountries.map((c) => countryOf(c)?.name ?? c)} /> }]
      : []),
  ];
  return (
    <section className="flex flex-col gap-3 border-t border-base-300 px-6 py-5" aria-labelledby="tt-impact-scope">
      <h3 id="tt-impact-scope" className={tt.sectionTitle}>
        What It Covers
      </h3>
      <dl className="m-0 grid gap-x-6 gap-y-2.5 sm:grid-cols-[7rem_minmax(0,1fr)]">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className={`${tt.caption} pt-0.5`}>{r.label}</dt>
            <dd className="m-0 min-w-0">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
