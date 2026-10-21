"use client";

import {
  BottomAxis,
  ChartFrame,
  Crosshair,
  Dot,
  HitArea,
  Legend,
  linearScale,
  nearestIndex,
  niceMax,
  StepLine,
  stepIndexAt,
  time,
  timeScale,
  Tooltip,
  TooltipRow,
  useHovered,
  ValueAxis,
} from "@/components/ui/charts/kit";
import * as ui from "@/components/ui/styles";
import { ERROR_MARK, PRIMARY_MARK, SUCCESS_MARK } from "@/components/ui/theme";
import { formatDate } from "../../../duty-calculator/lib/format";
import { IsoDate } from "../../../../tariffs/engine-v2/types";
import { formatRate } from "../../formatRate";
import { ProductHistory } from "../../insights/catalogHistory";
import { AuditVerdict } from "../entries";
import { money, VERDICTS } from "../EntriesTable";
import { AuditRow } from "../useAuditRows";

// One product's duty rate in force over time, as a step line, with each audited entry on it: a
// dot at the rate that was paid, joined to the rate owed that day. An entry paid at the old rate
// just after a change sits off the line, which is the refund (or the underpayment) to look at.
// Hovering picks the nearest entry (or, with none, the step) and shows it. On the chart kit.

const HEIGHT = 260;
const DOT: Record<AuditVerdict, string> = { overpaid: SUCCESS_MARK, underpaid: ERROR_MARK, correct: PRIMARY_MARK };

export const RateTimeline = ({ history, rows, to }: { history: ProductHistory; rows: AuditRow[]; to: IsoDate }) => {
  const hover = useHovered();
  const audited = rows.filter((r) => r.audit).sort((a, b) => a.entry.entryDate.localeCompare(b.entry.entryDate));
  if (!history.length) return null;

  // From the earlier of the history's start and the first entry, so every entry is on the plot
  const from = audited.length && audited[0].entry.entryDate < history[0].from ? audited[0].entry.entryDate : history[0].from;
  const max = niceMax(Math.max(...history.map((s) => s.pct), ...audited.flatMap((r) => [r.audit!.ratePaidPct, r.audit!.rateOwedPct]), 0.01));
  const scales = (w: number, h: number) => ({ x: timeScale(from, to, [0, w]), y: linearScale([0, max], [h, 0]) });
  const byEntries = audited.length > 0;

  return (
    <section className={`${ui.card} flex flex-col gap-4 p-5`} aria-labelledby="tt-rate-timeline">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="tt-rate-timeline" className={ui.cardTitle}>
            Your Entries Against the Rate in Force
          </h3>
          <p className={`${ui.caption} mt-0.5`}>The line is the duty rate in force; each dot is an entry, at the rate you paid.</p>
        </div>
        <Legend
          items={[
            { label: "Rate in force", color: PRIMARY_MARK, shape: "line" },
            ...(["overpaid", "underpaid", "correct"] as AuditVerdict[]).map((v) => ({ label: VERDICTS[v].label, color: DOT[v], shape: "dot" as const })),
          ]}
        />
      </div>

      <ChartFrame
        height={HEIGHT}
        label="Duty rate in force over time, with each audited entry"
        onLeave={hover.clear}
        overlay={({ innerWidth, innerHeight }) => {
          if (hover.index === null) return null;
          const { x, y } = scales(innerWidth, innerHeight);
          if (byEntries) {
            const r = audited[hover.index];
            const a = r.audit!;
            return (
              <Tooltip x={x.at(r.entry.entryDate)} y={y(a.ratePaidPct)}>
                <p className="m-0 mb-1 font-semibold text-base-content">
                  {formatDate(r.entry.entryDate)}
                  {r.entry.entryNumber ? ` · ${r.entry.entryNumber}` : ""}
                </p>
                <TooltipRow color={DOT[a.verdict]} label="Paid" value={`${formatRate(a.ratePaidPct)} · ${money(r.entry.dutyPaid)}`} />
                <TooltipRow color={PRIMARY_MARK} label="Owed" value={`${formatRate(a.rateOwedPct)} · ${money(a.owed)}`} />
                <p className="m-0 mt-1 text-base-content/70">
                  {VERDICTS[a.verdict].label}
                  {a.verdict !== "correct" ? `: ${money(Math.abs(a.difference))}` : ""}
                </p>
              </Tooltip>
            );
          }
          const step = history[hover.index];
          return (
            <Tooltip x={x.at(step.from)} y={y(step.pct)}>
              <p className="m-0 mb-1 font-semibold text-base-content">Since {formatDate(step.from)}</p>
              <TooltipRow color={PRIMARY_MARK} label="Rate in force" value={formatRate(step.pct)} />
            </Tooltip>
          );
        }}
      >
        {({ innerWidth, innerHeight }) => {
          const { x, y } = scales(innerWidth, innerHeight);
          const entryXs = audited.map((r) => x.at(r.entry.entryDate));
          const stepXs = history.map((s) => x.at(s.from));
          const activeEntry = byEntries && hover.index !== null ? audited[hover.index] : null;
          return (
            <>
              <ValueAxis ticks={y.ticks(3)} y={y} format={formatRate} />
              <BottomAxis
                labels={[
                  { x: 0, text: formatDate(from), anchor: "start" },
                  { x: innerWidth, text: "Today", anchor: "end" },
                ]}
              />
              <StepLine points={history.map((s) => ({ x: time(s.from), y: s.pct }))} x={x} y={y} to={time(to)} color={PRIMARY_MARK} />
              {audited.map((r) => {
                const a = r.audit!;
                const cx = x.at(r.entry.entryDate);
                return (
                  <g key={r.entry.id} pointerEvents="none">
                    {/* Theme marks at runtime positions (DESIGN_SYSTEM §10) */}
                    <line x1={cx} x2={cx} y1={y(a.ratePaidPct)} y2={y(a.rateOwedPct)} stroke={DOT[a.verdict]} strokeWidth={2} strokeDasharray="3 3" />
                    <Dot cx={cx} cy={y(a.ratePaidPct)} color={DOT[a.verdict]} active={activeEntry === r} />
                  </g>
                );
              })}
              {activeEntry && <Crosshair x={x.at(activeEntry.entry.entryDate)} />}
              {!byEntries && hover.index !== null && <Crosshair x={stepXs[hover.index]} />}
              <HitArea onMove={(px) => hover.set(byEntries ? nearestIndex(entryXs, px) : stepIndexAt(stepXs, px))} />
            </>
          );
        }}
      </ChartFrame>
    </section>
  );
};
