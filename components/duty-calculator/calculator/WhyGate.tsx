"use client";

import { ReactNode } from "react";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { currentPath, signupHref } from "@/components/tariff-tracker/access/signup";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";

// The plain-English "why" behind every number (why a tariff applies, what an adjustment would
// switch off, why a heading doesn't apply, the summary) takes a free account: no paywall, just
// sign-up. Signed out, a locked line takes its place, and the real text isn't rendered at all.

export const useCanSeeWhy = () => {
  const { user, isLoading } = useUser();
  // While the session loads, show nothing locked: most visitors resolve signed-out quickly
  return { canSee: Boolean(user), loading: isLoading };
};

const signUp = (where: string) => {
  trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "why", reason: "account", page: where });
  window.location.href = signupHref(currentPath());
};

// A locked line in place of an explanation: a few blurred bars (never the real text) and the ask
// (`bars={false}`: just the ask, where it stands alone rather than in place of a line of text)
export const WhyLocked = ({ label, where, className = "", bars = true }: { label: string; where: string; className?: string; bars?: boolean }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      signUp(where);
    }}
    className={`group inline-flex max-w-full items-center gap-2 text-left text-xs font-medium text-primary ${className}`}
  >
    {bars && (
      <span aria-hidden className="flex shrink-0 gap-1 blur-[2px]">
        <span className="h-2 w-10 rounded-full bg-base-content/20" />
        <span className="h-2 w-16 rounded-full bg-base-content/20" />
        <span className="h-2 w-8 rounded-full bg-base-content/20" />
      </span>
    )}
    <LockClosedIcon className="h-3 w-3 shrink-0" aria-hidden />
    <span className="underline-offset-2 group-hover:underline">{label}</span>
  </button>
);

// The explanation when signed in; the locked line when not
export const WhyGate = ({ label, where, children }: { label: string; where: string; children: ReactNode }) => {
  const { canSee, loading } = useCanSeeWhy();
  if (loading) return null;
  return canSee ? <>{children}</> : <WhyLocked label={label} where={where} />;
};
