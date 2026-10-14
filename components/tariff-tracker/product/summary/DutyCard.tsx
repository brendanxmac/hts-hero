import { StackedBar } from "@/components/ui/charts/StackedBar";
import * as tt from "@/components/ui/styles/tracker";
import { formatMoney, todayIso } from "../../../duty-calculator/lib/format";
import { addDays } from "../../../../tariffs/engine-v2/history";
import { formatRate } from "../../formatRate";
import { segmentOn } from "../../insights/catalogHistory";
import { useInsights } from "../../insights/InsightsContext";
import { programColors } from "../../programColors";
import { shortProgram, TrackedProduct } from "../../report";
import { SummaryCard } from "./SummaryCard";

// What the import pays today: its rate, big, with how it's moved in a year; a bar of what it's
// made of (base duty and each tariff); then each part as a rate and in dollars on its shipment,
// with the fees
export const DutyCard = ({ product, onOpen }: { product: TrackedProduct; onOpen: () => void }) => {
  const { histories } = useInsights();
  const colors = programColors([product]);
  const money = (n: number) => formatMoney(Math.round(n * 100) / 100);
  const history = histories.get(product.key);
  const yearAgo = history?.length ? segmentOn(history, addDays(todayIso(), -365)).pct : undefined;
  const moved = yearAgo === undefined ? 0 : product.totalPct - yearAgo;

  return (
    <SummaryCard title="Duty today" link={{ label: "Open the calculator", onClick: onOpen }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className={tt.eyebrow("primary")}>Duty rate</span>
          <p className={`${tt.metricLg} m-0 mt-1 text-primary`}>{formatRate(product.totalPct)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {yearAgo !== undefined && (
            <span className={tt.chip(Math.abs(moved) < 0.005 ? "neutral" : moved > 0 ? "error" : "success")}>
              {Math.abs(moved) < 0.005 ? "No change in a year" : `${moved > 0 ? "▲" : "▼"} ${formatRate(Math.abs(moved))} in a year`}
            </span>
          )}
          <span className="text-sm text-base-content/70">
            <span className="font-semibold tabular-nums text-base-content">{money(product.result.totalDuty)}</span> on{" "}
            {formatMoney(product.customsValue).replace(/\.00$/, "")}
            {product.adjustments.customsValue === undefined ? " (estimate)" : ""}
          </span>
        </div>
      </div>

      <StackedBar
        parts={product.parts.map((p) => ({ label: shortProgram(p.key), amount: p.pct, color: colors[p.key] }))}
        formatValue={formatRate}
        size="sm"
        shape="pill"
        legend={false}
      />

      <table className="w-full text-sm tabular-nums">
        <tbody>
          {product.parts.map((p) => (
            <tr key={p.key} className="border-t border-base-300">
              <td className="py-2 text-base-content/70">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: colors[p.key] }} aria-hidden />
                {shortProgram(p.key)}
              </td>
              <td className="py-2 text-right text-base-content">{formatRate(p.pct)}</td>
              <td className="py-2 text-right text-base-content/70">{money((p.pct / 100) * product.customsValue)}</td>
            </tr>
          ))}
          <tr className="border-t border-base-300">
            <td className="py-2 text-base-content/70">Fees (MPF, HMF)</td>
            <td className="py-2 text-right text-base-content/40">—</td>
            <td className="py-2 text-right text-base-content/70">{money(product.result.totalFees)}</td>
          </tr>
          <tr className="border-t border-base-300 font-semibold">
            <td className="py-2 text-base-content">Duty on one shipment</td>
            <td className="py-2 text-right text-base-content">{formatRate(product.totalPct)}</td>
            <td className="py-2 text-right text-base-content">{money(product.result.totalDuty)}</td>
          </tr>
        </tbody>
      </table>
    </SummaryCard>
  );
};
