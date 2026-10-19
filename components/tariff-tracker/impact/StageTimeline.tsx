"use client";

import { useEffect, useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { STAGE_DETAIL, STAGE_LABELS } from "@/components/tariff-updates/labels";
import { stagesFor, type Stage } from "@/libs/tariff-updates/types";
import type { TrackerUpdate } from "../overview/useTariffUpdates";
import { day, relativeDays } from "./format";

// Where a tariff action stands (DESIGN_SYSTEM.md §15): its stage is a status, the latest it has
// reached, shown as a chip; under it the path so far as a short vertical timeline, oldest first.
// Each stage it reached has its date and the official document behind it; the day it takes (or
// took) effect sits among them by date; the stages still ahead are faded. Stages it skipped (many
// actions are never announced first) aren't shown.

interface Source {
  stage: Stage | null;
  published_at: string;
  title: string;
  url: string;
}

type Step = { id: string; label: string; detail: string; date: string | null; url?: string; state: "done" | "now" | "ahead" | "effective" };

export const StageTimeline = ({ update, today }: { update: TrackerUpdate; today: string }) => {
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
  const effective: Step[] = update.effective_on
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
  // By date; on the same day, the stage before the day it takes effect
  const past = [...reached, ...effective].sort(
    (a, b) => (a.date ?? "").slice(0, 10).localeCompare((b.date ?? "").slice(0, 10)) || (a.state === "effective" ? 1 : 0) - (b.state === "effective" ? 1 : 0),
  );
  // What it could still reach
  const ahead: Step[] = STAGE_ORDER.slice(current + 1).map((stage): Step => ({ id: stage, label: STAGE_LABELS[stage], detail: STAGE_DETAIL[stage], date: null, state: "ahead" }));
  const steps = [...past, ...ahead];

  return (
    <section className="flex flex-col gap-3" aria-labelledby="tt-impact-stage">
      <div className="flex items-center justify-between gap-3">
        <h3 id="tt-impact-stage" className={tt.sectionTitle}>
          Where It Stands
        </h3>
        <span className={tt.chip("primary")}>{STAGE_LABELS[update.stage]}</span>
      </div>
      {sources === null ? (
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
