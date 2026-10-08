// Tariff-rate quota headings that change no duty but are filed with in-quota entries. See
// HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"

export const headings: Tariff[] = [
  // U.S. note 7(c)–(d) (2026HTSRev18, Proclamation 11059): 300,000 t more lean beef trimmings of
  // countries other than Argentina (which has its own quota, 9903.54.01, not modeled), September 1
  // to November 30, 2026, in three 30-day tranches of 100,000 t. Quota access only: the in-quota
  // rate comes from the chapter 2 line.
  {
    code: "9903.54.02",
    program: "quotas",
    name: "Additional Quota: Lean Beef Trimmings",
    description:
      "In addition to the aggregate quantity of beef specified in additional U.S. note 3(a) to chapter 2 of the tariff schedule for any calendar year, and the aggregate quantity of lean beef trimmings of Argentina specified in additional U.S. note 3(b) to chapter 2 of the tariff schedule, 300,000 metric tons of lean beef trimmings of other countries or areas, described in statistical reporting numbers 0201.30.5091, 0201.30.5097, 0202.30.5091 and 0202.30.5097, may be entered for consumption, or withdrawn from warehouse for consumption, between 12:01 a.m. local port time on September 1, 2026, and 11:59 p.m. eastern time on November 30, 2026, as provided in subsections (c) and (d) of U.S. note 7 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["AR"],
      codes: [{ list: "leanBeefTrimmings7c" }],
    },
    requires: [confirm("9903.54.02")],
    rate: { kind: "free" },
    effective: { from: "2026-09-01", to: "2026-12-01" },
    source: { revision: "2026HTSRev18", citation: "Proclamation 11059", note: "U.S. note 7(c)–(d)" },
  },
]
