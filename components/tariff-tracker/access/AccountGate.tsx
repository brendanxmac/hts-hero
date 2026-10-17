"use client";

import { ReactNode, useCallback } from "react";
import { LockedPreview } from "@/components/ui/LockedPreview";
import { useUser } from "@/contexts/UserContext";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { currentPath, signupHref } from "./signup";

// A view that needs a free account (Duty over time, Analysis, and in the Tracker Rate history and
// Sourcing: see PRICING.md). Signed-in visitors get it; everyone else gets its stand-in and a
// sign-up that brings them back to it. Works anywhere, inside the Tracker or not.
export type AccountFeature = "analysis" | "duty-over-time" | "alerts" | "history" | "insights" | "overview" | "sourcing" | "savings" | "entries";

export const AccountGate = ({
  feature,
  title,
  teaser,
  points,
  preview,
  page,
  // Where sign-up returns to; this page by default
  redirect,
  minHeight,
  framed,
  children,
}: {
  feature: AccountFeature;
  title: string;
  teaser?: ReactNode;
  points?: string[];
  preview: ReactNode;
  // For analytics: where it was shown
  page: string;
  redirect?: () => string;
  minHeight?: string;
  framed?: boolean;
  children: ReactNode;
}) => {
  const { user, isLoading } = useUser();
  const onShown = useCallback(() => trackEvent(MixpanelEvent.LOCKED_FEATURE_VIEWED, { feature, reason: "account", page }), [feature, page]);

  if (user) return <>{children}</>;
  return (
    <LockedPreview
      title={title}
      teaser={teaser}
      points={points}
      preview={preview}
      minHeight={minHeight}
      framed={framed}
      onShown={isLoading ? undefined : onShown}
      cta={{
        label: "Create a free account",
        onClick: () => {
          trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature, reason: "account", page });
          window.location.href = signupHref(redirect ? redirect() : currentPath());
        },
      }}
      note="Less than 30 seconds. No credit card."
    />
  );
};
