"use client";

import Link from "next/link";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { estimateEmailBody } from "../lib/estimateEmail";
import { LINKS, contactLink, estimateUrl } from "../lib/links";
import { Billing, Estimate, TRACKER_MAX_LISTED_PAIRS, formatPrice } from "../lib/pricing";
import { BillingToggle } from "../plans/BillingToggle";
import { CopyLinkButton } from "./CopyLinkButton";

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
    <aside className={ui.card} aria-labelledby="estimate-summary-title">
      <div className="flex flex-col gap-3 border-b border-base-300 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 id="estimate-summary-title" className={ui.cardTitle}>
            Your estimate
          </h3>
          {!isEmpty && <CopyLinkButton query={query} />}
        </div>
        <BillingToggle billing={billing} onChange={onBillingChange} size="sm" />
      </div>

      {isEmpty ? (
        <p className={`${ui.bodySm} px-5 py-8 text-center`}>Turn on a product to see your price.</p>
      ) : (
        <ul className="divide-y divide-base-300" aria-live="polite">
          {est.lines.map((line) => (
            <li key={line.id} className="flex items-start justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-base-content">{line.label}</p>
                <p className={`${ui.caption} mt-0.5`}>{line.detail}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-base-content">
                {line.includedWith ? (
                  <span className="text-success">Included</span>
                ) : line.monthly === null ? (
                  <span className="text-primary">Let&apos;s talk</span>
                ) : (
                  formatPrice(line.monthly)
                )}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t border-base-300 px-5 py-5">
        <p className={ui.label}>Total per month</p>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className={ui.metric.primary} aria-live="polite">
            {formatPrice(est.monthly)}
          </span>
          {est.hasQuote && <span className={ui.bodySm}>+ custom</span>}
          {billing === "annual" && est.annualSavings > 0 && (
            <span className="text-sm tabular-nums text-base-content/60 line-through">
              <span className="sr-only">was </span>
              {formatPrice(est.listMonthly)}
            </span>
          )}
        </div>
        {!isEmpty &&
          (billing === "annual" ? (
            <p className={ui.caption}>
              {formatPrice(annualTotal)} billed yearly ·{" "}
              <span className="font-medium text-success">you save {formatPrice(est.annualSavings)} a year</span>
            </p>
          ) : (
            est.annualSavings > 0 && (
              <p className={ui.caption}>
                Billed monthly.{" "}
                <button type="button" className={ui.link} onClick={() => onBillingChange("annual")}>
                  Save {formatPrice(est.annualSavings)} a year with annual billing
                </button>
              </p>
            )
          ))}
      </div>

      {est.hasQuote && (
        <div className="px-5 pb-5">
          <div className={`${ui.notice("primary")} flex gap-2.5`}>
            <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className={ui.bodySm}>
              Tracking more than {TRACKER_MAX_LISTED_PAIRS} pairs is priced to your catalog. The total leaves it out.
            </p>
          </div>
        </div>
      )}

      <div className={`${ui.cardFooter} flex flex-col gap-2`}>
        {needsConversation ? (
          <a
            href={emailLink}
            className={`${ui.button({ variant: "primary", size: "lg" })} w-full`}
          >
            Talk to us about this plan
          </a>
        ) : (
          <>
            <Link
              href={LINKS.signUp}
              aria-disabled={isEmpty}
              className={`${ui.button({ variant: "primary", size: "lg" })} w-full ${isEmpty ? "pointer-events-none opacity-50" : ""}`}
            >
              Get started
            </Link>
            {!isEmpty && (
              <a href={emailLink} className={`${ui.button({ variant: "ghost" })} w-full`}>
                Email us this estimate
              </a>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
