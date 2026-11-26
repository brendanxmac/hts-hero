"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useOptionalTrackerAccess } from "@/components/tariff-tracker/access/accessContext";
import { entryHref } from "@/libs/signup-onboarding";
import { isSaleLive } from "@/libs/black-friday";
import { TRACKER_PATH } from "@/components/tariff-tracker/sections";

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

// The plans, after the sale's button: in Duty Guard they open in place; elsewhere, signed in, Duty
// Guard opens on them; signed out, sign-up and the onboarding first
export const SALE_PLANS_PATH = `${TRACKER_PATH}?upgrade=plan`;

// Who sees the sale: everyone but a paying account. `kind` is null while it's still being found
// out (shown meanwhile: a paying account sees at most a moment of it)
export const useSaleAudience = (initialLive = false) => {
  const live = useSaleLive(initialLive);
  const { user } = useUser();
  const tracker = useOptionalTrackerAccess();
  const [fetched, setFetched] = useState<string | null>(null);

  useEffect(() => {
    if (tracker || !live) return;
    if (!user) return setFetched("anonymous");
    let on = true;
    fetchPlanKind().then((kind) => on && setFetched(kind));
    return () => {
      on = false;
    };
  }, [tracker, live, user]);

  const kind = tracker ? (tracker.loading ? null : tracker.access.kind) : fetched;
  const signedIn = tracker ? tracker.signedIn : !!user;
  return {
    live,
    kind,
    signedIn,
    show: live && kind !== "paid",
    // Settled: safe to open the popup (never to a paying account)
    ready: live && kind !== null && kind !== "paid",
    href: signedIn ? SALE_PLANS_PATH : entryHref("black_friday", SALE_PLANS_PATH),
    // In Duty Guard, the plans open in place
    openPlans: tracker ? () => tracker.openUpgrade("plan", "user") : null,
  };
};
