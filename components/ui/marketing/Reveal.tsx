"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

// Fades and lifts its child in the first time it scrolls into view. For visuals only: keep copy
// outside it, so text is never hidden from readers, crawlers or a slow script.
export const Reveal = ({ children, className = "", delayMs = 0 }: { children: ReactNode; className?: string; delayMs?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !ref.current) return;
    const el = ref.current;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setShown(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setTimeout(() => setShown(true), delayMs);
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs]);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}>
      {children}
    </div>
  );
};
