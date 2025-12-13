"use client";

import { useEffect, useState, useRef } from "react";

// Must scroll PAST this to collapse (expanded -> collapsed)
const COLLAPSE_THRESHOLD = 120;
// Must scroll ABOVE this to expand (collapsed -> expanded)
const EXPAND_THRESHOLD = 50;
// Lock duration after state change (longer than CSS transition)
const LOCK_DURATION_MS = 400;

/**
 * Hook to handle header scroll behavior with hysteresis and state locking.
 * 
 * Key design:
 * - Hysteresis: 70px "dead zone" between thresholds prevents oscillation
 * - State lock: After any state change, ignore scroll events for 400ms
 * - This prevents feedback loops from layout shifts when header resizes
 */
export function useHeaderScroll(isEnabled: boolean) {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Use refs for mutable state that shouldn't trigger re-renders
  const stateRef = useRef(false);
  const lockedUntilRef = useRef(0);

  useEffect(() => {
    if (!isEnabled) {
      setIsScrolled(false);
      stateRef.current = false;
      return;
    }

    const scrollContainer = document.querySelector(
      ".h-screen.overflow-y-auto"
    ) as HTMLElement | null;
    
    if (!scrollContainer) return;

    const handleScroll = () => {
      const now = Date.now();
      
      // If locked, ignore this scroll event entirely
      if (now < lockedUntilRef.current) {
        return;
      }

      const scrollTop = scrollContainer.scrollTop;
      const currentState = stateRef.current;
      let newState = currentState;

      if (!currentState && scrollTop > COLLAPSE_THRESHOLD) {
        // Currently expanded, should collapse
        newState = true;
      } else if (currentState && scrollTop < EXPAND_THRESHOLD) {
        // Currently collapsed, should expand
        newState = false;
      }
      // If scrollTop is between EXPAND_THRESHOLD and COLLAPSE_THRESHOLD,
      // maintain the current state (dead zone)

      if (newState !== currentState) {
        // State is changing - lock further changes
        lockedUntilRef.current = now + LOCK_DURATION_MS;
        stateRef.current = newState;
        setIsScrolled(newState);
      }
    };

    // Initialize based on current scroll position (no lock for initial state)
    const initialScrollTop = scrollContainer.scrollTop;
    const initialState = initialScrollTop > COLLAPSE_THRESHOLD;
    stateRef.current = initialState;
    setIsScrolled(initialState);

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [isEnabled]);

  return isScrolled;
}
