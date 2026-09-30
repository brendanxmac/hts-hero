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
]
