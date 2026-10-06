"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowPathIcon, ClipboardDocumentCheckIcon, TrashIcon } from "@heroicons/react/20/solid";
import { BreadcrumbsProvider } from "@/contexts/BreadcrumbsContext";
import { CalculatorLayout } from "@/components/duty-calculator/calculator/CalculatorLayout";
import { Disclaimer } from "@/components/duty-calculator/calculator/Disclaimer";
import { ExploreModal } from "@/components/duty-calculator/calculator/ExploreModal";
import { FinderStart, useTariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { Answers, TransportMode } from "@/tariffs/engine-v2/types";
import { adjustmentTags, Adjustments, DEFAULT_MODE, DEFAULT_UNITS, DEFAULT_VALUE, isAdjusted } from "../adjustments";
import { formatRate } from "../formatRate";
import { TrackedProduct } from "../report";
import { TRACKER_PATH } from "../sections";
import { SubTabs } from "../shell/SubTabs";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { AnalysisTab } from "./analysis/AnalysisTab";

// One catalog product, opened from its row: the full calculator for it (its shipment, trade
// programs, conditions, duty over time), its duty from every other origin (Analysis), and its
// entries. Everything set here is saved as the
// product's adjustments, so the catalog row shows it on the way back.

type ProductTab = "duty" | "analysis" | "entries";

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
  const { setAdjustments, entryDate, setEntryDate, removeProducts } = useTracker();
  const nav = useTrackerNav();
  const [tab, setTab] = useState<ProductTab>("duty");
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

  const { entry } = row;
  const totalPct = f.result && f.customsValue > 0 ? (f.result.totalDuty / f.customsValue) * 100 : row.totalPct;
  const tags = adjustmentTags(row.adjustments, row.result);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <button type="button" className={`${ui.button({ variant: "ghost", size: "sm" })} -ml-3`} onClick={nav.closeProduct}>
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Catalog
        </button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <span className="text-lg leading-none" aria-hidden>
              {entry.country.flag}
            </span>
            {entry.country.name}
          </div>
          <h1 className={`${mono.className} text-2xl font-semibold tracking-tight text-base-content`}>
            {entry.element.htsno}
          </h1>
          <p className={`${ui.bodySm} max-w-3xl`}>{row.description}</p>
          {tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1" aria-label="Adjustments">
              {tags.map((t) => (
                <span key={t.id} className={ui.badge("primary")} title={t.title}>
                  {t.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <div className={ui.label}>Total duty rate</div>
            <div className={`${ui.metric.primary} mt-1 text-primary`}>{formatRate(totalPct)}</div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {isAdjusted(row.adjustments) && (
              <button type="button" className={ui.button({ size: "sm" })} onClick={onReset}>
                <ArrowPathIcon className="h-4 w-4" aria-hidden />
                Reset adjustments
              </button>
            )}
            <button
              type="button"
              className={`${ui.button({ size: "sm" })} hover:text-error`}
              onClick={() => {
                removeProducts([row.key]);
                nav.closeProduct();
              }}
            >
              <TrashIcon className="h-4 w-4" aria-hidden />
              Remove
            </button>
          </div>
        </div>
      </header>

      <SubTabs<ProductTab>
        label="Product"
        tabs={[
          { id: "duty", label: "Duty" },
          { id: "analysis", label: "Analysis" },
          { id: "entries", label: "Entries", soon: true },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "analysis" ? (
        <AnalysisTab product={row} />
      ) : tab === "duty" ? (
        <div className="flex flex-col gap-4">
          <CalculatorLayout
            f={f}
            fixedProduct
            railTitle="Shipment"
            railDescription="Saved to this product as you change it"
          />
          <Disclaimer />
          <ExploreModal f={f} />
        </div>
      ) : (
        <section className={`${ui.card} max-w-3xl`} aria-labelledby="tt-entries-heading">
          <div className={ui.cardHeader}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden>
                <ClipboardDocumentCheckIcon className="h-5 w-5" />
              </span>
              <h3 id="tt-entries-heading" className={ui.cardTitle}>
                Entries for this product
              </h3>
            </div>
            <span className={ui.badge("primary")}>In development</span>
          </div>
          <ul className={`${ui.bodySm} flex list-disc flex-col gap-2 px-10 py-4`}>
            <li>Every shipment of this product you&apos;ve cleared: entry number, entry date, value and duty paid</li>
            <li>An instant check of each against the rates in force on its entry date</li>
            <li>Overpayments you could recover, and underpayments to fix before Customs finds them</li>
          </ul>
          <div className={`${ui.cardFooter} ${ui.bodySm}`}>
            Part of{" "}
            <button type="button" className={ui.link} onClick={() => nav.openTab("entries")}>
              Entry audit
            </button>
            , coming soon.
          </div>
        </section>
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
