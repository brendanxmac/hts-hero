"use client";

import Link from "next/link";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import { BillingSwitch } from "@/components/ui/marketing";
import { estimateEmailBody } from "../lib/estimateEmail";
import { LINKS, contactLink, estimateUrl } from "../lib/links";
import { Billing, Estimate, TRACKER_MAX_LISTED_PAIRS, formatPrice } from "../lib/pricing";
import { CopyLinkButton } from "./CopyLinkButton";

const ghostOnDark =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-5 text-base font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60";

// The running total beside the estimator: a line per product, the monthly total and what
// annual billing saves
export const EstimateSummary = ({
  est,
  billing,
  onBillingChange,
  query,
}: {
  est: Estimate;
  billing: Billing;
  onBillingChange: (billing: Billing) => void;
  query: string;
}) => {
  const isEmpty = est.lines.length === 0;
  const annualTotal = est.monthly * 12;
  const needsConversation = est.lines.some((line) => line.viaSales);
  const emailLink = contactLink("My HTS Hero plan", estimateEmailBody(est, billing, estimateUrl(query)));

  return (
    <aside
      className="relative isolate overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl shadow-slate-900/25"
      aria-labelledby="estimate-summary-title"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(36rem_18rem_at_100%_0%,rgba(45,212,191,0.25),transparent)]"
      />

      <div className="flex flex-col gap-4 px-6 pt-6 sm:px-7 sm:pt-7">
        <div className="flex items-center justify-between gap-3">
          <h3 id="estimate-summary-title" className="text-lg font-semibold text-white sm:text-xl">
            Your estimate
          </h3>
          {!isEmpty && <CopyLinkButton query={query} />}
        </div>
        <div>
          <BillingSwitch billing={billing} onChange={onBillingChange} size="sm" />
        </div>
      </div>

      <div className="flex flex-col gap-2 px-6 pb-6 pt-7 sm:px-7">
        <p className={mk.eyebrowDark}>Total per month</p>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-6xl font-extrabold tabular-nums tracking-tight text-white sm:text-7xl" aria-live="polite">
            {formatPrice(est.monthly)}
          </span>
          {est.hasQuote && <span className="text-base font-medium text-slate-300">+ custom</span>}
          {billing === "annual" && est.annualSavings > 0 && (
            <span className="text-lg tabular-nums text-slate-400 line-through">
              <span className="sr-only">was </span>
              {formatPrice(est.listMonthly)}
            </span>
          )}
        </div>
        {!isEmpty &&
          (billing === "annual" ? (
            <p className="text-sm tabular-nums text-slate-300">
              {formatPrice(annualTotal)} billed yearly ·{" "}
              <span className="font-semibold text-emerald-400">you save {formatPrice(est.annualSavings)} a year</span>
            </p>
          ) : (
            est.annualSavings > 0 && (
              <p className="text-sm text-slate-300">
                Billed monthly.{" "}
                <button
                  type="button"
                  className="rounded font-semibold text-teal-300 underline decoration-teal-300/40 decoration-2 underline-offset-4 tabular-nums hover:decoration-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60"
                  onClick={() => onBillingChange("annual")}
                >
                  Save {formatPrice(est.annualSavings)} a year with annual billing
                </button>
              </p>
            )
          ))}
      </div>

      {isEmpty ? (
        <p className="mx-6 border-t border-white/10 py-8 text-center text-base text-slate-300 sm:mx-7">
          Turn on a product to see your price.
        </p>
      ) : (
        <ul className="mx-6 divide-y divide-white/10 border-y border-white/10 sm:mx-7" aria-live="polite">
          {est.lines.map((line) => (
            <li key={line.id} className="flex items-start justify-between gap-4 py-3.5">
              <div className="min-w-0">
                <p className="text-base font-semibold text-white">{line.label}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{line.detail}</p>
              </div>
              <p className="shrink-0 text-base font-semibold tabular-nums text-white">
                {line.monthly === 0 ? (
                  <span className="text-emerald-400">Free</span>
                ) : line.monthly === null ? (
                  <span className="text-teal-300">Let&apos;s talk</span>
                ) : (
                  formatPrice(line.monthly)
                )}
              </p>
            </li>
          ))}
        </ul>
      )}

      {est.hasQuote && (
        <div className="px-6 pt-5 sm:px-7">
          <div className={`${mk.cardDark} flex gap-2.5 rounded-xl p-4`}>
            <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden />
            <p className="text-sm leading-relaxed text-slate-300">
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
              Get started
            </Link>
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
