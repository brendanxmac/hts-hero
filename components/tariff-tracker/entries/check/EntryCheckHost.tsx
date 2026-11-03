"use client";

import { useEffect } from "react";
import { useTracker } from "../../TrackerContext";
import { auditEntry, entryFacts, entryProductKey, owedOn } from "../entries";
import { useEntries } from "../EntriesContext";
import { closeEntryCheck, resetEntryDraft, setEntryDraft, useEntryCheck } from "./entryCheckStore";
import { EntryCheck } from "./EntryCheck";

// The entry audit, mounted once for the whole of Duty Guard (TrackerApp, beside the import
// takeover) and opened from any "Audit an Entry" (entryCheckStore), so nothing on the audits page
// re-rendering or going away can close it midway or before its finale plays.
// Opening it adds a step to the browser's history (the same address), so the browser's Back
// closes it onto the audits it was opened from; closing it any other way takes that step back off.
const isAuditStep = () => (window.history.state as { entryAudit?: boolean } | null)?.entryAudit === true;
const close = () => (isAuditStep() ? window.history.back() : closeEntryCheck());

export const EntryCheckHost = () => {
  const { open, fixedKey, draft, reviewId } = useEntryCheck();
  const { products: catalog } = useTracker();
  const { entries } = useEntries();
  useEffect(() => {
    if (!open) return;
    if (!isAuditStep()) window.history.pushState({ ...window.history.state, entryAudit: true }, "", window.location.href);
    const onPop = () => {
      if (!isAuditStep()) closeEntryCheck();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);
  if (!open) return null;
  const fixed = fixedKey ? catalog.filter((p) => p.key === fixedKey) : null;
  // A saved entry's Review: worked out again from the entry, as its row in the audits is
  const entry = reviewId ? entries.find((e) => e.id === reviewId) : undefined;
  const product = entry && catalog.find((p) => p.key === entryProductKey(entry));
  const review = entry && product ? { entry, product, audit: auditEntry(entry, product), result: owedOn(product, entryFacts(entry, product)) } : undefined;
  if (reviewId && !review) return null;
  return (
    <EntryCheck
      key={reviewId ?? "new"}
      review={review}
      products={fixed ?? catalog}
      fixed={!!fixed}
      draft={draft}
      setDraft={setEntryDraft}
      onClose={close}
      onReset={resetEntryDraft}
    />
  );
};
