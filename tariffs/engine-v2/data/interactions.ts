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

// Before April 6, 2026 (2026HTSRev4): the old metals headings notes 33, 38(a)/(h) and 39(a)
// listed in their items (1)–(5) (copper, aluminum, aluminum derivatives, steel, steel
// derivatives). 9903.81.92 and 9903.85.09 (no added duty) and the Russia headings aren't named.
const rev4MetalsHeadings = [
  "9903.78.01",
  "9903.85.02",
  "9903.85.12",
  "9903.85.04",
  "9903.85.07",
  "9903.85.08",
  "9903.85.13",
  "9903.85.14",
  "9903.85.15",
  "9903.81.87",
  "9903.81.88",
  "9903.81.94",
  "9903.81.95",
  "9903.81.89",
  "9903.81.90",
  "9903.81.91",
  "9903.81.93",
  "9903.81.96",
  "9903.81.97",
  "9903.81.98",
  "9903.81.99",
]

// PP 11021 rewrote these notes for entries on or after 12:01 a.m. EDT April 6, 2026
const PP_11021_FROM = "2026-04-06"
const pp11021 = (note: string, revision = "2026HTSRev5") => ({
  revision,
  citation: "Proclamation 11021",
  url: "https://www.govinfo.gov/content/pkg/FR-2026-04-09/html/2026-06960.htm",
  publishedOn: "2026-04-02",
  note,
})

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
  // U.S. note 2(v)(xvi) also names the Japan, Korea, Switzerland and Liechtenstein deal headings
  // (2026HTSRev3); both notes apply
  ...["9903.02.72", "9903.02.73", "9903.02.80", "9903.02.83", "9903.02.88"],
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

// Taiwan auto parts (U.S. note 33(u), Notice effective 2026-05-01)
const taiwanParts = headingRange("9903.94.66", "9903.94.69")
const TAIWAN_FROM = "2026-05-01"
// Proclamation 11032 (Section 232 metals restructuring, U.S. note 16 and cross-references)
const PP_11032_FROM = "2026-06-08"
const taiwanSource = (notes: string) => ({
  revision: "2026HTSRev9",
  note: `${notes}; Notice effective ${TAIWAN_FROM}`,
})

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
    effective: { to: TAIWAN_FROM },
    source: correction("U.S. note 39(a)(1)–(4) and (8)"),
  },
  {
    id: "232-autos-mhdv-ieepa-not-on-semiconductors",
    kind: "noStack",
    description:
      "Auto, MHDV and IEEPA duties don't apply to semiconductor articles under 9903.79.01 (U.S. note 39(a))",
    order: [
      { codes: ["9903.79.01"] },
      { codes: [...notOnSemiconductors, ...taiwanParts] },
    ],
    effective: { from: TAIWAN_FROM },
    source: taiwanSource("U.S. note 39(a)(2) adds 9903.94.66–.69"),
  },
  {
    ...metalsNoStack,
    order: [{ codes: metalsExcludedFor }, { codes: rev4MetalsHeadings }],
    effective: { to: PP_11021_FROM },
    source: pp11021(
      "U.S. notes 33(a), (f), (i)–(l), (n)–(o), (p)(iii), (q)(iii), (r)(iii), (s), (t), 38(a), 38(h) and 39(a)(5)–(9) items naming the old metals headings, as they read before PP 11021. Backfilled from 2026HTSRev5's change record",
      "2026HTSRev4",
    ),
  },
  {
    ...metalsNoStack,
    order: [{ codes: metalsExcludedFor }, { codes: metalsHeadingsThrough17 }],
    effective: { from: PP_11021_FROM, to: "2026-04-23" },
    source: pp11021(
      "U.S. notes 33, 38(a)(1), 38(h)(1) and 39(a)(5). Not modeled before 2026HTSRev6; added as a correction",
    ),
  },
  {
    ...metalsNoStack,
    order: [
      { codes: metalsExcludedFor },
      { codes: [...metalsHeadingsThrough17, "9903.82.18", "9903.82.19"] },
    ],
    effective: { from: "2026-04-23", to: TAIWAN_FROM },
    source: {
      revision: "2026HTSRev6",
      note: "U.S. notes 33, 38 and 39(a) ranges extended to 9903.82.19; effective date from the change record",
    },
  },
  {
    ...metalsNoStack,
    order: [
      { codes: [...metalsExcludedFor, ...taiwanParts] },
      { codes: [...metalsHeadingsThrough17, "9903.82.18", "9903.82.19"] },
    ],
    effective: { from: TAIWAN_FROM, to: PP_11032_FROM },
    source: taiwanSource(
      "U.S. note 33(u)(1): Taiwan auto parts (9903.94.66–.69) not subject to metals duties",
    ),
  },
  {
    ...metalsNoStack,
    order: [
      { codes: [...metalsExcludedFor, ...taiwanParts] },
      {
        codes: [
          ...metalsHeadingsThrough17,
          ...headingRange("9903.82.18", "9903.82.26"),
        ],
      },
    ],
    effective: { from: PP_11032_FROM },
    source: {
      revision: "2026HTSRev10",
      citation: "Proclamation 11032",
      note: "U.S. notes 33, 38(a)(1)/(h)(1) and 39(a)(5) ranges extended to 9903.82.26; effective 2026-06-08",
    },
  },
  {
    id: "232-metals-not-on-taiwan-civil-aircraft",
    kind: "noStack",
    description:
      "Section 232 metals duties don't apply to Taiwan civil aircraft components under 9903.96.03 (U.S. note 35(c))",
    order: [
      { codes: ["9903.96.03"] },
      { codes: [...metalsHeadingsThrough17, "9903.82.18", "9903.82.19"] },
    ],
    effective: { from: TAIWAN_FROM },
    source: taiwanSource("U.S. note 35(c)"),
  },
  {
    id: "232-metals-not-on-civil-aircraft-agreements",
    kind: "noStack",
    description:
      "Section 232 metals duties don't apply to civil aircraft articles of the UK (9903.96.01), the EU (9903.02.76), Japan (9903.96.02) or Korea (9903.02.81) (U.S. notes 35(a), 2(v)(xxii), 35(b) and 2(v)(xxiv)(b))",
    // Before April 6, 2026. One group of winners works because each agreement only covers its
    // own country's goods, and the UK headings and the others never apply to the same goods.
    // 35(a) names 9903.81.94, .96–.98; .95 and .99 are added because notes 16(p) and 16(r)
    // except 9903.96.01 from all six UK steel headings.
    order: [
      { codes: ["9903.96.01", "9903.02.76", "9903.96.02", "9903.02.81"] },
      {
        codes: [
          "9903.78.01",
          "9903.81.87",
          "9903.81.88",
          "9903.81.89",
          "9903.81.90",
          "9903.81.91",
          "9903.81.93",
          "9903.81.94",
          "9903.81.95",
          "9903.81.96",
          "9903.81.97",
          "9903.81.98",
          "9903.81.99",
          "9903.85.02",
          "9903.85.04",
          "9903.85.07",
          "9903.85.08",
          "9903.85.12",
          "9903.85.13",
          "9903.85.14",
          "9903.85.15",
        ],
      },
    ],
    effective: { to: PP_11021_FROM },
    source: pp11021(
      "U.S. notes 35(a), 35(b), 2(v)(xxii), 2(v)(xxiv)(b), 16(i), (k), (p), (r), 19(f), (h), (n), (p) and 36(a) as they read before PP 11021. Backfilled from 2026HTSRev5's change record",
      "2026HTSRev4",
    ),
  },
  {
    // Every verified revision (Rev 5–Rev 20) names the same range, "9903.82.02 and
    // 9903.82.04–9903.82.17", in all four notes
    id: "232-metals-not-on-civil-aircraft-agreements",
    kind: "noStack",
    description:
      "Section 232 metals duties don't apply to civil aircraft articles of the UK (9903.96.01), the EU (9903.02.76), Japan (9903.96.02) or Korea (9903.02.81) (U.S. notes 35(a), 2(v)(xxii), 35(b) and 2(v)(xxiv)(b))",
    order: [
      { codes: ["9903.96.01", "9903.02.76", "9903.96.02", "9903.02.81"] },
      { codes: metalsHeadingsThrough17 },
    ],
    effective: { from: PP_11021_FROM },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11021",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-04-09/html/2026-06960.htm",
      publishedOn: "2026-04-02",
      note: "U.S. notes 2(v)(xxii), 2(v)(xxiv)(b), 35(a) and 35(b) as rewritten by PP 11021 (Annex IV), effective 2026-04-06; clause (10) keeps the civil aircraft agreements. Not modeled before; added as a correction",
    },
  },
  {
    id: "ieepa-ca-mx-not-on-autos-mhdv-semiconductors",
    kind: "noStack",
    description:
      "IEEPA duties on goods of Canada (9903.01.10) and Mexico (9903.01.01) don't apply to vehicles, parts and semiconductors under their Section 232 headings (U.S. notes 33, 38 and 39)",
    order: [
      {
        codes: [
          ...caMxExcludedFor,
          // U.S. notes 16(i) and (k), 19(f) and (h) (2026HTSRev3): steel, steel derivative,
          // aluminum and aluminum derivative products "shall not be subject to" 9903.01.10 or
          // 9903.01.01. 16(i)'s sentence names only 9903.81.87; its lead-in covers .88 too
          ...[
            "9903.81.87",
            "9903.81.88",
            "9903.81.89",
            "9903.81.90",
            "9903.81.91",
            "9903.81.93",
          ],
          ...["9903.85.02", "9903.85.04", "9903.85.07", "9903.85.08"],
        ],
      },
      { codes: ["9903.01.10", "9903.01.01"] },
    ],
    // Ends with the IEEPA duties it ranks: no IEEPA duty for entries on or after Feb 24, 2026
    // (EO 14389; CSMS # 67834313). Its start comes with later backfill steps.
    effective: { to: "2026-02-24" },
    source: {
      revision: "2026HTSRev3",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "U.S. notes 33(a), (f), (p)(iii), (r)(iii), 38(a), (h), 39(a)(6)–(7), 16(i), (k) and 19(f), (h). Backfilled with the IEEPA headings (2026HTSRev3); IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026",
    },
  },
  {
    id: "ieepa-ca-mx-not-on-232-wood",
    kind: "noStack",
    description:
      "IEEPA duties on goods of Mexico (9903.01.01) and Canada (9903.01.10, 9903.01.16) don't apply to Section 232 wood products under 9903.76.01–9903.76.03 (U.S. notes 2(a), 2(j) and 2(m))",
    order: [
      { codes: ["9903.76.01", "9903.76.02", "9903.76.03"] },
      { codes: ["9903.01.01", "9903.01.10", "9903.01.16"] },
    ],
    effective: { to: "2026-02-24" },
    source: {
      revision: "2026HTSRev3",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "U.S. notes 2(a), (j) and (m) except products described in 9903.76.01–.03; potash (2(c), 2(l)) and energy aren't covered. Backfilled with the IEEPA headings (2026HTSRev3); IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026",
    },
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
    effective: { to: TAIWAN_FROM },
    source: correction(
      "U.S. notes 33(f), (j), (l), (o), (p)(iii), (q)(iii), (r)(iii), (t) and 38(h)(4)",
    ),
  },
  {
    id: "232-wood-not-on-auto-mhdv-parts",
    kind: "noStack",
    description:
      "Section 232 wood duties (9903.76.01–9903.76.03) don't apply to auto and MHDV parts under their Section 232 headings (U.S. notes 33 and 38(h))",
    order: [
      { codes: [...woodExcludedFor, ...taiwanParts] },
      { codes: ["9903.76.01", "9903.76.02", "9903.76.03"] },
    ],
    effective: { from: TAIWAN_FROM },
    source: taiwanSource(
      "U.S. note 33(u)(2): Taiwan auto parts (9903.94.66–.69) not subject to wood duties",
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
  {
    id: "232-wood-9903.76.24-not-on-taiwan-auto-parts",
    kind: "noStack",
    description:
      "9903.76.24 doesn't apply to Taiwan auto parts under 9903.94.66–9903.94.69 (U.S. note 33(u)(2))",
    order: [{ codes: taiwanParts }, { codes: ["9903.76.24"] }],
    effective: { from: TAIWAN_FROM },
    source: taiwanSource("U.S. note 33(u)(2)"),
  },
]
