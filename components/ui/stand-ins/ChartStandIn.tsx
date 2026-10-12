import { CHART_COLORS } from "../theme";
import * as ui from "../styles";

// A made-up stacked step chart, drawn behind a LockedPreview's blur in place of a real duty
// chart. Fixed numbers: it must never show anyone's real data.
const STEPS = [
  [12, 0, 0],
  [12, 10, 0],
  [12, 10, 15],
  [12, 25, 15],
  [12, 25, 5],
  [12, 30, 5],
  [12, 18, 5],
];

export const ChartStandIn = ({ title = "Duty over time" }: { title?: string }) => {
  const max = 60;
  const w = 100 / STEPS.length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className={ui.cardTitle}>{title}</span>
          <span className={ui.caption}>Every change, by date</span>
        </div>
        <span className={ui.metric.secondary}>42.0%</span>
      </div>
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="h-48 w-full">
        {STEPS.map((layers, i) => {
          let y = 50;
          return layers.map((v, j) => {
            const h = (v / max) * 50;
            y -= h;
            // Runtime geometry and theme chart colors (DESIGN_SYSTEM §10)
            return <rect key={`${i}-${j}`} x={i * w} y={y} width={w} height={h} fill={CHART_COLORS[j]} />;
          });
        })}
      </svg>
      <div className="flex flex-col gap-2">
        {["Section 301 increased", "Section 122 added", "Reciprocal tariff changed"].map((t) => (
          <div key={t} className="flex items-center justify-between border-t border-base-300 pt-2 text-sm">
            <span>{t}</span>
            <span className="tabular-nums">+10.0%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
