"use client";

import { ArrowRightIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { COLUMN_LABEL } from "../duty-calculator/results";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatRate } from "./formatRate";
import { programName, WatchRow } from "./report";

// An opened product: the charges that make up its rate, the questions that could change it,
// and a way into the full calculator
export const ProductDetails = ({ row, onOpenInCalculator }: { row: WatchRow; onOpenInCalculator: () => void }) => {
  const { result } = row;
  const applied = result.lines.filter((l) => l.status === "applies");
  const notApplied = result.lines.length - applied.length;
  const open = result.questions.filter((q) => !q.answered);
  const heading = (id: string) => result.lines.find((l) => `confirm:${l.code}` === id);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className={`${ui.card} overflow-hidden`}>
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Charges for {row.entry.element.htsno}</caption>
          <tbody className="tabular-nums">
            <tr>
              <td className="px-4 py-2.5 align-top">
                <span className={`${mono.className} font-semibold text-primary`}>Base</span>
                <span className="ml-2 text-base-content/70">{COLUMN_LABEL[result.column]}</span>
              </td>
              <td className="px-4 py-2.5 text-right text-base-content/70">{result.base.reasons[0] ?? "Free"}</td>
            </tr>
            {applied.map((line) => (
              <tr key={line.code} className="border-t border-base-300">
                <td className="px-4 py-2.5 align-top">
                  <span className={`${mono.className} font-semibold text-primary`}>{line.code}</span>
                  <span className="ml-2 text-base-content">{line.name}</span>
                  <span className="block text-xs text-base-content/60">{programName(line.program)}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right align-top">
                  {line.ratePct !== undefined ? formatRate(line.ratePct) : "—"}
                </td>
              </tr>
            ))}
            <tr className="border-t border-base-content/20 bg-base-200">
              <td className="px-4 py-2.5 font-semibold">Total duty rate</td>
              <td className="px-4 py-2.5 text-right font-semibold">{formatRate(row.totalPct)}</td>
            </tr>
          </tbody>
        </table>
        {notApplied > 0 && (
          <p className="border-t border-base-300 px-4 py-2 text-xs text-base-content/60">
            {notApplied} more {notApplied === 1 ? "heading was" : "headings were"} checked and don&apos;t apply
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {open.length > 0 ? (
          <div>
            <div className="text-sm font-semibold text-base-content">
              {open.length === 1 ? "1 question could change this" : `${open.length} questions could change this`}
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {open.slice(0, 4).map((q) => (
                <li key={q.input.id} className="text-xs leading-snug text-base-content/70">
                  {heading(q.input.id) ? (
                    <>
                      <span className={`${mono.className} font-semibold`}>{heading(q.input.id)?.code}</span>{" "}
                      {heading(q.input.id)?.name}
                    </>
                  ) : (
                    q.input.label
                  )}
                </li>
              ))}
              {open.length > 4 && <li className="text-xs text-base-content/60">and {open.length - 4} more</li>}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-base-content/70">No questions could change this rate.</p>
        )}
        {result.warnings.map((w) => (
          <p key={w} className="flex gap-1.5 text-xs leading-snug text-warning">
            <ExclamationTriangleIcon className="mt-px h-4 w-4 shrink-0" aria-hidden />
            {w}
          </p>
        ))}
        <button
          type="button"
          className={`${ui.button({ variant: "primary", size: "sm" })} self-start`}
          onClick={onOpenInCalculator}
        >
          Open in calculator
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};
