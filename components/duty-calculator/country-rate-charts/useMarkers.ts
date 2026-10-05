"use client";

import { useEffect, useState } from "react";
import { Markers } from "./types";

const MARKERS_STORAGE_KEY = "hts-hero-rates-markers";

// Whether countries show as colors or flags, remembered on this device
export const useMarkers = () => {
  const [markers, setMarkersState] = useState<Markers>("colors");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MARKERS_STORAGE_KEY);
      if (saved === "colors" || saved === "flags") setMarkersState(saved);
    } catch {
      // Storage can be unavailable (private mode); colors stay
    }
  }, []);

  const setMarkers = (next: Markers) => {
    setMarkersState(next);
    try {
      window.localStorage.setItem(MARKERS_STORAGE_KEY, next);
    } catch {
      // Not critical
    }
  };

  return [markers, setMarkers] as const;
};
