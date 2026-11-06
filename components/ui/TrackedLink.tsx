"use client";

import Link from "next/link";
import { ComponentProps } from "react";
import { useUser } from "@/contexts/UserContext";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";

// A link that sends a Mixpanel event when clicked (with signed_in added), usable from server
// components: the CTAs that don't go through EntryCta (links to /tariff-alerts, "Try it free"
// links to the sign-up)
export const TrackedLink = ({
  event,
  properties,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { event: MixpanelEvent; properties: Record<string, unknown> }) => {
  const { user } = useUser();
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackEvent(event, { ...properties, signed_in: !!user });
        onClick?.(e);
      }}
    />
  );
};
