"use client";

import { ReactNode } from "react";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { useUser } from "@/contexts/UserContext";
import { ENTRY_SIGNED_IN_HREF, entryHref, type EntryPoint } from "@/libs/signup-onboarding";

// A sign-up button on a marketing page (the homepage, /tariff-alerts, /duty-audits): sign up, then
// the onboarding, carrying where it started (?from=), with a Sign Up CTA Clicked event (the page,
// that entry, the section of the page and the button's words) so pages and sections can be
// compared, then followed through Onboarding Started / Completed by entry_point. Signed in, it
// opens the product instead (ENTRY_SIGNED_IN_HREF).
export const EntryCta = ({
  page,
  entry,
  section,
  label,
  className,
  children,
}: {
  page: "home" | "tariff-alerts" | "duty-audits";
  entry: EntryPoint;
  section: string;
  label: string;
  className: string;
  children: ReactNode;
}) => {
  const { user } = useUser();
  return (
    <a
      href={user ? ENTRY_SIGNED_IN_HREF[entry] : entryHref(entry)}
      className={className}
      onClick={() => trackEvent(MixpanelEvent.SIGNUP_CTA_CLICKED, { page, entry, section, label, signed_in: !!user })}
    >
      {children}
    </a>
  );
};
