"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { createSupabaseClient } from "@/libs/supabase/client";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { SavingKind } from "../insights/savings";
import { SavingOption } from "./options";
import { OpportunityStatus } from "./statuses";

// The savings opportunities the user is pursuing, across the catalog, and the record of every
// change to each (tracker_opportunities, tracker_opportunity_events). Shared by a product's
// Savings tab (which tracks and moves them) and the catalog's tallies.

export interface Opportunity {
  id: string;
  productKey: string;
  kind: SavingKind;
  optionRef: string;
  title: string;
  status: OpportunityStatus;
  rateBefore: number;
  rateAfter: number;
  usdPerShipment: number;
  note: string | null;
  securedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// What a change applied to the catalog, kept with its event
export interface AppliedChange {
  productKey: string;
  // The product's setup before and after (origin, trade program, answers)
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  // A change of origin adds the new origin as its own product
  addedProductKey?: string;
}

export interface OpportunityEvent {
  id: string;
  opportunityId: string;
  fromStatus: OpportunityStatus | null;
  toStatus: OpportunityStatus;
  note: string | null;
  applied: AppliedChange | null;
  createdAt: string;
}

interface OpportunitiesValue {
  loading: boolean;
  opportunities: Opportunity[];
  eventsFor: (opportunityId: string) => OpportunityEvent[];
  // The tracked opportunity for an option on a product, if any
  find: (productKey: string, optionId: string) => Opportunity | undefined;
  // Starts tracking an option (with a note, e.g. why it was ruled out); resolves to the opportunity,
  // or null if it couldn't be saved
  track: (productKey: string, option: SavingOption, status: OpportunityStatus, rateBefore: number, note?: string | null) => Promise<Opportunity | null>;
  // Moves one to a new status, with a note and (when secured) what was applied to the catalog
  setStatus: (opportunity: Opportunity, status: OpportunityStatus, note: string | null, applied?: AppliedChange) => Promise<boolean>;
}

const OpportunitiesContext = createContext<OpportunitiesValue | null>(null);

export const useOpportunities = () => {
  const value = useContext(OpportunitiesContext);
  if (!value) throw new Error("useOpportunities must be used inside OpportunitiesProvider");
  return value;
};

const COLUMNS =
  "id, product_key, kind, option_ref, title, status, rate_before, rate_after, usd_per_shipment, note, secured_at, created_at, updated_at";

interface Row {
  id: string;
  product_key: string;
  kind: SavingKind;
  option_ref: string;
  title: string;
  status: OpportunityStatus;
  rate_before: number | string;
  rate_after: number | string;
  usd_per_shipment: number | string;
  note: string | null;
  secured_at: string | null;
  created_at: string;
  updated_at: string;
}

interface EventRow {
  id: string;
  opportunity_id: string;
  from_status: OpportunityStatus | null;
  to_status: OpportunityStatus;
  note: string | null;
  applied: AppliedChange | null;
  created_at: string;
}

const fromRow = (r: Row): Opportunity => ({
  id: r.id,
  productKey: r.product_key,
  kind: r.kind,
  optionRef: r.option_ref,
  title: r.title,
  status: r.status,
  rateBefore: Number(r.rate_before),
  rateAfter: Number(r.rate_after),
  usdPerShipment: Number(r.usd_per_shipment),
  note: r.note,
  securedAt: r.secured_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const fromEventRow = (r: EventRow): OpportunityEvent => ({
  id: r.id,
  opportunityId: r.opportunity_id,
  fromStatus: r.from_status,
  toStatus: r.to_status,
  note: r.note,
  applied: r.applied,
  createdAt: r.created_at,
});

export const OpportunitiesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const userId = user?.id ?? null;
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [events, setEvents] = useState<OpportunityEvent[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setOpportunities([]);
      setEvents([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const db = createSupabaseClient();
    Promise.all([
      db.from("tracker_opportunities").select(COLUMNS).eq("user_id", userId).order("created_at", { ascending: true }),
      db
        .from("tracker_opportunity_events")
        .select("id, opportunity_id, from_status, to_status, note, applied, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
    ]).then(([opps, evs]) => {
      if (cancelled) return;
      if (opps.error) console.error("Error loading savings opportunities:", opps.error);
      if (evs.error) console.error("Error loading savings history:", evs.error);
      setOpportunities(((opps.data ?? []) as Row[]).map(fromRow));
      setEvents(((evs.data ?? []) as EventRow[]).map(fromEventRow));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const logEvent = useCallback(
    async (opportunityId: string, fromStatus: OpportunityStatus | null, toStatus: OpportunityStatus, note: string | null, applied?: AppliedChange) => {
      const { data, error } = await createSupabaseClient()
        .from("tracker_opportunity_events")
        .insert({ opportunity_id: opportunityId, user_id: userId, from_status: fromStatus, to_status: toStatus, note, applied: applied ?? null })
        .select("id, opportunity_id, from_status, to_status, note, applied, created_at")
        .single<EventRow>();
      if (error || !data) {
        console.error("Error saving savings history:", error);
        return;
      }
      setEvents((prev) => [...prev, fromEventRow(data)]);
    },
    [userId]
  );

  const track = useCallback(
    async (productKey: string, option: SavingOption, status: OpportunityStatus, rateBefore: number, note: string | null = null) => {
      if (!userId) return null;
      const { data, error } = await createSupabaseClient()
        .from("tracker_opportunities")
        .upsert(
          {
            user_id: userId,
            product_key: productKey,
            kind: option.kind,
            option_ref: option.ref,
            title: option.title,
            status,
            rate_before: rateBefore,
            rate_after: option.ratePct,
            usd_per_shipment: option.usd,
            note,
          },
          { onConflict: "user_id,product_key,kind,option_ref" }
        )
        .select(COLUMNS)
        .single<Row>();
      if (error || !data) {
        console.error("Error tracking a savings opportunity:", error);
        return null;
      }
      const saved = fromRow(data);
      setOpportunities((prev) => [...prev.filter((o) => o.id !== saved.id), saved]);
      await logEvent(saved.id, null, status, note);
      trackEvent(MixpanelEvent.TARIFF_TRACKER_OPPORTUNITY_CHANGED, { kind: option.kind, status, usd: Math.round(option.usd) });
      return saved;
    },
    [userId, logEvent]
  );

  const setStatus = useCallback(
    async (opportunity: Opportunity, status: OpportunityStatus, note: string | null, applied?: AppliedChange) => {
      const now = new Date().toISOString();
      const { data, error } = await createSupabaseClient()
        .from("tracker_opportunities")
        .update({ status, note, updated_at: now, secured_at: status === "secured" ? now : null })
        .eq("id", opportunity.id)
        .select(COLUMNS)
        .single<Row>();
      if (error || !data) {
        console.error("Error updating a savings opportunity:", error);
        return false;
      }
      const saved = fromRow(data);
      setOpportunities((prev) => prev.map((o) => (o.id === saved.id ? saved : o)));
      await logEvent(saved.id, opportunity.status, status, note, applied);
      trackEvent(MixpanelEvent.TARIFF_TRACKER_OPPORTUNITY_CHANGED, { kind: saved.kind, status, usd: Math.round(saved.usdPerShipment) });
      return true;
    },
    [logEvent]
  );

  const value = useMemo<OpportunitiesValue>(
    () => ({
      loading,
      opportunities,
      eventsFor: (id) => events.filter((e) => e.opportunityId === id),
      find: (productKey, optionId) => opportunities.find((o) => o.productKey === productKey && `${o.kind}:${o.optionRef}` === optionId),
      track,
      setStatus,
    }),
    [loading, opportunities, events, track, setStatus]
  );

  return <OpportunitiesContext.Provider value={value}>{children}</OpportunitiesContext.Provider>;
};
