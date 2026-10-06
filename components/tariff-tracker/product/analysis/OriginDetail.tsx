"use client";

import { ArrowTopRightOnSquareIcon, CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { calculatorUrl } from "@/components/duty-calculator/lib/estimate";
import { formatMoney } from "@/components/duty-calculator/lib/format";
import * as ui from "@/components/ui/styles";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { itemKey } from "../../catalog";
import { addToCatalog, useCatalog } from "../../catalogStore";
import { formatRate } from "../../formatRate";
import { BASE_PART, shortProgram, TrackedProduct } from "../../report";
import { TRACKER_PATH } from "../../sections";
import { useTrackerNav } from "../../shell/TrackerNav";
import { OriginRate, partsOf, RateBasis, rateOf } from "./analysis";

// A selected origin next to the product's own: the difference in rate and dollars, its tariffs,
// and one click to add it to the catalog (with the same shipment) or try it in the calculator

export const OriginDetail = ({
  product,
  origin,
  yours,
  basis,
  onClose,
}: {
  product: TrackedProduct;
  origin: OriginRate;
  yours: OriginRate | undefined;
  basis: RateBasis;
  onClose: () => void;
}) => {
  const nav = useTrackerNav();
  const { items } = useCatalog();
  const pct = rateOf(origin, basis);
  const yourPct = yours ? rateOf(yours, basis) : product.totalPct;
  const diff = pct - yourPct;
  const dollars = Math.abs((diff / 100) * product.customsValue);
  const key = itemKey({ code: htsCodeDigitsOnly(product.entry.element.htsno), country: origin.country.code });
  const inCatalog = items.some((i) => itemKey(i) === key);
  const claimed = basis === "agreements" && origin.agreement;

  const add = () => {
    const { transportMode, customsValue, quantity } = product.adjustments;
    addToCatalog([
      {
        code: htsCodeDigitsOnly(product.entry.element.htsno),
        country: origin.country.code,
        // The same shipment; answers and claims belong to the origin they were made for
        adjustments: {
          customsValue,
          quantity,
          transportMode,
          ...(claimed ? { claimedPreference: origin.agreement!.symbol } : {}),
        },
      },
    ]);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCTS_ADDED, { added: 1, source: "analysis", basis });
  };

  const tryInCalculator = () => {
    nav.openCalculator(
      calculatorUrl({
        path: TRACKER_PATH,
        extra: { tab: "calculator" },
        code: product.entry.element.htsno,
        country: origin.country.code,
        value: product.customsValue,
        units: product.quantity,
        date: product.result.asOf,
        mode: product.adjustments.transportMode ?? "ocean",
        pref: claimed ? origin.agreement!.symbol : undefined,
      })
    );
  };

  return (
    <section className={`${ui.card} flex flex-col`} aria-label={`${origin.country.name} compared with yours`}>
      <div className={ui.cardHeader}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-3xl leading-none" aria-hidden>
            {origin.country.flag}
          </span>
          <div className="min-w-0">
            <h3 className={`${ui.cardTitle} truncate`}>{origin.country.name}</h3>
            <p className={ui.caption}>{claimed ? `With ${origin.agreement!.name}` : "Standard rate"}</p>
          </div>
        </div>
        <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={onClose}>
          <XMarkIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className={ui.label}>Total duty rate</div>
            <div className={`${ui.metric.primaryCompact} mt-1`}>{formatRate(pct)}</div>
          </div>
          {!origin.isOrigin && Math.abs(diff) > 0.005 && (
            <div className="text-right">
              <div className={`text-sm font-semibold ${diff < 0 ? "text-success" : "text-error"}`}>
                {diff < 0 ? "−" : "+"}
                {formatRate(Math.abs(diff))} vs yours
              </div>
              <div className={ui.caption}>
                {diff < 0 ? "Saves" : "Costs"} {formatMoney(dollars).replace(/\.00$/, "")} per shipment
              </div>
            </div>
          )}
          {origin.isOrigin && <span className={ui.badge("primary")}>Your origin</span>}
          {!origin.isOrigin && Math.abs(diff) <= 0.005 && <span className={ui.badge()}>Same as yours</span>}
        </div>

        <ul className="flex flex-col gap-1.5 text-sm">
          {partsOf(origin, basis).length === 0 ? (
            <li className="text-base-content/70">Duty free</li>
          ) : (
            partsOf(origin, basis).map((p) => (
              <li key={p.key} className="flex justify-between gap-3">
                <span className="truncate text-base-content/70">{p.key === BASE_PART ? "Base duty" : shortProgram(p.key)}</span>
                <span className="font-semibold tabular-nums">{formatRate(p.pct)}</span>
              </li>
            ))
          )}
        </ul>
        {!claimed && origin.agreement && (
          <p className={`${ui.bodySm} text-success`}>
            {formatRate(origin.agreement.pct)} with {origin.agreement.name}
          </p>
        )}
        {origin.result.warnings[0] && <p className={ui.caption}>{origin.result.warnings[0]}</p>}
      </div>

      {!origin.isOrigin && (
        <div className={`${ui.cardFooter} mt-auto flex flex-wrap gap-2`}>
          {inCatalog ? (
            <button type="button" className={`${ui.button({ size: "sm" })} text-success`} onClick={() => nav.openProduct(key)}>
              <CheckIcon className="h-4 w-4" aria-hidden />
              In catalog
            </button>
          ) : (
            <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={add}>
              <PlusIcon className="h-4 w-4" aria-hidden />
              Add to catalog
            </button>
          )}
          <button type="button" className={ui.button({ size: "sm" })} onClick={tryInCalculator}>
            <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
            Try in calculator
          </button>
        </div>
      )}
    </section>
  );
};
