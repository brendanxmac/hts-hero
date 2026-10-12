"use client";

import { ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import * as ui from "./styles";

// A feature the visitor can't use yet: a blurred stand-in for it (never the real data), with
// what it would show them and the one step that unlocks it. The blur is the accepted exception
// in DESIGN_SYSTEM.md §10. The teaser should be a real number from the visitor's own data where
// there is one: it sells harder than the blur.
export const LockedPreview = ({
  title,
  teaser,
  points = [],
  cta,
  note,
  preview,
  minHeight = "min-h-80",
  onShown,
}: {
  title: string;
  // The headline fact, worked out from the visitor's data ("7 tariff changes hit your catalog")
  teaser?: ReactNode;
  // What unlocking gets them, a few short lines
  points?: string[];
  cta: { label: string; href?: string; onClick?: () => void };
  // Under the button: "Free forever. No credit card."
  note?: string;
  // The stand-in drawn behind the blur
  preview: ReactNode;
  // Tailwind min-height class for the whole panel
  minHeight?: string;
  // Called once, when it's first shown
  onShown?: () => void;
}) => {
  const shown = useRef(false);
  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    onShown?.();
  }, [onShown]);

  const button = ui.button({ variant: "primary" });

  return (
    <section className={`${ui.card} relative ${minHeight}`} aria-label={title}>
      {/* The stand-in: not real data, and nothing in it can be read or focused */}
      <div className="pointer-events-none select-none p-5 opacity-60 blur-sm" aria-hidden>
        {preview}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-lg border border-base-300 bg-base-100 p-6 text-center shadow-lg">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
            <LockClosedIcon className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-semibold tracking-tight text-base-content">{title}</h3>
          {teaser && <p className="text-sm font-medium leading-snug text-base-content">{teaser}</p>}
          {points.length > 0 && (
            <ul className={`${ui.bodySm} flex flex-col gap-1`}>
              {points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          {cta.href ? (
            <Link href={cta.href} className={`${button} mt-1`} onClick={cta.onClick}>
              {cta.label}
            </Link>
          ) : (
            <button type="button" className={`${button} mt-1`} onClick={cta.onClick}>
              {cta.label}
            </button>
          )}
          {note && <p className={ui.caption}>{note}</p>}
        </div>
      </div>
    </section>
  );
};
