"use client";

import { CSSProperties, ReactNode, useEffect, useState } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { mono } from "@/components/ui/font";

// Small pieces the import takeover's steps share: the stagger for things rising into place, a
// number that counts up, a step's heading, and the mini spreadsheet the instructions draw on.

// When a piece rises into place (globals.css .tt-ob-*): its delay, as a CSS variable
// "What's an import" (ExplainStep) comes right before the ways to add them (back in the flow
// 2026-10-30, as a short scene); false takes it out again (the rail and the step numbers follow).
export const SHOW_EXPLAINER = true;
export const ADD_STEP = SHOW_EXPLAINER ? 3 : 2;
export const DONE_STEP = ADD_STEP + 1;

export const delay = (ms: number) => ({ "--tt-delay": `${ms}ms` }) as CSSProperties;

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// A number counting up to `to` (eased), after `wait` ms; at once with reduced motion
export const useCountUp = (to: number, { duration = 1100, wait = 0 }: { duration?: number; wait?: number } = {}) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(to);
      return;
    }
    let frame = 0;
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setValue(to * (1 - Math.pow(1 - t, 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, wait);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [to, duration, wait]);
  return value;
};

// A step's eyebrow, title and lead, rising in turn. The title gets the id the dialog is labeled by.
export const StepHeading = ({
  eyebrow,
  title,
  lead,
  tone = "primary",
  size = "lg",
  center = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "primary" | "success" | "warning";
  size?: "lg" | "md";
  center?: boolean;
}) => (
  <div className={`flex flex-col gap-3 ${center ? "items-center text-center" : ""}`}>
    <span className={`${tt.eyebrow(tone)} tt-ob-rise`}>{eyebrow}</span>
    <h1
      id="tt-onboarding-title"
      tabIndex={-1}
      className={`${tt.display} tt-ob-rise m-0 font-semibold leading-[1.08] tracking-tight text-base-content outline-hidden ${size === "lg" ? "text-[2.6rem]" : "text-[2rem]"}`}
      style={delay(60)}
    >
      {title}
    </h1>
    {lead && (
      <p className="tt-ob-rise m-0 max-w-3xl text-base leading-relaxed text-base-content/75" style={delay(120)}>
        {lead}
      </p>
    )}
  </div>
);

// Numbered how-to steps beside an input
export const HowTo = ({ steps, start = 180 }: { steps: ReactNode[]; start?: number }) => (
  <ol className="m-0 flex list-none flex-col gap-3 p-0">
    {steps.map((step, i) => (
      <li key={i} className="tt-ob-rise flex gap-3" style={delay(start + i * 70)}>
        <span className={`${tt.display} flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary`}>
          {i + 1}
        </span>
        <span className="pt-0.5 text-sm leading-relaxed text-base-content/80">{step}</span>
      </li>
    ))}
  </ol>
);

// A keyboard key, inline
export const Key = ({ children }: { children: ReactNode }) => (
  <kbd
    className={`${mono.className} rounded-md border border-base-300 bg-base-100 px-1.5 py-0.5 text-[0.75rem] font-semibold text-base-content shadow-[0_1px_0_var(--color-base-300)]`}
  >
    {children}
  </kbd>
);

// A spreadsheet as most people keep their products: some columns of their own, and somewhere in
// it an HTS code and a country of origin, which light up. `copy` marks them as copied (marching
// border); `file` shows it as a file being saved.
const SHEET = {
  headers: ["Part #", "Description", "HTS Code", "Unit cost", "Country of Origin"],
  rows: [
    ["PMP-2210", "Pump housing", "8413.91.90.15", "$42.10", "Brazil"],
    ["GSK-0418", "Engine gasket", "8409.99.91.90", "$3.85", "Argentina"],
    ["BRG-7731", "Ball bearing", "8482.10.50.44", "$1.20", "China"],
    ["SHF-1009", "Drive shaft", "8483.10.30.50", "$88.00", "Mexico"],
  ],
  lit: [2, 4],
};

export const SheetIllustration = ({ caption, wait = 200 }: { caption?: string; wait?: number }) => (
  <figure className="tt-ob-rise m-0 flex flex-col gap-2" style={delay(wait)} aria-hidden>
    <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-[var(--tt-shadow)]">
      <div className="flex items-center gap-1.5 border-b border-base-300 bg-tt-soft px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-error/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
        <span className="ml-2 text-[0.7rem] font-semibold text-base-content/50">products.xlsx</span>
      </div>
      <table className="w-full table-fixed border-collapse text-[0.7rem]">
        <thead>
          <tr>
            {SHEET.headers.map((h, i) => (
              <th
                key={h}
                className={`truncate border-b border-r border-base-300 px-2 py-1.5 text-left font-semibold last:border-r-0 ${SHEET.lit.includes(i) ? "bg-primary/15 text-primary" : "text-base-content/50"
                  }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SHEET.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={`truncate border-b border-r border-base-300 px-2 py-1.5 last:border-r-0 ${SHEET.lit.includes(i) ? `bg-primary/8 font-semibold text-base-content ${i === 2 ? mono.className : ""}` : "text-base-content/40"
                    }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {caption && <figcaption className="text-center text-xs text-base-content/60">{caption}</figcaption>}
  </figure>
);
