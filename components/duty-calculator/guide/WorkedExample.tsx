import { WorkedExample as WorkedExampleData } from "@/libs/duty-calculator-content";
import { formatDutyPct, formatSummaryDate } from "@/libs/hts-duty-summary";
import { mono } from "@/components/ui/font";
import * as mk from "@/components/ui/marketing/styles";
import { BASE_LABEL, FEES_LABEL, partColors } from "@/components/ui/charts/partColors";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { Table, TBody, Td, Tr } from "@/components/ui/table/Table";
import { formatMoney, formatPct } from "../lib/format";

// One real entry worked through as a receipt: each part of the duty in its color from every other
// chart (partColors), then the fees and the total.
export const WorkedExample = ({ example, asOf }: { example: WorkedExampleData; asOf: string }) => {
  const colors = partColors([BASE_LABEL, ...example.lines.map((l) => l.program), FEES_LABEL]);
  const parts = [
    { label: `Base rate (${example.baseRate})`, amount: example.baseAmount, color: colors[BASE_LABEL], code: undefined as string | undefined },
    ...example.lines.map((l) => ({
      label: `${l.program} (${formatDutyPct(l.ratePct)})`,
      amount: l.amount,
      color: colors[l.program],
      code: l.code,
    })),
  ];
  const total = example.totalDuty + example.totalFees;
  return (
    <div className="min-w-0 self-start rounded-2xl border border-slate-200 skin:border-base-300 bg-slate-50 skin:bg-tt-soft p-5 sm:p-7">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 skin:text-base-content/60">Worked example</span>
      <h3 className={`${mk.h3} mt-2 leading-snug`}>
        Example: {formatMoney(example.customsValue)} of {example.productName} (HTS {example.htsno})
        from {example.countryName}, entered {formatSummaryDate(asOf)} by ocean
      </h3>
      <div className="mt-6 flex items-baseline justify-between gap-3 tabular-nums">
        <span className="text-sm font-medium text-slate-500 skin:text-base-content/60">Duty and fees</span>
        <span className="text-3xl font-bold tracking-tight text-slate-900 skin:text-base-content">{formatMoney(total)}</span>
      </div>
      {/* Where the money goes */}
      <StackedBar
        className="mt-3"
        parts={[...parts, { label: "Fees", amount: example.totalFees, color: colors[FEES_LABEL] }]}
        formatValue={formatMoney}
        size="sm"
        shape="pill"
        legend={false}
      />
      <Table edge="flush" dense className="mt-4 text-slate-900 skin:text-base-content">
        <TBody>
          {parts.map((p) => (
            <Tr key={p.label}>
              <Td className="text-slate-600 skin:text-base-content/70">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded align-middle" style={{ background: p.color }} aria-hidden />
                {p.label}
                {p.code && (
                  <>
                    {" "}
                    <span className={`${mono.className} text-xs text-slate-500 skin:text-base-content/60`}>{p.code}</span>
                  </>
                )}
              </Td>
              <Td align="right">{formatMoney(p.amount)}</Td>
            </Tr>
          ))}
          <Tr total>
            <Td>Total duty</Td>
            <Td align="right">{formatMoney(example.totalDuty)}</Td>
          </Tr>
          {example.fees.map((f) => (
            <Tr key={f.name}>
              <Td className="text-slate-600 skin:text-base-content/70">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded align-middle" style={{ background: colors[FEES_LABEL] }} aria-hidden />
                {f.name} ({formatPct(f.ratePct)})
              </Td>
              <Td align="right">{formatMoney(f.amount)}</Td>
            </Tr>
          ))}
          <Tr total>
            <Td>Total duty and fees</Td>
            <Td align="right">{formatMoney(total)}</Td>
          </Tr>
        </TBody>
      </Table>
    </div>
  );
};
