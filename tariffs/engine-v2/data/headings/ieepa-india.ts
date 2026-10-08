// IEEPA duty on products of India (U.S. note 2(z), headings 9903.01.84–9903.01.89), imposed by
// EO 14329 for entries after Aug 27, 2025 and terminated by EO 14384 for entries on or after
// 12:01 a.m. EST Feb 7, 2026. Descriptions are the 2026HTSRev2 heading text. Backfilled from
// 2026HTSRev3's change record. See HowTariffsWork.md §17.13 and
// tariffs/revision-diffs/2026HTSRev2/PLAN.md.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"

const PROGRAM = "ieepa-india"
// 9903.01.84: "entered for consumption, or withdrawn from warehouse for consumption, after
// 12:01 a.m. eastern daylight time on August 27, 2025"
const FROM = "2025-08-27"
const EFFECTIVE = { from: FROM, to: "2026-02-07" }

const source = (note: string) => ({
  revision: "2026HTSRev2",
  citation: "EO 14384 (91 FR 6501)",
  url: "https://www.govinfo.gov/content/pkg/FR-2026-02-11/html/2026-02818.htm",
  publishedOn: "2026-02-11",
  note: `${note}. Backfilled from 2026HTSRev3's change record. Starts on the date in 9903.01.84's text (EO 14329 sec. 2(b), 90 FR 38701: \"on or after 12:01 a.m. eastern daylight time 21 days after the date of this order\", Aug 6, 2025); EO 14384 sec. 2 ends it for goods entered on or after 12:01 a.m. EST Feb 7, 2026 and terminates 9903.01.84–9903.01.89 and note 2(z)`,
})

export const headings: Tariff[] = [
  {
    code: "9903.01.84",
    program: PROGRAM,
    name: "IEEPA India: Russian Oil Tariff",
    description:
      "Except for products described in headings 9903.01.85-9903.01.89, articles the product of India that are entered for consumption, or withdrawn from warehouse for consumption, after 12:01 a.m. eastern daylight time on August 27, 2025, as provided for in subdivision (z) of U.S. note 2 to this subchapter",
    scope: { countries: ["IN"], codes: "all" },
    exceptions: ["9903.01.85", "9903.01.86", "9903.01.87", "9903.01.88", "9903.01.89"],
    rate: { kind: "adValorem", pct: 25 },
    // Column 2: "The duty provided in the applicable subheading"
    rateByColumn: { column2: { kind: "free" } },
    effective: EFFECTIVE,
    source: source(
      "U.S. note 2(z)(i); stacks with the India reciprocal 9903.02.26 (\"shall also be subject to any additional duty provided for in this subchapter\") and applies with a trade preference claimed (special column + 25%)"
    ),
  },
  {
    code: "9903.01.85",
    program: PROGRAM,
    name: "IEEPA India Exemption: Loaded Before Aug 27, Entered Before Sep 17, 2025",
    description:
      "Articles the product of India that (1) were loaded onto a vessel at the port of loading and in transit on the final mode of transit prior to entry into the United States, before 12:01 a.m. eastern daylight time on August 27, 2025; and (2) are entered for consumption, or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on September 17, 2025",
    scope: { countries: ["IN"], codes: "all" },
    requires: [{ kind: "dateBefore", input: "loadingDate", date: FROM }],
    rate: { kind: "free" },
    // In transit (§14.1): the entry window is the record's dates, the loading date a condition
    effective: { from: FROM, to: "2025-09-17" },
    source: source(
      "In transit before 12:01 a.m. EDT Aug 27, 2025 and entered before 12:01 a.m. EDT Sep 17, 2025 (dates from the heading text)"
    ),
  },
  {
    code: "9903.01.86",
    program: PROGRAM,
    name: "IEEPA India Exemption: Listed Products (Annex II)",
    description:
      "Articles the product of India, classified in the subheadings enumerated in subdivision (v)(iii) of U.S. note 2 to this subchapter",
    // U.S. note 2(z)(ii): "the provisions of the HTSUS listed in subdivision (v)(iii)", both its
    // subheadings ((a)) and its particular articles ((b), which need confirming, as under
    // 9903.02.78). Decided by the user, Oct 8, 2026
    scope: {
      countries: ["IN"],
      codes: [{ list: "ieepaReciprocalAnnexII2viiia" }, { list: "argiculturalArticlesExemptFromCertainTariffs" }],
    },
    requires: [
      {
        kind: "answerForListedCodes",
        input: "confirm:9903.01.86",
        equals: true,
        list: "argiculturalArticlesExemptFromCertainTariffs",
      },
    ],
    rate: { kind: "free" },
    effective: EFFECTIVE,
    source: source(
      "U.S. note 2(z)(ii): the subheadings of 2(v)(iii)(a), and the particular articles of 2(v)(iii)(b) once confirmed (decided by the user, Oct 8, 2026)"
    ),
  },
  {
    code: "9903.01.87",
    program: PROGRAM,
    name: "IEEPA India Exemption: Section 232 Articles",
    description:
      "Articles of iron or steel; derivative articles of iron or steel; articles of aluminum; wood products; derivative articles of aluminum; passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans); light trucks; parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks; medium- and heavy-duty vehicles; parts of medium- and heavy-duty vehicles; semiconductor articles; semi-finished copper; and intensive copper derivative products, of India, as provided in subdivisions (z)(iii) through (z)(xiii) of U.S. note 2 to this subchapter",
    scope: {
      countries: ["IN"],
      codes: "all",
      // U.S. note 2(z)(iii)–(xiii): the duties "shall not apply to" products provided for in these
      // headings. Wood under 9903.76.04 still pays ((x))
      whenApplies: {
        codes: [
          "9903.81.87",
          "9903.81.88",
          "9903.81.89",
          "9903.81.90",
          "9903.81.91",
          "9903.81.92",
          "9903.81.93",
          "9903.85.02",
          "9903.85.04",
          "9903.85.07",
          "9903.85.08",
          "9903.85.09",
          "9903.94.01",
          "9903.94.03",
          "9903.94.05",
          "9903.94.07",
          "9903.78.01",
          "9903.76.01",
          "9903.76.02",
          "9903.76.03",
          "9903.74.01",
          "9903.74.02",
          "9903.74.03",
          "9903.74.08",
          "9903.74.09",
          "9903.79.01",
        ],
      },
    },
    rate: { kind: "free" },
    effective: EFFECTIVE,
    source: source("U.S. note 2(z)(iii)–(xiii): the whole article, with no non-metal-content carve-back"),
  },
  {
    code: "9903.01.88",
    program: PROGRAM,
    name: "IEEPA India Exemption: Donations",
    description:
      "Articles the product of India that are donations, by persons subject to the jurisdiction of the United States, such as food, clothing, and medicine, intended to be used to relieve human suffering, as provided for in subdivision (z)(xiv) of U.S. note 2 to this subchapter",
    scope: { countries: ["IN"], codes: "all" },
    requires: [{ kind: "answer", input: "isDonation", equals: true }],
    rate: { kind: "free" },
    effective: EFFECTIVE,
    source: source("U.S. note 2(z)(xiv)"),
  },
  {
    code: "9903.01.89",
    program: PROGRAM,
    name: "IEEPA India Exemption: Informational Materials",
    description:
      "Articles the product of India that are informational materials, including but not limited to, publications, films, posters, phonograph records, photographs, microfilms, microfiche, tapes, compact disks, CD ROMs, artworks, and news wire feeds",
    scope: { countries: ["IN"], codes: "all" },
    requires: [{ kind: "answer", input: "isInformationalMaterial", equals: true }],
    rate: { kind: "free" },
    effective: EFFECTIVE,
    source: source("U.S. note 2(z)"),
  },
]
