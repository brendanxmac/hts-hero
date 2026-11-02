"use client";

import { DutyAuditsUpsell } from "../access/DutyAuditsUpsell";
import { useTrackerAccess } from "../access/accessContext";
import { hasAudits } from "@/libs/tariff-tracker/plan";
import * as ui from "@/components/ui/styles";
import { TableStandIn } from "@/components/ui/stand-ins";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { AccountGate } from "../access/AccountGate";
import { sectionBySlug } from "../sections";
import { NeedsProducts } from "../shell/NeedsProducts";
import { SectionHeader } from "../shell/SectionPage";
import { useTracker } from "../TrackerContext";
import { FreeChecksNotice } from "../access/FreeChecksNotice";
import { AuditDisclaimer } from "./AuditDisclaimer";
import { AuditStats } from "./AuditStats";
import { AuditEntryButton } from "./check/AuditEntryButton";
import { AuditStart } from "./AuditStart";
import { PaidVsOwedChart } from "./charts/PaidVsOwedChart";
import { EntriesTable } from "./EntriesTable";
import { Upload7501Button } from "./Upload7501Button";
import { useAuditRows } from "./useAuditRows";

// The Entry audit tab (Beta): every logged entry across the catalog, checked against the duty in
// force on its entry date. Each check spends one of the trial's audit checks
// (the trial and paid plans; none on the free plan, TRIAL_ALLOWANCE.auditChecks being 0); paid plans
// audit without limit (PRICING.md). Each product's Audit tab is the same, for that product.

// The page's header: once an entry is audited, "Audit an Entry" sits on its right (before that,
// the empty state below has it, big)
const Header = () => {
  const { totals, loading } = useAuditRows();
  const { access, signedIn } = useTrackerAccess();
  const showActions = signedIn && hasAudits(access) && !loading && totals.audited > 0;
  return (
    <SectionHeader
      section={sectionBySlug("entries")!}
      actions={
        showActions && (
          <>
            <Upload7501Button />
            <AuditEntryButton />
          </>
        )
      }
    />
  );
};

const AuditReport = () => {
  const { rows, totals, loading } = useAuditRows();
  const { access, signedIn } = useTrackerAccess();
  if (signedIn && !hasAudits(access))
    return (
      <DutyAuditsUpsell
        feature="entries"
        title={rows.length ? `${rows.length.toLocaleString("en-US")} ${rows.length === 1 ? "Entry" : "Entries"} Ready to Audit` : "Check What You Paid on Past Entries"}
        body="Duty Guard Pro checks every entry against the duty in force on its date, flagging possible over and underpayments."
        points={["Unlimited audits on the products your plan covers", "A findings report for your team or broker", "Keep 100% of what you find"]}
      />
    );
  return (
    <div className="flex flex-col gap-4">
      <FreeChecksNotice kind="audits" />
      {loading ? (
        <div className={`${ui.skeleton} h-40 w-full`} />
      ) : totals.audited === 0 ? (
        <>
          <AuditStart />
          {rows.length > 0 && <EntriesTable rows={rows} />}
        </>
      ) : (
        <>
          <AuditStats totals={totals} />
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
      <>
        <Header />
        <NeedsProducts
          title="Add Products to Audit Your Entries"
          body="Entry audit checks the duty you paid on each past entry against the duty in force on its entry date."
        />
      </>
    );
  }
  return (
    <>
      <Header />
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
    </>
  );
};
