"use client";

import { ArrowRightIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { useTrackerAccess } from "../../access/accessContext";
import { TrackedProduct } from "../../report";
import { useTracker } from "../../TrackerContext";
import { openEntryCheck, useEntryCheck } from "./entryCheckStore";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";

// "Audit an Entry": opens the step-by-step entry audit (EntryCheck). The audits' main action, in
// the Entry Audit page's header and above a product's Audit tab (size "md"), or the big button of
// their empty state (size "lg"). The audit itself and its draft live in entryCheckStore (mounted by
// EntryCheckHost), so this button can come and go. Out of checks, it opens the upgrade instead.
export const AuditEntryButton = ({ fixedProduct, size = "md" }: { fixedProduct?: TrackedProduct; size?: "md" | "lg" }) => {
  const { products: catalog } = useTracker();
  const { auditsLeft, openUpgrade } = useTrackerAccess();
  const { draft } = useEntryCheck();
  const products = fixedProduct ? [fixedProduct] : catalog;
  const outOfChecks = auditsLeft === 0;
  // A draft under way for this import (or, from the catalog, any import still in it)
  const resuming = !!draft.entryDate && products.some((p) => p.key === draft.productKey);
  const start = () => {
    if (outOfChecks) return openUpgrade("entries");
    trackEvent(MixpanelEvent.DUTY_GUARD_ENTRY_AUDIT_STARTED, { resuming, from: fixedProduct ? "product" : "audits", audits_left: auditsLeft });
    openEntryCheck(fixedProduct?.key ?? null, resuming ? draft.productKey : (products[0]?.key ?? ""));
  };

  return (
    <button type="button" onClick={start} disabled={!products.length} className={`${ui.button({ variant: "primary", size })} group`}>
      <DocumentMagnifyingGlassIcon className="h-5 w-5" aria-hidden />
      {outOfChecks ? "Upgrade to Audit an Entry" : resuming ? "Continue Your Audit" : "Audit an Entry"}
      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </button>
  );
};
