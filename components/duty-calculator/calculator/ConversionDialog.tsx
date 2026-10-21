"use client";

import { ReactNode, useContext, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BanknotesIcon,
  BellAlertIcon,
  BoltIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentTextIcon,
  GlobeAmericasIcon,
  LightBulbIcon,
  NewspaperIcon,
  ReceiptRefundIcon,
  ShieldCheckIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import { useUser } from "@/contexts/UserContext";
import { REVERSE_TRIAL, TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { useOptionalTrackerAccess } from "@/components/tariff-tracker/access/accessContext";
import { featureTab, PremiumFeature } from "@/components/tariff-tracker/access/features";
import { sectionUrl } from "@/components/tariff-tracker/sections";
import { TrackerNavContext } from "@/components/tariff-tracker/shell/TrackerNav";
import { currentPath, signupHref } from "@/components/tariff-tracker/access/signup";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { AUDITS_ENABLED, SAVINGS_AUDITS_LABEL, SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";
import { AUTO_AUDITING, FREE_FOREVER_SHORT, SAVINGS_DETECTION } from "@/components/ui/marketing/comingSoon";
import { thisPageWith } from "../landing/redirect";

// The calculator's two sign-up pitches, as a dialog for signed-out visitors:
// - "account": everything a free account adds (PRICING.md), led by what they reached for (an
//   explanation of this import, a past date) when the host says
// - "trial": what the Tariff Tracker's 14-day reverse trial adds (REVERSE_TRIAL: every new account
//   gets it, no card; then no alerts on their own imports, TRIAL_ALLOWANCE.alertImports being 0, but
//   Tariff News alerts and sourcing insights free; AD/CVD checks are the trial's), led by the feature
//   they reached for (tracking, the qualification check, refunds, sourcing); "See everything else" steps over to the account view
// Each view's button runs the host's own action (where sign-up should come back to).
// useConversion opens it from anywhere, sending signed-in users the right way instead.

export type AccountBenefit = "why" | "legal" | "ruled-out" | "history" | "analysis" | "adcvd" | "alerts" | "impacts" | "savings" | "audits";

// What every free account gets (the AccountCta's "For every import" is analysis and alerts).
// Savings and audits are off for the Tracker MVP (features.ts), so their lines drop out
export const ACCOUNT_BENEFITS: { id: AccountBenefit; text: string }[] = ([
  { id: "why", text: "The plain-english 'why' behind every tariff on every import" },
  { id: "legal", text: "The legal text behind every tariff and exemption, with the notes it cites" },
  { id: "ruled-out", text: "Why other tariffs don't apply, so you know nothing was missed" },
  { id: "history", text: "Any import's full duty on any past date, line by line" },
  { id: "analysis", text: "Sourcing intelligence: any import's duty from every country of origin, as insights, a globe, a table and a chart" },
  { id: "adcvd", text: `AD/CVD checks free for ${REVERSE_TRIAL.days} days: whether an import may fall under an antidumping or countervailing duty case, and its rates` },
  {
    id: "alerts",
    text: `The Tariff Tracker free for ${REVERSE_TRIAL.days} days on up to ${REVERSE_TRIAL.imports} imports, with an alert when a tariff change hits one (before → after); then Tariff News alerts on every new US tariff action, free forever`,
  },
  { id: "impacts", text: "Impact checks: see exactly how any tariff action affects each import you track" },
  { id: "savings", text: `What you could save on ${TRIAL_ALLOWANCE.savingsChecks} imports: trade programs, exemptions and cheaper origins` },
  { id: "audits", text: `${TRIAL_ALLOWANCE.auditChecks} past entries checked for duty you may have overpaid` },
] as { id: AccountBenefit; text: string }[]).filter((b) => (b.id !== "savings" || SAVINGS_ENABLED) && (b.id !== "audits" || AUDITS_ENABLED));

// Each benefit as a selling point, for pitches without points of their own
const BENEFIT_POINTS: Record<AccountBenefit, SellingPoint> = {
  why: { icon: "why", title: "Why every tariff applies", body: "In plain English, with the legal text behind it." },
  legal: { icon: "legal", title: "The legal text on every line", body: "Every tariff and exemption, with the notes it cites." },
  "ruled-out": { icon: "shield", title: "Why the others don't apply", body: "So you know nothing was missed." },
  history: { icon: "clock", title: "Any date's duty", body: "Line by line, for any entry date, past or scheduled." },
  analysis: { icon: "globe", title: "Your duty from every country", body: "See where it could cost less to source it." },
  adcvd: { icon: "shield", title: "AD/CVD checks", body: `See if an import may fall under an antidumping or countervailing case, free for ${REVERSE_TRIAL.days} days.` },
  alerts: { icon: "bell", title: "Alerts the moment rates change", body: `The full Tracker free for ${REVERSE_TRIAL.days} days, on up to ${REVERSE_TRIAL.imports} imports.` },
  impacts: { icon: "bolt", title: "How each tariff action hits you", body: "See exactly which of your imports it touches." },
  savings: { icon: "money", title: "Ways to pay less", body: "Trade programs, exemptions and cheaper origins." },
  audits: { icon: "receipt", title: "Find what you overpaid", body: "Past entries checked against what you owed." },
};

const pointsFor = (account: AccountPitch): SellingPoint[] => {
  if (account.points?.length) return account.points.slice(0, 3);
  const ids = Array.from(new Set([account.highlight, "alerts", "why", "analysis"].filter(Boolean) as AccountBenefit[])).filter((id) =>
    ACCOUNT_BENEFITS.some((b) => b.id === id),
  );
  return ids.slice(0, 3).map((id) => BENEFIT_POINTS[id]);
};

const POINT_ICONS: Record<PointIcon, typeof BellAlertIcon> = {
  bell: BellAlertIcon,
  sparkles: SparklesIcon,
  news: NewspaperIcon,
  why: LightBulbIcon,
  legal: DocumentTextIcon,
  shield: ShieldCheckIcon,
  clock: ClockIcon,
  globe: GlobeAmericasIcon,
  bolt: BoltIcon,
  money: BanknotesIcon,
  receipt: ReceiptRefundIcon,
};

export type ConversionView = "account" | "trial";

// The icons a selling point can lead with
export type PointIcon = "bell" | "sparkles" | "news" | "why" | "legal" | "shield" | "clock" | "globe" | "bolt" | "money" | "receipt";

// One of the three selling points the account view leads with
export interface SellingPoint {
  icon: PointIcon;
  title: string;
  body: string;
}

// What the account view leads with
export type AccountPitch = {
  title: string;
  // The benefit they reached for: its point leads (when the pitch has no points of its own)
  highlight?: AccountBenefit;
  // Three selling points, in this import's own numbers (otherwise from the highlight)
  points?: SellingPoint[];
  // Just this sentence in place of the points: the short pitch
  body?: string;
  // Why not to wait, from the import's own data (a scheduled change, how often it moved): amber,
  // under the title. Only ever real facts
  urgency?: string;
  // Hides the host's note under the button (the points already say it all)
  hideNote?: boolean;
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
  subtitle: `Try the Tariff Tracker free for ${REVERSE_TRIAL.days} days: everything, on up to ${REVERSE_TRIAL.imports} imports. Get an alert the moment a tariff change hits one, and see exactly how any tariff action affects each.`,
};

// What every new account's 14-day trial includes, for the trial view's list (PRICING.md). The Tracker MVP
// (features.ts) sells tracking only; the savings and audit list comes back with them
const TRIAL_INCLUDES = SAVINGS_ENABLED || AUDITS_ENABLED ? [
  `Savings checks on ${TRIAL_ALLOWANCE.savingsChecks} imports: trade programs, cheaper origins and what you could qualify for`,
  `${TRIAL_ALLOWANCE.auditChecks} audit checks: what you paid on past entries against what you owed`,
  `Alerts when a tariff change hits up to ${REVERSE_TRIAL.imports} of your imports`,
  "Rate history, sourcing and insights across your whole catalog",
] : [
  `Track up to ${REVERSE_TRIAL.imports} imports, with every tariff on each one`,
  "An alert when a tariff change hits one of them: the rate before and after, AD/CVD alerts included",
  "Impact checks and Insights: see exactly how any tariff action affects each import",
  "Tariff News, rate history, and every tariff exported to CSV or Excel",
  `After ${REVERSE_TRIAL.days} days, ${FREE_FOREVER_SHORT} stay free, forever`,
];

// The free account's pitch, built to convert: the headline (this import's own when the host has
// one), any real reason not to wait, three selling points, then one big button with what it costs (nothing: under 30 seconds, no credit card).
// Everything else a free account includes is a click away, not in the way.
const AccountView = ({
  account,
  fromTrial,
  onBack,
  accountNote,
  onCreateAccount,
}: {
  account: AccountPitch;
  fromTrial: boolean;
  onBack: () => void;
  accountNote: string;
  onCreateAccount: () => void;
}) => {
  const [more, setMore] = useState(false);
  const points = pointsFor(account);
  return (
    <div className="flex flex-col gap-5">
      {/* A soft brand wash behind the headline */}
      <div className="-mx-6 -mt-6 flex flex-col gap-3 rounded-t-[inherit] bg-linear-to-b from-primary/10 to-transparent px-6 pb-1 pt-6 sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7">
        {fromTrial && (
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1 self-start text-xs font-medium text-base-content/60 hover:text-base-content">
            <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
            Back to the Tariff Tracker
          </button>
        )}
        <p className={`${tt.eyebrow("primary")} pr-8`}>Create Free Account</p>
        <Dialog.Title className={`${tt.display} text-[1.6rem] font-semibold leading-tight text-base-content`}>{account.title}</Dialog.Title>
        {account.urgency && (
          <p className="m-0 flex items-start gap-2 rounded-xl bg-warning/10 px-3 py-2 text-sm font-medium text-base-content">
            <span className="relative mt-1.5 flex h-2 w-2 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
            </span>
            {account.urgency}
          </p>
        )}
      </div>

      {account.body ? (
        <p className="-mt-2 text-base leading-relaxed text-base-content/80">{account.body}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {points.map((p) => {
            const Icon = POINT_ICONS[p.icon];
            return (
              <li key={p.title} className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] font-semibold text-base-content">{p.title}</span>
                  <span className="block text-sm text-base-content/70">{p.body}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2.5">
        <button type="button" className={`${ui.button({ variant: "primary" })} h-12 w-full text-base`} onClick={onCreateAccount}>
          {account.cta}
          <ArrowRightIcon className="h-5 w-5" aria-hidden />
        </button>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium text-base-content/70">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5 text-success" aria-hidden />
            Under 30 seconds
          </span>
          <span className="inline-flex items-center gap-1">
            <CreditCardIcon className="h-3.5 w-3.5 text-success" aria-hidden />
            No credit card
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckIcon className="h-3.5 w-3.5 text-success" aria-hidden />
            {REVERSE_TRIAL.days} days of the full Tracker
          </span>
        </div>
        {!account.hideNote && accountNote && <p className="m-0 text-center text-xs text-base-content/60">{accountNote}</p>}
      </div>

      <div className="border-t border-base-300 pt-3">
        <button
          type="button"
          onClick={() => setMore(!more)}
          aria-expanded={more}
          className="mx-auto flex items-center gap-1 text-xs font-medium text-base-content/60 hover:text-base-content"
        >
          Everything a free account includes
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${more ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {more && (
          <ul className="mt-3 flex flex-col gap-1.5">
            {ACCOUNT_BENEFITS.map((b) => (
              <li key={b.id} className="flex items-start gap-2 text-sm text-base-content/80">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {b.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

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

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative w-full max-w-xl p-6 sm:p-7`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          {view === "trial" ? (
            <div className="flex flex-col gap-5">
              <div className="pr-8">
                <p className={tt.eyebrow("success")}>{trial.eyebrow ?? `Tariff Tracker · Free for ${REVERSE_TRIAL.days} days`}</p>
                <Dialog.Title className={`${tt.display} mt-2 text-2xl font-semibold leading-tight text-base-content`}>{trial.title}</Dialog.Title>
                <p className={`${tt.subtitle} mt-2`}>{trial.subtitle}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-base-content/60">Free for {REVERSE_TRIAL.days} days from your first imports, with every new account:</p>
                <ul className="flex flex-col gap-2.5">
                  {TRIAL_INCLUDES.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-base-content">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                      {item}
                    </li>
                  ))}
                  {/* Not live yet (features.ts): labeled, part of the trial when they launch */}
                  {!SAVINGS_ENABLED && !AUDITS_ENABLED && (
                    <li className="flex items-start gap-2.5 text-sm text-base-content">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                      <span>
                        {SAVINGS_DETECTION.name} and {AUTO_AUDITING.name.toLowerCase()}, included when they launch{" "}
                        <span className={tt.chip("warning")}>{SAVINGS_AUDITS_LABEL}</span>
                      </span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" className={`${ui.button({ variant: "primary" })} h-12 w-full text-base`} onClick={onStartTrial}>
                  {trial.cta ?? `Start your free ${REVERSE_TRIAL.days}-day trial`}
                </button>
                <p className="text-center text-xs text-base-content/60">
                  No credit card, nothing to cancel. A free account takes less than 30 seconds.
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
            <AccountView
              account={initialView === "trial" ? DEFAULT_ACCOUNT : account}
              fromTrial={initialView === "trial"}
              onBack={() => setView("trial")}
              accountNote={accountNote}
              onCreateAccount={onCreateAccount}
            />
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
