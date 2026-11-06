"use client";

import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useTrackerAccess } from "../../access/accessContext";
import { realItems } from "../../catalog";
import { useCatalogSynced } from "../../catalogSync";
import { useTracker } from "../../TrackerContext";
import { arrivalSource } from "../arrival";
import { useImportTakeover } from "../takeoverStore";
import { markTourSeen, openFeatureTour, tourSeen } from "./tourStore";
import { openTrackerOnboarding } from "../welcome/TrackerOnboarding";
import { welcomeCoverRemaining } from "./WelcomeCover";
import { TRACKER_WELCOME_PARAM } from "@/libs/signup-onboarding";

// What opens by itself when an account first reaches Duty Guard. The feature tour never does: it
// opens only from the sidebar's Product Tour (in development, ?tourPreview=1 too). An account's first
// visit with no imports (signed in, its catalog known, and no import flow already open) gets the
// Duty Guard onboarding, once; one that arrives with imports, or from the one-click ways in, goes
// straight to them. Straight from the sign-up onboarding (?welcome=, libs/signup-onboarding.ts):
// "imports" (came for savings or audits) and "alerts" open Duty Guard onboarding (TrackerOnboarding)
// once the welcome cover has been up long enough, ending in the import flow, not the tour;
// "calculator" opens nothing, ever.
export const TourTriggers = (): null => {
  const { user } = useUser();
  const { signedIn, loading } = useTrackerAccess();
  const synced = useCatalogSynced(user?.id);
  const { allItems: items } = useTracker();
  const takeover = useImportTakeover();
  const hasImports = realItems(items).length > 0;

  useEffect(() => {
    if (!signedIn || loading || !synced || !user?.id || takeover.open) return;
    const welcome = new URL(window.location.href).searchParams.get(TRACKER_WELCOME_PARAM);
    if (welcome !== "imports" && welcome !== "alerts" && welcome !== "calculator") return;
    // Handled once: the address loses it, so a reload doesn't repeat it
    const url = new URL(window.location.href);
    url.searchParams.delete(TRACKER_WELCOME_PARAM);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    markTourSeen(user.id, "first_visit");
    // Once the welcome has had its moment (WelcomeCover)
    if (welcome === "imports" || welcome === "alerts") setTimeout(() => openTrackerOnboarding(welcome), welcomeCoverRemaining());
  }, [signedIn, loading, synced, user?.id, takeover.open]);

  useEffect(() => {
    // From the sign-up onboarding: the effect above decides
    if (new URL(window.location.href).searchParams.get(TRACKER_WELCOME_PARAM)) return;
    // An arrival from the one-click ways in (arrival.ts) sees the import it asked for
    if (!signedIn || loading || !synced || !user?.id || takeover.open || arrivalSource()) return;
    if (tourSeen(user.id, "first_visit")) return;
    markTourSeen(user.id, "first_visit");
    if (!hasImports) setTimeout(() => openTrackerOnboarding("imports"), welcomeCoverRemaining());
  }, [signedIn, loading, synced, user?.id, takeover.open]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (new URL(window.location.href).searchParams.get("tourPreview") === "1") openFeatureTour("preview");
    // And ?welcomePreview=imports|alerts opens Duty Guard onboarding
    const welcomePreview = new URL(window.location.href).searchParams.get("welcomePreview");
    if (welcomePreview === "imports" || welcomePreview === "alerts") openTrackerOnboarding(welcomePreview);
  }, []);

  return null;
};
