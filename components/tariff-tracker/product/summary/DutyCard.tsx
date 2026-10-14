import { formatMoney } from "../../../duty-calculator/lib/format";
import { formatRate } from "../../formatRate";
import { programColors } from "../../programColors";
import { shortProgram, TrackedProduct } from "../../report";
import { RateBars } from "../savings/RateBars";
import { SummaryCard } from "./SummaryCard";

// What the product pays today: its rate as one bar, then each part of it as a rate and in dollars
// on its shipment, with the fees
export const DutyCard = ({ product, onOpen }: { product: TrackedProduct; onOpen: () => void }) => {
  const colors = programColors([product]);
  const money = (n: number) => formatMoney(Math.round(n * 100) / 100);
  return (
    <SummaryCard title="Duty today" link={{ label: "Open the calculator", onClick: onOpen }}>
      <RateBars bars={[{ label: "Total duty rate", pct: product.totalPct, parts: product.parts }]} />
      <table className="w-full text-sm tabular-nums">
        <tbody>
          {product.parts.map((p) => (
            <tr key={p.key} className="border-t border-base-300">
              <td className="py-2 text-base-content/70">
                {/* Series color (DESIGN_SYSTEM §10) */}
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
