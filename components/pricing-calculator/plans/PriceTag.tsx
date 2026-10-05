import * as ui from "@/components/ui/styles";
import { Billing, formatPrice, monthlyRate } from "../lib/pricing";

// A plan's price per month, with the list price struck through when billed annually
export const PriceTag = ({
  listPrice,
  billing,
  prefix,
  unit = "/mo",
  note,
}: {
  listPrice: number;
  billing: Billing;
  // "From", for plans priced by tier
  prefix?: string;
  unit?: string;
  // Replaces the billing line under the price
  note?: string;
}) => {
  const price = monthlyRate(listPrice, billing);
  const billingLine =
    note ?? (billing === "annual" ? `${formatPrice(price * 12)} billed yearly` : "Billed monthly");

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {prefix && <span className={ui.bodySm}>{prefix}</span>}
        <span className={ui.metric.primary} aria-live="polite">
          {formatPrice(price)}
        </span>
        <span className={ui.bodySm}>{unit}</span>
        {billing === "annual" && (
          <span className="text-sm tabular-nums text-base-content/60 line-through">
            <span className="sr-only">was </span>
            {formatPrice(listPrice)}
          </span>
        )}
      </div>
      <p className={`${ui.caption} mt-2`}>{billingLine}</p>
    </div>
  );
};
