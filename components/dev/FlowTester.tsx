"use client";

import { useState } from "react";
import { ArrowPathIcon, PlayIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { trackerDisplay, trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import { TRIAL_PREVIEWS } from "@/libs/tariff-tracker/plan";
import { entryHref, onboardingNext, ONBOARDING_PATH, type EntryPoint } from "@/libs/signup-onboarding";

// The Flow Tester (/dev/flows, development only): every sign-up path, replayable on your own
// account. "Run" forgets your onboarding (/api/dev/flow-reset and this browser's "seen" flags) and
// plays the whole path as a new sign-up gets it: the questions, then that entry's next step.
// "Questions only" previews the questions without saving; "Next step only" skips straight to what
// follows them. Runs in dev save to the dev database and send events to the dev Mixpanel.

const FLOWS: { entry: EntryPoint; button: string; next: string }[] = [
  { entry: "hero", button: "Home · hero “Get Started Free”", next: "Tracker onboarding → add imports" },
  { entry: "audit", button: "Home · “Find Overpaid Duty”", next: "Tracker onboarding → add imports" },
  { entry: "alerts", button: "Home · “Get Tariff Alerts”", next: "Tracker onboarding (alerts first) → add imports" },
  { entry: "calculator", button: "Home · “Try Tariff Calculator”", next: "Tracker calculator, no tour or popups" },
  { entry: "savings", button: "Home · “Find Savings”", next: "Tracker onboarding → add imports" },
  { entry: "classify", button: "Home · classification “Try it Free”", next: "Classification tour → new classification" },
  { entry: "closing", button: "Home · closing “Get Started Free”", next: "Tracker onboarding → add imports" },
  { entry: "alerts_page", button: "/tariff-alerts · any button", next: "Tracker onboarding (alerts first) → add imports" },
  { entry: "audits_page", button: "/duty-audits · any button", next: "Tracker onboarding → add imports" },
];

const OTHER: { label: string; href: string; note: string }[] = [
  { label: "Sign-up page", href: "/signup", note: "Signed out only (signed in, it moves on)" },
  { label: "Old sign-up link", href: "/signin?sign-up=true&redirect=%2Fclassifications", note: "Should land on /signup, keeping the redirect" },
  { label: "Sign-in page", href: "/signin", note: "Signed out only" },
  { label: "Get a Demo form", href: "/", note: "The hero's second button (submitting emails Brendan)" },
  { label: "Tracker tour (preview)", href: "/tariff-tracker?tourPreview=1", note: "The product tour, from the sidebar's button" },
  { label: "Tracker onboarding (preview)", href: "/tariff-tracker?onboardingPreview=1&welcomePreview=imports", note: "The 3 screens; add &welcomePreview=alerts for the alerts version" },
  { label: "Classification tour", href: "/classifications", note: "The header's Product Tour button" },
];

const SEEN_KEYS = (userId: string) => [
  `hts-hero-tariff-tracker-tour-seen:${userId}:first_visit`,
  `hts-hero-tariff-tracker-tour-seen:${userId}:imports_added`,
  "onboarding_classifications_completed",
];

const button = "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors disabled:opacity-50";
const primary = `${button} bg-primary text-primary-content hover:bg-primary/90`;
const quiet = `${button} border border-base-300 text-base-content/80 hover:border-base-content/40 hover:text-base-content`;

export const FlowTester = () => {
  const { user } = useUser();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // Forgets your onboarding answers and every "seen" flag, so the next run is a first time
  const reset = async () => {
    if (!user) return;
    const res = await fetch("/api/dev/flow-reset", { method: "POST" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Reset failed");
    try {
      SEEN_KEYS(user.id).forEach((k) => localStorage.removeItem(k));
    } catch {
      // Storage blocked: the tours may count as seen
    }
  };

  const run = async (go: string, withReset: boolean) => {
    setBusy(true);
    setNote(null);
    try {
      if (withReset) await reset();
      window.location.href = go;
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  };

  const forgetFirstTouch = () => {
    try {
      localStorage.removeItem("hts-hero-first-touch");
      setNote("First visit forgotten: the next page you open counts as this browser's first.");
    } catch {
      setNote("Storage is blocked in this browser.");
    }
  };

  return (
    <main className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} min-h-screen bg-base-200 px-6 py-10 text-base-content`}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-warning">Development only</p>
          <h1 className="text-3xl font-semibold tracking-tight [font-family:var(--font-tracker-display)]">Flow Tester</h1>
          <p className="max-w-3xl text-base-content/70">
            Replay every sign-up path on your own account. <b>Run</b> forgets your onboarding and plays the path the way a new sign-up gets it:
            the three questions, then where that button leads. Answers save to the dev database, and events go to the dev Mixpanel.
          </p>
          <p className="text-sm">
            {user ? (
              <>
                Signed in as <b>{user.email}</b>.
              </>
            ) : (
              <span className="text-warning">
                Signed out. Sign in first to run the flows (or use the sign-up links below to test the signed-out path).
              </span>
            )}
          </p>
          {note && <p className="text-sm text-error">{note}</p>}
        </header>

        <section className="overflow-hidden rounded-2xl bg-base-100 ring-1 ring-base-300">
          <table className="w-full text-left text-sm">
            <thead className="bg-base-200/60 text-xs uppercase tracking-wider text-base-content/60">
              <tr>
                <th className="px-4 py-3">Button</th>
                <th className="px-4 py-3">After the questions</th>
                <th className="px-4 py-3">Test</th>
              </tr>
            </thead>
            <tbody>
              {FLOWS.map((f) => (
                <tr key={f.entry} className="border-t border-base-300 align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{f.button}</p>
                    <p className="font-mono text-xs text-base-content/50">from={f.entry}</p>
                  </td>
                  <td className="px-4 py-3 text-base-content/75">{f.next}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={primary} disabled={busy || !user} onClick={() => run(`${ONBOARDING_PATH}?from=${f.entry}`, true)}>
                        <PlayIcon className="h-4 w-4" aria-hidden /> Run
                      </button>
                      <button type="button" className={quiet} disabled={busy} onClick={() => run(`${ONBOARDING_PATH}?preview=1&from=${f.entry}`, false)}>
                        Questions only
                      </button>
                      <button type="button" className={quiet} disabled={busy || !user} onClick={() => run(onboardingNext(f.entry), true)}>
                        Next step only
                      </button>
                      <a className={quiet} href={entryHref(f.entry)}>
                        Sign-up link
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="flex flex-col gap-3 rounded-2xl bg-base-100 p-5 ring-1 ring-base-300">
            <h2 className="text-lg font-semibold">Trial stages</h2>
            <p className="text-sm text-base-content/70">The Tracker as your account would look at each stage of the trial. Nothing about your account changes.</p>
            <div className="flex flex-wrap gap-2">
              {TRIAL_PREVIEWS.map((stage) => (
                <a key={stage} className={quiet} href={`/tariff-tracker?trialPreview=${stage}`}>
                  {stage}
                </a>
              ))}
              <a className={quiet} href="/tariff-tracker?trialPreview=off">
                off
              </a>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl bg-base-100 p-5 ring-1 ring-base-300">
            <h2 className="text-lg font-semibold">Other pages and resets</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {OTHER.map((o) => (
                <li key={o.label}>
                  <a className="font-semibold text-primary hover:underline" href={o.href}>
                    {o.label}
                  </a>{" "}
                  <span className="text-base-content/60">· {o.note}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                className={quiet}
                disabled={busy || !user}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await reset();
                    setNote("Reset: your onboarding and every “seen” flag are forgotten.");
                  } catch (e) {
                    setNote(e instanceof Error ? e.message : "Reset failed");
                  }
                  setBusy(false);
                }}
              >
                <ArrowPathIcon className="h-4 w-4" aria-hidden /> Reset my onboarding
              </button>
              <button type="button" className={quiet} onClick={forgetFirstTouch}>
                Forget my first visit
              </button>
            </div>
            <p className="text-xs text-base-content/50">
              The signed-out path (sign-up, confirmation email, first Tracker visit) needs a real new account: sign up as yourname+test1@yourdomain.com
              in a private window; the emails reach your normal inbox.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};
