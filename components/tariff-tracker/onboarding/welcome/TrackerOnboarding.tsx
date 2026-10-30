"use client";

import { ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { useEscapeToClose } from "@/hooks";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { TourShell, TourStage } from "@/components/product-tour/TourShell";
import { openImportTakeover } from "../takeoverStore";
import { AlertScene, AuditScene, ImpactScene, RewardScene, SavingsScene, SetupScene, WelcomeScene } from "./scenes";

// The Tariff Tracker onboarding: what a new account from the sign-up onboarding sees first
// (?welcome=imports or alerts; TourTriggers opens it). Not the product tour (that stays a button
// away): a short, cinematic sell, one idea per screen (TourStage), each with one animated scene.
// Welcome; what the Tracker does, one thing a screen (alerts and their impact first for someone
// who came for alerts, else audits and savings first); how setup takes 30 seconds; then the free
// week they get for adding imports now. "Add my imports" goes straight into the import flow
// (ImportTakeover's choose step) with nothing in between. In the shared TourShell.

type Focus = "imports" | "alerts";

let state: { open: boolean; focus: Focus } = { open: false, focus: "imports" };
const listeners = new Set<() => void>();
const set = (next: Partial<typeof state>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};
export const openTrackerOnboarding = (focus: Focus) => set({ open: true, focus });
const closeTrackerOnboarding = () => set({ open: false });
const CLOSED = { open: false, focus: "imports" as Focus };
export const useTrackerOnboarding = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => state,
    () => CLOSED,
  );

// Each page has one color, shared by its eyebrow and the highlighted words of its title:
// red for tariffs that hit, green for money back or saved, blue for the Tracker itself
type Tone = "primary" | "error" | "success";
const TONE: Record<Tone, { text: string }> = {
  primary: { text: "text-primary" },
  error: { text: "text-error" },
  success: { text: "text-success" },
};
type Page = { id: string; rail: string; eyebrow: string; title: ReactNode; lead: string; tone: Tone; scene: ReactNode };

const PAGES: Record<string, Page> = {
  welcome: {
    id: "welcome",
    rail: "Welcome",
    eyebrow: "Welcome to Tariff Tracker",
    title: (
      <>
        No more overpaying. <br /><span className={TONE.primary.text}>No more surprises.</span>
      </>
    ),
    lead: "We watch your imports around the clock to find savings and notify you any time something changes",
    tone: "primary",
    scene: <WelcomeScene />,
  },
  alerts: {
    id: "alerts",
    rail: "Alerts",
    eyebrow: "Tariff alerts",
    title: (
      <>
        Know when tariffs <span className={TONE.error.text}>hit you.</span>
      </>
    ),
    lead: "You'll recieve a notification any time your imports might be affected.",
    tone: "error",
    scene: <AlertScene />,
  },
  impact: {
    id: "impact",
    rail: "Impact",
    eyebrow: "The impact",
    title: (
      <>
        See <span className={TONE.error.text}>what it costs.</span>
      </>
    ),
    lead: "The rate before and after on every product, so you can act before it lands on your entries.",
    tone: "error",
    scene: <ImpactScene />,
  },
  audits: {
    id: "audits",
    rail: "Audits",
    eyebrow: "Duty audits",
    title: (
      <>
        Find <span className={TONE.success.text}>overpaid duty.</span>
      </>
    ),
    lead: "We check every entry, you keep 100% of any refund.",
    tone: "success",
    scene: <AuditScene />,
  },
  savings: {
    id: "savings",
    rail: "Savings",
    eyebrow: "Savings",
    title: (
      <>
        and discover <span className={TONE.success.text}>savings.</span>
      </>
    ),
    lead: "We constantly check your imports for exemptions, trade programs, and origins you may benefit from.",
    tone: "success",
    scene: <SavingsScene />,
  },
  setup: {
    id: "setup",
    rail: "Setup",
    eyebrow: "Setup",
    title: (
      <>
        Get started in <br /><span className={TONE.primary.text}>30 seconds</span>
      </>
    ),
    lead: "Just upload your list of imports, and you're good to go.",
    tone: "primary",
    scene: <SetupScene />,
  },
  start: {
    id: "start",
    rail: "Start",
    eyebrow: "One Week Free",
    title: (
      <>
        Try it for 7 days <span className={TONE.primary.text}>FREE</span>
      </>
    ),
    lead: `Test it out for ${REVERSE_TRIAL.days} days to see if it's a good fit, no strings attached.`,
    tone: "primary",
    scene: <RewardScene imports={REVERSE_TRIAL.imports} />,
  },
};

// Alerts first for someone who came for alerts; audits and savings first for everyone else
const ORDER: Record<Focus, string[]> = {
  alerts: ["welcome", "alerts", "impact", "audits", "savings", "setup", "start"],
  imports: ["welcome", "audits", "savings", "alerts", "impact", "setup", "start"],
};

export const TrackerOnboarding = () => {
  const { open, focus } = useTrackerOnboarding();
  const [at, setAt] = useState(0);
  const pages = ORDER[focus].map((id) => PAGES[id]);
  const page = pages[Math.min(at, pages.length - 1)];
  const last = at >= pages.length - 1;

  useEffect(() => {
    if (!open) return;
    setAt(0);
    trackEvent(MixpanelEvent.TRACKER_WELCOME_SHOWN, { focus });
  }, [open]);
  useEffect(() => {
    if (open) trackEvent(MixpanelEvent.TRACKER_WELCOME_STEP, { step: page.id, index: at + 1, of: pages.length, focus });
  }, [open, at]);

  const skip = () => {
    trackEvent(MixpanelEvent.TRACKER_WELCOME_SKIPPED, { step: page.id, focus });
    closeTrackerOnboarding();
  };
  useEscapeToClose(open, skip);

  // The arrow keys move between screens
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setAt((i) => Math.min(pages.length - 1, i + 1));
      else if (e.key === "ArrowLeft") setAt((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pages.length]);

  if (!open) return null;

  // Straight into the import flow: it opens as this closes, so nothing shows in between
  const addImports = () => {
    trackEvent(MixpanelEvent.TRACKER_WELCOME_ADD_IMPORTS, { focus });
    openImportTakeover("onboarding", "choose");
    closeTrackerOnboarding();
  };

  return (
    <TourShell product="Tariff Tracker" steps={pages} at={at} onGo={setAt} exitLabel="Skip for now" onExit={skip} labelledBy="tt-welcome-title">
      <TourStage
        key={page.id}
        titleId="tt-welcome-title"
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
        accent={TONE[page.tone].text}
        scene={page.scene}
        onBack={at > 0 ? () => setAt(at - 1) : undefined}
        next={last ? { label: "Add my imports", onClick: addImports } : { label: at === 0 ? "Show me" : "Next", onClick: () => setAt(at + 1) }}
        footnote={last ? "Takes about 30 seconds. No credit card." : undefined}
      />
    </TourShell>
  );
};
