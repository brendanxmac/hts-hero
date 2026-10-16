"use client";

import { ReactNode, useId, useRef, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

// A small (i) that explains what's beside it in full: hover it or tab to it and a card opens
// under it, lined up with its right edge. The card is placed on the screen (position: fixed) from
// where the (i) is, so a card that clips its contents (overflow-hidden) can't cut it off, and it
// stays inside the page's theme. It's the (i)'s description for screen readers.

const WIDTH = 288;
const GAP = 8;

export const InfoTip = ({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) => {
  const id = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const [at, setAt] = useState<{ top: number; left: number } | null>(null);
  const show = () => {
    const box = ref.current?.getBoundingClientRect();
    if (box) setAt({ top: box.bottom + GAP, left: Math.max(GAP, Math.min(box.right - WIDTH, window.innerWidth - WIDTH - GAP)) });
  };
  const hide = () => setAt(null);
  return (
    <span className={`inline-flex ${className}`} onMouseEnter={show} onMouseLeave={hide}>
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-describedby={id}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => e.key === "Escape" && hide()}
        className="rounded-full text-base-content/35 transition-colors hover:text-base-content/70 focus-visible:text-base-content/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <InformationCircleIcon className="h-4 w-4" aria-hidden />
      </button>
      <span
        id={id}
        role="tooltip"
        hidden={!at}
        // Runtime position (DESIGN_SYSTEM §10)
        style={at ? { top: at.top, left: at.left, width: WIDTH } : undefined}
        className="pointer-events-none fixed z-50 rounded-xl border border-base-300 bg-base-100 p-3.5 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-base-content/80 shadow-lg"
      >
        {children}
      </span>
    </span>
  );
};
