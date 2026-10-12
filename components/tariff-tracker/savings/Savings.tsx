"use client";

import { useMemo, useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { TableStandIn } from "@/components/ui/stand-ins";
import { PremiumGate } from "../access/PremiumGate";
import { useInsights } from "../insights/InsightsContext";
import { InsightsProgress } from "../insights/InsightsProgress";
import { savingsTeaser, wholeDollars } from "../insights/teasers";
import { sectionBySlug } from "../sections";
import { NeedsProducts } from "../shell/NeedsProducts";
import { StatRow } from "../shell/StatRow";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { SavingRow, SavingsTable } from "./SavingsTable";

// The Savings tab: every way to pay less duty across the catalog, worked out for each product's
// own shipment. Trade programs and exemptions keep the supplier; sourcing means moving it.

type Show = "all" | "keep" | "origin";
const SHOWS: { id: Show; label: string }[] = [
  { id: "all", label: "All" },
  { id: "keep", label: "Keep my suppliers" },
  { id: "origin", label: "Sourcing" },
];

const SavingsReport = () => {
  const insights = useInsights();
  const nav = useTrackerNav();
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
    [insights.savings, show, byKey]
  );
  const { anyUsd, keepSupplierUsd, productsWithSavings, exemptionsToCheck } = insights.totals;

  return (
    <div className="flex flex-col gap-4">
      <InsightsProgress label="Checking" />
      <StatRow
        stats={[
          { label: "Potential savings", value: wholeDollars(anyUsd), note: "Up to, per shipment, if you qualify", tone: "success" },
          { label: "From trade programs", value: wholeDollars(keepSupplierUsd), note: "Same suppliers, if you qualify" },
          {
            label: "Products with potential savings",
            value: `${productsWithSavings.toLocaleString("en-US")}`,
            note: `Of ${insights.products.length.toLocaleString("en-US")} tracked`,
          },
          { label: "Exemptions to check", value: exemptionsToCheck.toLocaleString("en-US"), note: "Not counted in the totals" },
        ]}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl<Show> label="Show savings" options={SHOWS} value={show} onChange={setShow} size="sm" />
        <p className={ui.caption}>Per shipment, at each product&apos;s value and quantity. Open a product to change them.</p>
      </div>
      {rows.length ? (
        <SavingsTable rows={rows} onOpen={(key) => nav.openProduct(key)} />
      ) : (
        <div className={`${ui.card} p-6`}>
          <p className={ui.bodySm}>
            {insights.savingsReady ? "No savings of this kind on your tracked products." : "Looking for savings…"}
          </p>
        </div>
      )}
      <p className={ui.caption}>
        Exemptions depend on facts about your goods, and trade programs on meeting their rules of origin: confirm both
        before claiming. A new country of origin needs the goods to be made there (substantial transformation), not only
        shipped from there.
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
    <PremiumGate
      feature="savings"
      title="See where you could pay less duty"
      teaser={savingsTeaser(insights) ?? "Checking your catalog for savings…"}
      points={section.planned}
      preview={<TableStandIn />}
      minHeight="min-h-[28rem]"
    >
      <SavingsReport />
    </PremiumGate>
  );
};
