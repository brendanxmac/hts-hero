import { PROGRAM } from "@/components/ui/marketing";

// The trade lanes on the map: each origin with a real 2026 change (from the tariff changelog).
// id is the ISO 3166 numeric code world-atlas uses.
export const LANES = [
  { id: "124", country: "Canada", program: "Section 338", change: "+50%", detail: "Listed products, even under USMCA", date: "Aug 22, 2026", color: PROGRAM["Section 338"] },
  { id: "076", country: "Brazil", program: "Section 301", change: "+25%", detail: "Most products of Brazil", date: "Jul 22, 2026", color: PROGRAM["Section 301"] },
  { id: "156", country: "China", program: "Section 232", change: "+25%", detail: "Drones and drone parts", date: "Sep 3, 2026", color: PROGRAM["Section 232"] },
  { id: "392", country: "Japan", program: "Section 232", change: "15% total", detail: "Patented pharmaceuticals", date: "Jul 31, 2026", color: "#22d3ee" },
];
