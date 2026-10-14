"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { BreadcrumbsProvider } from "@/contexts/BreadcrumbsContext";
import { Countries } from "@/constants/countries";
import { CalculatorWorkspace } from "@/components/duty-calculator/calculator/CalculatorWorkspace";
import { Disclaimer } from "@/components/duty-calculator/calculator/Disclaimer";
import { ExploreModal } from "@/components/duty-calculator/calculator/ExploreModal";
import { FinderStart, useTariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import * as ui from "@/components/ui/styles";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { Answers, TransportMode } from "@/tariffs/engine-v2/types";
import { Adjustments, DEFAULT_MODE, DEFAULT_UNITS, DEFAULT_VALUE, isAdjusted } from "../adjustments";
import { TrackedProduct } from "../report";
import { isProductTab, ProductTab, TRACKER_PATH } from "../sections";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { ProductAudit } from "./audit/ProductAudit";
import { ProductHeader } from "./ProductHeader";
import { ProductSummary } from "./summary/ProductSummary";
import { ProductSavings } from "./savings/ProductSavings";

// One catalog product, opened from its row: its header (what it is, four facts, the tabs), then
// - Summary (where it opens): every part of it at a glance, each leading to its tab
// - Duty: the calculator tab's own calculator, for this product (its code and origin fixed), with
//   Recent Changes and Compare (where the Analysis is). Everything set here is saved as the
//   product's adjustments, so the catalog row shows it on the way back.
// - Savings: every way to pay less on it, guided, once its savings are unlocked
// - Audit (Beta): its past entries, checked against the duty in force on each entry date


const CALCULATOR_TAB = { tab: "calculator" };

// The inputs that are saved as adjustments
interface Saved {
  customsValue: number;
  quantity: number;
  transportMode: TransportMode;
  claimedPreference: string;
  answers: Answers;
}

const startFrom = (row: TrackedProduct, adjustments: Adjustments, entryDate: string): FinderStart => ({
  element: row.entry.element,
  country: row.entry.country,
  customsValue: adjustments.customsValue ?? DEFAULT_VALUE,
  quantity: adjustments.quantity ?? DEFAULT_UNITS,
  entryDate,
  transportMode: adjustments.transportMode ?? DEFAULT_MODE,
  claimedPreference: adjustments.claimedPreference,
  answers: adjustments.answers,
});

const Workspace = ({ row, start, onReset }: { row: TrackedProduct; start: FinderStart; onReset: () => void }) => {
  const { setAdjustments, entryDate, setEntryDate, removeProducts, itemFor, products } = useTracker();
  const nav = useTrackerNav();
  const searchParams = useSearchParams();
  const asked = searchParams.get("ptab");
  const [tab, setTab] = useState<ProductTab>(isProductTab(asked) ? asked : "summary");
  // Opened again on another tab (from Savings or Entry audit) while already open
  useEffect(() => {
    if (isProductTab(asked)) setTab(asked);
  }, [asked]);
  const openTab = (next: ProductTab) => {
    setTab(next);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCT_TAB_OPENED, { tab: next });
  };
  const f = useTariffFinder({
    path: TRACKER_PATH,
    extraParams: CALCULATOR_TAB,
    syncAddress: false,
    initial: start,
    track: false,
  });

  // Save what changes. Compared with what was last saved (not with the catalog's copy, which
  // catches up a moment later), so each change is written once.
  const saved = useRef<Saved>({
    customsValue: start.customsValue,
    quantity: start.quantity,
    transportMode: start.transportMode,
    claimedPreference: start.claimedPreference ?? "",
    answers: start.answers ?? {},
  });
  useEffect(() => {
    const current: Saved = {
      customsValue: f.customsValue,
      quantity: f.quantity,
      transportMode: f.transportMode,
      claimedPreference: f.claimedPreference,
      answers: f.answers,
    };
    const patch: Adjustments = {};
    const last = saved.current;
    if (current.customsValue !== last.customsValue) patch.customsValue = current.customsValue;
    if (current.quantity !== last.quantity) patch.quantity = current.quantity;
    if (current.transportMode !== last.transportMode) patch.transportMode = current.transportMode;
    if (current.claimedPreference !== last.claimedPreference) patch.claimedPreference = current.claimedPreference;
    if (JSON.stringify(current.answers) !== JSON.stringify(last.answers)) patch.answers = current.answers;
    if (Object.keys(patch).length) {
      saved.current = current;
      setAdjustments(row.key, patch);
    }
    // Saved values only; row.key is fixed for this workspace
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.customsValue, f.quantity, f.transportMode, f.claimedPreference, f.answers]);

  // The date is the catalog's "Rates as of", shared by every product
  useEffect(() => {
    if (f.entryDate !== entryDate) setEntryDate(f.entryDate);
    // Only when it's changed here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.entryDate]);

  const totalPct = f.result && f.customsValue > 0 ? (f.result.totalDuty / f.customsValue) * 100 : row.totalPct;
  const totalDuty = f.result ? f.result.totalDuty : row.result.totalDuty;

  return (
    <div className="flex flex-col gap-5">
      <ProductHeader
        row={row}
        totalPct={totalPct}
        totalDuty={totalDuty}
        tab={tab}
        onTab={openTab}
        onBack={nav.closeProduct}
        onReset={onReset}
        onRemove={() => {
          removeProducts([row.key]);
          nav.closeProduct();
        }}
        adjusted={isAdjusted(row.adjustments)}
      />

      <MovingNotice row={row} movingTo={itemFor(row.key)?.movingTo} hasNew={(key) => products.some((p) => p.key === key)} />

      {/* Kept mounted, so the calculator keeps its state while another tab is open. A class, not the
          hidden attribute: `flex` would override that and keep it showing */}
      <div className={tab === "duty" ? "flex flex-col gap-4" : "hidden"}>
        <CalculatorWorkspace f={f} page="tracker_product" fixedProduct />
        <Disclaimer />
        <ExploreModal f={f} />
      </div>
      {tab === "summary" && <ProductSummary product={row} onTab={openTab} />}
      {tab === "savings" && <ProductSavings product={row} />}
      {tab === "audit" && <ProductAudit product={row} />}
    </div>
  );
};

// A product whose origin is moving (a secured change of origin): where to, and the new one
const MovingNotice = ({ row, movingTo, hasNew }: { row: TrackedProduct; movingTo?: string; hasNew: (key: string) => boolean }) => {
  const nav = useTrackerNav();
  const country = Countries.find((c) => c.code === movingTo);
  if (!country) return null;
  const newKey = `${row.key.split("-")[0]}-${country.code}`;
  return (
    <div role="status" className={`${ui.notice("primary")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
      <ArrowRightIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      <p className={`${ui.bodySm} flex-1`}>
        <span className="font-semibold text-base-content">
          Moving to {country.flag} {country.name}.
        </span>{" "}
        The new origin is its own product in your catalog. Keep this one while you still import from {row.entry.country.name}; its
        history and entries stay here.
      </p>
      {hasNew(newKey) && (
        <button type="button" className={`${ui.button({ size: "sm" })} shrink-0`} onClick={() => nav.openProduct(newKey)}>
          Open {country.name}
        </button>
      )}
    </div>
  );
};

export const ProductView = ({ productKey }: { productKey: string }) => {
  const { products, loading, entryDate, resetAdjustments } = useTracker();
  const nav = useTrackerNav();
  const row = products.find((p) => p.key === productKey);
  // Restarted from scratch after a reset, so the calculator drops what was set
  const [run, setRun] = useState({ n: 0, cleared: false });

  // Counted once per product opened
  useEffect(() => {
    if (row) trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCT_OPENED, { adjusted: isAdjusted(row.adjustments) });
    // Once per product
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productKey, Boolean(row)]);

  if (loading) return <div className={`${ui.skeleton} h-96 w-full`} aria-busy="true" />;

  if (!row) {
    return (
      <div className={`${ui.card} flex max-w-xl flex-col items-start gap-3 p-6`}>
        <p className={ui.body}>This product isn&apos;t in your catalog.</p>
        <button type="button" className={ui.button({ size: "sm" })} onClick={nav.closeProduct}>
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Back to the catalog
        </button>
      </div>
    );
  }

  return (
    // The calculator's explorer modal keeps breadcrumbs here
    <BreadcrumbsProvider>
      <Workspace
        key={`${productKey}-${run.n}`}
        row={row}
        start={startFrom(row, run.cleared ? {} : row.adjustments, entryDate)}
        onReset={() => {
          resetAdjustments(row.key);
          setRun((r) => ({ n: r.n + 1, cleared: true }));
        }}
      />
    </BreadcrumbsProvider>
  );
};
