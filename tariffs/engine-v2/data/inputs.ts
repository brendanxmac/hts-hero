import { InputDefinition } from "../types"

// Named inputs shared across headings. Per-heading confirmations are generated
// in confirmations.ts.
export const namedInputs: InputDefinition[] = [
  {
    id: "loadingDate",
    label: "Date the goods were loaded onto the vessel for export",
    help: "Some exemptions apply to goods already in transit before a cutoff date.",
    type: "date",
  },
  {
    id: "isDonation",
    label: "Are the goods a donation to relieve human suffering (food, clothing, medicine)?",
    type: "boolean",
  },
  {
    id: "isInformationalMaterial",
    label:
      "Are the goods informational materials (publications, films, recordings, artworks, news wire feeds)?",
    type: "boolean",
  },
  {
    // Asked as "not": yes/no questions are checkboxes, and an unchecked box is unanswered, so the
    // box has to be the one that removes the duty
    id: "notQuartzSurfaceProduct",
    label: "These goods aren't quartz surface products",
    help: "Section 201 covers only quartz surface products: slabs, countertops, tiles and other surfaces made mostly of silica (e.g. quartz) with a resin binder, where silica is the largest single material by weight. Quarried stone such as granite, marble, soapstone or quartzite isn't included, nor are other goods under these codes, such as other glass articles (U.S. note 41(a)).",
    type: "boolean",
    citations: ["U.S. note 41(a)"],
  },
  {
    id: "uasForUse",
    label: "These goods are for use in or with unmanned aircraft",
    help: "Section 232 on unmanned aircraft systems covers power supplies and control panels only as docking stations (or their parts) for unmanned aircraft, and aircraft parts only for unmanned aircraft systems over 25 kg maximum take-off weight that aren't for retail delivery, agricultural use or sale to the Department of War (U.S. note 43(c)(1)–(2)).",
    type: "boolean",
    citations: ["U.S. note 43(c)(1)", "U.S. note 43(c)(2)"],
  },
  {
    id: "uasThermalImaging",
    label: "This unmanned aircraft has thermal imaging",
    help: "Unmanned aircraft with thermal imaging pay 100% under Section 232; without it, 25% (U.S. note 43(c)(3)–(4)).",
    type: "boolean",
    citations: ["U.S. note 43(c)(3)", "U.S. note 43(c)(4)"],
  },
  {
    id: "quartzQuotaFilled",
    label: "Has the quarterly quota for quartz surface products been filled?",
    help: "Section 201 quartz surface products pay the in-quota rate until the quarter's quota (U.S. note 41(d)) is used up, and the over-quota rate after that. CBP publishes quota status.",
    type: "boolean",
    citations: ["U.S. note 41(d)"],
  },
  {
    // Asked as the case that lifts the ban, like the other "not" questions above
    id: "alcoholInBulk",
    label: "These beverages are in bulk, not in bottles, cans, boxes, kegs or similar containers",
    help: "Proclamation 11061 bans these Canadian alcoholic beverages from import from September 29, 2026 only when they're packaged in bottles, cans, boxes, kegs or other similar direct-to-consumption containers. In bulk they can still be imported and pay the 50% Section 338 duty (CSMS #70050970).",
    type: "boolean",
  },
  // Section 232 metals before April 6, 2026 charged some goods on the metal content only, and
  // Section 122 then applied to the rest (U.S. notes 16, 19, 36 and 2(aa)(v) in 2026HTSRev4)
  {
    id: "steelContentPct",
    label: "Steel content (% of the article's value)",
    help: "The declared value of the steel in the article, as a percent of its customs value. Before April 6, 2026, the Section 232 steel duty on many derivative articles (and on chapter 73 goods) applied to the steel content only.",
    type: "percent",
  },
  {
    id: "aluminumContentPct",
    label: "Aluminum content (% of the article's value)",
    help: "The declared value of the aluminum in the article, as a percent of its customs value. Before April 6, 2026, the Section 232 aluminum duty on chapter 76 goods and many derivative articles applied to the aluminum content only.",
    type: "percent",
  },
  {
    id: "copperContentPct",
    label: "Copper content (% of the article's value)",
    help: "The declared value of the copper in the article, as a percent of its customs value. Before April 6, 2026, the Section 232 copper duty applied to the copper content only (U.S. note 36).",
    type: "percent",
  },
  {
    id: "ftzPrivilegedForeignAdmissionDate",
    label: "Date the goods were admitted to a foreign trade zone under privileged foreign status",
    help: "Only for goods withdrawn from a U.S. foreign trade zone that were admitted under privileged foreign status (19 CFR 146.41). Some Section 232 headings apply to goods admitted before a cutoff date; the rate is the same.",
    type: "date",
  },
  {
    id: "usContentPct",
    label: "U.S. content (% of the article's value)",
    help: "The value of the article attributable to parts produced in the United States, as a percent of its total value.",
    type: "percent",
  },
]
