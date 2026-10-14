import { StackedBar } from "@/components/ui/charts/StackedBar";
import * as tt from "@/components/ui/styles/tracker";
import { Table, TBody, Td, Tr } from "@/components/ui/table";
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

      <Table label="Duty by part" edge="flush" dense>
        <TBody>
          {product.parts.map((p) => (
            <Tr key={p.key}>
              <Td muted>
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: colors[p.key] }} aria-hidden />
                {shortProgram(p.key)}
              </Td>
              <Td align="right" className="text-base-content">
                {formatRate(p.pct)}
              </Td>
              <Td align="right" muted>
                {money((p.pct / 100) * product.customsValue)}
              </Td>
            </Tr>
          ))}
          <Tr>
            <Td muted>Fees (MPF, HMF)</Td>
            <Td align="right" className="text-base-content/40">
              —
            </Td>
            <Td align="right" muted>
              {money(product.result.totalFees)}
            </Td>
          </Tr>
          <Tr total>
            <Td>Duty on one shipment</Td>
            <Td align="right">{formatRate(product.totalPct)}</Td>
            <Td align="right">{money(product.result.totalDuty)}</Td>
          </Tr>
        </TBody>
      </Table>
    </SummaryCard>
  );
};
