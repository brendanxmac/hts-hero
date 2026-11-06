"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, EnvelopeIcon } from "@heroicons/react/20/solid";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { ConfirmPrompt, type SignupStatus } from "./ConfirmPrompt";

// The one thing /tariff-digest asks for: an email address, and how they want it: the weekly
// digest, each change as it happens, or both (preselected: the digest alone can't tell them first).
// Every law and country, through the same double opt-in as every other sign-up
// (/api/tariff-updates/subscribe). Done, ConfirmPrompt opens over this page: a new address checks
// its inbox and taps Confirm, which lands it on /tariff-digest/welcome (the confirm route) and
// sends the welcome email; closed, the form says the same in a line. An address already on the
// list is told it's all set and goes on to the welcome page.
// The address is kept for this tab (SIGNUP_EMAIL_KEY), so the trial's sign-up comes filled in.
// Subscribers who don't start the trial get the Tariff Alerts offer by email too, the Tuesday after
// their first digest (libs/email/digest-followup.ts).

export const WELCOME_PATH = "/tariff-digest/welcome";

// The address they subscribed with, for the sign-up page to fill in (this tab only, never in a URL)
export const SIGNUP_EMAIL_KEY = "hts-hero-signup-email";

// The source, with the button that opened this page (DigestButton's ?from=) when there was one:
// "tariff-digest-hero:home"
const sourceWithReferrer = (source: string) => {
  try {
    const from = new URLSearchParams(window.location.search).get("from")?.replace(/[^\w-]/g, "").slice(0, 30);
    return from ? `${source}:${from}` : source;
  } catch {
    return source;
  }
};

export type DigestFrequency = "weekly" | "instant" | "both";

// The three ways to get it, in the order shown
const FREQUENCIES: { value: DigestFrequency; label: string; hint: string; done: string }[] = [
  { value: "weekly", label: "Weekly digest", hint: "One email every Monday with the week's changes.", done: "your first digest arrives Monday" },
  { value: "instant", label: "Live Updates", hint: "An email the day each change is out, AD/CVD included.", done: "the next change comes the day it's out" },
  { value: "both", label: "Both", hint: "Each change as it happens, plus Monday's recap.", done: "the next change comes the day it's out, and the digest every Monday" },
];
const DEFAULT_FREQUENCY: DigestFrequency = "both";

export function DigestForm({
  source,
  autoFocus = false,
}: {
  source: string;
  autoFocus?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<DigestFrequency>(DEFAULT_FREQUENCY);
  const choice = FREQUENCIES.find((f) => f.value === frequency)!;
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  // What the sign-up found, and whether its prompt is still open
  const [done, setDone] = useState<SignupStatus | null>(null);
  const [prompt, setPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const src = sourceWithReferrer(source);
    try {
      const response = await fetch("/api/tariff-updates/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website,
          source: src,
          frequency,
          scope: "actions",
          authorities: [],
          countries: [],
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          body.error ?? "Something went wrong. Please try again.",
        );
      try {
        sessionStorage.setItem(SIGNUP_EMAIL_KEY, email.trim());
      } catch {
        // Private mode: nothing to carry over
      }
      trackEvent(MixpanelEvent.TARIFF_UPDATES_SUBSCRIBED, {
        source: src,
        frequency,
        scope: "actions",
        filtered: false,
      });
      const status: SignupStatus =
        body.status === "already_subscribed" || body.status === "throttled"
          ? body.status
          : "confirm_sent";
      if (status === "already_subscribed") router.prefetch(`${WELCOME_PATH}?s=${status}`);
      setSending(false);
      setDone(status);
      setPrompt(true);
    } catch (err) {
      setSending(false);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const startOver = () => {
    setPrompt(false);
    setDone(null);
    setEmail("");
  };

  const dialog = done && prompt && (
    <ConfirmPrompt
      status={done}
      email={email.trim()}
      frequency={frequency}
      onClose={() => setPrompt(false)}
      onContinue={() => router.push(`${WELCOME_PATH}?s=already_subscribed`)}
      onChangeEmail={startOver}
    />
  );

  // Closed, waiting on their inbox: the same in a line, where the form was
  if (done && done !== "already_subscribed" && !prompt)
    return (
      <div
        className="tt-enter flex items-start gap-4 rounded-3xl border border-primary/30 bg-primary/10 p-6"
        role="status"
      >
        <EnvelopeIcon className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="m-0 text-xl font-semibold text-base-content [font-family:var(--font-tracker-display)]">
            Check your inbox to confirm.
          </p>
          <p className="m-0 mt-1 text-base leading-relaxed text-base-content/70">
            Tap Confirm in the email we sent to{" "}
            <span className="font-semibold text-base-content">{email.trim()}</span>, and{" "}
            {choice.done}.
          </p>
          <button
            type="button"
            onClick={startOver}
            className="mt-3 text-sm font-semibold text-base-content/70 underline decoration-base-content/30 underline-offset-4 hover:text-base-content"
          >
            Use a different email
          </button>
        </div>
      </div>
    );

  return (
    <>
      {dialog}
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div role="radiogroup" aria-label="How you get it" className="grid grid-cols-3 gap-1 rounded-full border border-base-content/15 bg-base-100/40 p-1">
          {FREQUENCIES.map((f) => {
            const on = f.value === frequency;
            return (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setFrequency(f.value)}
                className={`h-10 rounded-full px-3 text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  on ? "bg-base-content text-base-100" : "text-base-content/60 hover:bg-base-content/5 hover:text-base-content"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 rounded-[2rem] border border-base-content/15 bg-base-100/60 p-2 transition-colors focus-within:border-primary sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Work email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              autoFocus={autoFocus}
              className="h-14 w-full rounded-full bg-transparent px-5 text-lg text-base-content placeholder:text-base-content/40 focus:outline-hidden"
            />
          </label>
          {/* Only bots fill this in */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            aria-hidden
          />
          <button
            type="submit"
            disabled={sending}
            className="group inline-flex h-14 shrink-0 items-center justify-center gap-2.5 rounded-full bg-primary px-8 text-base font-semibold text-primary-content transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-70"
          >
            {sending ? "Subscribing…" : frequency === "weekly" ? "Get the Digest" : "Get My Updates"}
            <ArrowRightIcon
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        </div>
        {error ? (
          <p className="m-0 px-5 text-sm text-error">{error}</p>
        ) : (
          <p className="m-0 px-5 text-sm text-base-content/50">
            {choice.hint} Free, and you can change it anytime. We&apos;ll email you a link to confirm.
          </p>
        )}
      </form>
    </>
  );
}
