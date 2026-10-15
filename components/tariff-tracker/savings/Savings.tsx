"use client";

import { useMemo, useState } from "react";
import { mono } from "@/components/ui/font";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { TableStandIn } from "@/components/ui/stand-ins";
import { useTrackerAccess } from "../access/accessContext";
import { FreeChecksNotice } from "../access/FreeChecksNotice";
import { AccountGate } from "../access/AccountGate";
import { BeyondPlanTeaser } from "../plan/BeyondPlanTeaser";
import { ReviewProgress } from "../opportunities/ReviewProgress";
import { SavingsTally } from "../opportunities/SavingsTally";
import { useInsights } from "../insights/InsightsContext";
import { InsightsProgress } from "../insights/InsightsProgress";
import { savingsTeaser, wholeDollars } from "../insights/teasers";
import { sectionBySlug } from "../sections";
import { NeedsProducts } from "../shell/NeedsProducts";
import { StatStrip } from "@/components/ui/StatStrip";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { SavingRow, SavingsTable } from "./SavingsTable";

// The Savings tab: every way to pay less duty across the catalog, worked out for each product's
// own shipment. Trade programs and exemptions keep the supplier; sourcing means moving it. A
// product's savings show once they're unlocked: checked with one of the trial's savings checks
// (PRICING.md: TRIAL_ALLOWANCE.savingsChecks, never reset, can't be moved), or covered by a paid
// plan. The rest are listed with what checking them could find, and the button to check.

type Show = "all" | "keep" | "origin";
const SHOWS: { id: Show; label: string }[] = [
  { id: "all", label: "All" },
  { id: "keep", label: "Keep my suppliers" },
  { id: "origin", label: "Sourcing" },
];

// The products whose savings aren't unlocked yet, most potential first: what a check could find,
// and the check
const PAGE = 20;
const ToCheck = () => {
  const insights = useInsights();
  const { paid, savingsLeft, spendCheck, openUpgrade } = useTrackerAccess();
  const [shown, setShown] = useState(PAGE);
  const [busy, setBusy] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      insights.products
        .filter((p) => !insights.unlocked.has(p.key))
        .map((product) => ({
          product,
          usd: insights.lockedBest.get(product.key),
        }))
        .sort((a, b) => (b.usd ?? -1) - (a.usd ?? -1)),
    [insights.products, insights.unlocked, insights.lockedBest],
  );
  if (!rows.length) return null;
  const canCheck = !paid && savingsLeft > 0;
  const check = async (key: string) => {
    if (!canCheck) return openUpgrade("savings");
    setBusy(key);
    await spendCheck("savings", key, "savings");
    setBusy(null);
  };

  return (
    <section className={ui.card} aria-labelledby="tt-savings-to-check">
      <div className={ui.cardHeader}>
        <div>
          <h2 id="tt-savings-to-check" className={ui.cardTitle}>
            {paid ? "Imports your plan doesn't cover" : "Check your imports"}
          </h2>
          <p className={`${ui.caption} mt-0.5`}>
            {insights.beyond.productsWithSavings > 0
              ? `Potential savings found on ${insights.beyond.productsWithSavings.toLocaleString("en-US")} of these${insights.beyond.ready ? "" : " so far"}, if you qualify.`
              : insights.beyond.ready
                ? "No trade program or origin savings spotted on these yet; a check also covers exemptions worth checking."
                : "Looking for savings…"}
          </p>
        </div>
      </div>
      <ul className="divide-y divide-base-300">
        {rows.slice(0, shown).map(({ product, usd }) => (
          <li key={product.key} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <span className={`${mono.className} block text-sm font-semibold text-base-content`}>
                {product.entry.element.htsno}
              </span>
              <span className="block truncate text-xs text-base-content/60">
                {product.entry.country.flag} {product.entry.country.name} · {product.description}
              </span>
            </div>
            <span className="text-right text-sm tabular-nums">
              {usd === undefined ? (
                <span className="text-base-content/50">Checking…</span>
              ) : usd > 0.005 ? (
                <>
                  <span className="font-semibold text-success">Up to {wholeDollars(usd)}</span>
                  <span className="block text-xs text-base-content/60">per shipment, found</span>
                </>
              ) : (
                <span className="text-base-content/60">Exemptions to check</span>
              )}
            </span>
            <button
              type="button"
              className={ui.button({
                variant: canCheck ? "primary" : "secondary",
                size: "sm",
              })}
              disabled={busy !== null}
              onClick={() => check(product.key)}
            >
              {busy === product.key ? "Checking…" : canCheck ? "Check savings" : paid ? "Cover it" : "See plans"}
            </button>
          </li>
        ))}
      </ul>
      {rows.length > shown && (
        <div className={`${ui.cardFooter} flex justify-center`}>
          <button type="button" className={ui.button({ size: "sm" })} onClick={() => setShown((n) => n + PAGE)}>
            Show more ({(rows.length - shown).toLocaleString("en-US")} left)
          </button>
        </div>
      )}
    </section>
  );
};

const SavingsReport = () => {
  const insights = useInsights();
  const nav = useTrackerNav();
  const { paid } = useTrackerAccess();
  const [show, setShow] = useState<Show>("all");
  const byKey = useMemo(() => new Map(insights.products.map((p) => [p.key, p])), [insights.products]);
  const rows = useMemo(
    () =>
      Array.from(insights.savings.values())
        .flat()
        .filter((s) => (show === "all" ? true : show === "keep" ? s.kind !== "origin" : s.kind === "origin"))
        // Counted savings first; exemptions (worth checking, rarely true) after them
        .sort((a, b) => Number(a.kind === "exemption") - Number(b.kind === "exemption") || b.usd - a.usd)
        .flatMap((saving): SavingRow[] => {
          const product = byKey.get(saving.productKey);
          return product ? [{ saving, product }] : [];
        }),
    [insights.savings, show, byKey],
  );
  const { anyUsd, keepSupplierUsd, productsWithSavings, exemptionsToCheck } = insights.totals;
  const checked = insights.unlocked.size;

  return (
    <div className="flex flex-col gap-4">
      <FreeChecksNotice kind="savings" />
      <ReviewProgress />
      <SavingsTally />
      <InsightsProgress label="Checking" />
      <StatStrip
        stats={[
          {
            label: "Potential savings",
            value: wholeDollars(anyUsd),
            note: "Up to, per shipment, if you qualify",
            tone: "success",
          },
          {
            label: "From trade programs",
            value: wholeDollars(keepSupplierUsd),
            note: "Same suppliers, if you qualify",
          },
          {
            label: "Products with potential savings",
            value: `${productsWithSavings.toLocaleString("en-US")}`,
            note: `Of ${checked.toLocaleString("en-US")} ${paid ? "covered by your plan" : "checked"}`,
          },
          {
            label: "Exemptions to check",
            value: exemptionsToCheck.toLocaleString("en-US"),
            note: "Not counted in the totals",
          },
        ]}
      />
      {paid && <BeyondPlanTeaser />}
      {checked > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SegmentedControl<Show> label="Show savings" options={SHOWS} value={show} onChange={setShow} size="sm" />
          <p className={ui.caption}>
            Per shipment, at each product&apos;s value and quantity. Open a product to change them.
          </p>
        </div>
      )}
      {checked === 0 ? null : rows.length ? (
        <SavingsTable rows={rows} onOpen={(key) => nav.openProduct(key, false, "savings")} />
      ) : (
        <div className={`${ui.card} p-6`}>
          <p className={ui.bodySm}>
            {insights.savingsReady ? "No savings of this kind on the imports you've checked." : "Looking for savings…"}
          </p>
        </div>
      )}
      <ToCheck />
      <p className={ui.caption}>
        Exemptions depend on facts about your goods, and trade programs on meeting their rules of origin: confirm both before
        claiming. A new country of origin needs the goods to be made there (substantial transformation), not only shipped
        from there.
      </p>
    </div>
  );
};

export const Savings = () => {
  const { items, loading } = useTracker();
  const insights = useInsights();
  const section = sectionBySlug("savings")!;
  if (loading) return <div className={`${ui.skeleton} h-80 w-full`} />;
  if (!items.length) {
    return (
      <NeedsProducts
        title="Add products to find savings"
        body="Savings checks every trade program, exemption and country of origin for the products you import."
      />
    );
  }
  return (
    <AccountGate
      feature="savings"
      page="tracker"
      title="See where you could pay less duty"
      teaser={savingsTeaser(insights) ?? "Checking your imports for savings…"}
      points={section.planned}
      preview={<TableStandIn />}
      minHeight="min-h-[28rem]"
    >
      <SavingsReport />
    </AccountGate>
  );
};
