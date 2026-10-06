// "2026-10-06" → "October 6, 2026". Dates are calendar days, so they're read as UTC to keep
// the day from shifting with the server's time zone.
export const formatPostDate = (isoDate: string, month: "long" | "short" = "long") =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month,
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
