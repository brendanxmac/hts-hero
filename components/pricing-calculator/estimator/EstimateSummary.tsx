"use client";

import Link from "next/link";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import { FREE_FOREVER_LINE } from "@/components/ui/marketing/comingSoon";
import { BillingSwitch } from "@/components/ui/marketing";
import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";
import { estimateEmailBody } from "../lib/estimateEmail";
import { LINKS, contactLink, estimateUrl } from "../lib/links";
import {
  Billing,
  Estimate,
  LAUNCH_PRICING,
  TRY_IT_FREE,
  TRACKER_MAX_LISTED_PAIRS,
  formatPerImport,
  formatPrice,
  launchPricingActive,
  trackerTierFor,
} from "../lib/pricing";
import { CopyLinkButton } from "./CopyLinkButton";

const ghostOnDark =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-5 text-base font-semibold text-base-content/70 transition-colors hover:bg-base-content/10 hover:text-base-content focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60";

// The running total beside the estimator: a line per product, the monthly total and what
// annual billing saves. While Tracker annual billing is off (MVP_TRIM.md), the Tracker line stays
// monthly: the billing switch shows only when another product can be billed yearly
export const EstimateSummary = ({
  est,
  billing,
  onBillingChange,
  query,
  pairs,
}: {
  est: Estimate;
  // The imports the Tracker covers, for its per-import price
  pairs: number;
  billing: Billing;
  onBillingChange: (billing: Billing) => void;
  query: string;
}) => {
  const isEmpty = est.lines.length === 0;
  // The Tracker line, when it's billed monthly whatever the switch says
  const monthlyTracker = TRACKER_ANNUAL_ENABLED ? undefined : est.lines.find((line) => line.id === "tracker");
  const canBillAnnually = TRACKER_ANNUAL_ENABLED || est.lines.some((line) => line.id !== "tracker");
  const annual = billing === "annual" && canBillAnnually;
  const annualTotal = (est.monthly - (monthlyTracker?.monthly ?? 0)) * 12;
  const needsConversation = est.lines.some((line) => line.viaSales);
  // Every new account starts the Tracker's 14-day trial (REVERSE_TRIAL), so a plan with it leads with the trial
  const hasTracker = est.lines.some((line) => line.id === "tracker");
  // What the Tracker plan comes to per import, per month (its price over the imports it covers)
  const trackerTier = trackerTierFor(pairs);
  const trackerPerImport = (monthly: number | null) =>
    trackerTier && monthly ? formatPerImport({ price: monthly, maxPairs: trackerTier.maxPairs }) : null;
  const emailLink = contactLink("My HTS Hero plan", estimateEmailBody(est, billing, estimateUrl(query)));

  return (
    <aside
      className="relative isolate overflow-hidden rounded-3xl hts-tracker-on-dark bg-base-200 text-base-content shadow-2xl shadow-black/25"
      aria-labelledby="estimate-summary-title"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(36rem_18rem_at_100%_0%,color-mix(in_oklab,var(--color-primary)_30%,transparent),transparent)]"
      />

      <div className="flex flex-col gap-4 px-6 pt-6 sm:px-7 sm:pt-7">
        <div className="flex items-center justify-between gap-3">
          <h3 id="estimate-summary-title" className="text-lg font-semibold text-base-content sm:text-xl">
            Your estimate
          </h3>
          {!isEmpty && <CopyLinkButton query={query} />}
        </div>
        {canBillAnnually && (
          <div>
            <BillingSwitch billing={billing} onChange={onBillingChange} size="sm" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 px-6 pb-6 pt-7 sm:px-7">
        <p className={mk.eyebrowDark}>Total per month</p>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-6xl font-extrabold tabular-nums tracking-tight text-base-content sm:text-7xl" aria-live="polite">
            {formatPrice(est.monthly)}
          </span>
          {est.hasQuote && <span className="text-base font-medium text-base-content/70">+ custom</span>}
          {annual && est.annualSavings > 0 && (
            <span className="text-lg tabular-nums text-base-content/50 line-through">
              <span className="sr-only">was </span>
              {formatPrice(est.listMonthly)}
            </span>
          )}
        </div>
        {!isEmpty &&
          (annual ? (
            <p className="text-sm tabular-nums text-base-content/70">
              {formatPrice(annualTotal)} billed yearly{monthlyTracker && ", Tariff Tracker billed monthly"} ·{" "}
              <span className="font-semibold text-success">you save {formatPrice(est.annualSavings)} a year</span>
            </p>
          ) : (
            est.annualSavings > 0 && (
              <p className="text-sm text-base-content/70">
                Billed monthly.{" "}
                <button
                  type="button"
                  className="rounded-sm font-semibold text-primary underline decoration-primary/40 decoration-2 underline-offset-4 tabular-nums hover:decoration-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60"
                  onClick={() => onBillingChange("annual")}
                >
                  Save {formatPrice(est.annualSavings)} a year with annual billing
                </button>
              </p>
            )
          ))}
      </div>

      {isEmpty ? (
        <p className="mx-6 border-t border-base-content/10 py-8 text-center text-base text-base-content/70 sm:mx-7">
          Turn on a product to see your price.
        </p>
      ) : (
        <ul className="mx-6 divide-y divide-base-content/10 border-y border-base-content/10 sm:mx-7" aria-live="polite">
          {est.lines.map((line) => (
            <li key={line.id} className="flex items-start justify-between gap-4 py-3.5">
              <div className="min-w-0">
                <p className="text-base font-semibold text-base-content">{line.label}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-base-content/50">{line.detail}</p>
              </div>
              <p className="shrink-0 text-base font-semibold tabular-nums text-base-content">
                {line.monthly === 0 ? (
                  <span className="text-success">Free</span>
                ) : line.monthly === null ? (
                  <span className="text-primary">Let&apos;s talk</span>
                ) : (
                  <>
                    {formatPrice(line.monthly)}
                    {line.id === "tracker" && trackerPerImport(line.monthly) && (
                      <span className="block text-right text-xs font-normal text-base-content/50">{trackerPerImport(line.monthly)}</span>
                    )}
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}

      {est.hasQuote && (
        <div className="px-6 pt-5 sm:px-7">
          <div className={`${mk.cardDark} flex gap-2.5 rounded-xl p-4`}>
            <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="text-sm leading-relaxed text-base-content/70">
              Covering more than {TRACKER_MAX_LISTED_PAIRS} imports is priced to your catalog. The total leaves it out.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 px-6 pb-6 pt-6 sm:px-7 sm:pb-7">
        {needsConversation ? (
          <a href={emailLink} className={`${mk.buttonOnDark} w-full`}>
            Talk to us about this plan
          </a>
        ) : (
          <>
            <Link
              href={LINKS.signUp}
              aria-disabled={isEmpty}
              className={`${mk.buttonOnDark} w-full ${isEmpty ? "pointer-events-none opacity-50" : ""}`}
            >
              {hasTracker ? TRY_IT_FREE : "Get started"}
            </Link>
            {hasTracker && (
              <p className="m-0 text-center text-xs leading-relaxed text-base-content/60">
                No credit card.{" "}
                {launchPricingActive()
                  ? `Subscribe before ${LAUNCH_PRICING.endsDay} and lock in launch pricing for as long as you stay subscribed.`
                  : FREE_FOREVER_LINE}
              </p>
            )}
            {!isEmpty && (
              <a href={emailLink} className={ghostOnDark}>
                Email us this estimate
              </a>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
