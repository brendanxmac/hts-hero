"use client";

import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useTrackerAccess } from "../../access/accessContext";
import { realItems } from "../../catalog";
import { useCatalogSynced } from "../../catalogSync";
import { useTracker } from "../../TrackerContext";
import { arrivalSource } from "../arrival";
import { useImportTakeover } from "../takeoverStore";
import { openFeatureTour, openTourOnce } from "./tourStore";

// When the feature tour opens by itself: the first time an account opens the Tracker (signed in,
// except an arrival from the one-click ways in, which waits for the next visit;
// its catalog known), never over the import flow (a link that asked for it goes first, and the
// tour after the imports takes over from there). After the first imports, ImportTakeover's
// finish opens it (openTourOnce "imports_added"). In development, ?tourPreview=1 opens it for
// anyone, signed out too.
export const TourTriggers = (): null => {
  const { user } = useUser();
  const { signedIn, loading } = useTrackerAccess();
  const synced = useCatalogSynced(user?.id);
  const { items } = useTracker();
  const takeover = useImportTakeover();
  const hasImports = realItems(items).length > 0;

  useEffect(() => {
    // An arrival from Get Alerts or Stop Overpaying (arrival.ts) sees the import it asked for first;
    // the tour waits for the next visit (or the sidebar's Product Tour)
    if (!signedIn || loading || !synced || !user?.id || takeover.open || arrivalSource()) return;
    openTourOnce(user.id, "first_visit", hasImports ? "alerts" : "imports");
  }, [signedIn, loading, synced, user?.id, takeover.open]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (new URL(window.location.href).searchParams.get("tourPreview") === "1") openFeatureTour("preview");
  }, []);

  return null;
};
