"use client";

import { CheckCircleIcon, CheckIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { mono } from "@/components/ui/font";

// What a spreadsheet needs, for the upload step (FileStep), beside the drop target. The rules are
// the reader's own: 8 or 10 digit codes (parse.ts), a country's name or 2-letter code
// (findCountry), .xlsx or CSV (spreadsheet.ts).

const COLUMNS = [
  { name: "HTS code", rule: "8 or 10 digits, dots optional", samples: ["8413.91.90.15", "84139190", "7326.90.86.88"] },
  { name: "Country of origin", rule: "Country name or 2-letter code", samples: ["Brazil", "CN", "China"] },
];

// The two columns, drawn as the columns of a sheet: each one's rule, then cells that read
export const FormatSpec = () => (
  <div className={`${tt.panel} flex flex-col gap-4 p-5`}>
    <div className="flex flex-col gap-1">
      <span className={`${tt.display} text-base font-semibold text-base-content`}>What Your File Needs</span>
      <span className="text-sm leading-relaxed text-base-content/70">
        At least these two columns. Anything else can stay, we ignore it.
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {COLUMNS.map((c) => (
        <div key={c.name} className="overflow-hidden rounded-xl border border-primary/25 bg-base-100">
          <div className="flex flex-col gap-0.5 bg-primary/10 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden />
              {c.name}
            </span>
            <span className="text-xs text-base-content/70">{c.rule}</span>
          </div>
          {c.samples.map((s) => (
            <span
              key={s}
              className={`block border-t border-base-300 px-3 py-1.5 text-sm font-semibold text-base-content ${c.name === "HTS code" ? mono.className : ""}`}
            >
              {s}
            </span>
          ))}
        </div>
      ))}
    </div>
    <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-base-content/70">
      {["Excel (.xlsx) or CSV", "One product per row"].map((t) => (
        <li key={t} className="flex items-center gap-1">
          <CheckIcon className="h-3.5 w-3.5 text-success" aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  </div>
);
