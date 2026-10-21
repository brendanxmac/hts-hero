"use client";

import { Dialog } from "@headlessui/react";
import { ArrowRightIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";

// Before tracking a sheet's ready rows without the rest (SheetReview): one nudge to fix them first,
// since each is an import that goes unwatched, and the way on for anyone who'd rather not. The rows
// left wait in the Tracker (toFinish.ts) either way. Over the takeover, so above its layer; portals
// out of the Tracker, so it carries the Tracker's look itself (DESIGN_SYSTEM §15).

const n = (count: number) => count.toLocaleString("en-US");

export const LeaveRowsDialog = ({
  open,
  left,
  ready,
  onFix,
  onStart,
  onClose,
}: {
  open: boolean;
  // Rows still to fix, and imports ready to track
  left: number;
  ready: number;
  onFix: () => void;
  onStart: () => void;
  onClose: () => void;
}) => {
  const one = left === 1;
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[80]">
      <div className="fixed inset-0 bg-black/50" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative flex w-full max-w-md flex-col gap-5 p-6 shadow-2xl sm:p-7`}>
          <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content">
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning" aria-hidden>
            <ExclamationTriangleIcon className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-2">
            <span className={tt.eyebrow("warning")}>Before You Start</span>
            <Dialog.Title className={`${tt.display} m-0 pr-6 text-2xl font-semibold leading-tight text-base-content`}>
              Fix the {n(left)} {one ? "row" : "rows"} left first?
            </Dialog.Title>
            <p className="m-0 text-sm leading-relaxed text-base-content/70">
              {one ? "It's an import" : "Each one is an import"} we can&apos;t watch yet: no alert when {one ? "its" : "their"} tariffs change, and left out of
              your duty totals. Most take one click, since we suggest the fix.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" className={`${ui.button({ variant: "primary" })} w-full`} onClick={onFix} autoFocus>
              Fix {one ? "it" : `the ${n(left)}`} now
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" className="py-1 text-sm font-semibold text-base-content/60 hover:text-base-content" onClick={onStart}>
              Start with the {n(ready)} ready
            </button>
          </div>
          <p className="m-0 text-center text-xs text-base-content/60">
            {one ? "It waits" : "They wait"} in the Tracker under &ldquo;{n(left)} {one ? "Import" : "Imports"} to Finish&rdquo;.
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
