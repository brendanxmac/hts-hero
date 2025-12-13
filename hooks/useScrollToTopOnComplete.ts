"use client";

import { useEffect } from "react";

const SCROLL_TO_TOP_DELAY = 150;

/**
 * Hook to scroll to top when classification is completed
 */
export function useScrollToTopOnComplete(isComplete: boolean) {
  useEffect(() => {
    if (!isComplete) return;

    const scrollContainer = document.querySelector(
      ".h-screen.overflow-y-auto"
    ) as HTMLElement | null;

    if (scrollContainer) {
      setTimeout(() => {
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      }, SCROLL_TO_TOP_DELAY);
    }
  }, [isComplete]);
}
