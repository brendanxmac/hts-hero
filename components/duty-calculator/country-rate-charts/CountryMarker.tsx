import { CountryRates } from "./types";

// The marker for a chosen country: a colored dot, or its flag. "plot" is the larger size,
// on the chart; "chip" sits beside a name.
export const CountryMarker = ({
  row,
  size,
  flags,
  color,
}: {
  row: CountryRates;
  size: "chip" | "plot";
  flags: boolean;
  color?: string;
}) =>
  flags ? (
    <span aria-hidden className={size === "plot" ? "text-lg leading-none" : "leading-none"}>
      {row.flag}
    </span>
  ) : (
    <span
      aria-hidden
      className={`block rounded-full ${size === "plot" ? "h-3 w-3 ring-2 ring-base-100" : "h-2.5 w-2.5"}`}
      style={{ background: color }}
    />
  );
