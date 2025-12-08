"use client";

import { useEffect, useState } from "react";

const SCROLL_DOWN_THRESHOLD = 100;
const SCROLL_UP_THRESHOLD = 20;

/**
 * Hook to handle header scroll behavior with hysteresis
 */
export function useHeaderScroll(isEnabled: boolean) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    const scrollContainer = document.querySelector(
      ".h-screen.overflow-y-auto"
    ) as HTMLElement | null;
    if (!scrollContainer) return;

    let ticking = false;

    const updateHeader = () => {
      const scrollTop = scrollContainer.scrollTop;

      setIsScrolled((prev) => {
        if (prev) {
          return scrollTop > SCROLL_UP_THRESHOLD;
        }
        return scrollTop > SCROLL_DOWN_THRESHOLD;
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    updateHeader();
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [isEnabled]);

  return isScrolled;
}
