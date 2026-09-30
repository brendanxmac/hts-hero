import { IBM_Plex_Mono } from "next/font/google";

// Monospace for HTS and Chapter 99 codes, so digits and dots line up
export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatMoney = (amount: number) => usd.format(amount);

// "12.5%", "0.3464%", "2.9%"
export const formatPct = (pct: number) =>
  `${Math.round(pct * 10000) / 10000}%`;

// "2026-04-10" -> "Apr 10, 2026"
export const formatDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Local date as "YYYY-MM-DD"
export const todayIso = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

export const TRANSPORT_MODES = [
  { id: "ocean", label: "Ocean" },
  { id: "air", label: "Air" },
  { id: "truck", label: "Truck" },
  { id: "rail", label: "Rail" },
] as const;
