"use client";

import { useState } from "react";
import { ChevronDownIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { WatchError } from "./parse";

// The lines of a watch list that couldn't be read, and why. Open until the user hides it.
export const SkippedLines = ({ errors }: { errors: WatchError[] }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={ui.notice("warning")}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded text-left text-sm font-semibold text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-1.5">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
          {errors.length === 1 ? "1 line couldn't be read" : `${errors.length} lines couldn't be read`}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-base-content/60 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <ul className="mt-2 flex max-h-48 flex-col gap-1.5 overflow-y-auto">
          {errors.map((e) => (
            <li key={e.line} className="text-xs leading-snug text-base-content/70">
              <span className={`${mono.className} font-semibold text-base-content`}>Line {e.line}:</span> {e.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
