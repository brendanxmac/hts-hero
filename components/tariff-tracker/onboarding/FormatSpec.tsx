"use client";

import { Fragment } from "react";
import { CheckIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import { delay } from "./parts";

// What a spreadsheet needs, for the upload step (FileStep), beside the drop target: drawn as the
// sheet itself, a few imports filling in one a row. The rules under the column names are the
// reader's own: 8 or 10 digit codes (parse.ts), a country's name or 2-letter code (findCountry),
// .xlsx or CSV (spreadsheet.ts); any other columns are ignored.

const COLUMNS = [
  { name: "HTS code", rule: "8 or 10 digits" },
  { name: "Country of origin", rule: "Name or 2-letter code" },
];

// Real 10-digit codes (checked on hts.usitc.gov): men's cotton T-shirts, upholstered wood-frame
// household seats, LED luminaires, backpacks
const ROWS = [
  { code: "6109.10.00.12", country: "China" },
  { code: "6109.10.00.12", country: "Brazil" },
  { code: "9401.61.40.11", country: "Vietnam" },
  { code: "9405.42.84.40", country: "China" },
  { code: "4202.92.31.20", country: "India" },
];

export const FormatSpec = ({ start = 150 }: { start?: number }) => (
  <div
    className="tt-ob-rise w-full overflow-hidden rounded-2xl bg-base-100 text-left ring-1 ring-base-300"
    style={delay(start)}
    role="img"
    aria-label="Your spreadsheet needs an HTS code column and a country of origin column, one import per row"
  >
    <style>{`
      @keyframes fs-row { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: none; } }
      .fs-row { animation: fs-row 420ms cubic-bezier(.2,.9,.3,1.1) var(--tt-delay, 0ms) both; }
      @media (prefers-reduced-motion: reduce) { .fs-row { animation: none; } }
    `}</style>
    <div className="flex items-center gap-2 bg-success px-4 py-2.5 text-success-content" aria-hidden>
      <TableCellsIcon className="h-4 w-4" />
      <span className="text-sm font-bold">imports-example.xlsx</span>
    </div>
    <div className="grid grid-cols-[2.5rem_1fr_1fr] text-sm" aria-hidden>
      <span className="border-b border-base-300 bg-base-200/60" />
      {COLUMNS.map((c) => (
        <span key={c.name} className="flex flex-col gap-0.5 border-b border-base-300 bg-base-200/60 px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">{c.name}</span>
          <span className="text-xs text-base-content/50">{c.rule}</span>
        </span>
      ))}
      {ROWS.map((r, i) => {
        const wait = start + 300 + i * 140;
        return (
          <Fragment key={i}>
            {[
              <span key="n" className="text-base-content/40">{i + 1}</span>,
              <span key="c" className={`${mono.className} font-semibold text-base-content`}>{r.code}</span>,
              <span key="o" className="text-base-content">{r.country}</span>,
            ].map((cell, j) => (
              <span key={j} className="fs-row flex items-center border-b border-base-300/70 px-3 py-2.5" style={delay(wait)}>
                {cell}
              </span>
            ))}
          </Fragment>
        );
      })}
    </div>
    <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-xs text-base-content/70" aria-hidden>
      {["One import per row", "Excel (.xlsx) or CSV", "Other columns are fine, we ignore them"].map((t) => (
        <li key={t} className="flex items-center gap-1">
          <CheckIcon className="h-3.5 w-3.5 text-success" />
          {t}
        </li>
      ))}
    </ul>
  </div>
);
