"use client";

import { useMemo } from "react";
import { auditUnlocked } from "@/libs/tariff-tracker/plan";
import { useTrackerAccess } from "../access/accessContext";
import { TrackedProduct } from "../report";
import { useTracker } from "../TrackerContext";
import { auditEntry, EntryAudit, entryProductKey, TrackerEntry } from "./entries";
import { useEntries } from "./EntriesContext";

// The logged entries (all, or one product's), each with its catalog product and, once it's been
// checked, its audit; and the totals of the checked ones

export interface AuditRow {
  entry: TrackerEntry;
  // Gone when the product was removed from the catalog
  product?: TrackedProduct;
  // Null until it's checked (or with its product gone)
  audit: EntryAudit | null;
}

export interface AuditTotals {
  logged: number;
  audited: number;
  paid: number;
  owed: number;
  overpaid: number;
  underpaid: number;
}

export const useAuditRows = (productKey?: string) => {
  const { entries, loading } = useEntries();
  const { products } = useTracker();
  const { access } = useTrackerAccess();
  return useMemo(() => {
    const byKey = new Map(products.map((p) => [p.key, p]));
    const rows: AuditRow[] = entries
      .filter((e) => !productKey || entryProductKey(e) === productKey)
      .map((entry) => {
        const product = byKey.get(entryProductKey(entry));
        return { entry, product, audit: product && auditUnlocked(access, entry.id) ? auditEntry(entry, product) : null };
      });
    const audited = rows.filter((r) => r.audit);
    const totals: AuditTotals = {
      logged: rows.length,
      audited: audited.length,
      paid: audited.reduce((sum, r) => sum + r.entry.dutyPaid, 0),
      owed: audited.reduce((sum, r) => sum + r.audit!.owed, 0),
      overpaid: audited.reduce((sum, r) => sum + Math.max(0, r.audit!.difference), 0),
      underpaid: audited.reduce((sum, r) => sum + Math.max(0, -r.audit!.difference), 0),
    };
    return { rows, totals, loading };
  }, [entries, products, access, productKey, loading]);
};
