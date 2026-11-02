"use client";

import { useTracker } from "../../TrackerContext";
import { auditEntry, entryFacts, entryProductKey, owedOn } from "../entries";
import { useEntries } from "../EntriesContext";
import { closeEntryCheck, resetEntryDraft, setEntryDraft, useEntryCheck } from "./entryCheckStore";
import { EntryCheck } from "./EntryCheck";

// The entry audit, mounted once for the whole of Duty Guard (TrackerApp, beside the import
// takeover) and opened from any "Audit an Entry" (entryCheckStore), so nothing on the audits page
// re-rendering or going away can close it midway or before its finale plays
export const EntryCheckHost = () => {
  const { open, fixedKey, draft, reviewId } = useEntryCheck();
  const { products: catalog } = useTracker();
  const { entries } = useEntries();
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
      onClose={closeEntryCheck}
      onReset={resetEntryDraft}
    />
  );
};
