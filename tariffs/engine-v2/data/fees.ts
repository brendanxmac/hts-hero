import { FeeSchedule } from "../types"

export const fees: FeeSchedule[] = [
  // MPF minimum and maximum change every October 1 (the start of CBP's fiscal year)
  {
    id: "mpf",
    name: "Merchandise Processing Fee",
    ratePct: 0.3464,
    min: 33.58,
    max: 651.5,
    effective: { from: "2025-10-01", to: "2026-10-01" },
    source: { note: "FY2026" },
  },
  {
    id: "mpf",
    name: "Merchandise Processing Fee",
    ratePct: 0.3464,
    min: 34.58,
    max: 670.86,
    effective: { from: "2026-10-01" },
    source: {
      citation: "91 FR, Jul 31, 2026 (FR Doc. 2026-15530)",
      url: "https://www.federalregister.gov/documents/2026/07/31/2026-15530/customs-user-fees-to-be-adjusted-for-inflation-in-fiscal-year-2027",
      note: "FY2027",
    },
  },
  {
    id: "hmf",
    name: "Harbor Maintenance Fee",
    ratePct: 0.125,
    // Applies only to ocean shipments; the calculator currently assumes ocean.
    effective: {},
  },
]
