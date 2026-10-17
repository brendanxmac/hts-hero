import { DEFAULT_VALUE } from "@/components/tariff-tracker/adjustments";

// Every dollar amount of duty is worked out for one shipment's customs value: the one the user
// entered, or the $10,000 default. Wherever dollars show, they say which, in these words, so a
// reader never takes "$4,000" for what they'll actually pay. Rates (%) are true at any value, so
// they lead everywhere but the Duty tab, where landed cost in dollars is the point.

const whole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const isDefaultValue = (value: number) => Math.abs(value - DEFAULT_VALUE) < 0.005;

// "$10,000 (default)", "$25,000", "$12,345.67"
export const valueLabel = (value: number) =>
  `${Number.isInteger(value) ? whole.format(value) : cents.format(value)}${isDefaultValue(value) ? " (default)" : ""}`;

// "on a $10,000 (default) shipment"
export const onShipment = (value: number) => `on a ${valueLabel(value)} shipment`;

// The tooltip that says how to change it
export const VALUE_HINT = "Dollar amounts are worked out for this customs value. Change the Value to see your own.";
