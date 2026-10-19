"use client";

import { ReactNode, useMemo } from "react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { Module } from "@/components/ui/Module";
import { useCatalogAdcvd } from "@/components/adcvd/useCatalogAdcvd";
import { todayIso } from "../../duty-calculator/lib/format";
import { addDays } from "../../../tariffs/engine-v2/history";
import { useTrackerAccess } from "../access/accessContext";
import { useAlertSettings } from "../alerts/AlertSettingsContext";
import { formatRate } from "../formatRate";
import { day, signedRate } from "../impact/format";
import { useInsights } from "../insights/InsightsContext";
import { matchLabel, useImportMatches } from "../news/useImportMatches";
import { shortProgram } from "../report";
import { TRACKER_PATH } from "../sections";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { useTariffUpdates } from "./useTariffUpdates";

// Home's list of what needs the user (DESIGN_SYSTEM.md §15 "Home"): a short list, ranked by what it
// costs them and how soon. Rates that went up first, then tariff actions about to take effect or
// that may hit an import, then AD/CVD cases to answer, then setting up (alerts, import values).
// Each item says what happened in one line, the detail in a second, and has one button that opens
// the fix. An item leaves the list once it's dealt with (the change ages out, the cases are
// answered, alerts are on). When nothing's left, the list says so.

type Tone = "error" | "warning" | "primary";

interface Item {
  id: string;
  tone: Tone;
  title: ReactNode;
  detail: ReactNode;
  action: string;
  go: () => void;
  // The one main action on the list is the first setup step (cobalt); the rest are secondary
  main?: boolean;
}

const STRIPE: Record<Tone, string> = { error: "bg-error", warning: "bg-warning", primary: "bg-primary" };

// Rates that went up within this many days stay on the list
const RECENT_DAYS = 90;
// The most items of one kind before they're summed up in one line
const MOST = 3;

const openAction = (slug: string) => window.history.pushState(null, "", `${TRACKER_PATH}?tab=changes&update=${encodeURIComponent(slug)}`);

export const useAttention = (): Item[] | null => {
  const { items, products, loading } = useTracker();
  const insights = useInsights();
  const alerts = useAlertSettings();
  const { signedIn } = useTrackerAccess();
  const nav = useTrackerNav();
  const updates = useTariffUpdates("all");
  const matches = useImportMatches(updates);
  const keyed = useMemo(() => items.map((i) => ({ key: `${i.code}-${i.country}`, code: i.code, country: i.country })), [items]);
  const adcvd = useCatalogAdcvd(keyed);
  const today = todayIso();

  return useMemo(() => {
    if (loading) return null;
    const out: Item[] = [];
    const byKey = new Map(products.map((p) => [p.key, p]));
    const name = (key: string) => {
      const p = byKey.get(key);
      return p ? `${p.entry.element.htsno} from ${p.entry.country.name}` : key;
    };

    // 1. Rates that went up lately: each import's latest rise, the biggest first
    const since = addDays(today, -RECENT_DAYS);
    const rises = new Map<string, (typeof insights.changes)[number]>();
    for (const c of insights.changes) if (c.deltaPct > 0 && c.date >= since && c.date <= today && !rises.has(c.product.key)) rises.set(c.product.key, c);
    const risen = Array.from(rises.values()).sort((a, b) => b.deltaPct - a.deltaPct);
    for (const c of risen.slice(0, MOST)) {
      const cause = c.after.changes.find((l) => l.delta > 0)?.name;
      out.push({
        id: `rise-${c.product.key}-${c.date}`,
        tone: "error",
        title: (
          <>
            {name(c.product.key)} went up <span className="text-error">{signedRate(c.deltaPct)}</span>
          </>
        ),
        detail: `${formatRate(c.before.pct)} → ${formatRate(c.after.pct)} on ${day(c.date)}${cause ? `, from ${shortProgram(cause)}` : ""}`,
        action: "See why",
        go: () => nav.openProduct(c.product.key, false, "history"),
      });
    }
    if (risen.length > MOST)
      out.push({
        id: "rise-more",
        tone: "error",
        title: `${risen.length - MOST} more of your imports went up in the last ${RECENT_DAYS} days`,
        detail: "Every change on your imports, with the tariff behind it",
        action: "Rate history",
        go: () => nav.openTab("history"),
      });

    // 2. Tariff actions still to take effect, or that name an import (before the duty engine
    // confirms them), newest first
    const pending = (updates ?? []).filter((u) => {
      const m = matches.get(u.slug);
      if (u.kind === "hts_revision" || !m || m.confirmed + m.likely === 0) return false;
      const upcoming = !!u.effective_on && u.effective_on > today;
      return upcoming || (m.confirmed === 0 && u.last_activity_at.slice(0, 10) >= addDays(today, -45));
    });
    for (const u of pending.slice(0, MOST)) {
      const upcoming = !!u.effective_on && u.effective_on > today;
      out.push({
        id: `action-${u.slug}`,
        tone: "warning",
        title: upcoming ? `From ${day(u.effective_on!, false)}: ${u.title}` : u.title,
        detail: matchLabel(matches.get(u.slug)!).text,
        action: "See the impact",
        go: () => openAction(u.slug),
      });
    }

    // 3. AD/CVD: imports a case covers (by the user's own answer), then those still to check
    const covered = keyed.filter((i) => adcvd.get(i.key)?.applies);
    const toCheck = keyed.filter((i) => adcvd.get(i.key) && !adcvd.get(i.key)!.applies);
    if (covered.length)
      out.push({
        id: "adcvd-applies",
        tone: "error",
        title: `AD/CVD applies to ${covered.length === 1 ? name(covered[0].key) : `${covered.length} of your imports`}`,
        detail: "Deposits are due on top of the duty. See the rate range and what to do.",
        action: "Open",
        go: () => nav.openProduct(covered[0].key, false, "adcvd"),
      });
    if (toCheck.length)
      out.push({
        id: "adcvd-check",
        tone: "warning",
        title: `AD/CVD cases may cover ${toCheck.length === 1 ? name(toCheck[0].key) : `${toCheck.length} of your imports`}`,
        detail: "A few questions per case rule most of them out",
        action: "Check",
        go: () => nav.openProduct(toCheck[0].key, false, "adcvd"),
      });

    // 4. Setting up: alerts first (the product's promise), then the import values
    if (items.length && (!signedIn || (!alerts.loading && !alerts.on)))
      out.push({
        id: "setup-alerts",
        tone: "primary",
        title: "Turn on alerts for your imports",
        detail: `Hear the day a tariff change hits any of your ${items.length.toLocaleString("en-US")} imports, by email, Slack or Teams`,
        action: "Turn on alerts",
        go: () => nav.openTab("alerts"),
        main: true,
      });
    const onDefault = products.filter((p) => p.adjustments.customsValue === undefined);
    if (onDefault.length)
      out.push({
        id: "setup-values",
        tone: "primary",
        title: "Set your import values",
        detail: `${onDefault.length.toLocaleString("en-US")} of your ${products.length.toLocaleString("en-US")} imports use the $10,000 default, so their dollar amounts are estimates`,
        action: "Set values",
        go: () => nav.openProduct(onDefault[0].key, false, "duty"),
        main: !out.some((i) => i.main),
      });
    return out;
  }, [loading, products, insights.changes, updates, matches, keyed, adcvd, items.length, signedIn, alerts.loading, alerts.on, today, nav]);
};

export const AttentionList = () => {
  const list = useAttention();
  return (
    <Module title="Needs Your Attention" subtitle={list?.length ? `${list.length} ${list.length === 1 ? "thing" : "things"} to look at, the most pressing first` : undefined} padded={false}>
      {!list ? (
        <div className="flex flex-col gap-2 px-5 pb-5 sm:px-6" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${ui.skeleton} h-12 w-full`} />
          ))}
        </div>
      ) : !list.length ? (
        <div className="flex items-center gap-3 px-5 pb-6 sm:px-6">
          <CheckCircleIcon className="h-6 w-6 shrink-0 text-success" aria-hidden />
          <p className={`${tt.body} m-0`}>Nothing needs you today. When a tariff change hits one of your imports, it shows up here.</p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {list.map((item) => (
            <li key={item.id} className="flex items-center gap-4 border-t border-base-300 px-5 py-3.5 sm:px-6">
              <span className={`w-1 self-stretch rounded-full ${STRIPE[item.tone]}`} aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold leading-snug text-base-content">{item.title}</span>
                <span className={tt.caption}>{item.detail}</span>
              </div>
              <button type="button" className={`${ui.button({ variant: item.main ? "primary" : "secondary", size: "sm" })} shrink-0`} onClick={item.go}>
                {item.action}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Module>
  );
};
