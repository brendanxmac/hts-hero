import { formatMoney } from "../lib/format";

// A total in the statement table; `strong` for the grand total
export const TotalRow = ({
  label,
  amount,
  strong,
}: {
  label: string;
  amount: number;
  strong?: boolean;
}) => (
  <tr
    className={`border-t ${strong ? "border-base-content/20 bg-base-200" : "border-base-content/20"}`}
  >
    <td
      colSpan={3}
      className={`py-3.5 pl-5 sm:pl-6 pr-3 text-sm ${strong ? "font-semibold" : "font-semibold text-base-content/70"}`}
    >
      {label}
    </td>
    <td className="tabular-nums py-3.5 pl-3 pr-5 sm:pr-6 text-right whitespace-nowrap text-base font-semibold">
      {formatMoney(amount)}
    </td>
  </tr>
);
