"use client";

import { ReactNode } from "react";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { signupHref } from "@/components/tariff-tracker/access/signup";

// A Tracker feature shown as a teaser on the calculator page: a blurred stand-in (never real
// data, DESIGN_SYSTEM §10.5), what it would tell them about this import, and a free sign-up that
// lands them on the real thing in the Tariff Tracker. Signed-in visitors never see this page.
export const Teaser = ({
  feature,
  tone,
  title,
  teaser,
  points,
  cta,
  redirect,
  preview,
}: {
  // For analytics
  feature: string;
  tone: "primary" | "warning" | "success";
  title: string;
  // The real fact about this import, worked out on the page
  teaser: ReactNode;
  points: string[];
  cta: string;
  // Where sign-up returns to (this page with this import, plus any view to open)
  redirect: () => string;
  preview: ReactNode;
}) => (
  <div className="relative min-h-80 overflow-hidden rounded-2xl bg-tt-soft">
    <div className="pointer-events-none select-none p-6 opacity-60 blur-sm" aria-hidden>
      {preview}
    </div>
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-3xl border border-base-300 bg-base-100 p-6 text-center shadow-lg">
        <span className={`${tt.chip(tone)} gap-1.5`}>
          <LockClosedIcon className="h-3 w-3" aria-hidden />
          Free with an account
        </span>
        <h3 className={`${tt.display} m-0 text-xl font-semibold text-base-content`}>{title}</h3>
        <p className="m-0 text-sm font-medium leading-snug text-base-content">{teaser}</p>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-base-content/70">
          {points.map((p) => (
            <li key={p}>· {p}</li>
          ))}
        </ul>
        <a
          href={signupHref(redirect())}
          className={`${tt.button("primary")} mt-1`}
          onClick={(e) => {
            // Built at click time, so it carries the inputs as they are now
            e.currentTarget.href = signupHref(redirect());
            trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature, reason: "account", page: "calculator" });
          }}
        >
          {cta}
        </a>
        <span className="text-xs text-base-content/60">No credit card.</span>
      </div>
    </div>
  </div>
);
