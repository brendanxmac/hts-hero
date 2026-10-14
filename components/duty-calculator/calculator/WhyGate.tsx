"use client";

import { createContext, ReactNode, useContext } from "react";
import { useUser } from "@/contexts/UserContext";
import { currentPath, signupHref } from "@/components/tariff-tracker/access/signup";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";

// The plain-English "why" behind every number (why a tariff applies, what an adjustment would
// switch off, why a heading doesn't apply, the summary) takes a free account: no paywall, just
// sign-up. Signed out, a small link to the sign-up pitch takes its place, and the real text isn't
// rendered at all.

// What a locked line does when clicked: the host's sign-up pitch (the calculator's account
// pop-up), named by where it was clicked; without one, straight to sign-up
export const WhyUnlockContext = createContext<((where: string) => void) | null>(null);

export const useCanSeeWhy = () => {
  const { user, isLoading } = useUser();
  // While the session loads, show nothing locked: most visitors resolve signed-out quickly
  return { canSee: Boolean(user), loading: isLoading };
};

const signUp = (where: string) => {
  trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "why", reason: "account", page: where });
  window.location.href = signupHref(currentPath());
};

// A locked explanation: a small text link to the sign-up pitch, in its place
export const WhyLocked = ({ label, where, className = "" }: { label: string; where: string; className?: string }) => {
  const unlock = useContext(WhyUnlockContext);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (unlock) unlock(where);
        else signUp(where);
      }}
      className={`self-start text-left text-xs font-medium text-primary underline-offset-2 hover:underline ${className}`}
    >
      {label}
    </button>
  );
};

// The explanation when signed in; the locked line when not
export const WhyGate = ({ label, where, children }: { label: string; where: string; children: ReactNode }) => {
  const { canSee, loading } = useCanSeeWhy();
  if (loading) return null;
  return canSee ? <>{children}</> : <WhyLocked label={label} where={where} />;
};
