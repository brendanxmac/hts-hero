"use client";

import { useEffect, useState } from "react";

// A column that moves with the page: one that fits below the gap stays there; a taller one scrolls
// until its end is in view, the gap below it, and stays there, so all of it can be reached without
// scrolling it on its own. Returns the ref setter and the sticky offset for the column.
const STICKY_GAP = 16;

// The header that stays on screen above the content, when there is one: a header marked
// data-sticky-header that's showing (a Tracker import's, inside a tab that may be hidden), else the
// site's own when it's sticky or fixed. What's under it is hidden, so columns stop (and scrolling
// lands) below it.
export const stickyHeaderHeight = () => {
  const marked = Array.from(document.querySelectorAll<HTMLElement>("[data-sticky-header]")).find((el) => el.offsetParent !== null);
  const header = marked ?? document.querySelector("header");
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
