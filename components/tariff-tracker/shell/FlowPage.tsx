"use client";

import { ReactNode, RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { useEscapeToClose } from "@/hooks";
import { useTrackerNav } from "./TrackerNav";

// A step-by-step flow inside Duty Guard (the entry audit, the savings review): one big box over
// the content area beside the sidebar (TrackerShell's flow slot), so the sidebar stays and the
// flow reads as a page of Duty Guard, while the box itself is the stage the steps play out on.
// The box's head stays put: Back to where it was opened from, the flow's name and what it's for,
// which step of how many, a progress line, and the steps. The steps scroll under it. Going
// anywhere else in Duty Guard (a sidebar tab, an import) closes it, as does Escape.

export const FLOW_SLOT_ID = "tt-flow-slot";

export const FlowPage = ({
  label,
  context,
  back,
  onClose,
  rail,
  progress,
  scroller,
  children,
}: {
  // "Entry Audit", "Savings Review"
  label: string;
  // What it's for, under the label: the import
  context?: ReactNode;
  // "Back to Audits"
  back: string;
  onClose: () => void;
  // The steps, in the head's band
  rail?: ReactNode;
  // Where it's at: the step (1-based) and how many there are
  progress?: { at: number; of: number };
  // The flow's scroller, for each step to start at its top
  scroller?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) => {
  // Found as it renders (a flow only ever opens in the browser), so the box is there in the same
  // commit as the flow: its first "start at the top" then has a scroller to scroll, rather than
  // running before the box exists and leaving a focused button low on the page scrolled into view
  const slot = typeof document === "undefined" ? null : document.getElementById(FLOW_SLOT_ID);
  // ...and the box opens at its top, whatever was scrolled before
  useLayoutEffect(() => {
    scroller?.current?.scrollTo({ top: 0 });
  }, [scroller]);
  useEscapeToClose(true, onClose);

  // Moving elsewhere in Duty Guard closes it (not on opening)
  const { tab, product } = useTrackerNav();
  const where = useRef(`${tab}:${product ?? ""}`);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (where.current !== `${tab}:${product ?? ""}`) close.current();
  }, [tab, product]);

  if (!slot) return null;
  const pct = progress ? Math.min(1, Math.max(0, progress.at / progress.of)) * 100 : null;
  return createPortal(
    <div role="region" aria-label={label} data-own-keys className="tt-enter flex h-full flex-col bg-base-200 p-3 sm:p-4 lg:p-0">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-base-300 bg-(--tt-ob-ground) text-base-content shadow-[var(--tt-shadow)]">
        <header className="relative shrink-0 border-b border-base-300 bg-base-100">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4 lg:px-7">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 justify-self-start rounded-full py-1.5 pl-2 pr-3 text-sm font-semibold text-base-content/70 transition-colors hover:bg-tt-soft hover:text-base-content"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden />
              {back}
            </button>
            <div className="flex min-w-0 flex-col items-center text-center">
              <span className={`${tt.display} whitespace-nowrap text-base font-semibold`}>{label}</span>
              {context && <span className="truncate text-xs">{context}</span>}
            </div>
            <span className="justify-self-end text-xs font-semibold tabular-nums text-base-content/55">
              {progress && `Step ${Math.min(progress.at, progress.of)} of ${progress.of}`}
            </span>
          </div>
          {rail && <div className="hidden justify-center border-t border-base-300/70 px-5 py-2.5 md:flex lg:px-7">{rail}</div>}
          {pct !== null && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 translate-y-px bg-transparent" aria-hidden>
              <div className="h-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
            </div>
          )}
        </header>
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</div>
        </div>
      </div>
    </div>,
    slot
  );
};
