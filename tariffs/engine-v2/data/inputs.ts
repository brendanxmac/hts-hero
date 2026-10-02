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
    id: "isQuartzSurfaceProduct",
    label: "Is this a quartz surface product?",
    help: "Slabs, countertops, tiles and other surfaces made mostly of silica (e.g. quartz) with a resin binder, where silica is the largest single material by weight. Quarried stone such as granite, marble, soapstone or quartzite isn't included (U.S. note 41(a)).",
    type: "boolean",
  },
  {
    id: "quartzQuotaFilled",
    label: "Has the quarterly quota for quartz surface products been filled?",
    help: "Section 201 quartz surface products pay the in-quota rate until the quarter's quota (U.S. note 41(d)) is used up, and the over-quota rate after that. CBP publishes quota status.",
    type: "boolean",
  },
  {
    id: "usContentPct",
    label: "U.S. content (% of the article's value)",
    help: "The value of the article attributable to parts produced in the United States, as a percent of its total value.",
    type: "percent",
  },
]
