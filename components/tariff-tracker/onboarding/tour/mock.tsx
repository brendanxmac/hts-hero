"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { SECTIONS, SectionSlug } from "../../sections";
import { prefersReducedMotion } from "../parts";

// The pieces each tour step's demo is drawn with: a small Duty Guard window (its real sidebar, the
// open tab lit), a cursor that glides to what it clicks, and a timeline that plays the demo in
// beats. Every demo plays once as the step opens, then holds on its last frame; Replay plays it
// again. With reduced motion it starts on the last frame.

// The beat the demo is on: 0 at the start, then one more at each time in `at` (ms from the
// start). `run` changes (Replay) start it over.
export const useBeats = (at: number[], run: number) => {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setBeat(at.length);
      return;
    }
    setBeat(0);
    const timers = at.map((ms, i) => setTimeout(() => setBeat(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [run]);
  return beat;
};

// The sidebar's tabs, as Duty Guard shows them
const TABS = SECTIONS.filter((s) => !s.hidden && s.group === "workspace");

export const MockWindow = ({ tab, children, cursor }: { tab: SectionSlug; children: ReactNode; cursor?: ReactNode }) => (
  <div className={`${tt.panel} relative flex h-[27rem] w-full flex-col overflow-hidden shadow-[0_24px_60px_-24px_var(--tt-ob-glow)]`} aria-hidden>
    {/* The window's bar */}
    <div className="flex shrink-0 items-center gap-1.5 border-b border-base-300 bg-tt-soft px-3 py-2">
      <span className="h-2.5 w-2.5 rounded-full bg-error/50" />
      <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
      <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
      <span className="mx-auto rounded-md bg-base-100 px-3 py-0.5 text-[0.65rem] text-base-content/50">htshero.com/duty-guard</span>
    </div>
    <div className="flex min-h-0 flex-1">
      {/* The sidebar: dark in both modes, as in Duty Guard */}
      <div className="hts-tracker-on-dark flex w-36 shrink-0 flex-col gap-0.5 bg-tt-side p-2 text-base-content">
        <span className={`${tt.display} px-2 pb-2 pt-1 text-[0.7rem] font-semibold`}>Duty Guard</span>
        {TABS.map((s) => (
          <span
            key={s.slug}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[0.65rem] transition-colors duration-300 ${
              s.slug === tab ? "bg-tt-side-active font-semibold text-base-content" : "text-base-content/60"
            }`}
          >
            <s.Icon className="h-3 w-3 shrink-0" />
            <span className="flex-1 truncate">{s.label}</span>
          </span>
        ))}
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden bg-base-200 p-3">{children}</div>
    </div>
    {cursor}
  </div>
);

// The cursor, gliding between spots; `click` rings out where it is. It aims at what it clicks: `to`
// names a `data-cursor` in the window, and the tip lands on its middle, measured from the layout
// (so a panel still sliding in doesn't throw it off). Otherwise x% and y% of the window; with
// neither, it stays where it was.
export const Cursor = ({ to, x, y, click = false, hidden = false }: { to?: string; x?: number; y?: number; click?: boolean; hidden?: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [spot, setSpot] = useState<{ left: string; top: string }>({ left: "50%", top: "80%" });
  useLayoutEffect(() => {
    const root = ref.current?.parentElement;
    if (!root) return;
    const measure = () => {
      if (!to) {
        if (x !== undefined && y !== undefined) setSpot({ left: `${x}%`, top: `${y}%` });
        return;
      }
      const el = root.querySelector<HTMLElement>(`[data-cursor="${to}"]`);
      if (!el) return;
      let left = el.offsetWidth / 2;
      let top = el.offsetHeight / 2;
      let n: HTMLElement | null = el;
      while (n && n !== root) {
        left += n.offsetLeft;
        top += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      setSpot({ left: `${left}px`, top: `${top}px` });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [to, x, y]);
  return (
    <span
      ref={ref}
      className={`pointer-events-none absolute z-30 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${hidden ? "opacity-0" : "opacity-100"}`}
      style={spot}
    >
      {click && <span key={`${to}-${spot.left}-${spot.top}`} className="tt-ob-ping absolute -left-3 -top-3 h-6 w-6 rounded-full bg-primary/40" />}
      <svg width="18" height="20" viewBox="0 0 18 20" className="relative drop-shadow-[0_2px_3px_rgb(0_0_0/0.35)]">
        <path d="M1 1 L1 16 L5 12 L8 19 L11 17.6 L8 11 L14 11 Z" fill="white" stroke="#0e1220" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </span>
  );
};

// A piece of the demo that shows from a beat on, rising into place
export const Show = ({ when, children, className = "" }: { when: boolean; children: ReactNode; className?: string }) =>
  when ? <div className={`tt-ob-rise ${className}`}>{children}</div> : null;

// A small page title inside the window
export const MockTitle = ({ title, action }: { title: string; action?: ReactNode }) => (
  <div className="mb-2.5 flex items-center justify-between gap-2">
    <span className={`${tt.display} text-sm font-semibold text-base-content`}>{title}</span>
    {action}
  </div>
);
