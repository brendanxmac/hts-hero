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
  compact = false,
}: {
  listPrice: number;
  billing: Billing;
  // "From", for plans priced by tier
  prefix?: string;
  unit?: string;
  // Replaces the billing line under the price
  note?: string;
  dark?: boolean;
  // A smaller price, for the compact plan cards
  compact?: boolean;
}) => {
  const price = monthlyRate(listPrice, billing);
  const billingLine = note ?? (billing === "annual" ? `${formatPrice(price * 12)} billed yearly` : "Billed monthly");

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {prefix && <span className={dark ? "text-base-content/50" : "text-base-content/60 skin:text-base-content/60"}>{prefix}</span>}
        <span className={`${compact ? "text-4xl" : "text-6xl"} font-extrabold tracking-tight tabular-nums ${dark ? "text-base-content" : "text-base-content skin:text-base-content"}`} aria-live="polite">
          {formatPrice(price)}
        </span>
        {unit && <span className={`text-lg ${dark ? "text-base-content/50" : "text-base-content/60 skin:text-base-content/60"}`}>{unit}</span>}
        {price < listPrice && (
          <span className={`text-lg tabular-nums line-through ${dark ? "text-base-content/60 skin:text-base-content/60" : "text-base-content/50"}`}>
            <span className="sr-only">was </span>
            {formatPrice(listPrice)}
          </span>
        )}
      </div>
      <p className={`${compact ? "mt-1" : "mt-2"} text-sm ${dark ? "text-base-content/50" : "text-base-content/60 skin:text-base-content/60"}`}>{billingLine}</p>
    </div>
  );
};
