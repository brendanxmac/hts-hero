// Migrated from the legacy tariff data (2026HTSRev5), then reviewed by hand. The legacy engine
// was removed on Oct 1, 2026; this file is now the source. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"
import { tariffVersions } from "../../versioning"

const allHeadings: Tariff[] = [
  {
    code: "9903.94.01",
    program: "232-autos",
    name: "Section 232 Autos: Passenger Vehicles and Light Trucks",
    description:
      "Except for products described in headings 9903.94.02, 9903.94.03, 9903.94.04, 9903.94.31, 9903.94.40, 9903.94.41, 9903.94.50, 9903.94.51, 9903.94.60, and 9903.94.61, passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks, as specified in note 33 to this subchapter, as provided for in subdivision (b) of U.S. note 33 to this subchapter",
    scope: {
      countries: "all",
      codes: [{ list: "automobiles33B" }],
    },
    exceptions: [
      "9903.94.02",
      "9903.94.03",
      "9903.94.04",
      "9903.94.31",
      "9903.94.40",
      "9903.94.41",
      "9903.94.50",
      "9903.94.51",
      "9903.94.60",
      "9903.94.61",
    ],
    rate: { kind: "adValorem", pct: 25 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.02",
    program: "232-autos",
    name: "Section 232 Autos Exemption: Not a Passenger Vehicle or Light Truck, or Approved United States Content",
    description:
      "Effective with respect to entries on or after April 3, 2025, articles as provided for in subdivision (c) of U.S. note 33 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "automobiles33B" }],
    },
    requires: [confirm("9903.94.02")],
    rate: { kind: "free" },
    effective: { from: "2025-04-03" },
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.03",
    program: "232-autos",
    name: "Section 232 Autos: Foreign Content of USMCA Vehicles (Commerce Approved)",
    description:
      "Effective with respect to entries on or after April 3, 2025, certain passenger vehicles and light trucks, as provided for in subdivision (d) of U.S. note 33 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "automobiles33B" }],
    },
    requires: [confirm("9903.94.03")],
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: { from: "2025-04-03" },
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.04",
    program: "232-autos",
    name: "Section 232 Autos Exemption: Vehicles at Least 25 Years Old",
    description:
      "Effective with respect to entries on or after April 3, 2025, certain passenger vehicles and light trucks, as provided for in subdivision (e) of U.S. note 33 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "automobiles33B" }],
    },
    requires: [confirm("9903.94.04")],
    rate: { kind: "free" },
    effective: { from: "2025-04-03" },
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.31",
    program: "232-autos",
    name: "Section 232 Autos: Passenger Vehicles of the United Kingdom",
    description:
      "Effective with respect to entries on or after June 30, 2025, passenger vehicles that are products of the United Kingdom as specified in subdivision (i) of U.S. note 33 to this subchapter, when entered under the terms of subdivision (i) of U.S. note 33 to this subchapter",
    scope: {
      countries: ["GB"],
      // TODO(list): "9903.94.31" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.94.31" }],
    },
    exceptions: ["9903.94.07", "9903.94.01"],
    requires: [confirm("9903.94.31")],
    rate: { kind: "adValorem", pct: 7.5 },
    rateByColumn: {
      special: { kind: "free" },
      column2: { kind: "free" },
    },
    effective: { from: "2025-06-30" },
    source: {
      revision: "2026HTSRev9",
      citation: "90 FR 27851",
      note: "Description from 2026HTSRev9 (effective date filled in); rate unchanged",
    },
  },
  ...tariffVersions(
    {
      code: "9903.94.05",
      program: "232-autos",
      name: "Section 232 Auto Parts",
      description:
        "Except for products described in headings 9903.94.06, 9903.94.32, 9903.94.33, 9903.94.42, 9903.94.43, 9903.94.44, 9903.94.45, 9903.94.52, 9903.94.53, 9903.94.54, 9903.94.55, 9903.94.62, and 9903.94.63, automobile parts, as provided for in subdivision (g) of U.S. note 33 to this subchapter",
      scope: {
        countries: "all",
        codes: [{ list: "automobileParts33G" }],
      },
      exceptions: [
        "9903.94.06",
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
        "9903.74.08",
        "9903.74.09",
      ],
      requires: [confirm("9903.94.05")],
      rate: { kind: "adValorem", pct: 25 },
      effective: {},
      source: { revision: "2026HTSRev5" },
    },
    [
      {
        from: "2026-05-01",
        set: {
          description:
            "Except for products described in headings 9903.94.06, 9903.94.32, 9903.94.33, 9903.94.42, 9903.94.43, 9903.94.44, 9903.94.45, 9903.94.52, 9903.94.53, 9903.94.54, 9903.94.55, 9903.94.62, 9903.94.63, 9903.94.66 and 9903.94.67, automobile parts, as provided for in subdivision (g) of U.S. note 33 to this subchapter",
          exceptions: [
            "9903.94.06",
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
            "9903.74.08",
            "9903.74.09",
            "9903.94.66",
            "9903.94.67",
          ],
        },
        source: {
          revision: "2026HTSRev9",
          note: "Taiwan headings 9903.94.66/67 added as exceptions (U.S. note 33(u)); Notice effective 2026-05-01",
        },
      },
    ],
  ),
  {
    code: "9903.94.06",
    program: "232-autos",
    name: "Section 232 Auto Parts Exemption: USMCA Parts, or Not a Vehicle Part",
    description:
      "Effective with respect to entries on or after May 3, 2025, articles provided for in subdivision (h) of U.S. note 33 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "automobileParts33G" }],
    },
    requires: [confirm("9903.94.06")],
    rate: { kind: "free" },
    effective: { from: "2025-05-03" },
    source: { revision: "2026HTSRev5" },
  },
  ...tariffVersions(
    {
      code: "9903.94.07",
      program: "232-autos",
      name: "Section 232 Auto Parts: For Vehicle Production or Repair in the United States",
      description:
        "Except as provided for in headings 9903.94.33, 9903.94.44, 9903.94.45, 9903.94.54, 9903.94.55, 9903.94.64, and 9903.94.65, automobile parts as provided for in subdivision (p) of U.S. note 33 to this subchapter.",
      scope: {
        countries: "all",
        // U.S. note 33(p) lists no codes: it covers automobile parts certified for U.S. production or
        // repair, outside chapters 72, 73 and 76 and the 33(g) and 38(i) lists. Chapters that can't hold
        // vehicle parts are left out too (an engine judgment; see lists/vehicle-parts.ts). PROGRESS.md L9.
        codes: "all",
        excludeCodes: [
          { list: "automobileParts33G" },
          { list: "ch72Headings" },
          { list: "ch73Headings" },
          { list: "ch76Headings" },
          { list: "partsOfMHDVs38i" },
          { list: "notVehiclePartChapters" },
        ],
      },
      exceptions: [
        "9903.94.33",
        "9903.94.44",
        "9903.94.45",
        "9903.94.54",
        "9903.94.55",
        "9903.94.06",
        "9903.94.32",
        "9903.94.52",
        "9903.94.53",
        "9903.94.42",
        "9903.94.43",
        "9903.94.64",
        "9903.94.65",
      ],
      requires: [confirm("9903.94.07")],
      rate: { kind: "adValorem", pct: 25 },
      effective: {},
      source: { revision: "2026HTSRev5" },
    },
    [
      {
        from: "2026-05-01",
        set: {
          description:
            "Except as provided for in headings 9903.94.33, 9903.94.44, 9903.94.45, 9903.94.54, 9903.94.55, 9903.94.64, 9903.94.65, 9903.94.68, and 9903.94.69, automobile parts as provided for in subdivision (p) of U.S. note 33 to this subchapter",
          exceptions: [
            "9903.94.33",
            "9903.94.44",
            "9903.94.45",
            "9903.94.54",
            "9903.94.55",
            "9903.94.06",
            "9903.94.32",
            "9903.94.52",
            "9903.94.53",
            "9903.94.42",
            "9903.94.43",
            "9903.94.64",
            "9903.94.65",
            "9903.94.68",
            "9903.94.69",
          ],
        },
        source: {
          revision: "2026HTSRev9",
          note: "Taiwan headings 9903.94.68/69 added as exceptions (U.S. note 33(u)); Notice effective 2026-05-01",
        },
      },
    ],
  ),
  {
    code: "9903.94.33",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of the United Kingdom for United Kingdom Vehicles",
    description:
      "Automobile parts the product of the United Kingdom as provided for in subdivision (q) of U.S. note 33 to this subchapter",
    scope: {
      countries: ["GB"],
      // TODO(list): covers every code except the exclusions below (legacy scope). The heading's U.S. note subdivision (see description) defines its own list; use that instead. PROGRESS.md L9.
      codes: "all",
      excludeCodes: [
        { list: "autoPartsOfUK33J" },
        { list: "ch72Headings" },
        { list: "ch73Headings" },
        { list: "ch76Headings" },
        { list: "partsOfMHDVs38i" },
      ],
    },
    requires: [confirm("9903.94.33")],
    rate: { kind: "adValorem", pct: 10 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.44",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of the European Union for United States Production or Repair (Base Duty 15% or More)",
    description:
      "Automobile parts the product of the European Union with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent, as provided for in subdivision (r) of U.S. note 33 to this subchapter.",
    scope: {
      countries: [{ list: "eu-members" }],
      // TODO(list): covers every code except the exclusions below (legacy scope). The heading's U.S. note subdivision (see description) defines its own list; use that instead. PROGRESS.md L9.
      codes: "all",
      excludeCodes: [
        { list: "automobileParts33G" },
        { list: "ch72Headings" },
        { list: "ch73Headings" },
        { list: "ch76Headings" },
        { list: "partsOfMHDVs38i" },
      ],
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.44")],
    rate: { kind: "free" },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.45",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of the European Union for United States Production or Repair (15% Including Base Duty)",
    description:
      "Automobile parts the product of the European Union with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent, as provided for in subdivision (r) of U.S. note 33 to this subchapter.",
    scope: {
      countries: [{ list: "eu-members" }],
      // TODO(list): covers every code except the exclusions below (legacy scope). The heading's U.S. note subdivision (see description) defines its own list; use that instead. PROGRESS.md L9.
      codes: "all",
      excludeCodes: [
        { list: "automobileParts33G" },
        { list: "ch72Headings" },
        { list: "ch73Headings" },
        { list: "ch76Headings" },
        { list: "partsOfMHDVs38i" },
      ],
    },
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.45")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.54",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of Japan for United States Production or Repair (Base Duty 15% or More)",
    description:
      "Automobile parts the product of Japan with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent, as provided for in subdivision (r) of U.S. note 33 to this subchapter.",
    scope: {
      countries: ["JP"],
      // TODO(list): covers every code except the exclusions below (legacy scope). The heading's U.S. note subdivision (see description) defines its own list; use that instead. PROGRESS.md L9.
      codes: "all",
      excludeCodes: [
        { list: "automobileParts33G" },
        { list: "ch72Headings" },
        { list: "ch73Headings" },
        { list: "ch76Headings" },
        { list: "partsOfMHDVs38i" },
      ],
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.54")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.55",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of Japan for United States Production or Repair (15% Including Base Duty)",
    description:
      "Automobile parts the product of Japan with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent, as provided for in subdivision (r) of U.S. note 33 to this subchapter.",
    scope: {
      countries: ["JP"],
      // TODO(list): covers every code except the exclusions below (legacy scope). The heading's U.S. note subdivision (see description) defines its own list; use that instead. PROGRESS.md L9.
      codes: "all",
      excludeCodes: [
        { list: "automobileParts33G" },
        { list: "ch72Headings" },
        { list: "ch73Headings" },
        { list: "ch76Headings" },
        { list: "partsOfMHDVs38i" },
      ],
    },
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.55")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.64",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of South Korea for United States Production or Repair (Base Duty 15% or More)",
    description:
      "Parts of passenger vehicles and light trucks that are products of South Korea as specified in subdivisions (r) and (t) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent",
    scope: {
      countries: ["KR"],
      // TODO(list): covers every code except the exclusions below (legacy scope). The heading's U.S. note subdivision (see description) defines its own list; use that instead. PROGRESS.md L9.
      codes: "all",
      excludeCodes: [
        { list: "automobileParts33G" },
        { list: "ch72Headings" },
        { list: "ch73Headings" },
        { list: "ch76Headings" },
        { list: "partsOfMHDVs38i" },
      ],
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.64")],
    rate: { kind: "free" },
    // Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A: "on or after 12:01 a.m. eastern time on November 1, 2025" (automobiles and parts). Retroactive
    effective: { from: "2025-11-01" },
    source: { revision: "2026HTSRev5", note: "Starts with goods entered on or after 12:01 a.m. ET Nov 1, 2025 (Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A; retroactive, published Dec 4, 2025), backfilled from 2025HTSRev32's change record" },
  },
  {
    code: "9903.94.65",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of South Korea for United States Production or Repair (15% Including Base Duty)",
    description:
      "Parts of passenger vehicles and light trucks that are products of South Korea as specified in subdivisions (r) and (t) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special less than 15 percent",
    scope: {
      countries: ["KR"],
      // TODO(list): covers every code except the exclusions below (legacy scope). The heading's U.S. note subdivision (see description) defines its own list; use that instead. PROGRESS.md L9.
      codes: "all",
      excludeCodes: [
        { list: "automobileParts33G" },
        { list: "ch72Headings" },
        { list: "ch73Headings" },
        { list: "ch76Headings" },
        { list: "partsOfMHDVs38i" },
      ],
    },
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.65")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    // Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A: "on or after 12:01 a.m. eastern time on November 1, 2025" (automobiles and parts). Retroactive
    effective: { from: "2025-11-01" },
    source: { revision: "2026HTSRev5", note: "Starts with goods entered on or after 12:01 a.m. ET Nov 1, 2025 (Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A; retroactive, published Dec 4, 2025), backfilled from 2025HTSRev32's change record" },
  },
  {
    code: "9903.94.32",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of the United Kingdom",
    description:
      "Effective with respect to entries on or after June 30, 2025, parts of passenger vehicles and light trucks of the United Kingdom, classified in the subheadings enumerated in subdivision (j) of U.S. note 33 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: [{ list: "autoPartsOfUK33J" }],
    },
    requires: [confirm("9903.94.32")],
    rate: { kind: "adValorem", pct: 10 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: { from: "2025-06-30" },
    source: {
      revision: "2026HTSRev9",
      citation: "90 FR 27851",
      note: "Description from 2026HTSRev9 (effective date filled in); rate unchanged",
    },
  },
  {
    code: "9903.94.40",
    program: "232-autos",
    name: "Section 232 Autos: Vehicles of Japan (Base Duty 15% or More)",
    description:
      "Passenger vehicles and light trucks that are products of Japan as provided for in subdivision (k) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent as provided for in subdivision (m) of U.S. note 33 to this subchapter",
    scope: {
      countries: ["JP"],
      codes: [{ list: "automobiles33B" }],
    },
    exceptions: ["9903.94.02", "9903.94.04"],
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.40")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.41",
    program: "232-autos",
    name: "Section 232 Autos: Vehicles of Japan (15% Including Base Duty)",
    description:
      "Passenger vehicles and light trucks that are products of Japan provided for in subdivision (k) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent as provided for in subdivision (m) of U.S. note 33 to this subchapter.",
    scope: {
      countries: ["JP"],
      codes: [{ list: "automobiles33B" }],
    },
    exceptions: ["9903.94.02", "9903.94.04"],
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.41")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.42",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of Japan (Base Duty 15% or More)",
    description:
      "Parts of passenger vehicles and light trucks that are products of Japan as provided for subdivision (l) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent as provided for in subdivision (m) of U.S. note 33 to this subchapter.",
    scope: {
      countries: ["JP"],
      codes: [{ list: "automobileParts33G" }],
    },
    exceptions: ["9903.94.06"],
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.42")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.43",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of Japan (15% Including Base Duty)",
    description:
      "Parts of passenger vehicles and light trucks that are products of Japan as provided for subdivision (l) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent as provided for in subdivision (m) of U.S. note 33 to this subchapter.",
    scope: {
      countries: ["JP"],
      codes: [{ list: "automobileParts33G" }],
    },
    exceptions: ["9903.94.06"],
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.43")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.50",
    program: "232-autos",
    name: "Section 232 Autos: Vehicles of the European Union (Base Duty 15% or More)",
    description:
      "Passenger vehicles and light trucks that are products of the European Union as specified in subdivision (n) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1 equal to or greater than 15 percent.",
    scope: {
      countries: [{ list: "eu-members" }],
      codes: [{ list: "automobiles33B" }],
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.50")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.51",
    program: "232-autos",
    name: "Section 232 Autos: Vehicles of the European Union (15% Including Base Duty)",
    description:
      "Passenger vehicles and light trucks that are products of the European Union as specified in subdivision (n) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1 less than 15 percent",
    scope: {
      countries: [{ list: "eu-members" }],
      codes: [{ list: "automobiles33B" }],
    },
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.51")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.52",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of the European Union (Base Duty 15% or More)",
    description:
      "Parts of passenger vehicles and light trucks that are products of the European Union as specified in subdivision (o) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1 equal to or greater than 15 percent.",
    scope: {
      countries: [{ list: "eu-members" }],
      codes: [{ list: "automobileParts33G" }],
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.52")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.53",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of the European Union (15% Including Base Duty)",
    description:
      "Parts of passenger vehicles and light trucks that are products of the European Union as specified in subdivision (o) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column1 less than 15 percent.",
    scope: {
      countries: [{ list: "eu-members" }],
      codes: [{ list: "automobileParts33G" }],
    },
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.53")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.60",
    program: "232-autos",
    name: "Section 232 Autos: Vehicles of South Korea (Base Duty 15% or More)",
    description:
      "Passenger vehicles and light trucks that are products of South Korea as specified in subdivision (s) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent",
    scope: {
      countries: ["KR"],
      codes: [{ list: "automobiles33B" }],
    },
    exceptions: ["9903.94.02", "9903.94.04"],
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.60")],
    rate: { kind: "free" },
    // Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A: "on or after 12:01 a.m. eastern time on November 1, 2025" (automobiles and parts). Retroactive
    effective: { from: "2025-11-01" },
    source: { revision: "2026HTSRev5", note: "Starts with goods entered on or after 12:01 a.m. ET Nov 1, 2025 (Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A; retroactive, published Dec 4, 2025), backfilled from 2025HTSRev32's change record" },
  },
  {
    code: "9903.94.61",
    program: "232-autos",
    name: "Section 232 Autos: Vehicles of South Korea (15% Including Base Duty)",
    description:
      "Passenger vehicles and light trucks that are products of South Korea as specified in subdivision (s) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special less than 15 percent",
    scope: {
      countries: ["KR"],
      codes: [{ list: "automobiles33B" }],
    },
    exceptions: ["9903.94.02", "9903.94.04"],
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.61")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    // Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A: "on or after 12:01 a.m. eastern time on November 1, 2025" (automobiles and parts). Retroactive
    effective: { from: "2025-11-01" },
    source: { revision: "2026HTSRev5", note: "Starts with goods entered on or after 12:01 a.m. ET Nov 1, 2025 (Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A; retroactive, published Dec 4, 2025), backfilled from 2025HTSRev32's change record" },
  },
  {
    code: "9903.94.62",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of South Korea (Base Duty 15% or More)",
    description:
      "Parts of passenger vehicles and light trucks that are products of South Korea as specified in subdivisions (g) and (t) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent",
    scope: {
      countries: ["KR"],
      codes: [{ list: "automobileParts33G" }],
    },
    exceptions: ["9903.94.06"],
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.62")],
    rate: { kind: "free" },
    // Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A: "on or after 12:01 a.m. eastern time on November 1, 2025" (automobiles and parts). Retroactive
    effective: { from: "2025-11-01" },
    source: { revision: "2026HTSRev5", note: "Starts with goods entered on or after 12:01 a.m. ET Nov 1, 2025 (Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A; retroactive, published Dec 4, 2025), backfilled from 2025HTSRev32's change record" },
  },
  {
    code: "9903.94.63",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of South Korea (15% Including Base Duty)",
    description:
      "Parts of passenger vehicles and light trucks that are products of South Korea as specified in subdivisions (g) and (t) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special less than 15 percent",
    scope: {
      countries: ["KR"],
      codes: [{ list: "automobileParts33G" }],
    },
    exceptions: ["9903.94.06"],
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.63")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    // Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A: "on or after 12:01 a.m. eastern time on November 1, 2025" (automobiles and parts). Retroactive
    effective: { from: "2025-11-01" },
    source: { revision: "2026HTSRev5", note: "Starts with goods entered on or after 12:01 a.m. ET Nov 1, 2025 (Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A; retroactive, published Dec 4, 2025), backfilled from 2025HTSRev32's change record" },
  },
  {
    code: "9903.94.66",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of Taiwan (Base Duty 15% or More)",
    description:
      "Parts of passenger vehicles and light trucks that are products of Taiwan as provided for in subdivisions (g) and (u) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent",
    scope: {
      countries: ["TW"],
      codes: [{ list: "automobileParts33G" }],
    },
    exceptions: ["9903.94.06"],
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.66")],
    rate: { kind: "free" },
    effective: { from: "2026-05-01" },
    source: {
      revision: "2026HTSRev9",
      note: "U.S. note 33(u); Notice effective 2026-05-01",
    },
  },
  {
    code: "9903.94.67",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of Taiwan (15% Including Base Duty)",
    description:
      "Parts of passenger vehicles and light trucks that are products of Taiwan as provided for in subdivisions (g) and (u) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special less than 15 percent",
    scope: {
      countries: ["TW"],
      codes: [{ list: "automobileParts33G" }],
    },
    exceptions: ["9903.94.06"],
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.67")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: { from: "2026-05-01" },
    source: {
      revision: "2026HTSRev9",
      note: "U.S. note 33(u); Notice effective 2026-05-01",
    },
  },
  {
    code: "9903.94.68",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of Taiwan for United States Production or Repair (Base Duty 15% or More)",
    description:
      "Parts of passenger vehicles and light trucks that are products of Taiwan as specified in subdivisions (r) and (u) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent",
    scope: {
      countries: ["TW"],
      codes: "all",
      excludeCodes: [
        { list: "automobileParts33G" },
        { list: "ch72Headings" },
        { list: "ch73Headings" },
        { list: "ch76Headings" },
        { list: "partsOfMHDVs38i" },
      ],
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.68")],
    rate: { kind: "free" },
    effective: { from: "2026-05-01" },
    source: {
      revision: "2026HTSRev9",
      note: "U.S. note 33(u); Notice effective 2026-05-01",
    },
  },
  {
    code: "9903.94.69",
    program: "232-autos",
    name: "Section 232 Auto Parts: Parts of Taiwan for United States Production or Repair (15% Including Base Duty)",
    description:
      "Parts of passenger vehicles and light trucks that are products of Taiwan as provided for in subdivisions (r) and (u) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special less than 15 percent",
    scope: {
      countries: ["TW"],
      codes: "all",
      excludeCodes: [
        { list: "automobileParts33G" },
        { list: "ch72Headings" },
        { list: "ch73Headings" },
        { list: "ch76Headings" },
        { list: "partsOfMHDVs38i" },
      ],
    },
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.94.69")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: { from: "2026-05-01" },
    source: {
      revision: "2026HTSRev9",
      note: "U.S. note 33(u); Notice effective 2026-05-01",
    },
  },
]

// 2025HTSRev31 text of headings the U.S.-Korea deal changed on Nov 1, 2025: they didn't yet name the
// Korea vehicle and parts headings 9903.94.60–.65. Commerce/USTR notice (90 FR 55964), Annex Part A,
// "on or after 12:01 a.m. eastern time on November 1, 2025" (retroactive). Text only: the exceptions
// name headings that don't apply before then. Backfilled from 2025HTSRev32's change record
const KOREA_AUTOS_FROM = "2025-11-01"
const REV31_DESCRIPTIONS: Record<string, string> = {
  "9903.94.01":
    "Except for products described in headings 9903.94.02, 9903.94.03, 9903.94.04, 9903.94.31, 9903.94.40, 9903.94.41, 9903.94.50, and 9903.94.51, passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks, as specified in note 33 to this subchapter, as provided for in subdivision (b) of U.S. note 33 to this subchapter",
  "9903.94.05":
    "Except for products described in headings 9903.94.06, 9903.94.32, 9903.94.33, 9903.94.42, 9903.94.43, 9903.94.44, 9903.94.45, 9903.94.52, 9903.94.53, 9903.94.54, 9903.94.55, automobile parts, as provided for in subdivision (g) of U.S. note 33 to this subchapter",
  "9903.94.07":
    "Except as provided for in headings 9903.94.33, 9903.94.44, 9903.94.45, 9903.94.54 and 9903.94.55, automobile parts as provided for in subdivision (p) of U.S. note 33 to this subchapter",
}

export const headings: Tariff[] = allHeadings.flatMap((t) => {
  const before = REV31_DESCRIPTIONS[t.code]
  if (!before || (t.effective.from && t.effective.from > KOREA_AUTOS_FROM)) return [t]
  return [
    {
      ...t,
      description: before,
      effective: { ...t.effective, to: KOREA_AUTOS_FROM },
      source: {
        revision: "2025HTSRev31",
        citation: "Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part A",
        url: "https://www.govinfo.gov/content/pkg/FR-2025-12-04/html/2025-21940.htm",
        publishedOn: "2025-12-04",
        note: "The 2025HTSRev31 text, before the Korea vehicle and parts headings 9903.94.60–.65 (Nov 1, 2025, retroactive). Backfilled from 2025HTSRev32's change record",
      },
    },
    { ...t, effective: { ...t.effective, from: KOREA_AUTOS_FROM } },
  ]
})
