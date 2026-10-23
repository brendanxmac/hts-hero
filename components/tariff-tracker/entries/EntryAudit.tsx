"use client";

import * as ui from "@/components/ui/styles";
import { TableStandIn } from "@/components/ui/stand-ins";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { AccountGate } from "../access/AccountGate";
import { sectionBySlug } from "../sections";
import { NeedsProducts } from "../shell/NeedsProducts";
import { useTracker } from "../TrackerContext";
import { FreeChecksNotice } from "../access/FreeChecksNotice";
import { AuditDisclaimer } from "./AuditDisclaimer";
import { AuditForm } from "./AuditForm";
import { AuditStats } from "./AuditStats";
import { PaidVsOwedChart } from "./charts/PaidVsOwedChart";
import { EntriesTable } from "./EntriesTable";
import { Upload7501Card } from "./Upload7501Card";
import { useAuditRows } from "./useAuditRows";

// The Entry audit tab (Beta): every logged entry across the catalog, checked against the duty in
// force on its entry date. Each check spends one of the trial's audit checks
// (the trial and paid plans; none on the free plan, TRIAL_ALLOWANCE.auditChecks being 0); paid plans
// audit without limit (PRICING.md). Each product's Audit tab is the same, for that product.

const AuditReport = () => {
  const { rows, totals, loading } = useAuditRows();
  return (
    <div className="flex flex-col gap-4">
      <FreeChecksNotice kind="audits" />
      <AuditStats totals={totals} />
      <Upload7501Card />
      <AuditForm />
      {loading ? <div className={`${ui.skeleton} h-40 w-full`} /> : rows.length > 0 && (
        <>
          <PaidVsOwedChart rows={rows} />
          <EntriesTable rows={rows} />
        </>
      )}
      <AuditDisclaimer />
    </div>
  );
};

export const EntryAudit = () => {
  const { items, loading } = useTracker();
  const section = sectionBySlug("entries")!;
  if (loading) return <div className={`${ui.skeleton} h-80 w-full`} />;
  if (!items.length) {
    return (
      <NeedsProducts
        title="Add Products to Audit Your Entries"
        body="Entry audit checks the duty you paid on each past entry against the duty in force on its entry date."
      />
    );
  }
  return (
    <AccountGate
      feature="entries"
      page="tracker"
      title="Check What You Paid on Past Entries"
      teaser={`Free for ${REVERSE_TRIAL.days} days with every new account.`}
      points={section.planned}
      preview={<TableStandIn columns={["Entry", "Product", "Paid", "Owed"]} />}
      minHeight="min-h-112"
    >
      <AuditReport />
    </AccountGate>
  );
};
