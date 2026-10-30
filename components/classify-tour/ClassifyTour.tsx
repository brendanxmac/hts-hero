"use client";

import { ComponentType, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, DocumentTextIcon, ScaleIcon } from "@heroicons/react/20/solid";
import { TourShell, TourStep } from "@/components/product-tour/TourShell";
import { PRODUCTS } from "@/components/classify-landing/lib/howItWorks";
import { delay, HowTo } from "@/components/tariff-tracker/onboarding/parts";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { WelcomeCoverScreen } from "@/components/tariff-tracker/onboarding/tour/WelcomeCover";
import { TRACKER_WELCOME_PARAM } from "@/libs/signup-onboarding";

// The Classification Assistant's tour, in the shared TourShell: a welcome, then five steps, each
// what it's for, how, and a small demo of the real screen (the /classify demo's water bottle). It's
// also the product's onboarding: an account that signed up from the homepage's classification
// section lands on it (onboardingNext: /classifications?welcome=tour), and every way out, finishing
// or skipping, opens a new classification; the dashboard's spotlight tour is marked done so it
// doesn't follow it. The header's Product Tour opens it any time (openClassifyTour).

const EXAMPLE = PRODUCTS[1];
const FINAL_CODE = "9617.00.10.00";
export const NEW_CLASSIFICATION = "/classifications/new";
// The dashboard's spotlight tour (OnboardingTour tourId "classifications"), stored by useOnboardingTour
const SPOTLIGHT_DONE_KEY = "onboarding_classifications_completed";

// The screen between the onboarding and the tour, in the page's first HTML (app/classifications),
// until the tour says it's open (or a fallback lifts it)
const OPENED_EVENT = "classify-tour-opened";
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
  return show ? <WelcomeCoverScreen /> : null;
};

// Whether this visit came from the sign-up onboarding (read once, in the browser)
export const classifyTourRequested = () => typeof window !== "undefined" && new URL(window.location.href).searchParams.get(TRACKER_WELCOME_PARAM) === "tour";

const B = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-base-content">{children}</strong>;
const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`tt-ob-rise rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xl shadow-base-content/5 ${className}`}>{children}</div>
);
const Label = ({ children }: { children: ReactNode }) => <p className="m-0 text-xs font-bold uppercase tracking-wider text-base-content/50">{children}</p>;

// 0. Welcome: what you end up with, a final code backed by the law, in an audit-ready report
const WelcomeVisual = () => (
  <Card>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Label>Classification report</Label>
        <p className="m-0 mt-2 text-sm font-semibold leading-snug text-base-content">{EXAMPLE.description}</p>
      </div>
      <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">Final</span>
    </div>
    <div className="tt-ob-rise mt-4 flex items-center justify-between gap-3 rounded-xl bg-success/10 px-4 py-3 ring-1 ring-success/30" style={delay(200)}>
      <span className="text-sm font-semibold text-base-content/70">HTS code</span>
      <span className="font-mono text-xl font-bold text-success">{FINAL_CODE}</span>
    </div>
    <div className="tt-ob-rise mt-4 flex flex-wrap gap-2" style={delay(380)}>
      {EXAMPLE.legalNotes.map((n) => (
        <span key={n.source} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <DocumentTextIcon className="h-3.5 w-3.5" aria-hidden /> {n.source}
        </span>
      ))}
      {EXAMPLE.crossRulings.map((r) => (
        <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-base-content/10 px-2.5 py-1 text-xs font-semibold text-base-content/80">
          <ScaleIcon className="h-3.5 w-3.5" aria-hidden /> {r.id}
        </span>
      ))}
    </div>
    <p className="tt-ob-rise m-0 mt-4 flex items-center gap-2 text-sm text-base-content/70" style={delay(540)}>
      <CheckIcon className="h-4 w-4 text-success" aria-hidden /> Your reasoning, documented and ready for an audit
    </p>
  </Card>
);

// 1. A good description
const DescribeVisual = () => (
  <Card>
    <Label>Product description</Label>
    <p className="m-0 mt-2 rounded-xl border border-primary/40 bg-primary/[0.04] p-4 text-base leading-relaxed text-base-content ring-2 ring-primary/15">{EXAMPLE.description}</p>
    <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
      {["Material: stainless steel", "Build: double-wall, vacuum insulated", "Size: 32oz", "Use: drinking water, household"].map((t, i) => (
        <li key={t} className="tt-ob-rise flex items-center gap-2 text-sm text-base-content/75" style={delay(250 + i * 90)}>
          <CheckIcon className="h-4 w-4 text-success" aria-hidden /> {t}
        </li>
      ))}
    </ul>
  </Card>
);

// 2. Candidates and the research behind them
const CandidatesVisual = () => (
  <Card>
    <Label>Likely headings</Label>
    <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
      {EXAMPLE.candidates.map((c, i) => (
        <li key={c.code} className="tt-ob-rise flex items-center gap-3 rounded-xl border border-base-300 px-3 py-2.5" style={delay(150 + i * 90)}>
          <span className="font-mono text-sm font-bold text-base-content">{c.code}</span>
          <span className="truncate text-sm text-base-content/70">{c.title}</span>
        </li>
      ))}
    </ul>
    <div className="tt-ob-rise mt-4 flex flex-wrap gap-2" style={delay(560)}>
      {EXAMPLE.legalNotes.map((n) => (
        <span key={n.source} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <DocumentTextIcon className="h-3.5 w-3.5" aria-hidden /> {n.source}
        </span>
      ))}
      {EXAMPLE.crossRulings.map((r) => (
        <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-base-content/10 px-2.5 py-1 text-xs font-semibold text-base-content/80">
          <ScaleIcon className="h-3.5 w-3.5" aria-hidden /> {r.id}
        </span>
      ))}
    </div>
  </Card>
);

// 3. Pick the best, with a note
const SelectVisual = () => {
  const best = EXAMPLE.candidates[EXAMPLE.selectedIndex];
  return (
    <Card>
      <Label>Your pick</Label>
      <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/[0.05] px-3 py-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content">
          <CheckIcon className="h-4 w-4" aria-hidden />
        </span>
        <span className="font-mono text-sm font-bold text-base-content">{best.code}</span>
        <span className="truncate text-sm text-base-content/75">{best.title}</span>
      </div>
      <div className="tt-ob-rise mt-4" style={delay(300)}>
        <Label>Your notes (optional)</Label>
        <p className="m-0 mt-2 rounded-xl border border-base-300 p-3 text-sm leading-relaxed text-base-content/75">
          Double-wall vacuum vessel, complete with lid: a vacuum flask of 9617, not a steel container of 7310 or 7323.
        </p>
      </div>
    </Card>
  );
};

// 4. Again, down to ten digits
const DigitsVisual = () => {
  const levels = ["9617", "9617.00", "9617.00.10", FINAL_CODE];
  return (
    <Card>
      <Label>Down to ten digits</Label>
      <ol className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
        {levels.map((code, i) => {
          const last = i === levels.length - 1;
          return (
            <li
              key={code}
              className={`tt-ob-rise flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${last ? "bg-success/15 ring-1 ring-success/40" : "border border-base-300"}`}
              style={delay(150 + i * 220)}
            >
              <span className={`font-mono font-bold ${last ? "text-lg text-success" : "text-sm text-base-content"}`}>{code}</span>
              {last ? <span className="text-sm font-semibold text-success">Final code 🎉</span> : <CheckIcon className="h-4 w-4 text-success" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </Card>
  );
};

// 5. Every classification, in the dashboard
const DashboardVisual = () => {
  const rows = [
    { name: "Stainless steel water bottle, 32oz", code: FINAL_CODE, status: "Final", tone: "bg-success/15 text-success" },
    { name: "Ceramic brake pads, passenger vehicles", code: "8708.30.50", status: "Needs Review", tone: "bg-warning/15 text-warning" },
    { name: "Cotton crew-neck t-shirt, men's", code: "6109.10", status: "Draft", tone: "bg-base-content/10 text-base-content/70" },
  ];
  return (
    <Card>
      <Label>Your classifications</Label>
      <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
        {rows.map((r, i) => (
          <li key={r.name} className="tt-ob-rise flex items-center gap-3 rounded-xl border border-base-300 px-3 py-2.5" style={delay(150 + i * 110)}>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-base-content">{r.name}</span>
              <span className="font-mono text-xs text-base-content/60">{r.code}</span>
            </span>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${r.tone}`}>{r.status}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const STEPS: { id: string; rail: string; title: string; lead: string; how: ReactNode[]; Visual: ComponentType }[] = [
  // Always first: what it's for, before how
  {
    id: "welcome",
    rail: "Welcome",
    title: "Back Every Classification With Legal Proof",
    lead: "Describe a product and get its 10-digit HTS code with the legal notes and CROSS rulings behind it, in minutes.",
    how: [
      <>Find the right code with confidence, not guesswork.</>,
      <>
        See the <B>notes</B> and <B>rulings</B> behind every candidate.
      </>,
      <>Your reasoning is documented as you go, ready for an audit.</>,
    ],
    Visual: WelcomeVisual,
  },
  {
    id: "describe",
    rail: "Describe",
    title: "Start with a good product description",
    lead: "The better the description, the better the candidates. A sentence or two is enough.",
    how: [
      <>Say what it&apos;s made of, how it&apos;s built and its size.</>,
      <>Say who it&apos;s for and how it&apos;s used.</>,
      <>
        Click <B>Classify</B>.
      </>,
    ],
    Visual: DescribeVisual,
  },
  {
    id: "candidates",
    rail: "Candidates",
    title: "See the likely HS candidates, with the research",
    lead: "HTS Hero finds the headings your product could fall under, and the evidence for each.",
    how: [
      <>Compare the likely headings side by side.</>,
      <>
        Read the <B>section and chapter notes</B> that apply to each.
      </>,
      <>
        Check <B>CROSS rulings</B> on similar products.
      </>,
    ],
    Visual: CandidatesVisual,
  },
  {
    id: "select",
    rail: "Select",
    title: "Select the best one, and add notes if you like",
    lead: "You make the call. Your reasoning is saved with it, ready for an audit.",
    how: [
      <>Pick the candidate that fits best.</>,
      <>Optionally add a note on why, in your own words.</>,
    ],
    Visual: SelectVisual,
  },
  {
    id: "digits",
    rail: "10 Digits",
    title: "Repeat until you reach 10 digits 🎉",
    lead: "Each level narrows it down, from the heading to the full 10-digit HTS code.",
    how: [
      <>Pick the best fit at each level.</>,
      <>
        At 10 digits, you have your <B>final code</B>, with every step documented.
      </>,
    ],
    Visual: DigitsVisual,
  },
  {
    id: "dashboard",
    rail: "Dashboard",
    title: "See and manage every classification",
    lead: "Every classification you make lives in your dashboard.",
    how: [
      <>
        Filter by <B>Draft</B>, <B>Needs Review</B> and <B>Final</B>.
      </>,
      <>Open any one to review it, or download its report.</>,
    ],
    Visual: DashboardVisual,
  },
];

// Opens the tour from a button (the classifications header's Product Tour); closing goes back
const OPEN_EVENT = "classify-tour-open";
export const openClassifyTour = () => window.dispatchEvent(new Event(OPEN_EVENT));

export const ClassifyTour = () => {
  const router = useRouter();
  // null: closed; "onboarding": from the sign-up onboarding (every way out opens a new
  // classification); "button": opened by hand (closing goes back)
  const [from, setFrom] = useState<"onboarding" | "button" | null>(null);
  const [at, setAt] = useState(0);
  const open = from !== null;

  // From the sign-up onboarding, once; the address loses ?welcome= so a reload doesn't repeat it
  useEffect(() => {
    if (!classifyTourRequested()) return;
    try {
      localStorage.setItem(SPOTLIGHT_DONE_KEY, "true");
    } catch {
      // Not critical
    }
    const url = new URL(window.location.href);
    url.searchParams.delete(TRACKER_WELCOME_PARAM);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    setAt(0);
    setFrom("onboarding");
    window.dispatchEvent(new Event(OPENED_EVENT));
    trackEvent(MixpanelEvent.CLASSIFY_TOUR_SHOWN, { from: "onboarding" });
  }, []);

  // From a button, any time
  useEffect(() => {
    const onOpen = () => {
      setAt(0);
      setFrom("button");
      trackEvent(MixpanelEvent.CLASSIFY_TOUR_SHOWN, { from: "button" });
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (open) trackEvent(MixpanelEvent.CLASSIFY_TOUR_STEP, { step: STEPS[at].id, index: at + 1, of: STEPS.length });
  }, [open, at]);

  if (!open) return null;
  const step = STEPS[at];
  const last = at === STEPS.length - 1;
  const Visual = step.Visual;

  // From the onboarding, every way out goes to a new classification; by hand, closing goes back
  const end = (how: "finished" | "skipped") => {
    trackEvent(MixpanelEvent.CLASSIFY_TOUR_ENDED, { how, step: step.id, from });
    if (from === "onboarding" || how === "finished") router.push(NEW_CLASSIFICATION);
    else setFrom(null);
  };

  return (
    <TourShell
      product="Classification Assistant"
      steps={STEPS}
      at={at}
      onGo={(i) => setAt(i)}
      exitLabel={from === "onboarding" ? "Skip tour" : "Close tour"}
      onExit={() => end("skipped")}
      labelledBy="classify-tour-title"
    >
      <TourStep
        key={step.id}
        titleId="classify-tour-title"
        eyebrow={`Step ${at + 1} of ${STEPS.length} · ${step.rail}`}
        title={step.title}
        lead={step.lead}
        body={<HowTo steps={step.how} start={200} />}
        onBack={at > 0 ? () => setAt(at - 1) : undefined}
        next={last ? { label: from === "onboarding" ? "Classify my first product" : "Classify a product", onClick: () => end("finished") } : { label: `Next: ${STEPS[at + 1].rail}`, onClick: () => setAt(at + 1) }}
        visual={<Visual />}
      />
    </TourShell>
  );
};
