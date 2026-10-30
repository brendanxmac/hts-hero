"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import logo from "@/app/logo.svg";
import { THEME } from "@/components/ui/theme";
import { trackerDisplay, trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { identifyUser, MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { cleanWebsite, COMPANY_TYPES, onboardingNext, readFirstTouch, ROLES, TRACKER_WELCOME_PARAM } from "@/libs/signup-onboarding";
import { WelcomeCoverScreen } from "@/components/tariff-tracker/onboarding/tour/WelcomeCover";

// The sign-up onboarding, full screen like HubSpot's: the logo (not a link) and one question at a
// time, with nothing else to click and no way back. Picking an answer saves it and moves on; the
// website can be skipped with a small link. Crisp stays, for help. Saving never blocks them: if a
// save fails, they still go on.

export type OnboardingStep = "company_type" | "website" | "role";
const ORDER: OnboardingStep[] = ["company_type", "website", "role"];

const post = (body: Record<string, unknown>) =>
  fetch("/api/signup-onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch((): null => null);

const option =
  "flex h-16 w-full items-center justify-center rounded-lg border border-base-content/30 bg-base-100 px-6 text-base font-semibold text-base-content transition-all hover:border-base-content/60 hover:shadow-lg hover:shadow-base-content/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-60";

export const SignupOnboarding = ({
  userId,
  initialStep,
  entryPoint,
  preview = false,
}: {
  userId: string;
  initialStep: OnboardingStep;
  // The homepage section whose button they came from, if any
  entryPoint: string | null;
  preview?: boolean;
}) => {
  // A development preview (?preview=1) saves and tracks nothing
  const save = (body: Record<string, unknown>) => (preview ? Promise.resolve(null) : post(body));
  const track: typeof trackEvent = (...args) => (preview ? undefined : trackEvent(...args));
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [website, setWebsite] = useState("");
  const [websiteError, setWebsiteError] = useState(false);
  const [busy, setBusy] = useState(false);
  // Leaving for a tour (the Tracker's or the classification one): its cover shows here first, so
  // the hand-off is one screen
  const [leaving, setLeaving] = useState(false);
  const started = useRef(false);

  // Opened: the row, and where they first came from
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const firstTouch = readFirstTouch();
    save({ action: "start", firstTouch, entryPoint });
    track(MixpanelEvent.ONBOARDING_STARTED, {
      resumed_at: initialStep,
      entry_point: entryPoint,
      first_landing_path: firstTouch?.landing_path,
      first_referring_domain: firstTouch?.referring_domain,
      first_utm_source: firstTouch?.utm_source,
      first_utm_campaign: firstTouch?.utm_campaign,
    });
  }, [initialStep, entryPoint]);

  const answered = async (action: OnboardingStep, value: string, label: string) => {
    setBusy(true);
    await save({ action, value });
    track(MixpanelEvent.ONBOARDING_STEP_COMPLETED, { step: action, step_number: ORDER.indexOf(action) + 1, answer: value, entry_point: entryPoint });
    if (!preview) identifyUser(userId, { [`onboarding_${action}`]: action === "website" ? value : label });
    if (action === "role") {
      track(MixpanelEvent.ONBOARDING_COMPLETED, { role: value, entry_point: entryPoint });
      // On to what they came for (onboardingNext)
      // (A preview saves nothing but still goes on, so the whole path can be walked)
      const next = onboardingNext(entryPoint);
      const welcome = new URL(next, window.location.origin).searchParams.get(TRACKER_WELCOME_PARAM);
      if (welcome === "imports" || welcome === "alerts" || welcome === "tour") setLeaving(true);
      window.location.href = next;
      return;
    }
    setStep(ORDER[ORDER.indexOf(action) + 1]);
    setBusy(false);
  };

  const submitWebsite = (e: FormEvent) => {
    e.preventDefault();
    const clean = cleanWebsite(website);
    if (!clean) return setWebsiteError(true);
    answered("website", clean, clean);
  };

  const skipWebsite = async () => {
    setBusy(true);
    await save({ action: "skip_website" });
    track(MixpanelEvent.ONBOARDING_WEBSITE_SKIPPED, { step_number: 2, entry_point: entryPoint });
    setStep("role");
    setBusy(false);
  };

  const question =
    step === "company_type"
      ? { title: "What does your company do?", lead: "This helps set you up for what you need." }
      : step === "website"
        ? { title: "Company Website", lead: "So we can tailor HTS Hero to your business." }
        : { title: "What is your role?", lead: "This helps set you up to achieve your goals faster." };

  if (leaving) return <WelcomeCoverScreen />;

  return (
    <main className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} fixed inset-0 z-50 overflow-y-auto bg-base-100`}>
      {/* The logo only, not a link: nothing here leads away */}
      <div className="px-8 pt-8 sm:px-10">
        <Image src={logo} alt="HTS Hero" width={36} height={36} priority />
      </div>

      <div className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-xl flex-col items-center justify-center px-6 pb-24">
        {/* Each question fades in */}
        <style>{`@keyframes onb-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } } .onb-in { animation: onb-in .35s ease-out; } @media (prefers-reduced-motion: reduce) { .onb-in { animation: none; } }`}</style>
        <div key={step} className="onb-in flex w-full flex-col items-center">
          <h1 className={`${tt.display} text-center text-3xl font-semibold tracking-tight text-base-content`}>{question.title}</h1>
          <p className="mt-3 text-center text-lg text-base-content/70">{question.lead}</p>

          <div className="mt-10 flex w-full flex-col gap-4">
            {step === "company_type" &&
              COMPANY_TYPES.map((t) => (
                <button key={t.id} type="button" disabled={busy} className={option} onClick={() => answered("company_type", t.id, t.label)}>
                  {t.label}
                </button>
              ))}

            {step === "website" && (
              <form onSubmit={submitWebsite} className="flex w-full flex-col gap-4">
                <label htmlFor="onb-website" className="sr-only">
                  Company website
                </label>
                <input
                  id="onb-website"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  autoFocus
                  placeholder="yourcompany.com"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    setWebsiteError(false);
                  }}
                  className={`h-16 w-full rounded-lg border bg-base-100 px-5 text-base text-base-content placeholder:text-base-content/40 focus:outline-hidden focus:ring-2 focus:ring-primary/40 ${websiteError ? "border-error" : "border-base-content/30 focus:border-primary"}`}
                  aria-invalid={websiteError}
                />
                {websiteError && <p className="-mt-2 text-sm text-error">Enter a website like yourcompany.com</p>}
                <button type="submit" disabled={busy || !website.trim()} className="h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-content transition-colors hover:bg-primary/90 disabled:bg-base-200 disabled:text-base-content/40">
                  Continue
                </button>
                <button type="button" disabled={busy} onClick={skipWebsite} className="self-center text-xs text-base-content/50 underline-offset-4 hover:text-base-content/70 hover:underline">
                  Skip
                </button>
              </form>
            )}

            {step === "role" &&
              ROLES.map((r) => (
                <button key={r.id} type="button" disabled={busy} className={option} onClick={() => answered("role", r.id, r.label)}>
                  {r.label}
                </button>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
};
