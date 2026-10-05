import { WorkedExample as WorkedExampleData } from "@/libs/duty-calculator-content";
import { formatDutyPct, formatSummaryDate } from "@/libs/hts-duty-summary";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { BASE_DUTY_COLOR, FEES_COLOR, PROGRAM_COLORS } from "@/components/ui/theme";
import { formatMoney, formatPct } from "../lib/format";

// One real entry worked through as a receipt: each part of the duty in the calculator's chart
// colors, then the fees and the total.
export const WorkedExample = ({ example, asOf }: { example: WorkedExampleData; asOf: string }) => {
  const parts = [
    { label: `Base rate (${example.baseRate})`, amount: example.baseAmount, color: BASE_DUTY_COLOR, code: undefined as string | undefined },
    ...example.lines.map((l, i) => ({
      label: `${l.program} (${formatDutyPct(l.ratePct)})`,
      amount: l.amount,
      color: PROGRAM_COLORS[i % PROGRAM_COLORS.length],
      code: l.code,
    })),
  ];
  const total = example.totalDuty + example.totalFees;
  return (
    <div className={`${ui.card} self-start p-5 sm:p-6`}>
      <span className={ui.label}>Worked example</span>
      <h3 className={`${ui.cardTitle} mt-1.5`}>
        Example: {formatMoney(example.customsValue)} of {example.productName} (HTS {example.htsno})
        from {example.countryName}, entered {formatSummaryDate(asOf)} by ocean
      </h3>
      <div className="mt-4 flex items-baseline justify-between gap-3 tabular-nums">
        <span className="text-sm text-base-content/60">Duty and fees</span>
        <span className={ui.metric.primaryCompact}>{formatMoney(total)}</span>
      </div>
      {/* Where the money goes */}
      <div className="mt-3 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-base-300" aria-hidden>
        {[...parts, { label: "Fees", amount: example.totalFees, color: FEES_COLOR, code: undefined }]
          .filter((p) => p.amount > 0)
          .map((p) => (
            <span key={p.label} style={{ width: `${(p.amount / total) * 100}%`, background: p.color }} />
          ))}
      </div>
      <table className="mt-4 w-full text-sm tabular-nums text-base-content">
        <tbody>
          {parts.map((p) => (
            <tr key={p.label} className="border-t border-base-300">
              <td className="py-2 pr-3 text-base-content/70">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded align-middle" style={{ background: p.color }} aria-hidden />
                {p.label}
                {p.code && (
                  <>
                    {" "}
                    <span className={`${mono.className} ${ui.caption}`}>{p.code}</span>
                  </>
                )}
              </td>
              <td className="py-2 text-right">{formatMoney(p.amount)}</td>
            </tr>
          ))}
          <tr className="border-t border-base-content/20 font-semibold">
            <td className="py-2 pr-3">Total duty</td>
            <td className="py-2 text-right">{formatMoney(example.totalDuty)}</td>
          </tr>
          {example.fees.map((f) => (
            <tr key={f.name} className="border-t border-base-300">
              <td className="py-2 pr-3 text-base-content/70">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded align-middle" style={{ background: FEES_COLOR }} aria-hidden />
                {f.name} ({formatPct(f.ratePct)})
              </td>
              <td className="py-2 text-right">{formatMoney(f.amount)}</td>
            </tr>
          ))}
          <tr className="border-t border-base-content/20 font-semibold">
            <td className="py-2 pr-3">Total duty and fees</td>
            <td className="py-2 text-right">{formatMoney(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
