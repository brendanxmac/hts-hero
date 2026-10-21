"use client";

import { useEffect, useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { STAGE_DETAIL, STAGE_LABELS } from "@/components/tariff-updates/labels";
import { EVENTS } from "@/libs/adcvd/types";
import { createSupabaseClient } from "@/libs/supabase/client";
import { stagesFor, type Stage } from "@/libs/tariff-updates/types";
import type { TrackerUpdate } from "../overview/useTariffUpdates";
import { day, relativeDays } from "./format";

// Where a tariff action stands (DESIGN_SYSTEM.md §15): its stage is a status, the latest it has
// reached, shown as a chip; under it the path so far as a short vertical timeline, oldest first.
// Each stage it reached has its date and the official document behind it; the day it takes (or
// took) effect sits among them by date; the stages still ahead are faded. Stages it skipped (many
// actions are never announced first) aren't shown. An AD/CVD proceeding uses its own milestones
// instead (petition, investigation started, preliminary and final determinations, ITC votes, order),
// from its notices in adcvd_events, with an investigation's milestones still to come faded.

interface Source {
  stage: Stage | null;
  published_at: string;
  title: string;
  url: string;
}

type Step = { id: string; label: string; detail: string; date: string | null; url?: string; state: "done" | "now" | "ahead" | "effective" };

const ActionStages = ({ update, today }: { update: TrackerUpdate; today: string }) => {
  const [sources, setSources] = useState<Source[] | null>(null);
  useEffect(() => {
    let live = true;
    setSources(null);
    fetch(`/api/tariff-updates/sources?slug=${encodeURIComponent(update.slug)}`)
      .then((r): Promise<{ sources: Source[] }> | { sources: Source[] } => (r.ok ? r.json() : { sources: [] }))
      .then((d: { sources: Source[] }) => live && setSources(d.sources ?? []))
      .catch(() => live && setSources([]));
    return () => {
      live = false;
    };
  }, [update.slug]);

  // Only the stages this kind of action can reach (AD/CVD: filed early and published)
  const STAGE_ORDER = stagesFor(update);
  const current = STAGE_ORDER.indexOf(update.stage);
  // Each stage reached, with its first document; the current stage always counts as reached
  const reached: Step[] = STAGE_ORDER.flatMap((stage, i): Step[] => {
    // A stage passed: when it got there. The stage it's at now: its latest document (an AD/CVD case
    // publishes several notices on its way)
    const docs = (sources ?? []).filter((s) => s.stage === stage).sort((a, b) => a.published_at.localeCompare(b.published_at));
    const doc = i === current ? docs[docs.length - 1] : docs[0];
    if (!doc && i !== current) return [];
    return [
      {
        id: stage,
        label: STAGE_LABELS[stage],
        detail: STAGE_DETAIL[stage],
        date: doc?.published_at ?? (i === current ? update.last_activity_at : null),
        url: doc?.url,
        state: i === current ? "now" : "done",
      },
    ];
  }).filter((s) => STAGE_ORDER.indexOf(s.id as Stage) <= current);
  const past = byDate([...reached, ...effectiveStep(update, today)]);
  // What it could still reach
  const ahead: Step[] = STAGE_ORDER.slice(current + 1).map((stage): Step => ({ id: stage, label: STAGE_LABELS[stage], detail: STAGE_DETAIL[stage], date: null, state: "ahead" }));
  const steps = [...past, ...ahead];

  return <Timeline chip={STAGE_LABELS[update.stage]} steps={sources === null ? null : steps} today={today} />;
};

// The day it takes (or took) effect, as a milestone
const effectiveStep = (update: TrackerUpdate, today: string): Step[] =>
  update.effective_on
    ? [
        {
          id: "effective",
          label: update.effective_on > today ? "Takes effect" : "In effect",
          detail: `Applies to goods entered on or after this day (${relativeDays(update.effective_on, today)})`,
          date: update.effective_on,
          state: "effective",
        },
      ]
    : [];

// By date; on the same day, the milestone before the day it takes effect
const byDate = (steps: Step[]) =>
  [...steps].sort(
    (a, b) => (a.date ?? "").slice(0, 10).localeCompare((b.date ?? "").slice(0, 10)) || (a.state === "effective" ? 1 : 0) - (b.state === "effective" ? 1 : 0),
  );

// ── AD/CVD: the case's own milestones (libs/adcvd), from its notices ──

interface CaseEvent {
  event: string;
  published_on: string;
  agency: "commerce" | "itc" | "cbp";
  url: string;
}

// Short names for the timeline
const CASE_LABELS: Record<string, string> = {
  itc_institution: "Petition filed",
  initiation: "Investigation started",
  itc_prelim: "ITC preliminary vote",
  prelim: "Preliminary determination",
  final: "Final determination",
  itc_final: "ITC final vote",
  order: "Order issued",
  continuation: "Order continued",
  revocation: "Order revoked",
  termination: "Investigation ended",
  suspension: "Suspension agreement",
  circumvention: "Circumvention inquiry",
  scope_ruling: "Scope ruling",
};
const AGENCY = { commerce: "Commerce", itc: "the US International Trade Commission", cbp: "CBP" };

// An investigation's path, in order: what's still ahead once it's under way
const INVESTIGATION = ["itc_institution", "initiation", "itc_prelim", "prelim", "final", "itc_final", "order"];
// Where an investigation ends early, or ends
const CLOSES = new Set(["order", "termination", "suspension"]);

const CaseStages = ({ update, today }: { update: TrackerUpdate; today: string }) => {
  const [events, setEvents] = useState<CaseEvent[] | null>(null);
  useEffect(() => {
    let live = true;
    setEvents(null);
    createSupabaseClient()
      .from("adcvd_events")
      .select("event, published_on, agency, url")
      .eq("update_id", update.id)
      .order("published_on")
      .then(({ data }) => live && setEvents((data ?? []) as CaseEvent[]));
    return () => {
      live = false;
    };
  }, [update.id]);

  if (events === null) return <Timeline chip="AD/CVD" steps={null} today={today} />;
  // One step per milestone (a case's AD and CVD sides, or several countries, publish the same one):
  // the first notice of each, in date order
  const first = new Map<string, CaseEvent>();
  for (const e of events) if (!first.has(e.event)) first.set(e.event, e);
  const reached = Array.from(first.values());
  const latest = events[events.length - 1];
  const done: Step[] = reached.map((e) => ({
    id: e.event,
    label: CASE_LABELS[e.event] ?? EVENTS[e.event as keyof typeof EVENTS] ?? "Notice",
    detail: `Published by ${AGENCY[e.agency] ?? "Commerce"} in the Federal Register`,
    date: e.published_on,
    url: e.url,
    state: e.event === latest?.event ? "now" : "done",
  }));
  // An investigation still under way: the milestones it hasn't reached, faded
  const investigating = reached.some((e) => INVESTIGATION.includes(e.event)) && !reached.some((e) => CLOSES.has(e.event));
  const furthest = Math.max(-1, ...reached.map((e) => INVESTIGATION.indexOf(e.event)));
  const ahead: Step[] = investigating
    ? INVESTIGATION.slice(furthest + 1)
        .filter((ev) => !first.has(ev))
        .map((ev): Step => ({ id: ev, label: CASE_LABELS[ev], detail: "Still to come in the investigation", date: null, state: "ahead" }))
    : [];
  const chip = latest ? (CASE_LABELS[latest.event] ?? EVENTS[latest.event as keyof typeof EVENTS] ?? "AD/CVD") : "AD/CVD";
  return <Timeline chip={chip} steps={[...byDate([...done, ...effectiveStep(update, today)]), ...ahead]} today={today} />;
};

// Where a tariff action stands: an AD/CVD proceeding by its own milestones, any other action by
// the stages it has reached
export const StageTimeline = ({ update, today }: { update: TrackerUpdate; today: string }) =>
  update.kind === "ad_cvd" || update.authority === "ad_cvd" ? <CaseStages update={update} today={today} /> : <ActionStages update={update} today={today} />;

const Timeline = ({ chip, steps, today }: { chip: string; steps: Step[] | null; today: string }) => {
  return (
    <section className="flex flex-col gap-3" aria-labelledby="tt-impact-stage">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <h3 id="tt-impact-stage" className={`${tt.sectionTitle} whitespace-nowrap`}>
          Where It Stands
        </h3>
        <span className={tt.chip("primary")}>{chip}</span>
      </div>
      {steps === null ? (
        <div className={`${ui.skeleton} h-32 w-full`} />
      ) : (
        <ol className="m-0 flex list-none flex-col p-0">
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            const dot =
              s.state === "now"
                ? "border-primary bg-primary ring-4 ring-primary/15"
                : s.state === "done"
                  ? "border-primary bg-primary"
                  : s.state === "effective"
                    ? "border-warning bg-warning"
                    : "border-base-300 bg-base-100";
            return (
              <li key={s.id} className="relative flex gap-3 pb-3 last:pb-0" title={s.detail}>
                {/* The line down to the next step: solid along the path so far, dotted ahead */}
                {!last && (
                  <span
                    className={`absolute left-[5px] top-4 bottom-0 w-0.5 ${steps[i + 1].state === "ahead" ? "border-l-2 border-dotted border-base-300" : "bg-primary/30"}`}
                    aria-hidden
                  />
                )}
                <span className={`relative mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${dot}`} aria-hidden />
                <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                  <span className={`text-sm ${s.state === "ahead" ? "text-base-content/50" : s.state === "now" ? "font-semibold text-base-content" : "text-base-content/80"}`}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-primary hover:underline">
                        {s.label}
                        <ArrowTopRightOnSquareIcon className="h-3 w-3 opacity-60" aria-hidden />
                      </a>
                    ) : (
                      s.label
                    )}
                  </span>
                  {s.date && (
                    <span className={`${tt.caption} shrink-0 text-right tabular-nums`}>
                      {day(s.date)}
                      {s.state === "effective" && <span className="block text-warning">{relativeDays(s.date, today)}</span>}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
