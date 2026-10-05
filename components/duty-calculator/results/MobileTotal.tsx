import { formatMoney } from "../lib/format";

// A total in the phone statement; `strong` for the grand total
export const MobileTotal = ({
  label,
  amount,
  strong,
}: {
  label: string;
  amount: number;
  strong?: boolean;
}) => (
  <li
    className={`border-t border-base-content/20 px-5 py-3.5 flex items-baseline justify-between gap-4 ${
      strong ? "bg-base-200" : ""
    }`}
  >
    <span className="text-sm font-semibold">{label}</span>
    <span className="tabular-nums text-base font-semibold">
      {formatMoney(amount)}
    </span>
  </li>
);
