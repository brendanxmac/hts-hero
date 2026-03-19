"use client";

import { useEffect, useRef, useState } from "react";

const keywords = [
  "According to GRI 1...",
  "Based on Section XV Note 1(g):",
  "Under GRI 3(a)...",
  "Based on Chapter Note 3(a):",
  "Per GRI 3(b)...",
  "Additional US Note Note 1(g) states:",
];

export const GRIDefenseHeroMarketing = () => {
  const stateRef = useRef({ index: 0, charCount: 0, isDeleting: false });
  const [, setTick] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { index, charCount } = stateRef.current;
  const currentPhrase = keywords[index];
  const displayText = currentPhrase.slice(0, charCount);
  const isGRI = currentPhrase.includes("GRI");

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const typeSpeed = prefersReducedMotion ? 120 : 50;
    const deleteSpeed = prefersReducedMotion ? 80 : 35;
    const pauseAfterType = prefersReducedMotion ? 2500 : 1400;
    const pauseAfterDelete = prefersReducedMotion ? 800 : 500;

    const tick = () => {
      const { index, charCount, isDeleting } = stateRef.current;
      const phrase = keywords[index];

      if (isDeleting) {
        if (charCount > 0) {
          stateRef.current.charCount = charCount - 1;
          setTick((t) => t + 1);
          timeoutRef.current = setTimeout(tick, deleteSpeed);
        } else {
          stateRef.current.isDeleting = false;
          stateRef.current.index = (index + 1) % keywords.length;
          stateRef.current.charCount = 0;
          setTick((t) => t + 1);
          timeoutRef.current = setTimeout(tick, pauseAfterDelete);
        }
      } else {
        if (charCount < phrase.length) {
          stateRef.current.charCount = charCount + 1;
          setTick((t) => t + 1);
          timeoutRef.current = setTimeout(tick, typeSpeed);
        } else {
          stateRef.current.isDeleting = true;
          setTick((t) => t + 1);
          timeoutRef.current = setTimeout(tick, pauseAfterType);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, typeSpeed);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative mx-4 md:mx-8 px-8 md:px-16 text-center">
      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-primary/90 mb-4">
        Defensible & Documented
      </p>
      <h2 className="gri-text-glow text-3xl md:text-4xl lg:text-6xl font-bold text-base-content leading-tight max-w-3xl mx-auto">
        Not Just Codes, <span className="text-primary">Proof</span>
      </h2>
      <p className="text-base md:text-lg text-base-content/60 mt-6 max-w-3xl mx-auto">
        GRI, Legal Note, & CROSS Rulings defense included for every classification
      </p>

      <div className="mt-8 pt-6 border-t border-base-content/10 min-h-[4rem] md:min-h-[5rem] flex items-center justify-center">
        <div className="relative w-full min-h-[4rem] md:min-h-[5rem] flex items-center justify-center">
          <span
            className={`text-2xl md:text-4xl font-semibold tracking-tight ${isGRI ? "text-primary/90" : "text-secondary/90"
              }`}
            aria-live="polite"
          >
            {displayText}
            <span
              className="inline-block w-[3px] h-[0.85em] ml-1 align-middle bg-current animate-[griTypingCursor_1s_step-end_infinite]"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </div>
  );
};
