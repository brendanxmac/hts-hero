"use client";

import { BottomAxis, ChartFrame, GroupedBars, HitArea, Legend, linearScale, nearestIndex, niceMax, Tooltip, TooltipRow, useHovered, ValueAxis } from "@/components/ui/charts/kit";
import * as ui from "@/components/ui/styles";
import { SERIES_COLORS } from "@/components/ui/theme";
import { formatDate } from "../../../duty-calculator/lib/format";
import { wholeDollars } from "../../insights/teasers";
import { money, VERDICTS } from "../EntriesTable";
import { AuditRow } from "../useAuditRows";

// What was paid and what was owed on each audited entry, oldest first: a pair of bars per entry,
// with the entry's date, both amounts and the difference on hover. Paid and owed are two series in
// the chart palette's first two slots. On the chart kit.

const HEIGHT = 240;
const MARGIN = { top: 12, right: 12, bottom: 28, left: 60 };
const PAID = SERIES_COLORS[0];
const OWED = SERIES_COLORS[1];

export const PaidVsOwedChart = ({ rows }: { rows: AuditRow[] }) => {
  const hover = useHovered();
  const audited = rows.filter((r) => r.audit).sort((a, b) => a.entry.entryDate.localeCompare(b.entry.entryDate));
  if (!audited.length) return null;

  const ids = audited.map((r) => r.entry.id);
  const max = niceMax(Math.max(...audited.flatMap((r) => [r.entry.dutyPaid, r.audit!.owed]), 1));

  return (
    <section className={`${ui.card} flex flex-col gap-4 p-5`} aria-labelledby="tt-paid-owed">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="tt-paid-owed" className={ui.cardTitle}>
            Paid Against Owed, Entry by Entry
          </h3>
          <p className={`${ui.caption} mt-0.5`}>
            {audited.length} audited {audited.length === 1 ? "entry" : "entries"}, oldest first.
          </p>
        </div>
        <Legend
          items={[
            { label: "Paid", color: PAID },
            { label: "Owed", color: OWED },
          ]}
        />
      </div>

      <ChartFrame
        height={HEIGHT}
        margin={MARGIN}
        label="Duty paid and owed on each audited entry"
        onLeave={hover.clear}
        overlay={({ innerWidth, innerHeight }) => {
          if (hover.index === null) return null;
          const r = audited[hover.index];
          const step = innerWidth / audited.length;
          const y = linearScale([0, max], [innerHeight, 0]);
          return (
            <Tooltip x={step * hover.index + step / 2} y={y(Math.max(r.entry.dutyPaid, r.audit!.owed))}>
              <p className="m-0 mb-1 font-semibold text-base-content">{formatDate(r.entry.entryDate)}</p>
              <TooltipRow color={PAID} label="Paid" value={money(r.entry.dutyPaid)} />
              <TooltipRow color={OWED} label="Owed" value={money(r.audit!.owed)} />
              <p className="m-0 mt-1 text-base-content/70">{VERDICTS[r.audit!.verdict].label}</p>
            </Tooltip>
          );
        }}
      >
        {({ innerWidth, innerHeight }) => {
          const y = linearScale([0, max], [innerHeight, 0]);
          const step = innerWidth / audited.length;
          const centres = audited.map((_, i) => step * i + step / 2);
          return (
            <>
              <ValueAxis ticks={y.ticks(3)} y={y} format={wholeDollars} />
              <GroupedBars
                categories={ids}
                series={[
                  { key: "paid", color: PAID, values: Object.fromEntries(audited.map((r) => [r.entry.id, r.entry.dutyPaid])) },
                  { key: "owed", color: OWED, values: Object.fromEntries(audited.map((r) => [r.entry.id, r.audit!.owed])) },
                ]}
                y={y}
                hovered={hover.index === null ? null : ids[hover.index]}
              />
              <BottomAxis
                labels={[
                  { x: 0, text: formatDate(audited[0].entry.entryDate), anchor: "start" },
                  ...(audited.length > 1 ? [{ x: innerWidth, text: formatDate(audited[audited.length - 1].entry.entryDate), anchor: "end" as const }] : []),
                ]}
              />
              <HitArea onMove={(px) => hover.set(nearestIndex(centres, px))} />
            </>
          );
        }}
      </ChartFrame>
    </section>
  );
};
