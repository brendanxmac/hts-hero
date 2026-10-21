"use client";

import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useTrackerAccess } from "../access/accessContext";
import { useCatalogSynced } from "../catalogSync";
import { useTracker } from "../TrackerContext";
import { useTrackerNav } from "./TrackerNav";

// Whether the catalog is known to have no imports yet: loaded (and, signed in, synced with the
// account), and empty. Until then Home has nothing to show, so it's left out of the nav and a visit
// to it opens Your Imports, the setup page (SetupPage); it's back once imports are added.
export const useNoImportsYet = () => {
  const { user } = useUser();
  const { signedIn, loading: accessLoading } = useTrackerAccess();
  const { loading, items } = useTracker();
  const synced = useCatalogSynced(user?.id);
  return !loading && !accessLoading && (!signedIn || synced) && items.length === 0;
};

// Home asked for (the Tracker's default tab) with no imports yet: Your Imports, in its place
export const useHomeWaitsForImports = () => {
  const empty = useNoImportsYet();
  const { tab } = useTrackerNav();
  useEffect(() => {
    if (!empty || tab !== "overview") return;
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "catalog");
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [empty, tab]);
  return empty;
};
