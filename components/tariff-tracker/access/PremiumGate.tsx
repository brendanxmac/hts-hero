"use client";

import { ReactNode, useCallback } from "react";
import { LockedPreview } from "@/components/ui/LockedPreview";
import * as ui from "@/components/ui/styles";
import { formatPrice, TRACKER_TIERS, TRIAL_DAYS } from "@/components/pricing-calculator/lib/pricing";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { useTrackerAccess } from "./accessContext";
import { PremiumFeature } from "./features";

// A premium part of the Tracker. With the trial or a plan it's simply there; otherwise its
// stand-in, the teaser (a real number from the user's catalog where there is one) and the next
// step up: sign up, start the trial, or pick a plan.
export const PremiumGate = ({
  feature,
  title,
  teaser,
  points,
  preview,
  minHeight,
  children,
}: {
  feature: PremiumFeature;
  title: string;
  teaser?: ReactNode;
  points?: string[];
  preview: ReactNode;
  minHeight?: string;
  children: ReactNode;
}) => {
  const { loading, premium, signedIn, canStartTrial, access, unlock, unlockLabel } = useTrackerAccess();
  const onShown = useCallback(
    () => trackEvent(MixpanelEvent.LOCKED_FEATURE_VIEWED, { feature, reason: access.kind, page: "tracker" }),
    [feature, access.kind]
  );

  if (loading) return <div className={`${ui.skeleton} h-80 w-full`} aria-busy="true" />;
  if (premium) return <>{children}</>;

  const note = !signedIn
    ? `Free account, then try everything for ${TRIAL_DAYS} days. No credit card.`
    : canStartTrial
      ? `${TRIAL_DAYS} days free, up to 100 products. No credit card.`
      : `Your trial has ended. Plans from ${formatPrice(TRACKER_TIERS[0].price)}/month.`;

  return (
    <LockedPreview
      title={title}
      teaser={teaser}
      points={points}
      preview={preview}
      minHeight={minHeight}
      onShown={onShown}
      cta={{ label: unlockLabel, onClick: () => unlock(feature) }}
      note={note}
    />
  );
};
