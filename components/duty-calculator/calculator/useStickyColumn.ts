"use client";

import { useEffect, useState } from "react";

// A column that moves with the page: one that fits below the gap stays there; a taller one scrolls
// until its end is in view, the gap below it, and stays there, so all of it can be reached without
// scrolling it on its own. Returns the ref setter and the sticky offset for the column.
const STICKY_GAP = 16;

export const useStickyColumn = () => {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [top, setTop] = useState(STICKY_GAP);
  useEffect(() => {
    if (!el) return;
    const update = () =>
      setTop(
        el.offsetHeight + STICKY_GAP <= window.innerHeight
          ? STICKY_GAP
          : window.innerHeight - el.offsetHeight - STICKY_GAP,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [el]);
  return [setEl, top] as const;
};
