"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { createSupabaseClient } from "@/libs/supabase/client";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { useTrackerAccess } from "../access/accessContext";
import { ENTRY_COLUMNS, EntryRow, fromEntryRow, NewEntry, TrackerEntry } from "./entries";

// The signed-in user's logged entries (tracker_entries), newest entry date first, shared by the
// catalog's Entry audit and each product's Audit tab. Adding an entry checks it, spending one of
// the trial's audit checks (PRICING.md); nothing while signed out.

interface EntriesValue {
  entries: TrackerEntry[];
  loading: boolean;
  // Saves the entry, then checks it; resolves to the saved entry, or null if it couldn't be saved
  addAndCheck: (entry: NewEntry) => Promise<TrackerEntry | null>;
  // Checks an entry saved earlier (one that wasn't checked when the allowance ran out)
  check: (entry: TrackerEntry) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

const EntriesContext = createContext<EntriesValue | null>(null);

export const useEntries = () => {
  const value = useContext(EntriesContext);
  if (!value) throw new Error("useEntries must be used inside EntriesProvider");
  return value;
};

const byDateDesc = (a: TrackerEntry, b: TrackerEntry) => b.entryDate.localeCompare(a.entryDate);

export const EntriesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const { access, spendCheck } = useTrackerAccess();
  const userId = user?.id ?? null;
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    createSupabaseClient()
      .from("tracker_entries")
      .select(ENTRY_COLUMNS)
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Error loading entries:", error);
        setEntries(((data ?? []) as EntryRow[]).map(fromEntryRow));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const check = useCallback(
    async (entry: TrackerEntry) => {
      const ok = await spendCheck("audit", entry.id, "entries");
      if (ok) trackEvent(MixpanelEvent.TARIFF_TRACKER_ENTRY_AUDITED, { plan: access.kind });
      return ok;
    },
    [spendCheck, access.kind]
  );

  const addAndCheck = useCallback(
    async (entry: NewEntry) => {
      if (!userId) return null;
      const { data, error } = await createSupabaseClient()
        .from("tracker_entries")
        .insert({
          user_id: userId,
          hts_code: entry.htsCode,
          country: entry.country,
          entry_date: entry.entryDate,
          entry_number: entry.entryNumber,
          customs_value: entry.customsValue,
          quantity: entry.quantity,
          duty_paid: entry.dutyPaid,
        })
        .select(ENTRY_COLUMNS)
        .single<EntryRow>();
      if (error || !data) {
        console.error("Error saving entry:", error);
        return null;
      }
      const saved = fromEntryRow(data);
      setEntries((prev) => [saved, ...prev].sort(byDateDesc));
      await check(saved);
      return saved;
    },
    [userId, check]
  );

  const remove = useCallback(async (id: string) => {
    const { error } = await createSupabaseClient().from("tracker_entries").delete().eq("id", id);
    if (error) {
      console.error("Error removing entry:", error);
      return false;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    return true;
  }, []);

  const value = useMemo(() => ({ entries, loading, addAndCheck, check, remove }), [entries, loading, addAndCheck, check, remove]);
  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
};
