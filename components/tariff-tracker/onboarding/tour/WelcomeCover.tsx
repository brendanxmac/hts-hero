"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/app/logo.svg";
import { trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import { useFeatureTour } from "./tourStore";
import { useTrackerOnboarding } from "../welcome/TrackerOnboarding";

// The screen between the sign-up onboarding's last answer and what follows it (the Tracker
// onboarding, or the Classification Assistant's tour): "Welcome to HTS Hero" on the tours' ground,
// the logo popping in with rings rippling out, full screen. The onboarding shows it as it leaves; the
// Tracker page renders it from the server's first byte (when ?welcome= asks for the tour) and keeps
// it up until the tour opens over it, so the Tracker itself never shows in between. A fallback
// lifts it after a while in case the tour can't open.

const FALLBACK_MS = 12_000;

export const WelcomeCoverScreen = () => (
  <div
    className={`${THEME} hts-tracker ${trackerSans.className} fixed inset-0 z-[74] flex flex-col items-center justify-center overflow-hidden bg-(--tt-ob-ground) text-base-content`}
    role="status"
    aria-live="polite"
  >
    <style>{`
      @keyframes wc-pop { 0% { opacity: 0; transform: scale(.55); } 60% { opacity: 1; transform: scale(1.08); } 100% { transform: scale(1); } }
      @keyframes wc-ring { 0% { opacity: .55; transform: scale(.7); } 100% { opacity: 0; transform: scale(2.6); } }
      @keyframes wc-glow { 0%, 100% { opacity: .45; transform: scale(1); } 50% { opacity: .8; transform: scale(1.12); } }
      @keyframes wc-rise { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: none; } }
      @keyframes wc-dot { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-5px); } }
      .wc-pop { animation: wc-pop .7s cubic-bezier(.2,.9,.3,1.2) both; }
      .wc-ring { animation: wc-ring 2.4s cubic-bezier(.2,.7,.3,1) infinite; }
      .wc-glow { animation: wc-glow 2.4s ease-in-out infinite; }
      .wc-rise { animation: wc-rise .6s cubic-bezier(.2,.8,.3,1) both; }
      .wc-dot { animation: wc-dot 1.2s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) { .wc-pop, .wc-ring, .wc-glow, .wc-rise, .wc-dot { animation: none; } .wc-ring { display: none; } }
    `}</style>

    {/* The logo, popping in, with rings rippling out from it over a soft glow */}
    <div className="relative flex h-40 w-40 items-center justify-center">
      <span className="wc-glow absolute inset-0 rounded-full bg-primary/25 blur-2xl" aria-hidden />
      <span className="wc-ring absolute h-24 w-24 rounded-full border-2 border-primary/50" aria-hidden />
      <span className="wc-ring absolute h-24 w-24 rounded-full border-2 border-primary/50" style={{ animationDelay: "1.2s" }} aria-hidden />
      <span className="wc-pop relative flex h-24 w-24 items-center justify-center rounded-full bg-base-content shadow-2xl shadow-primary/30">
        <Image src={logo} alt="" width={56} height={56} priority />
      </span>
    </div>

    <h1 className={`${tt.display} wc-rise m-0 mt-8 text-center text-4xl font-semibold tracking-tight sm:text-5xl`} style={{ animationDelay: ".25s" }}>
      Welcome to <span className="text-primary">HTS Hero</span>
    </h1>
    <p className="wc-rise m-0 mt-4 flex items-center gap-2 text-base text-base-content/60" style={{ animationDelay: ".45s" }}>
      Setting things up for you
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="wc-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
    </p>
  </div>
);

// On the Tracker page: up until the tour opens (or the fallback)
export const WelcomeCover = () => {
  const { open: tourOpen } = useFeatureTour();
  const { open: onboardingOpen } = useTrackerOnboarding();
  const open = tourOpen || onboardingOpen;
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (open) setShow(false);
  }, [open]);
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), FALLBACK_MS);
    return () => clearTimeout(timer);
  }, []);
  return show ? <WelcomeCoverScreen /> : null;
};
