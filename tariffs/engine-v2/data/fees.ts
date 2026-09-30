import { FeeSchedule } from "../types"

export const fees: FeeSchedule[] = [
  {
    id: "mpf",
    name: "Merchandise Processing Fee",
    ratePct: 0.3464,
    min: 33.58,
    max: 651.5,
    // FY2026 values. MPF minimum and maximum change every October 1.
    // TODO: add the FY2027 values (effective 2026-10-01) and set `to` on this record.
    effective: { from: "2025-10-01" },
  },
  {
    id: "hmf",
    name: "Harbor Maintenance Fee",
    ratePct: 0.125,
    // Applies only to ocean shipments; the calculator currently assumes ocean.
    effective: {},
  },
]
