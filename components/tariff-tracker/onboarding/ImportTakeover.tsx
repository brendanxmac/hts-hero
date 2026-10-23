"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { CheckIcon } from "@heroicons/react/20/solid";
import logo from "@/app/logo.svg";
import { trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import { useUser } from "@/contexts/UserContext";
import { useEscapeToClose } from "@/hooks";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { SkipReason } from "@/libs/tariff-tracker/onboarding";
import { useTrackerAccess } from "../access/accessContext";
import { itemKey, NewProduct, realItems } from "../catalog";
import { useCatalogSynced } from "../catalogSync";
import { useTrackerNav } from "../shell/TrackerNav";
import { AddSource, useTracker } from "../TrackerContext";
import {
  AddMethod,
  FileStep,
  PasteStep,
  RecentStep,
  useRecentToAdd,
} from "./AddSteps";
import { ChooseStep } from "./ChooseStep";
import { DoneStep } from "./DoneStep";
import { ExplainStep } from "./ExplainStep";
import { FinishStep } from "./FinishStep";
import { HandyStep } from "./HandyStep";
import { HookStep } from "./HookStep";
import { SHOW_EXPLAINER } from "./parts";
import { SkipStep } from "./SkipStep";
import { openTourOnce } from "./tour/tourStore";
import {
  closeImportTakeover,
  openImportTakeover,
  setTakeoverStep,
  TakeoverStep,
  useImportTakeover,
} from "./takeoverStore";

// The import takeover (PRICING.md and the onboarding plan, 2026-10-20): the whole screen, opened when
// the person asks for it (the empty Home and Imports pages, SetupPanel; the plan card; an email's
// link), never by itself (2026-10-21). Why it matters (HookStep), what an import is
// (ExplainStep), the ways in (ChooseStep and AddSteps), help without the list (HandyStep), and the
// finish (DoneStep), which starts the trial. "Skip setup" leads to a last word (SkipStep); after it the
// empty Home and Imports pages keep asking. Signed out, the Overview's empty state asks instead.

// The first Tracker visit, recorded once per tab (the no-imports emails count from it)
const VISIT_KEY = "tt-tracker-visit-recorded";

const store = (kind: "session" | "local") => {
  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
};

const save = (body: Record<string, unknown>) =>
  fetch("/api/tracker/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch((): null => null);

const SOURCES: Record<AddMethod, AddSource> = {
  recent: "recent_lookups",
  paste: "paste",
  file: "csv",
};

// The rail across the top: where they are in the steps. Without the explainer in the flow, its
// detour (from skip) counts as the welcome
const RAIL = [
  { label: "Welcome", steps: SHOW_EXPLAINER ? ["hook"] : ["hook", "explain"] },
  ...(SHOW_EXPLAINER ? [{ label: "What's an import", steps: ["explain"] }] : []),
  {
    label: "Add your imports",
    steps: ["choose", "recent", "paste", "file", "handy"],
  },
  { label: "Get Started!", steps: ["done"] },
];

// The rail across the top: where they are in the four steps, and a way to any of them (the
// last only once there are imports to show)
const Rail = ({
  step,
  onGo,
  canFinish,
}: {
  step: TakeoverStep;
  onGo: (step: TakeoverStep) => void;
  canFinish: boolean;
}) => {
  const at = RAIL.findIndex((r) => r.steps.includes(step));
  return (
    <ol
      className="m-0 hidden list-none items-center gap-2 p-0 md:flex"
      aria-label="Setup steps"
    >
      {RAIL.map((r, i) => {
        const done = at > i;
        const current = at === i;
        const reachable = i < RAIL.length - 1 || canFinish;
        return (
          <li key={r.label} className="flex items-center gap-2">
            {i > 0 && (
              <span
                className={`h-px w-8 ${done || current ? "bg-primary/50" : "bg-base-300"}`}
                aria-hidden
              />
            )}
            <button
              type="button"
              disabled={!reachable || current}
              onClick={() => onGo(r.steps[0] as TakeoverStep)}
              aria-current={current ? "step" : undefined}
              className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors enabled:hover:bg-base-300/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-default"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${done
                    ? "bg-primary text-primary-content"
                    : current
                      ? "border-2 border-primary text-primary"
                      : "border-2 border-base-300 text-base-content/40"
                  }`}
                aria-hidden
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-sm font-semibold ${current ? "text-base-content" : done ? "text-base-content/70 group-enabled:group-hover:text-base-content" : reachable ? "text-base-content/50 group-hover:text-base-content" : "text-base-content/30"}`}
              >
                {r.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};

export const ImportTakeover = () => {
  const { user } = useUser();
  const {
    signedIn,
    loading: accessLoading,
    access,
    refreshAccess,
  } = useTrackerAccess();
  const { items, addProducts } = useTracker();
  const nav = useTrackerNav();
  const synced = useCatalogSynced(user?.id);
  const { open, step, from } = useImportTakeover();
  const recent = useRecentToAdd();
  const [addedKeys, setAddedKeys] = useState<string[]>([]);
  const [few, setFew] = useState(false);
  const realCount = realItems(items).length;
  const autoOpened = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  // "Skip setup" opens over the step they were on, which stays as it was underneath (a sheet
  // half fixed, a pasted list), so Back puts them right where they left off, scrolled to the spot
  const [skipping, setSkipping] = useState(false);
  const leftAt = useRef(0);

  // The Tracker opened, signed in: the first time is kept (the no-imports emails count from it)
  useEffect(() => {
    if (!signedIn || accessLoading || store("session")?.getItem(VISIT_KEY))
      return;
    store("session")?.setItem(VISIT_KEY, "1");
    void save({ action: "visit" });
  }, [signedIn, accessLoading]);

  // In development, ?onboardingPreview=1 opens it from the start for anyone (signed out too), to
  // check the flow without an empty account
  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || autoOpened.current) return;
    if (
      new URL(window.location.href).searchParams.get("onboardingPreview") !==
      "1"
    )
      return;
    autoOpened.current = true;
    openImportTakeover("preview", "hook");
  }, []);

  // Opens only when asked for (decided 2026-10-21: opening by itself on a first visit was abrupt;
  // the empty Home and Imports pages sell the Tracker and ask, SetupPanel). A link can ask for it
  // too, once the account's catalog is known: an email's "Add my imports" or a "Track your
  // products" link (?setup=add, ?add=paste), straight to the ways in or the one named. ?add= asks
  // only while the account has none of its own imports; ?setup= (the calculator's "Get Tariff
  // Alerts, Audits, & Savings", signed in) asks whatever the catalog holds.
  useEffect(() => {
    if (autoOpened.current || !signedIn || accessLoading || !synced || open)
      return;
    const url = new URL(window.location.href);
    if (realCount > 0 && !url.searchParams.has("setup")) return;
    const asked = url.searchParams.get("setup") ?? url.searchParams.get("add");
    autoOpened.current = true;
    if (!asked) return;
    if (url.searchParams.has("setup")) {
      url.searchParams.delete("setup");
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}`,
      );
    }
    const first: TakeoverStep =
      asked === "paste"
        ? "paste"
        : asked === "csv" || asked === "file"
          ? "file"
          : "choose";
    openImportTakeover("link", first);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_SHOWN, {
      from: "link",
      asked,
    });
  }, [signedIn, accessLoading, synced, realCount, open]);

  // Opened from an ask (the empty pages, the plan card, the imports-to-finish banner)
  useEffect(() => {
    if (open && from !== "link")
      trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_SHOWN, { from });
  }, [open, from]);

  // Each step starts at the top, with its title focused for screen readers
  useEffect(() => {
    if (!open) return;
    scroller.current?.scrollTo({ top: 0 });
    const timer = setTimeout(
      () =>
        document
          .getElementById("tt-onboarding-title")
          ?.focus({ preventScroll: true }),
      50,
    );
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, { step });
    return () => clearTimeout(timer);
  }, [open, step]);

  // Escape closes it, keeping its place (a cell being edited or picked takes the first Escape)
  useEscapeToClose(open, closeImportTakeover);

  if (!open) return null;

  const dismiss = () => {
    setSkipping(false);
    closeImportTakeover();
  };
  const startSkip = () => {
    leftAt.current = scroller.current?.scrollTop ?? 0;
    setSkipping(true);
    scroller.current?.scrollTo({ top: 0 });
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
      step: "skip",
      from: step,
    });
    setTimeout(
      () =>
        document
          .getElementById("tt-onboarding-title")
          ?.focus({ preventScroll: true }),
      50,
    );
  };
  const backFromSkip = () => {
    setSkipping(false);
    requestAnimationFrame(() =>
      scroller.current?.scrollTo({ top: leftAt.current }),
    );
  };
  const go = (next: TakeoverStep) => {
    setSkipping(false);
    setTakeoverStep(next);
  };

  const add = (products: NewProduct[], method: AddMethod) => {
    if (!products.length) return;
    const firstImports = realCount === 0;
    addProducts(products, SOURCES[method]);
    setAddedKeys(products.map(itemKey));
    setTakeoverStep("done");
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_COMPLETED, {
      method,
      imports: products.length,
      first: firstImports,
    });
    // The catalog saves a moment later (catalogSync.ts) and its first real imports start the
    // trial on the server: ask for the plan again once that's had time to land
    setTimeout(refreshAccess, 2500);
    setTimeout(refreshAccess, 7000);
  };

  const skip = (reason: SkipReason | null, note: string) => {
    void save({ action: "skip", reason, note });
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_SKIPPED, {
      reason,
      from: step,
    });
    dismiss();
  };

  const body = (() => {
    switch (step) {
      case "hook":
        return <HookStep onNext={() => setTakeoverStep(SHOW_EXPLAINER ? "explain" : "choose")} />;
      case "explain":
        return <ExplainStep onNext={() => setTakeoverStep("choose")} />;
      case "choose":
        return (
          <ChooseStep
            lookups={recent}
            onPick={(next) => {
              setFew(false);
              setTakeoverStep(next);
            }}
          />
        );
      case "recent":
        return (
          <RecentStep onAdd={add} onBack={() => setTakeoverStep("choose")} />
        );
      case "paste":
        return (
          <PasteStep
            onAdd={add}
            onBack={() => setTakeoverStep(few ? "handy" : "choose")}
            few={few}
          />
        );
      case "file":
        return (
          <FileStep onAdd={add} onBack={() => setTakeoverStep("choose")} />
        );
      case "handy":
        return (
          <HandyStep
            onBack={() => setTakeoverStep("choose")}
            onFew={() => {
              setFew(true);
              setTakeoverStep("paste");
              trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, {
                help: "few",
              });
            }}
            onRemind={() => {
              void save({ action: "skip", reason: "remind_me" });
              trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_SKIPPED, {
                reason: "remind_me",
                from: step,
              });
              toast.success(
                "We'll email you tomorrow with these steps. Your 14-day trial waits until you add your imports.",
                { duration: 6000 },
              );
              dismiss();
            }}
          />
        );
      case "finish":
        return (
          <FinishStep
            onClose={closeImportTakeover}
            onAdd={(products) => {
              closeImportTakeover();
              if (!products.length) return;
              const { added } = addProducts(products, "csv");
              trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_STEP, {
                step: "finish_tracked",
                imports: products.length,
              });
              toast.success(
                added === 0
                  ? "Those imports were already tracked."
                  : added === 1
                    ? "1 more import is now tracked."
                    : `${added.toLocaleString("en-US")} more imports are now tracked.`,
              );
              setTimeout(refreshAccess, 2500);
            }}
          />
        );
      case "done":
        return (
          <DoneStep
            keys={addedKeys}
            trialEndsAt={access.trialEndsAt}
            onOpen={() => {
              closeImportTakeover();
              nav.openTab("overview");
              // The tour, once, from the alerts on: the imports are in
              if (user?.id) openTourOnce(user.id, "imports_added", "alerts");
            }}
          />
        );
    }
  })();

  return (
    <div
      ref={scroller}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tt-onboarding-title"
      className={`${THEME} hts-tracker ${trackerSans.className} fixed inset-0 z-[70] overflow-y-auto bg-(--tt-ob-ground) text-base-content has-[:not([hidden])>[data-fit]]:overflow-hidden`}
    >
      {/* A step marked data-fit (the sheet) is held to the screen's height and scrolls inside */}
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-6 pb-16 lg:px-10 has-[:not([hidden])>[data-fit]]:h-full has-[:not([hidden])>[data-fit]]:pb-6">
        <header className="sticky top-0 z-10 -mx-6 flex items-center justify-between gap-6 bg-(--tt-ob-ground) px-6 py-5 lg:-mx-10 lg:px-10">
          <button
            type="button"
            onClick={() =>
              step !== "done" && step !== "finish" && setTakeoverStep("hook")
            }
            className="flex items-center gap-2.5 rounded-full pr-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
            title="Back to the start"
          >
            <span className="flex items-center rounded-full bg-base-content p-1">
              <Image src={logo} alt="" className="w-6" width={24} height={24} />
            </span>
            <span
              className={`${tt.display} whitespace-nowrap text-[0.95rem] font-semibold`}
            >
              Tariff Tracker
            </span>
          </button>
          {step !== "finish" && (
            <Rail step={step} onGo={go} canFinish={addedKeys.length > 0} />
          )}
          <span className="flex min-w-32 justify-end">
            {step === "finish" ? (
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-base-content/55 hover:bg-base-300/60 hover:text-base-content"
                onClick={closeImportTakeover}
              >
                Close
              </button>
            ) : !skipping && step !== "done" && (
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-base-content/55 hover:bg-base-300/60 hover:text-base-content"
                onClick={startSkip}
              >
                Skip setup
              </button>
            )}
          </span>
        </header>
        {skipping && (
          <div className="flex flex-1 flex-col justify-center py-8">
            <SkipStep
              onBack={backFromSkip}
              onSkip={skip}
            />
          </div>
        )}
        <div
          key={step}
          hidden={skipping}
          className="flex flex-1 flex-col justify-center py-8 has-[>[data-fit]]:min-h-0 has-[>[data-fit]]:py-2"
        >
          {body}
        </div>
      </div>
    </div>
  );
};
