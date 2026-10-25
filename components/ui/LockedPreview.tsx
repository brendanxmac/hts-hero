"use client";

import { ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useInCard } from "./Card";
import * as ui from "./styles";

// A feature the visitor can't use yet: a blurred stand-in for it (or, in the calculator's account
// gates, the real content: a product decision, as what they'd unlock sells best), with
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
  framed = true,
}: {
  title: string;
  // The headline fact, worked out from the visitor's data ("7 tariff changes hit your catalog")
  teaser?: ReactNode;
  // What unlocking gets them, a few short lines
  points?: string[];
  cta: { label: string; href?: string; onClick?: () => void };
  // Under the button: "Less than 30 seconds. No credit card."
  note?: string;
  // Drawn behind the blur: a stand-in, or (where the user chose it) the real content
  preview: ReactNode;
  // In a card of its own (otherwise it sits inside the host's)
  framed?: boolean;
  // Tailwind min-height class for the whole panel
  minHeight?: string;
  // Called once, when its lock box is first on screen (not when it mounts: it can sit below the
  // fold, or in a tab that's hidden)
  onShown?: () => void;
}) => {
  const inCard = useInCard();
  const shown = useRef(false);
  const lockBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = lockBox.current;
    if (shown.current || !onShown || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || shown.current || document.visibilityState !== "visible") return;
        shown.current = true;
        observer.disconnect();
        onShown();
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onShown]);

  const button = ui.button({ variant: "primary" });
  // Nothing behind the blur can be reached by keyboard either (React 18 has no `inert` prop)
  const behind = useRef<HTMLDivElement>(null);
  useEffect(() => {
    behind.current?.setAttribute("inert", "");
  }, []);

  return (
    // No card of its own inside a card's sections (CardSections): it's one of them
    // At most a screen of the preview: enough to see what's behind it, never a page of blur
    <section className={`${framed && !inCard ? `${ui.card} ` : ""}relative max-h-176 overflow-clip ${minHeight}`} aria-label={title}>
      {/* Behind the blur: nothing in it can be read by assistive tech, selected or focused */}
      <div ref={behind} className={`pointer-events-none select-none opacity-60 blur-xs ${framed ? "p-5" : ""}`} aria-hidden>
        {preview}
      </div>
      {/* Near the top, and in view while scrolling past a tall preview */}
      <div className="absolute inset-0 p-4 pt-12">
        <div ref={lockBox} className="sticky top-24 mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-lg border border-base-300 bg-base-100 p-6 text-center shadow-lg">
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
