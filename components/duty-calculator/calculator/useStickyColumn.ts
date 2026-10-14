"use client";

import { useEffect, useState } from "react";

// A column that moves with the page: one that fits below the gap stays there; a taller one scrolls
// until its end is in view, the gap below it, and stays there, so all of it can be reached without
// scrolling it on its own. Returns the ref setter and the sticky offset for the column.
const STICKY_GAP = 16;

// The site's header, when it stays on screen: what's under it is hidden, so columns stop (and
// scrolling lands) below it
export const stickyHeaderHeight = () => {
  const header = document.querySelector("header");
  if (!header) return 0;
  const { position } = getComputedStyle(header);
  return position === "sticky" || position === "fixed" ? header.getBoundingClientRect().height : 0;
};

export const useStickyColumn = () => {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [top, setTop] = useState(STICKY_GAP);
  useEffect(() => {
    if (!el) return;
    const update = () => {
      const header = stickyHeaderHeight();
      setTop(
        header + el.offsetHeight + STICKY_GAP * 2 <= window.innerHeight
          ? header + STICKY_GAP
          : window.innerHeight - el.offsetHeight - STICKY_GAP,
      );
    };
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
