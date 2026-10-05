"use client";

import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { TariffFinder } from "../duty-calculator/lib/useTariffFinder";
import { EXAMPLE_LIST } from "./exampleList";
import { WatchError } from "./parse";
import { SkippedLines } from "./SkippedLines";


// The list being watched, and the date its rates are worked out for
export const WatchListRail = ({
  f,
  text,
  onTextChange,
  onExample,
  count,
  errors,
}: {
  f: TariffFinder;
  text: string;
  onTextChange: (text: string) => void;
  onExample: () => void;
  count: number;
  errors: WatchError[];
}) => {
  const status =
    count === 0 && errors.length === 0
      ? "Paste from a spreadsheet: code and country columns work too."
      : `${count} ${count === 1 ? "product" : "products"}${
          errors.length ? ` · ${errors.length} ${errors.length === 1 ? "line" : "lines"} skipped` : ""
        }`;

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-base-content">Your products</h2>
        <p className="mt-1 text-sm text-base-content/70">One per line: HTS code, country</p>
      </div>
      <div className={`${ui.card} flex flex-col gap-4 p-4`}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="tw-list" className={ui.label}>
              Watch list
            </label>
            {text.trim() ? (
              <button
                type="button"
                className="rounded text-xs font-medium text-base-content/60 transition-colors hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={() => onTextChange("")}
              >
                Clear
              </button>
            ) : (
              <button type="button" className={`${ui.link} text-xs`} onClick={onExample}>
                Use an example
              </button>
            )}
          </div>
          <textarea
            id="tw-list"
            className={`${`${ui.textarea} min-h-60`} ${mono.className} resize-y py-3 leading-relaxed`}
            rows={12}
            spellCheck={false}
            autoComplete="off"
            placeholder={EXAMPLE_LIST}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            aria-describedby="tw-list-status"
          />
          <p id="tw-list-status" className="text-xs text-base-content/60" aria-live="polite">
            {status}
          </p>
        </div>

        {errors.length > 0 && <SkippedLines errors={errors} />}

        <div className="flex flex-col gap-1 border-t border-base-300 pt-3">
          <label htmlFor="tw-date" className={ui.label}>
            Rates as of
          </label>
          <input
            id="tw-date"
            type="date"
            className={`${ui.input} tabular-nums`}
            value={f.entryDate}
            onChange={(e) => f.setEntryDate(e.target.value)}
          />
          <p className="text-xs leading-snug text-base-content/60">Shared with the calculator&apos;s entry date</p>
        </div>
      </div>
    </div>
  );
};
