import { Interaction } from "../types"

// How programs combine beyond individual headings' exceptions. See HowTariffsWork.md §8.
// Order matters within each kind (§8.4).

// Headings whose entries "shall not be subject to the additional duties imposed on entries of
// articles of aluminum, of steel, or of copper or derivative aluminum or steel articles provided
// for in headings 9903.82.02 and 9903.82.04–9903.82.xx"
const metalsExcludedFor = [
  // U.S. note 33(a), (f), (i)–(l), (n)–(t): passenger vehicles, light trucks and their parts
  "9903.94.01",
  "9903.94.05",
  "9903.94.07",
  "9903.94.31",
  "9903.94.32",
  "9903.94.33",
  "9903.94.40",
  "9903.94.41",
  "9903.94.42",
  "9903.94.43",
  "9903.94.44",
  "9903.94.45",
  "9903.94.50",
  "9903.94.51",
  "9903.94.52",
  "9903.94.53",
  "9903.94.54",
  "9903.94.55",
  "9903.94.60",
  "9903.94.61",
  "9903.94.62",
  "9903.94.63",
  "9903.94.64",
  "9903.94.65",
  // U.S. note 38(a)(1) and (h)(1): medium- and heavy-duty vehicles, buses and their parts
  "9903.74.01",
  "9903.74.02",
  "9903.74.08",
  "9903.74.09",
  // U.S. note 39(a)(5): semiconductor articles
  "9903.79.01",
]

// 9903.82.02 and 9903.82.04–9903.82.17
const metalsHeadingsThrough17 = [
  "9903.82.02",
  "9903.82.04",
  "9903.82.05",
  "9903.82.06",
  "9903.82.07",
  "9903.82.08",
  "9903.82.09",
  "9903.82.10",
  "9903.82.11",
  "9903.82.12",
  "9903.82.13",
  "9903.82.14",
  "9903.82.15",
  "9903.82.16",
  "9903.82.17",
]

const metalsNoStack = {
  id: "232-metals-not-on-autos-mhdv-semiconductors",
  kind: "noStack" as const,
  description:
    "Section 232 metals duties don't apply to vehicles, parts and semiconductors subject to their own Section 232 headings (U.S. notes 33, 38 and 39)",
}

export const interactions: Interaction[] = [
  {
    ...metalsNoStack,
    order: [{ codes: metalsExcludedFor }, { codes: metalsHeadingsThrough17 }],
    effective: { to: "2026-04-23" },
    source: {
      revision: "2026HTSRev5",
      note: "U.S. notes 33, 38(a)(1), 38(h)(1) and 39(a)(5). Not modeled before 2026HTSRev6; added as a correction",
    },
  },
  {
    ...metalsNoStack,
    order: [
      { codes: metalsExcludedFor },
      { codes: [...metalsHeadingsThrough17, "9903.82.18", "9903.82.19"] },
    ],
    effective: { from: "2026-04-23" },
    source: {
      revision: "2026HTSRev6",
      note: "U.S. notes 33, 38 and 39(a) ranges extended to 9903.82.19; effective date from the change record",
    },
  },
]
