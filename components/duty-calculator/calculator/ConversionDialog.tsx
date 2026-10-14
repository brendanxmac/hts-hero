"use client";

import { ReactNode, useContext, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { ArrowLeftIcon, CheckIcon, LockClosedIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import { useUser } from "@/contexts/UserContext";
import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { useOptionalTrackerAccess } from "@/components/tariff-tracker/access/accessContext";
import { featureTab, PremiumFeature } from "@/components/tariff-tracker/access/features";
import { sectionUrl } from "@/components/tariff-tracker/sections";
import { TrackerNavContext } from "@/components/tariff-tracker/shell/TrackerNav";
import { currentPath, signupHref } from "@/components/tariff-tracker/access/signup";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { thisPageWith } from "../landing/redirect";

// The calculator's two sign-up pitches, as a dialog for signed-out visitors:
// - "account": everything a free account adds (PRICING.md), led by what they reached for (an
//   explanation of this import, a past date) when the host says
// - "trial": what the Tariff Tracker's usage-based trial adds (every account gets it, with no time
//   limit), led by the feature they reached for (tracking, the qualification check, refunds,
//   sourcing); "See everything else" steps over to the account view
// Each view's button runs the host's own action (where sign-up should come back to).
// useConversion opens it from anywhere, sending signed-in users the right way instead.

export type AccountBenefit = "why" | "legal" | "ruled-out" | "history" | "analysis" | "alerts";

// What every free account gets (the AccountCta's "For every import" is analysis and alerts)
export const ACCOUNT_BENEFITS: { id: AccountBenefit; text: string }[] = [
  { id: "why", text: "The plain-english 'why' behind every tariff on every import" },
  { id: "legal", text: "The legal text behind every tariff and exemption, with the notes it cites" },
  { id: "ruled-out", text: "Why other tariffs don't apply, so you know nothing was missed" },
  { id: "history", text: "Any import's full duty on any past date, line by line" },
  { id: "analysis", text: "Any import's duty from every country of origin" },
  { id: "alerts", text: `Alerts when tariffs change on up to ${TRIAL_ALLOWANCE.alertImports} imports` },
];

export type ConversionView = "account" | "trial";

// What the account view leads with
export type AccountPitch = {
  title: string;
  // The benefit they reached for, picked out and first
  highlight?: AccountBenefit;
  // What the account would answer about this import, above the list of benefits
  thisImport?: string[];
  // Just this sentence in place of the lists: the short pitch
  body?: string;
  cta: string;
};

// What the trial view leads with
export type TrialPitch = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  cta?: string;
};

const DEFAULT_ACCOUNT: AccountPitch = { title: "Understand every import, free", cta: "Create my free account" };
const DEFAULT_TRIAL: TrialPitch = {
  title: "Know the moment a tariff change hits this import",
  subtitle: "Upload your whole catalog, get alerts on your top imports, and find every way you could pay less duty on them.",
};

// What every account's trial includes, for the trial view's list (PRICING.md)
const TRIAL_INCLUDES = [
  `Savings checks on ${TRIAL_ALLOWANCE.savingsChecks} imports: trade programs, cheaper origins and what you could qualify for`,
  `${TRIAL_ALLOWANCE.auditChecks} audit checks: what you paid on past entries against what you owed`,
  `Alerts when a tariff change hits up to ${TRIAL_ALLOWANCE.alertImports} of your imports`,
  "Rate history, sourcing and insights across your whole catalog",
];

export const ConversionDialog = ({
  open,
  view: initialView,
  account = DEFAULT_ACCOUNT,
  trial = DEFAULT_TRIAL,
  accountNote = "You come right back to this import.",
  onClose,
  onCreateAccount,
  onStartTrial,
  page,
}: {
  open: boolean;
  view: ConversionView;
  account?: AccountPitch;
  trial?: TrialPitch;
  // Under the account button: where sign-up lands them
  accountNote?: string;
  onClose: () => void;
  onCreateAccount: () => void;
  onStartTrial?: () => void;
  page: string;
}) => {
  const [view, setView] = useState(initialView);
  useEffect(() => {
    if (open) setView(initialView);
  }, [open, initialView]);

  const stepDown = () => {
    setView("account");
    trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "trial-dialog", reason: "not-ready", page });
  };
  const benefits = [...ACCOUNT_BENEFITS].sort((a, b) => Number(b.id === account.highlight) - Number(a.id === account.highlight));

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative w-full max-w-xl p-6 sm:p-7`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/50 hover:bg-tt-soft hover:text-base-content"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          {view === "trial" ? (
            <div className="flex flex-col gap-5">
              <div className="pr-8">
                <p className={tt.eyebrow("success")}>{trial.eyebrow ?? "Tariff Tracker · Free trial"}</p>
                <Dialog.Title className={`${tt.display} mt-2 text-2xl font-semibold leading-tight text-base-content`}>{trial.title}</Dialog.Title>
                <p className={`${tt.subtitle} mt-2`}>{trial.subtitle}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-base-content/60">Free with every account:</p>
                <ul className="flex flex-col gap-2.5">
                  {TRIAL_INCLUDES.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-base-content">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" className={`${tt.button("money", "md", "rounded")} h-12 w-full text-base`} onClick={onStartTrial}>
                  {trial.cta ?? "Start free"}
                </button>
                <p className="text-center text-xs text-base-content/60">
                  No credit card, no time limit. Your free account (less than 30 seconds) comes with the trial.
                </p>
              </div>
              <button
                type="button"
                onClick={stepDown}
                className="self-center text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                See everything else a free account gets you
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="pr-8">
                {initialView === "trial" && (
                  <button
                    type="button"
                    onClick={() => setView("trial")}
                    className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-base-content/60 hover:text-base-content"
                  >
                    <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
                    Back to the trial
                  </button>
                )}
                <p className={tt.eyebrow("primary")}>Create Free account</p>
                <Dialog.Title className={`${tt.display} mt-2 text-2xl font-semibold leading-tight text-base-content`}>
                  {initialView === "trial" ? DEFAULT_ACCOUNT.title : account.title}
                </Dialog.Title>
              </div>
              {initialView !== "trial" && account.body ? (
                <p className="-mt-2 text-base leading-relaxed text-base-content/80">{account.body}</p>
              ) : (
                <>
                  {initialView !== "trial" && account.thisImport && account.thisImport.length > 0 && (
                    <div className="flex flex-col gap-2 rounded-2xl bg-primary/5 px-4 py-3.5 ring-1 ring-primary/20">
                      <p className="text-xs font-semibold text-primary">Your free account answers, for this import:</p>
                      <ul className="flex flex-col gap-1.5">
                        {account.thisImport.map((q) => (
                          <li key={q} className="flex items-start gap-2 text-sm text-base-content">
                            <LockClosedIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-base-content/60">
                      {account.thisImport?.length && initialView !== "trial" ? "Plus, on every import:" : "Create a free account and you get:"}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {benefits.map((b) => {
                        // Picked out only when nothing about this import leads the dialog
                        const picked = initialView !== "trial" && !account.thisImport?.length && b.id === account.highlight;
                        return (
                          <li
                            key={b.id}
                            className={`flex items-start gap-2.5 rounded-xl px-3 py-1.5 text-sm ${picked ? "bg-primary/10 font-semibold text-base-content ring-1 ring-primary/30" : "text-base-content"}`}
                          >
                            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                            <span className="flex-1">{b.text}</span>
                            {picked && <span className={tt.chip("primary")}>What you clicked</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
              <div className="flex flex-col gap-2">
                <button type="button" className={`${tt.button("next", "md", "rounded")} h-12 w-full text-base`} onClick={onCreateAccount}>
                  {initialView === "trial" ? DEFAULT_ACCOUNT.cta : account.cta}
                </button>
                <p className="text-center text-xs text-base-content/60">
                  {initialView !== "trial" && account.body ? "" : "Less than 30 seconds. "}No credit card. {accountNote}
                </p>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

// Opens the pitches from any button on the calculator. Signed out, the dialog; signed in, the
// account (and with it the trial) is already there, so the feature's Tracker tab opens, where its
// checks are spent. Sign-up from the trial view comes back with `trial=<feature>`, which the
// Tracker welcomes.
export const useConversion = (page: string) => {
  const { user } = useUser();
  const access = useOptionalTrackerAccess();
  const nav = useContext(TrackerNavContext);
  const [state, setState] = useState<{
    open: boolean;
    view: ConversionView;
    account?: AccountPitch;
    trial?: TrialPitch;
    feature: PremiumFeature;
  }>({ open: false, view: "account", feature: "tracking" });

  const openAccount = (account: AccountPitch, source: string) => {
    trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: source, reason: "account", page });
    setState({ open: true, view: "account", account, feature: "tracking" });
  };
  const openTrial = (feature: PremiumFeature, trial: TrialPitch) => {
    trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature, reason: access?.access.kind ?? (user ? "signed-in" : "anonymous"), page });
    if (access?.signedIn && nav) nav.openTab(featureTab(feature));
    else if (user) window.location.href = sectionUrl(featureTab(feature));
    else setState({ open: true, view: "trial", trial, feature });
  };

  const dialog: ReactNode = (
    <ConversionDialog
      open={state.open}
      view={state.view}
      account={state.account}
      trial={state.trial}
      onClose={() => setState((s) => ({ ...s, open: false }))}
      onCreateAccount={() => (window.location.href = signupHref(currentPath()))}
      onStartTrial={() => (window.location.href = signupHref(thisPageWith({ trial: state.feature })))}
      page={page}
    />
  );
  return { signedIn: Boolean(user), dialog, openAccount, openTrial };
};
