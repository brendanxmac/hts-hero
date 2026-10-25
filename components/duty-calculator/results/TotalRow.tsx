import { formatMoney } from "../lib/format";

// A total in the statement table; `strong` for the grand total
export const TotalRow = ({
  label,
  amount,
  strong,
  hideBasis,
}: {
  label: string;
  amount: number;
  strong?: boolean;
  // The table has no "Applies to" column
  hideBasis?: boolean;
}) => (
  <tr
    // In the Tracker's look a total sits under the strong rule (2px where the structure changes), the
    // grand total on the container fill
    className={`border-t ${strong ? "border-base-content/20 bg-primary/[0.06] tracker:bg-tt-soft" : "border-base-content/20"} tracker:border-t-2 tracker:border-tt-rule`}
  >
    <td
      colSpan={hideBasis ? 2 : 3}
      className={`py-3.5 pl-5 sm:pl-6 pr-3 text-sm ${strong ? "font-semibold" : "font-semibold text-base-content/70"}`}
    >
      {label}
    </td>
    <td className="tabular-nums py-3.5 pl-3 pr-5 sm:pr-6 text-right whitespace-nowrap text-base font-semibold">
      {formatMoney(amount)}
    </td>
  </tr>
);
