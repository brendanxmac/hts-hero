import { Billing, formatPrice, monthlyRate } from "../lib/pricing";

// A plan's price per month in the marketing style, with the list price struck through when billed
// annually. (PriceTag is the analytical version, used on /duty-calculator.)
export const PlanPrice = ({
  listPrice,
  billing,
  prefix,
  unit = "/mo",
  note,
  dark = false,
}: {
  listPrice: number;
  billing: Billing;
  // "From", for plans priced by tier
  prefix?: string;
  unit?: string;
  // Replaces the billing line under the price
  note?: string;
  dark?: boolean;
}) => {
  const price = monthlyRate(listPrice, billing);
  const billingLine = note ?? (billing === "annual" ? `${formatPrice(price * 12)} billed yearly` : "Billed monthly");

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {prefix && <span className={dark ? "text-slate-400" : "text-slate-500 skin:text-base-content/60"}>{prefix}</span>}
        <span className={`text-6xl font-extrabold tracking-tight tabular-nums ${dark ? "text-white" : "text-slate-900 skin:text-base-content"}`} aria-live="polite">
          {formatPrice(price)}
        </span>
        {unit && <span className={`text-lg ${dark ? "text-slate-400" : "text-slate-500 skin:text-base-content/60"}`}>{unit}</span>}
        {price < listPrice && (
          <span className={`text-lg tabular-nums line-through ${dark ? "text-slate-500 skin:text-base-content/60" : "text-slate-400"}`}>
            <span className="sr-only">was </span>
            {formatPrice(listPrice)}
          </span>
        )}
      </div>
      <p className={`mt-2 text-sm ${dark ? "text-slate-400" : "text-slate-500 skin:text-base-content/60"}`}>{billingLine}</p>
    </div>
  );
};
