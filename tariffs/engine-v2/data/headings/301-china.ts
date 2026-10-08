// Migrated from the legacy tariff data (2026HTSRev5), then reviewed by hand. The legacy engine
// was removed on Oct 1, 2026; this file is now the source. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"

export const headings: Tariff[] = [
  {
    code: "9903.88.01",
    program: "301-china",
    name: "Articles the product of China from 20 (a) and (b) (Section 301)",
    description:
      "Except as provided in headings 9903.88.05, 9903.88.06, 9903.88.07, 9903.88.08, 9903.88.10, 9903.88.11, 9903.88.14, 9903.88.19, 9903.88.50, 9903.88.52, 9903.88.58, 9903.88.60, 9903.88.62, 9903.88.66, 9903.88.67, 9903.88.68, or 9903.88.69, articles the product of China, as provided for in U.S. note 20(a) to this subchapter and as provided for in the subheadings enumerated in U.S. note 20(b) [to this subchapter]",
    scope: {
      countries: ["CN"],
      // TODO(list): "9903.88.01" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.88.01" }],
    },
    exceptions: ["9903.88.69"],
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.88.02",
    program: "301-china",
    name: "Articles the product of China from 20 (c) and (d) (Section 301)",
    description:
      "Except as provided in headings 9903.88.12, 9903.88.17, 9903.88.20, 9903.88.54, 9903.88.59, 9903.88.61, 9903.88.63, 9903.88.66, 9903.88.67, 9903.88.68, 9903.88.69, or 9903.88.70, articles the product of China, as provided for in U.S. note 20(c) to this subchapter and as provided for in the subheadings enumerated in U.S. note 20(d)",
    scope: {
      countries: ["CN"],
      // TODO(list): "9903.88.02" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.88.02" }],
    },
    exceptions: ["9903.88.69", "9903.88.70"],
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.88.03",
    program: "301-china",
    name: "Articles of China from 20 (e) and (f) (Section 301)",
    description:
      "Except as provided in headings 9903.88.13, 9903.88.18, 9903.88.33, 9903.88.34, 9903.88.35, 9903.88.36, 9903.88.37, 9903.88.38, 9903.88.40, 9903.88.41, 9903.88.43, 9903.88.45, 9903.88.46, 9903.88.48, 9903.88.56, 9903.88.64, 9903.88.66, 9903.88.67, 9903.88.68, or 9903.88.69, articles the product of China, as provided for in U.S. note 20(e) to this subchapter and as provided for in the subheadings enumerated in U.S. note 20(f)",
    scope: {
      countries: ["CN"],
      // TODO(list): "9903.88.03" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.88.03" }],
    },
    exceptions: ["9903.88.69"],
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.88.04",
    program: "301-china",
    name: "Articles of China from 20 (g) (Section 301)",
    description:
      "Except as provided in headings 9903.88.33, 9903.88.34, 9903.88.36, 9903.88.37, 9903.88.38, 9903.88.40, 9903.88.46, 9903.88.48, 9903.88.56, 9903.88.64, 9903.88.66, 9903.88.67, or 9903.88.69, articles the product of China, as provided for in U.S. note 20(g) to this subchapter and as provided for in the subheadings enumerated in U.S. note 20(g)",
    scope: {
      countries: ["CN"],
      // TODO(list): "9903.88.04" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.88.04" }],
      // TODO(list): "9903.88.04:excluded" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      excludeCodes: [{ list: "9903.88.04:excluded" }],
    },
    exceptions: ["9903.88.69"],
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.88.15",
    program: "301-china",
    name: "Articles of China from 20 (r) and (s) (Section 301)",
    description:
      "Except as provided in headings 9903.88.39, 9903.88.42, 9903.88.44, 9903.88.47, 9903.88.49, 9903.88.51, 9903.88.53, 9903.88.55, 9903.88.57, 9903.88.65, 9903.88.66, 9903.88.67, 9903.88.68, or 9903.88.69, articles the product of China, as provided for in U.S. note 20(r) to this subchapter and as provided for in the subheadings enumerated in U.S. note 20(s)",
    scope: {
      countries: ["CN"],
      // TODO(list): "9903.88.15" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.88.15" }],
      // TODO(list): "9903.88.15:excluded" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      excludeCodes: [{ list: "9903.88.15:excluded" }],
    },
    exceptions: ["9903.88.69"],
    rate: { kind: "adValorem", pct: 7.5 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.88.69",
    program: "301-china",
    name: "Section 301 Exclusion Granted by USTR (U.S. Note 20(vvv))",
    description:
      "Effective with respect to entries on or after June 15, 2024 and through November 9, 2026, articles the product of China, as provided for in U.S. note 20(vvv) to this subchapter, each covered by an exclusion granted by the U.S. Trade Representative",
    scope: {
      countries: ["CN"],
      // TODO(list): "9903.88.69" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.88.69" }],
    },
    // Whole statistical numbers (20(vvv)(i)–(ii)) apply as listed; for an exclusion of a product
    // "described in" a number (20(vvv)(iii)–(iv)), the goods must be that product
    requires: [
      {
        kind: "answerForListedCodes",
        input: "confirm:9903.88.69",
        equals: true,
        list: "china301ExclusionDescribedProducts20vvv",
      },
    ],
    rate: { kind: "free" },
    effective: { from: "2024-06-15", to: "2026-11-10" },
    source: {
      revision: "2026HTSRev20",
      citation:
        "USTR notice of product exclusion extensions, 90 FR 55232 (FR Doc. 2025-21671)",
      url: "https://www.govinfo.gov/content/pkg/FR-2025-12-01/html/2025-21671.htm",
      publishedOn: "2025-12-01",
      note: 'The 178 exclusions extended for entries on or after 12:01 a.m. EST Nov 30, 2025 and before 11:59 p.m. EDT Nov 9, 2026; the heading reads "through November 9, 2026" from 2026HTSRev4 on. Described-product exclusions need confirmation (Oct 2026 correction: they applied to every good under the number)',
    },
  },
  {
    code: "9903.88.70",
    program: "301-china",
    name: "Section 301 Exclusion Granted by USTR (U.S. Note 20(www))",
    description:
      "Effective with respect to entries on or after January 1, 2024, and through November 9, 2026, articles the product of China, as provided in U.S. note 20(www) to this subchapter, each covered by an exclusion granted by the U.S. Trade Representative",
    scope: {
      countries: ["CN"],
      // TODO(list): "9903.88.70" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.88.70" }],
    },
    // Every 20(www) exclusion is a product "described in" a number (solar wafer equipment)
    requires: [confirm("9903.88.70")],
    rate: { kind: "free" },
    effective: { from: "2024-01-01", to: "2026-11-10" },
    source: {
      revision: "2026HTSRev20",
      citation:
        "USTR notice of product exclusion extensions, 90 FR 55232 (FR Doc. 2025-21671)",
      url: "https://www.govinfo.gov/content/pkg/FR-2025-12-01/html/2025-21671.htm",
      publishedOn: "2025-12-01",
      note: 'Extended with 9903.88.69 for entries before 11:59 p.m. EDT Nov 9, 2026; the heading reads "through November 9, 2026" from 2026HTSRev4 on. Needs confirmation (Oct 2026 correction: it applied to every good under the number)',
    },
  },
  {
    code: "9903.91.01",
    program: "301-china",
    name: "Entries from China in 31(b) after Sept.27, 2024",
    description:
      "Effective with respect to entries on or after September 27, 2024, articles the product of China, as provided for in subdivision (b) of U.S. note 31 to this subchapter",
    scope: {
      countries: ["CN"],
      codes: [{ list: "china31b" }],
    },
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: { from: "2024-09-27" },
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.91.02",
    program: "301-china",
    name: "Articles of China from 31(c) after Sept.27, 2024",
    description:
      "Effective with respect to entries on or after September 27, 2024, articles the product of China, as provided for in subdivision (c) of U.S. note 31 to this subchapter",
    scope: {
      countries: ["CN"],
      codes: [{ list: "china31c" }],
    },
    rate: { kind: "adValorem", pct: 50 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: { from: "2024-09-27" },
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.91.03",
    program: "301-china",
    name: "Articles of China from 31(d) after Sept.27, 2024",
    description:
      "Except as provided in heading 9903.91.10, effective with respect to entries on or after September 27, 2024, articles the product of China, as provided for in subdivision (d) of U.S. note 31 to this subchapter",
    scope: {
      countries: ["CN"],
      codes: [{ list: "china31d" }],
    },
    rate: { kind: "adValorem", pct: 100 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: { from: "2024-09-27" },
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.91.04",
    program: "301-china",
    name: "Articles of China from 31(e)",
    description:
      "Effective with respect to entries on or after January 1, 2025, and before January 1, 2026, articles the product of China, as provided for in subdivision (e) of U.S. note 31 to this subchapter",
    scope: {
      countries: ["CN"],
      codes: [{ list: "china31e" }],
    },
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: { from: "2025-01-01", to: "2026-01-01" },
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.91.05",
    program: "301-china",
    name: "Articles of China from 31(f)",
    description:
      "Effective with respect to entries on or after January 1, 2025, articles the product of China, as provided for in subdivision (f) of U.S. note 31 to this subchapter",
    scope: {
      countries: ["CN"],
      codes: [{ list: "china31f" }],
    },
    rate: { kind: "adValorem", pct: 50 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: { from: "2025-01-01" },
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.91.06",
    program: "301-china",
    name: "Articles of China from 31(g)",
    description:
      "Effective with respect to entries on or after January 1, 2026, articles the product of China, as provided for in subdivision (g) of U.S. note 31 to this subchapter",
    scope: {
      countries: ["CN"],
      codes: [{ list: "china31g" }],
    },
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: { from: "2026-01-01" },
    source: {
      revision: "2026HTSRev5",
      citation: "USTR notice, FR Doc. 2024-21217",
    },
  },
  {
    code: "9903.91.07",
    program: "301-china",
    name: "Articles of China from 31(h)",
    description:
      "Effective with respect to entries on or after January 1, 2026, articles the product of China, as provided for in subdivision (h) of U.S. note 31 to this subchapter",
    scope: {
      countries: ["CN"],
      codes: [{ list: "china31h" }],
    },
    rate: { kind: "adValorem", pct: 50 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: { from: "2026-01-01" },
    source: {
      revision: "2026HTSRev5",
      citation: "USTR notice, FR Doc. 2024-21217",
    },
  },
  {
    code: "9903.91.08",
    program: "301-china",
    name: "Articles of China from 31(i)",
    description:
      "Effective with respect to entries on or after January 1, 2026, articles the product of China, as provided for in subdivision (i) of U.S. note 31 to this subchapter",
    scope: {
      countries: ["CN"],
      codes: [{ list: "china31i" }],
    },
    rate: { kind: "adValorem", pct: 100 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: { from: "2026-01-01" },
    source: {
      revision: "2026HTSRev5",
      citation: "USTR notice, FR Doc. 2024-21217",
    },
  },
  {
    code: "9903.91.11",
    program: "301-china",
    name: "Articles of China from 31(j)",
    description:
      "Effective with respect to entries on or after January 1, 2025, articles the product of China, as provided for in subdivision (j) of U.S. note 31 to this subchapter",
    scope: {
      countries: ["CN"],
      // TODO(list): "9903.91.11" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.91.11" }],
    },
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: { from: "2025-01-01" },
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.92.09",
    program: "301-china",
    name: "Ship-to-Shore Gantry Cranes of China Exeception",
    description:
      "Notwithstanding subheading 9903.92.10, effective with respect to entries, on or after September 27, 2024, of ship-to-shore gantry cranes, configured as a high- or low-profile steel superstructure and designed to unload intermodal containers from vessels with coupling devices for containers, including spreaders or twist-locks, articles the product of China (provided for in subheading 8426.19.00), that are fulfilling in whole or in part an executed contract for sale dated prior to May 14, 2024 for goods that are entered for consumption, or withdrawn from warehouse for consumption, in the United States prior to May 14, 2026",
    scope: {
      countries: ["CN"],
      // TODO(list): "9903.92.09" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.92.09" }],
    },
    requires: [confirm("9903.92.09")],
    rate: { kind: "free" },
    effective: { from: "2024-09-27", to: "2026-05-14" },
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.92.10",
    program: "301-china",
    name: "Ship-to-Shore Gantry Cranes of China Additional Tariff",
    description:
      "Except as provided in heading 9903.91.09, ship-to-shore gantry cranes, configured as a high- or low-profile steel superstructure and designed to unload intermodal containers from vessels with coupling devices for containers, including spreaders or twist-locks (provided for in subheading 8426.19.00)",
    scope: {
      countries: ["CN"],
      // TODO(list): "9903.92.10" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.92.10" }],
    },
    exceptions: ["9903.92.09"],
    requires: [confirm("9903.92.10")],
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
]
