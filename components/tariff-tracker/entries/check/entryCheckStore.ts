"use client";

import { useSyncExternalStore } from "react";
import { emptyDraft, EntryDraft } from "./draft";

// Whether the entry audit is open, for which import (a product's Audit tab fixes it; the catalog's
// Entry audit lets them pick), and the draft as it's typed. One copy for the whole of Duty Guard,
// outside React, with the audit mounted once beside the import takeover (EntryCheckHost): the
// buttons that open it come and go (the audits' empty state is gone once the first entry is saved),
// and the audit, its finale included, must not go with them.

interface EntryCheckState {
  open: boolean;
  // The import it's fixed to, or null: any in the catalog
  fixedKey: string | null;
  draft: EntryDraft;
  // A saved entry it opened on, straight to its Review (a row of the audits clicked)
  reviewId: string | null;
}

let state: EntryCheckState = { open: false, fixedKey: null, draft: emptyDraft(""), reviewId: null };
const listeners = new Set<() => void>();
const update = (next: Partial<EntryCheckState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

// Opens it, keeping the draft when it's for the same import (closing midway and coming back picks
// up where it was left), else starting one on `productKey`
export const openEntryCheck = (fixedKey: string | null, productKey: string) =>
  update({
    open: true,
    fixedKey,
    reviewId: null,
    draft: state.draft.productKey === productKey || (!fixedKey && state.draft.productKey && state.fixedKey === null) ? state.draft : emptyDraft(productKey),
  });
// Opens a saved entry's Review; the draft in progress is kept for the next "Audit an Entry"
export const openEntryReview = (entryId: string) => update({ open: true, fixedKey: null, reviewId: entryId });
// Closing while changing a saved entry drops the changes, so the next audit starts fresh
export const closeEntryCheck = () =>
  update({ open: false, reviewId: null, draft: state.draft.editingId ? emptyDraft(state.draft.productKey) : state.draft });
export const setEntryDraft = (draft: EntryDraft) => update({ draft });
export const resetEntryDraft = () => update({ draft: emptyDraft(state.draft.productKey) });

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const CLOSED: EntryCheckState = { open: false, fixedKey: null, draft: emptyDraft(""), reviewId: null };
export const useEntryCheck = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => CLOSED
  );
