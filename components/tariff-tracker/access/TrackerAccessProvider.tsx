"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { MixpanelEvent, registerMixpanelSuperProperties, trackEvent, trackEventOnce } from "@/libs/mixpanel";
import {
  ANONYMOUS_ACCESS,
  canSpendCheck,
  CheckKind,
  checksLeft,
  hasChecked,
  isPaid,
  NO_USAGE,
  TrackerAccess,
  trackerAccessFrom,
  trialNotStarted,
} from "@/libs/tariff-tracker/plan";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { TrackerAccessContext, TrackerAccessValue } from "./accessContext";
import { PREMIUM_FEATURES, PremiumFeature } from "./features";
import { currentPath, signupHref } from "./signup";
import { LimitDialog } from "./LimitDialog";
import { UpgradeDialog } from "./UpgradeDialog";

// Loads the visitor's plan (from /api/tracker/access, which decides), spends the usage-based
// trial's checks (through /api/tracker/checks, which enforces them) and owns the way up: the
// plans dialog. Around the whole Tracker.

// Signed in, plan unknown (the request failed): the free plan, without a trial date (so nothing
// says the trial ended); the server decides what's actually covered
const FALLBACK_ACCESS: TrackerAccess = { ...trackerAccessFrom({ usage: NO_USAGE, activePlans: [], trialStartedAt: "2000-01-01T00:00:00Z", now: Infinity }), trialEndsAt: null };

export const TrackerAccessProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: userLoading } = useUser();
  const [access, setAccess] = useState<TrackerAccess>(ANONYMOUS_ACCESS);
  const [loading, setLoading] = useState(true);
  // Kept after closing, so the dialog's text doesn't change while it fades out
  const [dialog, setDialog] = useState<{ feature: PremiumFeature; open: boolean }>({ feature: "plan", open: false });
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));
  const userId = user?.id ?? null;

  const load = useCallback(async () => {
    // An admin's trial preview (?trialPreview=, see the access route), kept while they move around
    const stage = new URL(window.location.href).searchParams.get("trialPreview");
    if (stage) window.sessionStorage.setItem("tracker-trial-preview", stage);
    const preview = stage ?? window.sessionStorage.getItem("tracker-trial-preview");
    const res = await fetch(`/api/tracker/access${preview && preview !== "off" ? `?trialPreview=${encodeURIComponent(preview)}` : ""}`, { cache: "no-store" });
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
        // Spending a check asks the server
        if (!cancelled) setAccess(FALLBACK_ACCESS);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId, userLoading, load]);

  // On every event after this: the account's Tracker plan, to split any report by plan. And the
  // trial's start, counted once when the access shows it began in the last hour (the database
  // starts it with the first real imports, wherever they were added)
  useEffect(() => {
    if (!userId || loading || access.preview) return;
    registerMixpanelSuperProperties({ tracker_plan: access.kind, is_paying: isPaid(access) });
    if (!access.trialEndsAt) return;
    const started = new Date(access.trialEndsAt).getTime() - REVERSE_TRIAL.days * 24 * 60 * 60 * 1000;
    if (Date.now() - started < 60 * 60 * 1000) {
      trackEventOnce(`tracker-trial-started:${userId}`, MixpanelEvent.TARIFF_TRACKER_TRIAL_STARTED, {
        trial_ends_at: access.trialEndsAt,
      });
    }
  }, [userId, loading, access]);

  // Back from Stripe checkout (or a plan change): the webhook may land a moment after the redirect, so look twice
  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    // Or from a plan change in the billing portal (?plan=changed)
    const checkout = url.searchParams.get("checkout") === "success";
    const changed = url.searchParams.get("plan") === "changed";
    if (!checkout && !changed) return;
    url.searchParams.delete("checkout");
    url.searchParams.delete("plan");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
    toast.success(changed ? "Your Tariff Tracker plan is updated." : "Thanks! Your Tariff Tracker plan is active.");
    const refresh = () => {
      load()
        .then(setAccess)
        .catch((e: unknown) => console.error("Error refreshing Tariff Tracker access:", e));
    };
    const retry = setTimeout(refresh, 4000);
    refresh();
    return () => clearTimeout(retry);
  }, [userId, load]);

  // After something on the server changed the plan (the first imports start the trial)
  const refreshAccess = useCallback(() => {
    if (!userId) return;
    load()
      .then(setAccess)
      .catch((e: unknown) => console.error("Error refreshing Tariff Tracker access:", e));
  }, [userId, load]);

  const value: TrackerAccessValue = useMemo(() => {
    const signedIn = Boolean(userId);
    const openUpgrade = (feature: PremiumFeature) => {
      setDialog({ feature, open: true });
      trackEvent(MixpanelEvent.TARIFF_TRACKER_UPGRADE_OPENED, { feature, plan: access.kind, trigger: "user" });
    };
    const toSignup = () => (window.location.href = signupHref(currentPath()));

    const spendCheck = async (kind: CheckKind, ref: string, feature: PremiumFeature) => {
      if (!signedIn) {
        toSignup();
        return false;
      }
      if (isPaid(access) || hasChecked(access, kind, ref)) return true;
      if (!canSpendCheck(access, kind, ref)) {
        trackEvent(MixpanelEvent.TARIFF_TRACKER_ALLOWANCE_USED_UP, { kind, feature });
        openUpgrade(feature);
        return false;
      }
      try {
        const res = await fetch("/api/tracker/checks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, ref }),
        });
        const body = (await res.json()) as TrackerAccess & { error?: string; access?: TrackerAccess };
        if (!res.ok) {
          if (body.access) setAccess(body.access);
          if (res.status === 402) openUpgrade(feature);
          else toast.error(body.error ?? "Couldn't run that check.");
          return false;
        }
        setAccess(body);
        trackEvent(MixpanelEvent.TARIFF_TRACKER_CHECK_SPENT, { kind, feature, left: checksLeft(body, kind) });
        return true;
      } catch {
        toast.error("Couldn't run that check. Please try again.");
        return false;
      }
    };

    return {
      loading: loading || userLoading,
      signedIn,
      email: user?.email ?? null,
      access,
      paid: isPaid(access),
      savingsLeft: checksLeft(access, "savings"),
      auditsLeft: checksLeft(access, "audit"),
      spendCheck,
      openUpgrade,
      unlock: (feature) => {
        trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature, plan: access.kind, page: "tracker" });
        if (!signedIn) toSignup();
        else openUpgrade(feature);
      },
      unlockLabel: !signedIn ? "Create a free account" : "See plans",
      refreshAccess,
    };
  }, [access, loading, userLoading, userId, user?.email, refreshAccess]);

  // Back from the calculator's sign-up for a Tracker feature (`trial=<feature>`): the trial is
  // already on, so say what it includes. `upgrade=<feature>` opens the plans for that feature,
  // unless the plan has it already.
  useEffect(() => {
    if (value.loading || !value.signedIn || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const upgrade = url.searchParams.get("upgrade");
    const trial = url.searchParams.has("trial");
    if (!upgrade && !trial) return;
    url.searchParams.delete("upgrade");
    url.searchParams.delete("trial");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
    if (trial && !value.paid) {
      toast.success(
        trialNotStarted(value.access)
          ? `Your ${REVERSE_TRIAL.days}-day free trial is ready. It starts when you add your imports to the Tariff Tracker.`
          : value.access.kind === "trial"
          ? `Your ${REVERSE_TRIAL.days}-day free trial is on: everything in the Tariff Tracker, on up to ${REVERSE_TRIAL.imports} imports.`
          : "Your free plan is on: Tariff News alerts, sourcing insights and your whole catalog.",
        { duration: 6000 }
      );
    }
    if (upgrade && !value.paid) value.openUpgrade(upgrade in PREMIUM_FEATURES ? (upgrade as PremiumFeature) : "plan");
  }, [value]);

  return (
    <TrackerAccessContext.Provider value={value}>
      {children}
      {/* At the limit, the limit first (LimitDialog), then the plans */}
      <LimitDialog
        open={dialog.open && dialog.feature === "limit"}
        access={access}
        onSeePlans={() => {
          setDialog({ feature: "tracking", open: true });
          trackEvent(MixpanelEvent.TARIFF_TRACKER_UPGRADE_OPENED, { feature: "tracking", from: "limit", plan: access.kind });
        }}
        onClose={closeDialog}
      />
      <UpgradeDialog
        open={dialog.open && dialog.feature !== "limit"}
        feature={dialog.feature}
        access={access}
        onClose={closeDialog}
      />
    </TrackerAccessContext.Provider>
  );
};
