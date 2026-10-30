"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TourShell, TourStage } from "@/components/product-tour/TourShell";
import { welcomeCoverRemaining, WelcomeCoverScreen } from "@/components/tariff-tracker/onboarding/tour/WelcomeCover";
import { NUM_FREE_CLASSIFICATIONS } from "@/constants/classification";
import { useEscapeToClose } from "@/hooks";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { TRACKER_WELCOME_PARAM } from "@/libs/signup-onboarding";
import { CandidatesScene, ClassifyWelcomeScene, DescribeScene, DigitsScene, FreeScene, ReportScene, SelectScene } from "./scenes";

// The Classification Assistant's onboarding: what an account from the homepage's classification
// section sees first (onboardingNext: /classifications?welcome=tour). Not the product tour (that
// stays in the header, ClassifyTour): a short, cinematic sell in the Tracker onboarding's style, one
// idea per screen (TourStage), each with one animated scene. Welcome; describe it; the likely
// headings with the law behind them; their pick, their call; down to ten digits; the audit-ready
// report; then the free classifications they start with. Every way out, finishing or skipping, opens
// a new classification; the dashboard's spotlight tour is marked done so it doesn't follow it.

export const NEW_CLASSIFICATION = "/classifications/new";
// The dashboard's spotlight tour (OnboardingTour tourId "classifications"), stored by useOnboardingTour
const SPOTLIGHT_DONE_KEY = "onboarding_classifications_completed";
const PREVIEW_PARAM = "onboardingPreview";

// Whether this visit came from the sign-up onboarding (read once, in the browser), or is a dev preview
export const classifyOnboardingRequested = () => {
  if (typeof window === "undefined") return false;
  const params = new URL(window.location.href).searchParams;
  return params.get(TRACKER_WELCOME_PARAM) === "tour" || (process.env.NODE_ENV === "development" && params.get(PREVIEW_PARAM) === "1");
};

// The screen between the sign-up onboarding and this one, in the page's first HTML
// (app/classifications), until this says it's open (or a fallback lifts it)
const OPENED_EVENT = "classify-onboarding-opened";
export const ClassifyCover = () => {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const hide = () => setShow(false);
    window.addEventListener(OPENED_EVENT, hide);
    const timer = setTimeout(hide, 12_000);
    return () => {
      window.removeEventListener(OPENED_EVENT, hide);
      clearTimeout(timer);
    };
  }, []);
  return show ? <WelcomeCoverScreen product="Classification Assistant" sync /> : null;
};

// Each page has one color, shared by its eyebrow and the highlighted words of its title
type Tone = "primary" | "success";
const TONE: Record<Tone, string> = { primary: "text-primary", success: "text-success" };
type Page = { id: string; rail: string; eyebrow: string; title: ReactNode; lead: string; tone: Tone; scene: ReactNode };

const PAGES: Page[] = [
  {
    id: "welcome",
    rail: "Welcome",
    eyebrow: "Welcome to Classification Assistant",
    title: (
      <>
        Back up Every HTS Code <br />
        <span className={TONE.primary}>with Legal Evidence.</span>
      </>
    ),
    lead: "Classify any product in minutes, with the notes and rulings that prove it.",
    tone: "primary",
    scene: <ClassifyWelcomeScene />,
  },
  {
    id: "describe",
    rail: "Describe",
    eyebrow: "Step one",
    title: (
      <>
        Describe <span className={TONE.primary}>your product.</span>
      </>
    ),
    lead: "To begin any classification, enter your products details",
    tone: "primary",
    scene: <DescribeScene />,
  },
  {
    id: "candidates",
    rail: "Review",
    eyebrow: "The research",
    title: (
      <>
        Get candidates <br /> <span className={TONE.primary}>and proof.</span>
      </>
    ),
    lead: "Get a list of HS candidates with the section and chapter notes and CROSS rulings that back them.",
    tone: "primary",
    scene: <CandidatesScene />,
  },
  {
    id: "select",
    rail: "Select",
    eyebrow: "Your call",
    title: (
      <>
        Select the <span className={TONE.primary}>best.</span>
      </>
    ),
    lead: "Pick the option that looks best to you, and add your reasoning if you like. Nothing is decided for you.",
    tone: "primary",
    scene: <SelectScene />,
  },
  {
    id: "digits",
    rail: "Repeat",
    eyebrow: "Rinse & Repeat",
    title: (
      <>
        Repeat until <span className={TONE.success}>10 digits.</span>
      </>
    ),
    lead: "Each level narrows it down, until you have the full HTS code.",
    tone: "success",
    scene: <DigitsScene />,
  },
  {
    id: "report",
    rail: "Report",
    eyebrow: "Audit-ready",
    title: (
      <>
        Evidence saved, <br /><span className={TONE.success}>for every code.</span>
      </>
    ),
    lead: "Every step, note and ruling is automatically documented for you.",
    tone: "success",
    scene: <ReportScene />,
  },
  {
    id: "start",
    rail: "Start",
    eyebrow: "Try it Free",
    title: (
      <>
        Your first {NUM_FREE_CLASSIFICATIONS} are <span className={TONE.primary}>free.</span>
      </>
    ),
    lead: "Classify a real product now to see if it suits your needs.",
    tone: "primary",
    scene: <FreeScene count={NUM_FREE_CLASSIFICATIONS} />,
  },
];

export const ClassifyOnboarding = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);
  const page = PAGES[at];
  const last = at === PAGES.length - 1;

  // From the sign-up onboarding, once; the address loses ?welcome= so a reload doesn't repeat it
  useEffect(() => {
    if (!classifyOnboardingRequested()) return;
    try {
      localStorage.setItem(SPOTLIGHT_DONE_KEY, "true");
    } catch {
      // Not critical
    }
    const url = new URL(window.location.href);
    const fromSignup = url.searchParams.get(TRACKER_WELCOME_PARAM) === "tour";
    url.searchParams.delete(TRACKER_WELCOME_PARAM);
    url.searchParams.delete(PREVIEW_PARAM);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    // From the sign-up onboarding, once the welcome cover has had its moment (WelcomeCover)
    // (Not cancelled on cleanup: the address has already lost ?welcome=, so this runs only once)
    setTimeout(
      () => {
        setOpen(true);
        window.dispatchEvent(new Event(OPENED_EVENT));
        trackEvent(MixpanelEvent.CLASSIFY_ONBOARDING_SHOWN);
      },
      fromSignup ? welcomeCoverRemaining() : 0,
    );
  }, []);

  useEffect(() => {
    if (open) trackEvent(MixpanelEvent.CLASSIFY_ONBOARDING_STEP, { step: page.id, index: at + 1, of: PAGES.length });
  }, [open, at]);

  // Every way out opens a new classification
  const end = (how: "finished" | "skipped") => {
    trackEvent(how === "finished" ? MixpanelEvent.CLASSIFY_ONBOARDING_STARTED : MixpanelEvent.CLASSIFY_ONBOARDING_SKIPPED, { step: page.id });
    router.push(NEW_CLASSIFICATION);
  };
  useEscapeToClose(open, () => end("skipped"));

  // The arrow keys move between screens
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setAt((i) => Math.min(PAGES.length - 1, i + 1));
      else if (e.key === "ArrowLeft") setAt((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <TourShell product="Classification Assistant" steps={PAGES} at={at} onGo={setAt} exitLabel="Skip for now" onExit={() => end("skipped")} labelledBy="classify-onboarding-title">
      <TourStage
        key={page.id}
        titleId="classify-onboarding-title"
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
        accent={TONE[page.tone]}
        scene={page.scene}
        onBack={at > 0 ? () => setAt(at - 1) : undefined}
        next={last ? { label: "Classify my first product", onClick: () => end("finished") } : { label: at === 0 ? "See how" : "Next", onClick: () => setAt(at + 1) }}
        footnote={last ? "Takes a few minutes. No credit card." : undefined}
      />
    </TourShell>
  );
};
