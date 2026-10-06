"use client";

import { createContext, useContext } from "react";
import { SectionSlug } from "../sections";

// Moving between the tracker's tabs, from anywhere inside it
export interface TrackerNav {
  tab: SectionSlug;
  openTab: (slug: SectionSlug) => void;
  // The catalog product open in its own view (by product key), if any
  product: string | null;
  // fromList: opened from the catalog list, so going back returns to it as it was
  openProduct: (key: string, fromList?: boolean) => void;
  // Back to the catalog list
  closeProduct: () => void;
  // The Calculator tab, started over from a calculator link (code, country, shipment…)
  openCalculator: (url: string) => void;
}

export const TrackerNavContext = createContext<TrackerNav | null>(null);

export const useTrackerNav = () => {
  const nav = useContext(TrackerNavContext);
  if (!nav) throw new Error("useTrackerNav must be used inside TrackerApp");
  return nav;
};
