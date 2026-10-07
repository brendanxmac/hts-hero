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
  {
    id: "232-uas",
    name: "Section 232 – Unmanned Aircraft Systems",
    authority: "232",
    legalBasis: ["Proclamation 11055"],
  },
  { id: "quotas", name: "Tariff-Rate Quotas", authority: "other" },
  {
    id: "232-pharmaceuticals",
    name: "Section 232 – Pharmaceuticals",
    authority: "232",
    legalBasis: ["Proclamation 11020"],
  },
  { id: "301-china", name: "Section 301 – China", authority: "301" },
  {
    id: "338-canada",
    name: "Section 338 – Canada",
    authority: "338",
    legalBasis: ["Proclamation 11046", "Proclamation 11047", "Proclamation 11048", "Proclamation 11056"],
  },
  {
    id: "201-quartz",
    name: "Section 201 – Quartz Surface Products",
    authority: "201",
    legalBasis: ["Proclamation 11051"],
  },
  { id: "301-brazil", name: "Section 301 – Brazil", authority: "301" },
  { id: "301-forced-labor", name: "Section 301 – Forced Labor", authority: "301" },
  // Still "deal": these exempt civil aircraft from Section 232 duties, which outlived IEEPA.
  // The EU (9903.02.76) and Korea (9903.02.81) headings join from Feb 24, 2026, when their
  // IEEPA role ended; Proclamation 11021 clause (10) keeps the 232 reductions.
  {
    id: "aircraft-agreements",
    name: "Civil Aircraft Agreements (UK, EU, Japan, Korea)",
    authority: "deal",
    tradeDeal: true,
  },
  // Implemented under IEEPA (modifications of the reciprocal tariff order) and ended with
  // every IEEPA duty on Feb 24, 2026 (EO 14389; CSMS # 67834313). Their authority was "deal"
  // until Oct 7, 2026; `tradeDeal` keeps that.
  { id: "deal-eu", name: "U.S.–EU Framework Agreement", authority: "IEEPA", tradeDeal: true },
  { id: "deal-jp", name: "U.S.–Japan Agreement", authority: "IEEPA", tradeDeal: true },
  { id: "deal-kr", name: "U.S.–Korea Agreement", authority: "IEEPA", tradeDeal: true },
]
