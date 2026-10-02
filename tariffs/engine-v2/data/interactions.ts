import { Interaction } from "../types"

// How programs combine beyond individual headings' exceptions. See HowTariffsWork.md §8.
// Order matters within each kind (§8.4).

// "9903.01.24"–"9903.01.76" → every heading code in between (same chapter and subheading prefix)
const headingRange = (from: string, to: string) => {
  const prefix = from.slice(0, 8)
  const [start, end] = [Number(from.slice(8)), Number(to.slice(8))]
  return Array.from(
    { length: end - start + 1 },
    (_, i) => `${prefix}${String(start + i).padStart(2, "0")}`,
  )
}

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

// U.S. note 39(a)(1)–(4) and (8): semiconductor articles under 9903.79.01 aren't subject to the
// auto, auto parts, MHDV and MHDV parts duties, or to the IEEPA headings
const notOnSemiconductors = [
  ...["9903.94.01", "9903.94.03", "9903.94.31", "9903.94.40", "9903.94.41"],
  ...["9903.94.50", "9903.94.51", "9903.94.60", "9903.94.61"],
  ...["9903.94.05", "9903.94.07", "9903.94.32", "9903.94.33"],
  ...headingRange("9903.94.42", "9903.94.45"),
  ...headingRange("9903.94.52", "9903.94.55"),
  ...headingRange("9903.94.62", "9903.94.65"),
  ...["9903.74.01", "9903.74.02", "9903.74.03", "9903.74.08", "9903.74.09"],
  ...headingRange("9903.01.24", "9903.01.76"),
  ...headingRange("9903.02.01", "9903.02.71"),
]

// U.S. notes 33(a)(2)–(3), 33(f)(2)–(3), 33(p)(iii)(2)–(3), 33(r)(iii)(2)–(3), 38(a)(2)–(3),
// 38(h)(2)–(3) and 39(a)(6)–(7): no Canada (9903.01.10) or Mexico (9903.01.01) IEEPA duties
const caMxExcludedFor = [
  ...["9903.94.01", "9903.94.05", "9903.94.07", "9903.94.44", "9903.94.45"],
  ...["9903.94.54", "9903.94.55", "9903.94.64", "9903.94.65"],
  ...["9903.74.01", "9903.74.02", "9903.74.08", "9903.74.09", "9903.79.01"],
]

// U.S. notes 33(f)(4), (j)(2), (l)(2), (o)(2), (p)(iii)(4), (q)(iii)(2), (r)(iii)(4), (t)(2)
// and 38(h)(4): no wood duties under 9903.76.01–9903.76.03 on auto and MHDV parts
const woodExcludedFor = [
  ...["9903.94.05", "9903.94.07", "9903.94.32", "9903.94.33"],
  ...headingRange("9903.94.42", "9903.94.45"),
  ...headingRange("9903.94.52", "9903.94.55"),
  ...headingRange("9903.94.62", "9903.94.65"),
  ...["9903.74.08", "9903.74.09"],
]

const correction = (notes: string) => ({
  revision: "2026HTSRev6",
  note: `${notes}. Not modeled before; added as a correction, so it applies from the start of the data`,
})

export const interactions: Interaction[] = [
  // Before the metals rule, so a semiconductor article that drops an auto heading still drops metals
  {
    id: "232-autos-mhdv-ieepa-not-on-semiconductors",
    kind: "noStack",
    description:
      "Auto, MHDV and IEEPA duties don't apply to semiconductor articles under 9903.79.01 (U.S. note 39(a))",
    order: [{ codes: ["9903.79.01"] }, { codes: notOnSemiconductors }],
    effective: {},
    source: correction("U.S. note 39(a)(1)–(4) and (8)"),
  },
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
  {
    id: "ieepa-ca-mx-not-on-autos-mhdv-semiconductors",
    kind: "noStack",
    description:
      "IEEPA duties on goods of Canada (9903.01.10) and Mexico (9903.01.01) don't apply to vehicles, parts and semiconductors under their Section 232 headings (U.S. notes 33, 38 and 39)",
    order: [
      { codes: caMxExcludedFor },
      { codes: ["9903.01.10", "9903.01.01"] },
    ],
    effective: {},
    source: correction(
      "U.S. notes 33(a), (f), (p)(iii), (r)(iii), 38(a), (h) and 39(a)(6)–(7). 9903.01.10 and 9903.01.01 aren't in the data yet (ended Feb 24, 2026), so this has no effect until they're backfilled",
    ),
  },
  {
    id: "232-wood-not-on-auto-mhdv-parts",
    kind: "noStack",
    description:
      "Section 232 wood duties (9903.76.01–9903.76.03) don't apply to auto and MHDV parts under their Section 232 headings (U.S. notes 33 and 38(h))",
    order: [
      { codes: woodExcludedFor },
      { codes: ["9903.76.01", "9903.76.02", "9903.76.03"] },
    ],
    effective: {},
    source: correction(
      "U.S. notes 33(f), (j), (l), (o), (p)(iii), (q)(iii), (r)(iii), (t) and 38(h)(4)",
    ),
  },
  {
    id: "232-wood-9903.76.23-not-on-korean-auto-parts",
    kind: "noStack",
    description:
      "9903.76.23 doesn't apply to Korean auto parts under 9903.94.62–9903.94.65 (U.S. note 33(t)(2))",
    order: [
      { codes: headingRange("9903.94.62", "9903.94.65") },
      { codes: ["9903.76.23"] },
    ],
    effective: {},
    source: correction("U.S. note 33(t)(2)"),
  },
]
