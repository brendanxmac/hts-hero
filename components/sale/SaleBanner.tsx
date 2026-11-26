"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { SALE, saleDaysLeft } from "@/libs/black-friday";
import { useSaleAudience } from "./useSale";

export const endsIn = () => {
  const days = saleDaysLeft();
  return days <= 1 ? "Ends tonight" : `Ends ${SALE.endsLabel} · ${days} days left`;
};

// The sale's bar, in place of the page's usual one (`fallback`) while the sale is on and the
// visitor isn't paying. Top of every marketing and HTS page (MarketingLayout), the blog, and inside
// Duty Guard (`inApp`: a rounded card over the section, the plans opening in place). The X hides it
// on this page only, like the usual bar.
export const SaleBanner = ({ fallback = null, serverLive = false, inApp = false }: { fallback?: ReactNode; serverLive?: boolean; inApp?: boolean }) => {
  const sale = useSaleAudience(serverLive);
  const pathname = usePathname();
  const [closedOn, setClosedOn] = useState<string | null>(null);

  if (!sale.show) return <>{fallback}</>;
  if (closedOn === pathname) return null;

  const click = () =>
    trackEvent(MixpanelEvent.SALE_CTA_CLICKED, { sale: SALE.id, placement: "banner", page: pathname, signed_in: sale.signedIn, plan_kind: sale.kind });
  const button = "inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-warning px-6 text-sm font-bold text-warning-content shadow-lg shadow-black/20 transition-transform hover:scale-[1.03]";
  const label = (
    <>
      Claim {SALE.percentOff}% Off <ArrowRightIcon className="h-4 w-4" aria-hidden />
    </>
  );

  return (
    <div
      className={`hts-tracker-on-dark relative overflow-hidden bg-[linear-gradient(100deg,#0b0b12_0%,#1c1030_55%,#3a1424_100%)] text-white scheme-dark ${inApp ? "mb-4 rounded-2xl pr-12" : "pr-12 sm:pr-14"}`}
    >
      <div className={`${inApp ? "px-5" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"} flex flex-col items-center justify-center gap-3 py-4 sm:flex-row sm:justify-between sm:gap-6 sm:py-5`}>
        <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-4 sm:text-left">
          <span className="shrink-0 rounded-full bg-warning px-3 py-1 text-xs font-black uppercase tracking-widest text-warning-content">{SALE.name}</span>
          <p className="m-0 text-base sm:text-lg">
            <span className="font-bold">{SALE.percentOff}% off a full year of Duty Guard.</span>{" "}
            <span className="text-white/75">Every annual plan, Essentials and Pro.</span>{" "}
            {/* Cached pages can be days old: the count is the browser's */}
            <span className="font-semibold text-warning" suppressHydrationWarning>{endsIn()}</span>
          </p>
        </div>
        {sale.openPlans ? (
          <button
            type="button"
            className={button}
            onClick={() => {
              click();
              sale.openPlans?.();
            }}
          >
            {label}
          </button>
        ) : (
          <Link href={sale.href} onClick={click} className={button}>
            {label}
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={() => setClosedOn(pathname)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:right-4"
      >
        <XMarkIcon className="h-5 w-5" aria-hidden />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  );
};
