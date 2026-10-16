"use client";

import { Dialog } from "@headlessui/react";
import { ArrowRightIcon, BellSlashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import { formatPrice, LAUNCH_PRICING, launchPricingActive } from "@/components/pricing-calculator/lib/pricing";
import { TRACKER_PLANS, TrackerAccess } from "@/libs/tariff-tracker/plan";
import { useCatalog } from "../catalogStore";
import { BENEFITS } from "./UpgradeDialog";
import { useUpgradeStats } from "./upgradeStats";

// Before the plans: turning alerts on for one more import than the plan allows. Says the limit is
// reached and what it's costing (imports nobody is watching), then sells the plan that would cover
// all of them by what it costs per import, and leads to the plans. Portals out of the Tracker, so
// it carries the Tracker's look itself (DESIGN_SYSTEM §15).
export const LimitDialog = ({
  open,
  access,
  onSeePlans,
  onClose,
}: {
  open: boolean;
  access: TrackerAccess;
  onSeePlans: () => void;
  onClose: () => void;
}) => {
  const { items } = useCatalog();
  const stats = useUpgradeStats();
  const n = (count: number) => count.toLocaleString("en-US");
  const imports = stats?.imports ?? items.length;
  const off = Math.max(0, imports - (stats?.tracked ?? access.pairLimit));
  // The plan that would cover every import, and what that comes to per import
  const fits = TRACKER_PLANS.find((p) => imports <= p.maxPairs && p.maxPairs > access.pairLimit);
  const perImport = fits ? Math.round((fits.price / fits.maxPairs) * 100) / 100 : null;
  const launch = launchPricingActive();
  const paid = access.kind === "paid";

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-y-auto p-6 shadow-2xl sm:p-7`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/50 hover:bg-tt-soft hover:text-base-content"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error" aria-hidden>
              <BellSlashIcon className="h-6 w-6" />
            </span>
            <div className="flex flex-col gap-2">
              <span className={tt.eyebrow("error")}>Alert Limit Reached</span>
              <Dialog.Title className={`${tt.display} m-0 pr-6 text-2xl font-semibold leading-tight text-base-content`}>
                {paid ? `All ${n(access.pairLimit)} alert slots on your plan are in use` : `You've used all ${n(access.pairLimit)} free alert slots`}
              </Dialog.Title>
              <p className="m-0 text-sm leading-relaxed text-base-content/70">
                {off > 0 ? (
                  <>
                    <span className="font-semibold text-error">
                      {n(off)} of your {n(imports)} imports {off === 1 ? "has" : "have"} alerts off
                    </span>
                    , so if a new tariff hits {off === 1 ? "it" : "one of them"}, you won&apos;t hear about it until it shows up on your customs bill.
                  </>
                ) : (
                  "To turn alerts on for another import, upgrade or turn alerts off for one you're watching."
                )}
              </p>
            </div>

            {/* The plan that covers everything, by what it costs per import */}
            {fits && perImport !== null ? (
              <div className="flex flex-col gap-2 rounded-xl border border-primary/30 bg-primary/[0.05] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={tt.eyebrow("primary")}>Get alerts on all {n(imports)} imports</span>
                  {launch && <span className={tt.chip("success")}>Launch price · ends {LAUNCH_PRICING.endsDay}</span>}
                </div>
                <p className="m-0 flex flex-wrap items-baseline gap-x-2">
                  <span className={tt.metric}>{formatPrice(perImport)}</span>
                  <span className="text-sm text-base-content/70">per import, per month</span>
                </p>
                <span className="text-sm text-base-content/70">
                  Tracker {n(fits.maxPairs)}: {formatPrice(fits.price)}/mo for up to {n(fits.maxPairs)} imports
                  {launch ? ", locked in for as long as you stay subscribed" : ""}.
                </span>
              </div>
            ) : (
              <div className={`${tt.tile} p-4 text-sm text-base-content/70`}>
                More than {n(TRACKER_PLANS[TRACKER_PLANS.length - 1].maxPairs)} imports? We&apos;ll build a plan around your catalog.
              </div>
            )}

            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {BENEFITS.slice(0, 4).map(({ title }) => (
                <li key={title} className="flex items-center gap-2.5 text-sm text-base-content/80">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success" aria-hidden>
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {title}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2">
              <button type="button" className={`${ui.button({ variant: "primary" })} w-full`} onClick={onSeePlans}>
                {fits ? `Get alerts on all ${n(imports)} imports` : "See plans"}
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" className="text-sm font-semibold text-base-content/60 hover:text-base-content" onClick={onClose}>
                Not now, I&apos;ll turn alerts off for another import
              </button>
            </div>
            <p className="m-0 text-center text-xs text-base-content/50">Cancel anytime. No contract. Your catalog stays free.</p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
