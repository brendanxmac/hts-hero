// Migrated from the legacy tariff data (2026HTSRev5), then reviewed by hand. The legacy engine
// was removed on Oct 1, 2026; this file is now the source. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"
import { tariffVersions } from "../../versioning"

// Headings that trigger the 9903.03.06 exemption, per U.S. note 2(aa)(v). Metals are
// "9903.82.02 and 9903.82.04–…" (note 2(aa)(v)(1)): 9903.82.01 (no aluminum, steel or copper)
// and 9903.82.03 (metal under 15% of the weight) aren't listed, so those articles pay Section 122.
// Corrected for all dates in 2026HTSRev11; the legacy list had included them.
const section232ArticleHeadings = [
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
  "9903.94.01",
  "9903.94.02",
  "9903.94.03",
  "9903.94.31",
  "9903.94.40",
  "9903.94.41",
  "9903.94.50",
  "9903.94.51",
  "9903.94.60",
  "9903.94.61",
  "9903.94.05",
  "9903.94.06",
  "9903.94.07",
  "9903.94.32",
  "9903.94.33",
  "9903.94.42",
  "9903.94.43",
  "9903.94.44",
  "9903.94.45",
  "9903.94.52",
  "9903.94.53",
  "9903.94.54",
  "9903.94.55",
  "9903.94.62",
  "9903.94.63",
  "9903.94.64",
  "9903.94.65",
  "9903.74.01",
  "9903.74.02",
  "9903.74.03",
  "9903.74.06",
  "9903.74.08",
  "9903.74.09",
  "9903.74.10",
  "9903.79.01",
  "9903.76.01",
  "9903.76.02",
  "9903.76.03",
  "9903.76.20",
  "9903.76.21",
  "9903.76.22",
  "9903.76.23",
]

// Until April 6, 2026 (2026HTSRev4), note 2(aa)(v)(a)–(d) and (g) named the old Section 232
// metals headings, and the exemption covered only their metal content: "but such additional
// duty shall apply to the non-steel content" (non-aluminum, non-copper). The other triggers,
// (e), (f) and (h)–(k), are the same as today's (2)–(7). PP 11021 replaced (a)–(d) and (g).
const rev4MetalTriggers = [
  {
    metal: "steel",
    codes: [
      "9903.81.87",
      "9903.81.88",
      "9903.81.89",
      "9903.81.90",
      "9903.81.91",
      "9903.81.92",
      "9903.81.93",
      "9903.81.94",
      "9903.81.95",
      "9903.81.96",
      "9903.81.97",
      "9903.81.98",
      "9903.81.99",
    ],
  },
  {
    metal: "aluminum",
    codes: [
      "9903.85.02",
      "9903.85.04",
      "9903.85.07",
      "9903.85.08",
      "9903.85.09",
      "9903.85.12",
      "9903.85.13",
      "9903.85.14",
      "9903.85.15",
    ],
  },
  { metal: "copper", codes: ["9903.78.01"] },
]
const rev4Section232ArticleHeadings = [
  ...rev4MetalTriggers.flatMap((g) => g.codes),
  ...section232ArticleHeadings.filter((code) => !code.startsWith("9903.82.")),
]

// The note 2(aa)(v) list from 2026-06-08 (2026HTSRev10, with Rev 11's correction restoring
// 9903.82.02). U.S. note 50(a)(vi) (Brazil, 9903.05.07) lists the same headings word for word.
export const section232ArticleHeadingsFromJune8 = [
  ...section232ArticleHeadings,
  "9903.82.18",
  "9903.82.19",
  "9903.82.20",
  "9903.82.21",
  "9903.82.22",
  "9903.82.23",
  "9903.82.24",
  "9903.82.25",
  "9903.82.26",
  "9903.94.66",
  "9903.94.67",
  "9903.94.68",
  "9903.94.69",
  "9903.76.24",
]

// From 2026-07-31 (2026HTSRev14), notes 50(a)(vi)(8) and 52(f)(8) add "patented pharmaceutical
// articles provided for in headings 9903.04.60–9903.04.66" to the Brazil and forced-labor
// exemptions. 9903.03.06 had ended by then, so it keeps the June 8 list.
export const section232ArticleHeadingsFromJuly31 = [
  ...section232ArticleHeadingsFromJune8,
  "9903.04.60",
  "9903.04.61",
  "9903.04.62",
  "9903.04.63",
  "9903.04.64",
  "9903.04.65",
  "9903.04.66",
]

export const headings: Tariff[] = [
  {
    code: "9903.03.01",
    program: "122",
    name: "Section 122 Tariff",
    description:
      "Except for products described in headings 9903.03.02–9903.03.11, articles the product of any country, as provided for in subdivision (aa) of U.S. note 2 to this subchapter",
    scope: {
      countries: "all",
      codes: "all",
    },
    exceptions: [
      "9903.03.02",
      "9903.03.03",
      "9903.03.04",
      "9903.03.05",
      "9903.03.06",
      "9903.03.07",
      "9903.03.08",
      "9903.03.09",
      "9903.03.10",
      "9903.03.11",
      "9903.94.01",
      "9903.94.02",
      "9903.94.03",
      "9903.94.31",
      "9903.94.40",
      "9903.94.41",
      "9903.94.50",
      "9903.94.51",
      "9903.94.60",
      "9903.94.61",
      "9903.94.05",
      "9903.94.06",
      "9903.94.07",
      "9903.94.32",
      "9903.94.33",
      "9903.94.42",
      "9903.94.43",
      "9903.94.44",
      "9903.94.45",
      "9903.94.52",
      "9903.94.53",
      "9903.94.54",
      "9903.94.55",
      "9903.94.62",
      "9903.94.63",
      "9903.94.64",
      "9903.94.65",
      "9903.74.01",
      "9903.74.02",
      "9903.74.03",
      "9903.74.06",
      "9903.74.08",
      "9903.74.09",
      "9903.74.10",
      "9903.79.01",
      "9903.76.01",
      "9903.76.02",
      "9903.76.03",
      "9903.76.20",
      "9903.76.21",
      "9903.76.22",
      "9903.76.23",
    ],
    rate: { kind: "adValorem", pct: 10 },
    effective: { from: "2026-02-24", to: "2026-07-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11012",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
      publishedOn: "2026-02-20",
      note: "Entries on or after 12:01 a.m. EST February 24, 2026, through 12:01 a.m. EDT July 24, 2026 (150 days)",
    },
  },
  {
    code: "9903.03.02",
    program: "122",
    name: "Section 122 Exemption: Loaded Before Feb 24, Entered Before Feb 28",
    description:
      " Articles the product of any country that (1) were loaded onto a vessel at the port of loading and in transit on the final mode of transit prior to entry into the United States, before 12:01 a.m. eastern standard time on February 24, 2026; and (2) are entered for consumption, or withdrawn from warehouse for consumption, before 12:01 a.m. eastern standard time on February 28, 2026.",
    scope: {
      countries: "all",
      codes: "all",
    },
    requires: [
      { kind: "dateBefore", input: "loadingDate", date: "2026-02-24" },
    ],
    rate: { kind: "free" },
    effective: { from: "2026-02-24", to: "2026-02-28" },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11012",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
      publishedOn: "2026-02-20",
      note: "In transit before 12:01 a.m. EST February 24, 2026 and entered before 12:01 a.m. EST February 28, 2026",
    },
  },
  {
    code: "9903.03.03",
    program: "122",
    name: "Section 122 Exemption: Listed Products",
    description:
      "Articles the product of any country, as provided for in subdivision (aa)(ii) of U.S. note 2 to subchapter III of chapter 99 of the HTSUS.",
    scope: {
      countries: "all",
      // TODO(list): "9903.03.03" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.03.03" }],
    },
    rate: { kind: "free" },
    effective: { from: "2026-02-24", to: "2026-07-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11012",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
      publishedOn: "2026-02-20",
      note: "Entries on or after 12:01 a.m. EST February 24, 2026, through 12:01 a.m. EDT July 24, 2026 (150 days)",
    },
  },
  {
    code: "9903.03.04",
    program: "122",
    name: "Section 122 Exemption: Agricultural Products",
    description:
      "Articles the product of any country, as provided for in subdivision (aa)(iii) of U.S. note 2 to subchapter III of chapter 99 of the HTSUS. The agricultural products described in subdivision (aa)(iii) are:",
    scope: {
      countries: "all",
      codes: [{ list: "argiculturalArticlesExemptFromCertainTariffs" }],
    },
    rate: { kind: "free" },
    effective: { from: "2026-02-24", to: "2026-07-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11012",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
      publishedOn: "2026-02-20",
      note: "Entries on or after 12:01 a.m. EST February 24, 2026, through 12:01 a.m. EDT July 24, 2026 (150 days)",
    },
  },
  {
    code: "9903.03.05",
    program: "122",
    name: "Section 122 Exemption: Civil Aircraft Articles",
    description:
      "Articles of civil aircraft (all aircraft other than military aircraft); their engines, parts and components; their other parts, components and subassemblies; and ground flight simulators and their parts and components of any country, provided for in subdivision (aa)(iv) of U.S. note 2 to subchapter III of chapter 99 of the HTSUS.",
    scope: {
      countries: "all",
      codes: [{ list: "civilAircraftArticleExemptFromSection122Tariff" }],
    },
    requires: [confirm("9903.03.05")],
    rate: { kind: "free" },
    effective: { from: "2026-02-24", to: "2026-07-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11012",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
      publishedOn: "2026-02-20",
      note: "Entries on or after 12:01 a.m. EST February 24, 2026, through 12:01 a.m. EDT July 24, 2026 (150 days)",
    },
  },
  ...tariffVersions(
    {
      code: "9903.03.06",
      program: "122",
      name: "Section 122 Exemption: Section 232 Articles",
      description:
        "Articles of iron or steel, derivative articles of iron or steel, articles of aluminum, derivative articles of aluminum, passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans) and light trucks and parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans) and light trucks, semiconductor articles, semi-finished copper and intensive copper derivative products, wood products, or medium- and heavy-duty vehicles or medium- and heavy-duty vehicle parts, of any country, as provided in subdivision (aa)(v) of U.S. note 2 to this subchapter",
      scope: {
        countries: "all",
        codes: "all",
        whenApplies: {
          codes: rev4Section232ArticleHeadings,
        },
      },
      // Covers only the metal content under the old metals headings (note 2(aa)(v)(a)–(d), (g)).
      // CONFLICT, note followed: Proclamation 11012 clause (4) exempts "the part of the import to
      // which section 232 tariffs do apply", so under full-value 232 headings (9903.81.87, .89 on
      // 8708 stampings, 9903.85.04 parts…) it would exempt the whole value. The note exempts only
      // the metal content. E.g. bumper stampings, 50% steel, $10,000: $500 of Section 122 here,
      // $0 under the proclamation. We follow the HTS notes when they conflict (Oct 7, 2026).
      basis: { kind: "metalContentCovered", content: rev4MetalTriggers },
      rate: { kind: "free" },
      effective: { from: "2026-02-24" },
      source: {
        revision: "2026HTSRev4",
        citation: "Proclamation 11012; Proclamation 11021",
        url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
        publishedOn: "2026-02-20",
        note: "Conflict with Proclamation 11012 clause (4), note text followed: Section 122 applies to the non-metal content even where Section 232 charges the full value. Backfilled from 2026HTSRev5's change record (CR-3–5, CR-61): note 2(aa)(v) and this heading as they read before PP 11021 (91 FR 18201, signed 2026-04-02), which replaced them for entries on or after April 6, 2026. Starts with Section 122 (PP 11012)",
      },
    },
    [
      {
        from: "2026-04-06",
        set: {
          description:
            "Articles of aluminum, of steel, or of copper or derivative aluminum or steel articles; passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks; parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks; medium- and heavy-duty vehicles; parts of medium- and heavy-duty vehicles; wood products; and semiconductor articles, of any country, as provided in subdivision (aa)(v) of U.S. note 2 to this subchapter",
          scope: {
            countries: "all",
            codes: "all",
            whenApplies: {
              codes: section232ArticleHeadings,
            },
          },
          basis: { kind: "fullValue" },
        },
        source: {
          revision: "2026HTSRev5",
          citation: "Proclamation 11021",
          url: "https://www.govinfo.gov/content/pkg/FR-2026-04-09/html/2026-06960.htm",
          publishedOn: "2026-04-02",
          note: "Note 2(aa)(v)(1) names 9903.82.02 and 9903.82.04–.17, with no content split (PP 11021, Annex IV). Triggers corrected in 2026HTSRev11: 9903.82.01 and 9903.82.03 removed (data-entry correction, all dates). Description corrected to the 2026HTSRev5 heading text (Oct 2026)",
        },
      },
      {
        from: "2026-04-23",
        set: {
          scope: {
            countries: "all",
            codes: "all",
            whenApplies: {
              codes: [...section232ArticleHeadings, "9903.82.18", "9903.82.19"],
            },
          },
        },
        source: {
          revision: "2026HTSRev6",
          note: "U.S. note 2(aa)(v)(1) range extended to 9903.82.19; effective date from the change record",
        },
      },
      {
        from: "2026-05-01",
        set: {
          scope: {
            countries: "all",
            codes: "all",
            whenApplies: {
              codes: [
                ...section232ArticleHeadings,
                "9903.82.18",
                "9903.82.19",
                "9903.94.66",
                "9903.94.67",
                "9903.94.68",
                "9903.94.69",
                "9903.76.24",
              ],
            },
          },
        },
        source: {
          revision: "2026HTSRev9",
          note: "U.S. note 2(aa)(v)(3) and (4) add the Taiwan auto parts (9903.94.66–.69) and wood (9903.76.24) headings; Notice effective 2026-05-01",
        },
      },
      {
        // Note 2(aa)(v)(1) in 2026HTSRev10 as published reads "headings 9903.82.04 and
        // 9903.82.04–9903.82.26", leaving out 9903.82.02. The 2026HTSRev11 technical correction
        // (PP 11021, effective 2026-04-06) restores 9903.82.02 retroactively, so it's included here.
        from: "2026-06-08",
        set: {
          scope: {
            countries: "all",
            codes: "all",
            whenApplies: {
              codes: section232ArticleHeadingsFromJune8,
            },
          },
        },
        source: {
          revision: "2026HTSRev10",
          citation: "Proclamation 11032",
          note: "U.S. note 2(aa)(v)(1) extends to 9903.82.26, effective 2026-06-08. Rev 10 as published omitted 9903.82.02; the 2026HTSRev11 technical correction (PP 11021, effective 2026-04-06) restores it",
        },
      },
      { from: "2026-07-24", ends: true },
    ],
  ),
  {
    code: "9903.03.07",
    program: "122",
    name: "Section 122 Exemption: Articles of Canada Entered via USMCA",
    description:
      "Articles the product of Canada, entered free of duty under the United States-Mexico-Canada Agreement.",
    scope: {
      countries: ["CA"],
      codes: "all",
    },
    requires: [{ kind: "preferenceClaimed", symbols: ["S", "S+"] }],
    rate: { kind: "free" },
    effective: { from: "2026-02-24", to: "2026-07-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11012",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
      publishedOn: "2026-02-20",
      note: "Entries on or after 12:01 a.m. EST February 24, 2026, through 12:01 a.m. EDT July 24, 2026 (150 days)",
    },
  },
  {
    code: "9903.03.08",
    program: "122",
    name: "Section 122 Exemption: Articles of Mexico Entered via USMCA",
    description:
      "Articles the product of Mexico, entered free of duty under the United States-Mexico-Canada Agreement.",
    scope: {
      countries: ["MX"],
      codes: "all",
    },
    requires: [{ kind: "preferenceClaimed", symbols: ["S", "S+"] }],
    rate: { kind: "free" },
    effective: { from: "2026-02-24", to: "2026-07-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11012",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
      publishedOn: "2026-02-20",
      note: "Entries on or after 12:01 a.m. EST February 24, 2026, through 12:01 a.m. EDT July 24, 2026 (150 days)",
    },
  },
  {
    code: "9903.03.09",
    program: "122",
    name: "Section 122 Exemption: Textiles or Apparel Entered via CAFTA-DR",
    description:
      "Articles of textiles or apparel the product of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras or Nicaragua that meet the rules of origin under the Dominican Republic-Central America Free Trade Agreement.",
    scope: {
      countries: ["CR", "DO", "SV", "GT", "HN", "NI"],
      codes: "all",
    },
    requires: [
      { kind: "preferenceClaimed", symbols: ["P", "P+"] },
      confirm("9903.03.09"),
    ],
    rate: { kind: "free" },
    effective: { from: "2026-02-24", to: "2026-07-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11012",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
      publishedOn: "2026-02-20",
      note: "Entries on or after 12:01 a.m. EST February 24, 2026, through 12:01 a.m. EDT July 24, 2026 (150 days)",
    },
  },
  {
    code: "9903.03.10",
    program: "122",
    name: "Section 122 Exemption: Donations",
    description:
      " Articles that are donations, by persons subject to the jurisdiction of the United States, such as food, clothing and medicine, intended to be used to relieve human suffering.",
    scope: {
      countries: "all",
      codes: "all",
    },
    requires: [{ kind: "answer", input: "isDonation", equals: true }],
    rate: { kind: "free" },
    effective: { from: "2026-02-24", to: "2026-07-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11012",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
      publishedOn: "2026-02-20",
      note: "Entries on or after 12:01 a.m. EST February 24, 2026, through 12:01 a.m. EDT July 24, 2026 (150 days)",
    },
  },
  {
    code: "9903.03.11",
    program: "122",
    name: "Section 122 Exemption: Informational Materials",
    description:
      "Articles that are informational materials, including but not limited to publications, films, posters, phonograph records, photographs, microfilms, microfiche, tapes, compact disks, CD ROMs, artworks and news wire feeds.",
    scope: {
      countries: "all",
      codes: "all",
    },
    requires: [
      { kind: "answer", input: "isInformationalMaterial", equals: true },
    ],
    rate: { kind: "free" },
    effective: { from: "2026-02-24", to: "2026-07-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation 11012",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm",
      publishedOn: "2026-02-20",
      note: "Entries on or after 12:01 a.m. EST February 24, 2026, through 12:01 a.m. EDT July 24, 2026 (150 days)",
    },
  },
]
