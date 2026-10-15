import { formatMoney } from "../lib/format";

// A total in the statement table; `strong` for the grand total
export const TotalRow = ({
  label,
  amount,
  strong,
  before,
  hideBasis,
}: {
  label: string;
  amount: number;
  strong?: boolean;
  // The total before the last answer, when it moved
  before?: number;
  // The table has no "Applies to" column
  hideBasis?: boolean;
}) => (
  <tr
    className={`border-t ${strong ? "border-base-content/20 bg-primary/[0.06]" : "border-base-content/20"}`}
  >
    <td
      colSpan={hideBasis ? 2 : 3}
      className={`py-3.5 pl-5 sm:pl-6 pr-3 text-sm ${strong ? "font-semibold" : "font-semibold text-base-content/70"}`}
    >
      {label}
    </td>
    <td className="tabular-nums py-3.5 pl-3 pr-5 sm:pr-6 text-right whitespace-nowrap text-base font-semibold">
      {before !== undefined && Math.abs(before - amount) >= 0.005 && (
        <span className="block text-xs font-normal text-base-content/60 line-through">{formatMoney(before)}</span>
      )}
      {formatMoney(amount)}
    </td>
  </tr>
);
