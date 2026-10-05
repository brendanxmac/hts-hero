"use client";

// Checked but not applied: the other headings that match the code and country, and why each
// doesn't apply. Collapsed until opened.
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { DutyLine } from "@/tariffs/engine-v2/types";

const STATUS = {
  excluded: "Excluded",
  notApplicable: "Doesn't apply",
  needsAnswer: "Needs an answer",
  applies: "Applies",
};

export const NotAppliedPanel = ({ lines }: { lines: DutyLine[] }) => {
  const [open, setOpen] = useState(false);
  const notApplied = lines.filter((l) => l.status !== "applies");
  if (notApplied.length === 0) return null;
  return (
    <div className={ui.card}>
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 p-5 sm:px-6 text-left"
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
      >
        <span>
          <span className={`${ui.cardTitle} block`}>
            Checked but not applied
          </span>
          <span className={`${ui.caption} block mt-0.5`}>
            {notApplied.length} other headings match this code and country
          </span>
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 shrink-0 text-base-content/60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="border-t border-base-300 divide-y divide-base-300">
          {notApplied.map((line) => (
            <li
              key={line.code}
              className="px-5 sm:px-6 py-3.5 flex flex-col gap-1"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className={`${mono.className} ${ui.fieldLabel}`}>
                  {line.code}
                </span>
                <span className="text-sm text-base-content">{line.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                    line.status === "needsAnswer"
                      ? "bg-warning/10 text-warning border border-warning/40"
                      : "bg-base-300 text-base-content/70"
                  }`}
                >
                  {STATUS[line.status]}
                </span>
                {line.reasons[0] && (
                  <span className={ui.caption}>{line.reasons.join(" · ")}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
