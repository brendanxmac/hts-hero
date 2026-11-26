"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRightIcon, CheckIcon, ClockIcon, ShieldCheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Dialog } from "@/components/ui/Dialog";
import { THEME } from "@/components/ui/theme";
import { trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { ALERT_TIERS, AUDIT_TIERS, formatPrice } from "@/components/pricing-calculator/lib/pricing";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { SALE, saleAnnual } from "@/libs/black-friday";
import { SALE_PAGE, useSaleAudience } from "./useSale";
import { endsIn } from "./SaleBanner";

// Once a day per browser, while the sale is on
const seenKey = () => `sale-popup-${SALE.id}-${new Date().toISOString().slice(0, 10)}`;
const seen = () => {
  try {
    return window.localStorage.getItem(seenKey()) === "1";
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    window.localStorage.setItem(seenKey(), "1");
  } catch {
    // Private mode: it may show again
  }
};

// Never over another dialog (Duty Guard's import flow, its tour, the trial dialog): wait for it to close
const anotherDialogOpen = () => !!document.querySelector('[role="dialog"]');

const OFFERS = [
  {
    name: "Duty Guard Essentials",
    from: saleAnnual(ALERT_TIERS[0].price),
    points: ["Alerts the moment a tariff change hits your imports", "Exactly how each import is affected, rate before → after"],
  },
  {
    name: "Duty Guard Pro",
    from: saleAnnual(AUDIT_TIERS[0].price),
    points: ["Everything in Essentials", "Entry audits and savings detection on every import"],
  },
];

// The sale's big popup: a moment after landing on a marketing, HTS or blog page, or in Duty Guard,
// once a day, never to a paying account
export const SalePopup = ({ serverLive = false }: { serverLive?: boolean }) => {
  const sale = useSaleAudience(serverLive);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Not on the sale's own page, where it leads
    if (!sale.ready || seen() || pathname === SALE_PAGE) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const attempt = () => {
      if (seen()) return;
      if (anotherDialogOpen()) {
        if (tries++ < 20) timer = setTimeout(attempt, 3000);
        return;
      }
      markSeen();
      setOpen(true);
      trackEvent(MixpanelEvent.SALE_POPUP_SHOWN, { sale: SALE.id, page: pathname, signed_in: sale.signedIn, plan_kind: sale.kind });
    };
    // After the page settles, not over its first paint
    timer = setTimeout(attempt, 2500);
    return () => clearTimeout(timer);
  }, [sale.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = () => {
    trackEvent(MixpanelEvent.SALE_POPUP_DISMISSED, { sale: SALE.id, page: pathname, signed_in: sale.signedIn, plan_kind: sale.kind });
    setOpen(false);
  };
  const claim = () => {
    trackEvent(MixpanelEvent.SALE_CTA_CLICKED, { sale: SALE.id, placement: "popup", page: pathname, signed_in: sale.signedIn, plan_kind: sale.kind, destination: sale.openPlans ? "plans_dialog" : "sale_page" });
    setOpen(false);
    sale.openPlans?.();
  };
  const button = "group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-warning text-lg font-bold text-warning-content shadow-xl shadow-warning/25 transition-transform hover:scale-[1.02]";
  const label = (
    <>
      Claim {SALE.percentOff}% Off <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </>
  );

  return (
    <Dialog open={open} onClose={dismiss} className="relative z-[60]">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={`${THEME} hts-tracker ${trackerSans.className} hts-tracker-on-dark relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl bg-[linear-gradient(150deg,#0b0b12_0%,#1c1030_55%,#3a1424_100%)] text-white shadow-2xl ring-1 ring-white/10 scheme-dark`}
        >
          <button type="button" onClick={dismiss} className="absolute right-4 top-4 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white">
            <XMarkIcon className="h-6 w-6" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col items-center gap-6 px-6 pb-8 pt-10 text-center sm:px-12 sm:pb-10 sm:pt-12">
            <span className="rounded-full bg-warning px-4 py-1.5 text-sm font-black uppercase tracking-[0.2em] text-warning-content">{SALE.name} Sale</span>
            <Dialog.Title className={`${tt.display} m-0 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl`}>
              <span className="text-warning">{SALE.percentOff}% Off</span>
              <br />
              Duty Guard
            </Dialog.Title>
            <p className="m-0 max-w-xl text-lg leading-relaxed text-white/75">
              Every annual plan, Essentials and Pro, any size. One week only.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-warning" suppressHydrationWarning>
              <ClockIcon className="h-4 w-4" aria-hidden /> {endsIn()}
            </span>

            <div className="grid w-full gap-4 text-left sm:grid-cols-2">
              {OFFERS.map((o) => (
                <div key={o.name} className="flex flex-col gap-3 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/15">
                  <span className="text-sm font-bold uppercase tracking-wider text-white/60">{o.name}</span>
                  <p className="m-0 flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm text-white/60">from</span>
                    <span className="text-lg text-white/50 line-through">{formatPrice(o.from.usual)}</span>
                    <span className={`${tt.display} text-4xl font-bold text-white`}>{formatPrice(o.from.sale)}</span>
                    <span className="text-sm text-white/60">/ mo</span>
                  </p>
                  <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                    {o.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-white/80">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex w-full max-w-md flex-col gap-3">
              {sale.openPlans ? (
                <button type="button" className={button} onClick={claim}>
                  {label}
                </button>
              ) : (
                <Link href={sale.pageHref("popup")} className={button} onClick={claim}>
                  {label}
                </Link>
              )}
              <button type="button" onClick={dismiss} className="text-sm font-semibold text-white/55 hover:text-white">
                Maybe later
              </button>
            </div>

            <p className="m-0 flex flex-wrap items-center justify-center gap-x-1.5 text-xs text-white/55">
              <ShieldCheckIcon className="h-4 w-4 text-success" aria-hidden />
              30-day money-back guarantee. Billed yearly; {SALE.percentOff}% off your first year, then the regular annual price. Cancel anytime.
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
