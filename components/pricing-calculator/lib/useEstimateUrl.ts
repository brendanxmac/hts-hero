"use client";

import { useEffect, useRef } from "react";
import { EstimateState, toEstimateParams } from "./estimateParams";

// Wait for a pause before writing, so dragging the pairs slider doesn't write on every step
// (Safari also throttles frequent history updates)
const WRITE_DELAY_MS = 250;

// Keeps the URL's query in step with the estimate. It replaces the current history entry, so
// changing options doesn't fill the back button. Nothing is written until the first change,
// so a plain visit keeps a clean URL.
export const useEstimateUrl = (state: EstimateState) => {
  const query = toEstimateParams(state);
  const initialQuery = useRef(query);

  useEffect(() => {
    if (query === initialQuery.current) return;
    initialQuery.current = "";
    const timeout = setTimeout(() => {
      const url = new URL(window.location.href);
      url.search = query;
      window.history.replaceState(window.history.state, "", url);
    }, WRITE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  return query;
};
