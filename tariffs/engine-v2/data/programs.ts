import { Program } from "../types"

export const programs: Program[] = [
  {
    id: "122",
    name: "Section 122 – Balance of Payments Surcharge",
    authority: "122",
  },
  {
    id: "232-metals",
    name: "Section 232 – Steel, Aluminum & Copper",
    authority: "232",
    legalBasis: ["Proclamation 11021"],
  },
  { id: "232-autos", name: "Section 232 – Autos & Auto Parts", authority: "232" },
  { id: "232-wood", name: "Section 232 – Timber, Lumber & Wood Products", authority: "232" },
  {
    id: "232-mhdv",
    name: "Section 232 – Medium & Heavy-Duty Vehicles and Buses",
    authority: "232",
  },
  { id: "232-semiconductors", name: "Section 232 – Semiconductors", authority: "232" },
  { id: "301-china", name: "Section 301 – China", authority: "301" },
  {
    id: "aircraft-agreements",
    name: "Civil Aircraft Agreements (UK, Japan)",
    authority: "deal",
  },
  { id: "deal-eu", name: "U.S.–EU Framework Agreement", authority: "deal" },
  { id: "deal-jp", name: "U.S.–Japan Agreement", authority: "deal" },
  { id: "deal-kr", name: "U.S.–Korea Agreement", authority: "deal" },
]
