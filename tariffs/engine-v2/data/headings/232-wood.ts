// Migrated from the legacy tariff data (2026HTSRev5), then reviewed by hand. The legacy engine
// was removed on Oct 1, 2026; this file is now the source. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"
import { tariffVersions } from "../../versioning"

export const headings: Tariff[] = [
  {
    code: "9903.76.01",
    program: "232-wood",
    name: "Softwood & Timber Products",
    description: "TODO",
    scope: {
      countries: "all",
      // TODO(list): "9903.76.01" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.76.01" }],
    },
    exceptions: [
      "9903.94.01",
      "9903.94.03",
      "9903.94.05",
      "9903.94.07",
      "9903.74.08",
      "9903.74.09",
      "9903.94.33",
      "9903.94.44",
      "9903.94.45",
      "9903.94.54",
      "9903.94.55",
      "9903.94.62",
      "9903.94.63",
      "9903.94.64",
      "9903.94.65",
    ],
    rate: { kind: "adValorem", pct: 10 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  ...tariffVersions(
    {
      code: "9903.76.02",
      program: "232-wood",
      name: "Upholstered Wooden Furniture Products",
      description: "TODO",
      scope: {
        countries: "all",
        // TODO(list): "9903.76.02" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
        codes: [{ list: "9903.76.02" }],
        excludeCountries: ["GB", "JP", "KR", { list: "eu-members" }],
      },
      exceptions: [
        "9903.94.01",
        "9903.94.03",
        "9903.94.05",
        "9903.94.07",
        "9903.74.08",
        "9903.74.09",
        "9903.94.33",
        "9903.94.44",
        "9903.94.45",
        "9903.94.54",
        "9903.94.55",
        "9903.94.62",
        "9903.94.63",
        "9903.94.64",
        "9903.94.65",
      ],
      rate: { kind: "adValorem", pct: 25 },
      effective: {},
      source: { revision: "2026HTSRev5" },
    },
    [
      {
        from: "2026-05-01",
        set: {
          scope: {
            countries: "all",
            // TODO(list): "9903.76.02" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
            codes: [{ list: "9903.76.02" }],
            excludeCountries: ["GB", "JP", "KR", "TW", { list: "eu-members" }],
          },
        },
        source: {
          revision: "2026HTSRev9",
          note: "Taiwan excluded: U.S. note 37(c) as modified by Notice effective 2026-05-01 (Taiwan has 9903.76.24)",
        },
      },
    ],
  ),
  ...tariffVersions(
    {
      code: "9903.76.03",
      program: "232-wood",
      name: "Completed Kitchen Cabinets & Vanities (and parts thereof)",
      description: "TODO",
      scope: {
        countries: "all",
        // TODO(list): "9903.76.03" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
        codes: [{ list: "9903.76.03" }],
        excludeCountries: ["GB", "JP", "KR", { list: "eu-members" }],
      },
      exceptions: [
        "9903.94.01",
        "9903.94.03",
        "9903.76.04",
        "9903.94.05",
        "9903.94.07",
        "9903.74.08",
        "9903.74.09",
        "9903.94.33",
        "9903.94.44",
        "9903.94.45",
        "9903.94.54",
        "9903.94.55",
        "9903.94.62",
        "9903.94.63",
        "9903.94.64",
        "9903.94.65",
      ],
      rate: { kind: "adValorem", pct: 25 },
      effective: {},
      source: { revision: "2026HTSRev5" },
    },
    [
      {
        from: "2026-05-01",
        set: {
          scope: {
            countries: "all",
            // TODO(list): "9903.76.03" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
            codes: [{ list: "9903.76.03" }],
            excludeCountries: ["GB", "JP", "KR", "TW", { list: "eu-members" }],
          },
        },
        source: {
          revision: "2026HTSRev9",
          note: "Taiwan excluded: U.S. note 37(e) as modified by Notice effective 2026-05-01 (Taiwan has 9903.76.24)",
        },
      },
    ],
  ),
  {
    code: "9903.76.04",
    program: "232-wood",
    name: "Is Not a Completed Kitchen Cabinets & Vanities or its parts)",
    description: "TODO",
    scope: {
      countries: "all",
      // TODO(list): "9903.76.04" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.76.04" }],
    },
    requires: [confirm("9903.76.04")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.76.20",
    program: "232-wood",
    name: "Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from the United Kingdom",
    description: "TODO",
    scope: {
      countries: ["GB"],
      // TODO(list): "9903.76.20" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.76.20" }],
    },
    exceptions: ["9903.94.01", "9903.94.03", "9903.76.04", "9903.94.05"],
    rate: { kind: "adValorem", pct: 10 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.76.21",
    program: "232-wood",
    name: "Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from Japan",
    description: "TODO",
    scope: {
      countries: ["JP"],
      // TODO(list): "9903.76.21" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.76.21" }],
    },
    exceptions: ["9903.94.01", "9903.94.03", "9903.76.04", "9903.94.05"],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation of Sep 29, 2025 (90 FR, Oct 6, 2025)",
      note: "EU and Japan: combined Section 232 + MFN duty capped at 15%",
    },
  },
  {
    code: "9903.76.22",
    program: "232-wood",
    name: "Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from the European Union",
    description: "TODO",
    scope: {
      countries: [{ list: "eu-members" }],
      // TODO(list): "9903.76.22" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.76.22" }],
    },
    exceptions: ["9903.94.01", "9903.94.03", "9903.76.04", "9903.94.05"],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: {
      revision: "2026HTSRev5",
      citation: "Proclamation of Sep 29, 2025 (90 FR, Oct 6, 2025)",
      note: "EU and Japan: combined Section 232 + MFN duty capped at 15%",
    },
  },
  {
    code: "9903.76.23",
    program: "232-wood",
    name: "Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from South Korea",
    description:
      "Wood products of South Korea as provided for in subdivisions (d) and (f) of U.S. note 37 of this subchapter",
    scope: {
      countries: ["KR"],
      // TODO(list): "9903.76.23" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.76.23" }],
    },
    exceptions: [
      "9903.94.01",
      "9903.94.03",
      "9903.76.04",
      "9903.94.05",
      "9903.94.62",
      "9903.94.63",
      "9903.94.64",
      "9903.94.65",
    ],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: {
      revision: "2026HTSRev9",
      note: "Corrected from a flat +15% to topping up to 15% including the base rate, like Japan (9903.76.21), the EU (.22) and Taiwan (.24): U.S. note 37(l) uses the same terms",
    },
  },
  {
    code: "9903.76.24",
    program: "232-wood",
    name: "Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from Taiwan",
    description:
      "Wood products of Taiwan as provided for in subdivisions (d) and (f) of U.S. note 37 of this subchapter",
    scope: {
      countries: ["TW"],
      // Same products as Korea's 9903.76.23: subdivisions (d) and (f) of U.S. note 37
      codes: [{ list: "9903.76.23" }],
    },
    exceptions: [
      "9903.94.01",
      "9903.94.03",
      "9903.76.04",
      "9903.94.05",
      "9903.94.66",
      "9903.94.67",
      "9903.94.68",
      "9903.94.69",
    ],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: { from: "2026-05-01" },
    source: {
      revision: "2026HTSRev9",
      note: "U.S. note 37(m); Notice effective 2026-05-01",
    },
  },
]
