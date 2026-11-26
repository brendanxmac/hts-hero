"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useOptionalTrackerAccess } from "@/components/tariff-tracker/access/accessContext";
import { isSaleLive } from "@/libs/black-friday";

// Whether the sale is on, checked in the browser: the HTS pages are cached for days, so the
// server's answer can be stale. `initial` is the server's, so the first render matches its HTML;
// the clock corrects it right after
export const useSaleLive = (initial = false) => {
  const [live, setLive] = useState(initial);
  useEffect(() => {
    setLive(isSaleLive());
  }, []);
  return live;
};

// The visitor's Duty Guard plan outside Duty Guard (inside, its own access says), asked once per page load
let planKind: Promise<string | null> | null = null;
const fetchPlanKind = () =>
  (planKind ??= fetch("/api/tracker/access", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((a: { kind?: string } | null) => a?.kind ?? null)
    .catch((): null => null));

// The sale's page, where the popup, the banner and the email lead: anyone can see the deal there,
// and only picking a plan asks them to sign in (components/sale/BlackFridayPage.tsx)
export const SALE_PAGE = "/black-friday";

// Who sees the sale: everyone but a paying account. `kind` is null while it's still being found
// out (shown meanwhile: a paying account sees at most a moment of it)
export const useSaleAudience = (initialLive = false) => {
  const live = useSaleLive(initialLive);
  const { user, isLoading } = useUser();
  const tracker = useOptionalTrackerAccess();
  const [fetched, setFetched] = useState<string | null>(null);

  useEffect(() => {
    // Not until the session is read: a signed-in visitor isn't "anonymous" for a moment
    if (tracker || !live || isLoading) return;
    if (!user) return setFetched("anonymous");
    let on = true;
    fetchPlanKind().then((kind) => on && setFetched(kind));
    return () => {
      on = false;
    };
  }, [tracker, live, user, isLoading]);

  const kind = tracker ? (tracker.loading ? null : tracker.access.kind) : fetched;
  const signedIn = tracker ? tracker.signedIn : !!user;
  return {
    live,
    kind,
    signedIn,
    show: live && kind !== "paid",
    // Settled: safe to open the popup (never to a paying account)
    ready: live && kind !== null && kind !== "paid",
    // `from`: which button, for the page's source (popup or banner)
    pageHref: (from: string) => `${SALE_PAGE}?from=${from}`,
    // In Duty Guard (signed in already), the plans open in place, with the sale's prices
    openPlans: tracker ? () => tracker.openUpgrade("plan", "user") : null,
  };
};
