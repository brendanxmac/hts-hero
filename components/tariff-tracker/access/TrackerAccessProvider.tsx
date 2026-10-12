"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import {
  ANONYMOUS_ACCESS,
  canStartTrial,
  isPremium,
  TrackerAccess,
  trackerAccessFrom,
  trialDaysLeft,
} from "@/libs/tariff-tracker/plan";
import { TRIAL_DAYS } from "@/components/pricing-calculator/lib/pricing";
import { TrackerAccessContext, TrackerAccessValue } from "./accessContext";
import { PremiumFeature } from "./features";
import { currentPath, signupHref } from "./signup";
import { StartTrialDialog } from "./StartTrialDialog";
import { UpgradeDialog } from "./UpgradeDialog";

// Loads the visitor's plan (from /api/tracker/access, which decides), and owns the two ways up:
// the trial dialog and the plans dialog. Around the whole Tracker.

const FREE_ACCESS = trackerAccessFrom({ trial: null, activePlans: [] });

export const TrackerAccessProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: userLoading } = useUser();
  const [access, setAccess] = useState<TrackerAccess>(ANONYMOUS_ACCESS);
  const [loading, setLoading] = useState(true);
  // Kept after closing, so the dialog's text doesn't change while it fades out
  const [dialog, setDialog] = useState<{ kind: "trial" | "upgrade"; feature: PremiumFeature; open: boolean }>({
    kind: "trial",
    feature: "plan",
    open: false,
  });
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));
  const userId = user?.id ?? null;

  const load = useCallback(async () => {
    const res = await fetch("/api/tracker/access", { cache: "no-store" });
    if (!res.ok) throw new Error(`Access request failed (${res.status})`);
    return (await res.json()) as TrackerAccess;
  }, []);

  useEffect(() => {
    if (userLoading) return;
    if (!userId) {
      setAccess(ANONYMOUS_ACCESS);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    load()
      .then((next) => !cancelled && setAccess(next))
      .catch((e) => {
        console.error("Error loading Tariff Tracker access:", e);
        // Signed in, plan unknown: the free plan, so nothing is unlocked by mistake
        if (!cancelled) setAccess(FREE_ACCESS);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId, userLoading, load]);

  // Back from Stripe checkout: the webhook may land a moment after the redirect, so look twice
  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("checkout") !== "success") return;
    url.searchParams.delete("checkout");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
    toast.success("Thanks! Your Tariff Tracker plan is active.");
    const refresh = () => {
      load()
        .then(setAccess)
        .catch((e: unknown) => console.error("Error refreshing Tariff Tracker access:", e));
    };
    const retry = setTimeout(refresh, 4000);
    refresh();
    return () => clearTimeout(retry);
  }, [userId, load]);

  const startTrial = async (feature: PremiumFeature) => {
    try {
      const res = await fetch("/api/tracker/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: feature }),
      });
      const body = (await res.json()) as TrackerAccess & { error?: string; access?: TrackerAccess };
      if (!res.ok) {
        if (body.access) setAccess(body.access);
        toast.error(body.error ?? "Couldn't start your trial.");
        return false;
      }
      setAccess(body);
      trackEvent(MixpanelEvent.TARIFF_TRACKER_TRIAL_STARTED, { feature, trial_days: TRIAL_DAYS });
      return true;
    } catch {
      toast.error("Couldn't start your trial. Please try again.");
      return false;
    }
  };

  const value: TrackerAccessValue = useMemo(() => {
    const signedIn = Boolean(userId);
    const startable = canStartTrial(access);
    const openTrial = (feature: PremiumFeature) => {
      setDialog({ kind: "trial", feature, open: true });
      trackEvent(MixpanelEvent.TARIFF_TRACKER_TRIAL_DIALOG_OPENED, { feature });
    };
    const openUpgrade = (feature: PremiumFeature) => {
      setDialog({ kind: "upgrade", feature, open: true });
      trackEvent(MixpanelEvent.TARIFF_TRACKER_UPGRADE_OPENED, { feature, plan: access.kind });
    };
    return {
      loading: loading || userLoading,
      signedIn,
      email: user?.email ?? null,
      access,
      premium: isPremium(access),
      canStartTrial: startable,
      daysLeft: trialDaysLeft(access),
      openTrial,
      openUpgrade,
      unlock: (feature) => {
        trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature, plan: access.kind, page: "tracker" });
        if (!signedIn) window.location.href = signupHref(currentPath());
        else if (startable) openTrial(feature);
        else openUpgrade(feature);
      },
      unlockLabel: !signedIn ? "Create a free account" : startable ? `Start ${TRIAL_DAYS}-day free trial` : "See plans",
    };
  }, [access, loading, userLoading, userId, user?.email]);

  return (
    <TrackerAccessContext.Provider value={value}>
      {children}
      <StartTrialDialog
        open={dialog.open && dialog.kind === "trial"}
        feature={dialog.feature}
        onClose={closeDialog}
        onStart={() => startTrial(dialog.feature)}
      />
      <UpgradeDialog
        open={dialog.open && dialog.kind === "upgrade"}
        feature={dialog.feature}
        access={access}
        onClose={closeDialog}
      />
    </TrackerAccessContext.Provider>
  );
};
