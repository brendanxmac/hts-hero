"use client";

import * as tt from "@/components/ui/styles/tracker";
import { mono } from "@/components/ui/font";
import { delay } from "./parts";

// What an import is, shown rather than told: an HTS code slides in from one side, a country of
// origin from the other, and together they snap into one import. Then a second country for the same
// code makes a second import. No rates: just the idea, kept dead simple.

const Piece = ({ label, children, from, wait }: { label: string; children: React.ReactNode; from: "left" | "right"; wait: number }) => (
  <div className={`${from === "left" ? "tt-ob-from-left" : "tt-ob-from-right"} flex flex-col items-center gap-2`} style={delay(wait)}>
    <span className={tt.eyebrow("neutral")}>{label}</span>
    <div className="flex h-16 items-center rounded-2xl border-2 border-base-300 bg-base-100 px-5 shadow-[var(--tt-shadow)]">{children}</div>
  </div>
);

// Level with the boxes: the same height, at the bottom of the row (the labels sit above the boxes)
const Sign = ({ children, wait }: { children: string; wait: number }) => (
  <span className={`${tt.display} tt-ob-rise flex h-16 items-center self-end text-2xl font-semibold text-base-content/40`} style={delay(wait)} aria-hidden>
    {children}
  </span>
);

const ImportCard = ({ code, flag, country, wait }: { code: string; flag: string; country: string; wait: number }) => (
  <div className="tt-ob-pop flex flex-col items-center gap-2" style={delay(wait)}>
    <span className={tt.eyebrow("primary")}>One import</span>
    <div className="flex h-16 flex-col justify-center rounded-2xl border-2 border-primary bg-primary/5 px-5 leading-tight shadow-[0_12px_28px_-14px_var(--tt-ob-glow)]">
      <span className={`${mono.className} text-sm font-bold text-base-content`}>{code}</span>
      <span className="text-xs text-base-content">
        {flag} {country}
      </span>
    </div>
  </div>
);

export const ImportExplainer = () => (
  <div className="flex flex-col gap-8" role="img" aria-label="An HTS code plus a country of origin makes one import">
    <div className="flex flex-wrap items-start justify-center gap-2" aria-hidden>
      <Piece label="HTS code" from="left" wait={50}>
        <span className="flex flex-col leading-tight">
          <span className={`${mono.className} text-lg font-bold tracking-tight text-base-content`}>6109.10.00.12</span>
          <span className="text-[0.7rem] text-base-content/55">Cotton T-shirts</span>
        </span>
      </Piece>
      <Sign wait={150}>+</Sign>
      <Piece label="Country of origin" from="right" wait={200}>
        <span className="flex flex-col items-center leading-tight">
          <span className="flex items-center gap-2 text-lg font-semibold text-base-content">
            <span className="text-2xl">🇨🇳</span> China
          </span>
          <span className="text-[0.7rem] text-base-content/55">As on your entries</span>
        </span>
      </Piece>
      <Sign wait={320}>=</Sign>
      <ImportCard code="6109.10.00.12" flag="🇨🇳" country="China" wait={400} />
    </div>
    {/* The same code from somewhere else is a different import */}
    <div className="tt-ob-rise flex flex-wrap items-center justify-center gap-1 text-sm text-base-content/80" style={delay(600)} aria-hidden>
      <span>The same code with 🇧🇷 Brazil as the origin?</span>
      <span>That&apos;s a second import.</span>
    </div>
  </div>
);
