"use client";

import { useEffect, useRef, useState } from "react";

// Counts up to `to` when it scrolls into view. The server renders the final number, so
// crawlers and no-JS readers see it.
export const CountUp = ({ to, ms = 1400, className = "" }: { to: number; ms?: number; className?: string }) => {
  const [value, setValue] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !ref.current) return;
    setValue(0);
    let raf = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, ms]);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value.toLocaleString("en-US")}
    </span>
  );
};
