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
// onboarding, or the Classification Assistant's): "Welcome to HTS Hero" and the product's name on the tours' ground,
// the logo popping in with rings rippling out, full screen. The onboarding shows it as it leaves; the
// Tracker page renders it from the server's first byte (when ?welcome= asks for the tour) and keeps
// it up until the tour opens over it, so the Tracker itself never shows in between. It stays up at
// least MIN_SHOWN_MS in all, counted from when the onboarding first showed it (welcomeCoverRemaining),
// so the welcome lands before the next screen. On the next page it carries on where the onboarding's
// left off (sync): no second pop-in, the rings mid-ripple, so the two read as one screen. A fallback
// lifts it after a while in case the tour can't open.

const FALLBACK_MS = 12_000;
const MIN_SHOWN_MS = 4_500;
const STARTED_KEY = "hts-hero-welcome-cover-started";

// The onboarding, as it shows the cover and leaves: when it went up
export const startWelcomeCover = () => {
  try {
    sessionStorage.setItem(STARTED_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the next page counts from its own start
  }
};

// On the next page: how much longer the cover has to stay up before what follows opens (read once)
export const welcomeCoverRemaining = () => {
  let started = 0;
  try {
    started = Number(sessionStorage.getItem(STARTED_KEY)) || 0;
    sessionStorage.removeItem(STARTED_KEY);
  } catch {
    // Storage blocked
  }
  if (!started) started = performance.timeOrigin;
  return Math.min(MIN_SHOWN_MS, Math.max(0, started + MIN_SHOWN_MS - Date.now()));
};

// In the page's first HTML, before it paints: when the onboarding's cover was just up, skip the
// entrance and shift the loops by the time it's been up, so they carry on instead of starting over
const SYNC_SCRIPT = `(function(){try{var s=Number(sessionStorage.getItem(${JSON.stringify(STARTED_KEY)}));var e=Date.now()-s;if(!s||e<0||e>15000)return;var el=document.currentScript.parentElement;el.setAttribute("data-continued","");el.style.setProperty("--wc-shift",-e+"ms")}catch(_){}})()`;

// The product they're being taken to, named under the welcome
export type WelcomeProduct = "Tariff Tracker" | "Classification Assistant";

// sync: rendered on the server as the next page's first HTML (see SYNC_SCRIPT)
export const WelcomeCoverScreen = ({ product, sync = false }: { product: WelcomeProduct; sync?: boolean }) => (
  <div
    className={`${THEME} hts-tracker ${trackerSans.className} fixed inset-0 z-[74] flex flex-col items-center justify-center overflow-hidden bg-(--tt-ob-ground) text-base-content`}
    role="status"
    aria-live="polite"
    suppressHydrationWarning
  >
    {sync && <script dangerouslySetInnerHTML={{ __html: SYNC_SCRIPT }} />}
    <style>{`
      @keyframes wc-pop { 0% { opacity: 0; transform: scale(.55); } 60% { opacity: 1; transform: scale(1.08); } 100% { transform: scale(1); } }
      @keyframes wc-ring { 0% { opacity: .55; transform: scale(.7); } 100% { opacity: 0; transform: scale(2.6); } }
      @keyframes wc-glow { 0%, 100% { opacity: .45; transform: scale(1); } 50% { opacity: .8; transform: scale(1.12); } }
      @keyframes wc-rise { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: none; } }
      @keyframes wc-dot { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-5px); } }
      .wc-pop { animation: wc-pop .7s cubic-bezier(.2,.9,.3,1.2) both; }
      .wc-ring { animation: wc-ring 2.4s cubic-bezier(.2,.7,.3,1) calc(var(--wc-shift, 0ms) + var(--wc-at, 0ms)) infinite; }
      .wc-glow { animation: wc-glow 2.4s ease-in-out var(--wc-shift, 0ms) infinite; }
      .wc-rise { animation: wc-rise .6s cubic-bezier(.2,.8,.3,1) var(--wc-at, 0ms) both; }
      .wc-dot { animation: wc-dot 1.2s ease-in-out calc(var(--wc-shift, 0ms) + var(--wc-at, 0ms)) infinite; }
      [data-continued] .wc-pop, [data-continued] .wc-rise { animation: none; }
      @media (prefers-reduced-motion: reduce) { .wc-pop, .wc-ring, .wc-glow, .wc-rise, .wc-dot { animation: none; } .wc-ring { display: none; } }
    `}</style>

    {/* The logo, popping in, with rings rippling out from it over a soft glow */}
    <div className="relative flex h-40 w-40 items-center justify-center">
      <span className="wc-glow absolute inset-0 rounded-full bg-primary/25 blur-2xl" aria-hidden />
      <span className="wc-ring absolute h-24 w-24 rounded-full border-2 border-primary/50" aria-hidden />
      <span className="wc-ring absolute h-24 w-24 rounded-full border-2 border-primary/50" style={{ "--wc-at": "1.2s" } as React.CSSProperties} aria-hidden />
      <span className="wc-pop relative flex h-24 w-24 items-center justify-center rounded-full bg-base-content shadow-2xl shadow-primary/30">
        <Image src={logo} alt="" width={56} height={56} priority />
      </span>
    </div>

    <h1 className={`${tt.display} wc-rise m-0 mt-8 text-center text-4xl font-semibold tracking-tight sm:text-5xl`} style={{ "--wc-at": ".25s" } as React.CSSProperties}>
      Welcome to HTS Hero
      <br />
      <span className="text-primary">{product}</span>
    </h1>
    <p className="wc-rise m-0 mt-4 flex items-center gap-2 text-base text-base-content/60" style={{ "--wc-at": ".45s" } as React.CSSProperties}>
      Setting things up for you
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="wc-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ "--wc-at": `${i * 0.15}s` } as React.CSSProperties} />
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
  return show ? <WelcomeCoverScreen product="Tariff Tracker" sync /> : null;
};
