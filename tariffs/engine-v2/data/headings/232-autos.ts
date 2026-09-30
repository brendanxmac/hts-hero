// Migrated from the legacy tariff data (2026HTSRev5) by scripts/engine-v2/migrate-legacy.ts,
// then reviewed by hand. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"

export const headings: Tariff[] = [
  {
    code: "9903.94.01",
    program: "232-autos",
    name: "Section 232 Automobiles",
    description:
      "Except for products described in headings 9903.94.02, 9903.94.03, 9903.94.04, 9903.94.31, 9903.94.40, 9903.94.41, 9903.94.50, and 9903.94.51, passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks, as specified in note 33 to this subchapter, as provided for in subdivision (b) of U.S. note 33 to this subchapter",
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
    name: "The U.S Content of Articles of Ch.99, III, 33(b) OR non passenger vehicles / light trucks of those headings",
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
    name: "Tariff On Only The Non-US Content of Passenger Vehicles / Light Trucks If Approved by Secretary of Commerce",
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
    name: "Manufactured at least 25 Years Prior to Date of Entry",
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
    name: "Passenger Vehicles from the United Kingdom",
    description:
      "Effective with respect to entries on or after [ ], passenger vehicles that are products of the United Kingdom as specified in subdivision (i) of U.S. note 33 to this subchapter, when entered under the terms of subdivision (i) of U.S. note 33 to this subchapter. [Compilers note: This heading is effective on or after June 30, 2025. For more information, see 90 Fed. Reg. 27851.]",
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
    source: { revision: "2026HTSRev5", citation: "90 FR 27851" },
  },
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
  {
    code: "9903.94.06",
    program: "232-autos",
    name: "Is not an auto part for passenger vehicles or light trucks, or is an auto part that is USCMA Eligible other than knock-down kits or parts compilations",
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
  {
    code: "9903.94.07",
    program: "232-autos",
    name: "Parts for Production or Repair of Automobiles in the US",
    description:
      "Except as provided for in headings 9903.94.33, 9903.94.44, 9903.94.45, 9903.94.54, 9903.94.55, 9903.94.64, and 9903.94.65, automobile parts as provided for in subdivision (p) of U.S. note 33 to this subchapter.",
    scope: {
      countries: "all",
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
  {
    code: "9903.94.33",
    program: "232-autos",
    name: "Automobile parts of the United Kingdom that will be used in Automobiles of the United Kingdom",
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
    name: "Automobile parts of the European Union with Column 1 Duty >=15%",
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
    name: "Automobile parts of the European Union with Column 1 Duty <15% (Replaces General Duty)",
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
    name: "Automobile parts of the Japan from 33(r), with Column 1 Duty >=15%",
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
    name: "Automobile parts of Japan from 33(r), with Column 1 Duty <15% (Replaces General Duty)",
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
    name: "Parts of Vehicles & Light Trucks of South Korea from 33(r) & 33(t), with Column 1 Duty >=15%",
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
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.65",
    program: "232-autos",
    name: "Parts of Vehicles & Light Trucks of South Korea from 33(r) & 33(t), with Column 1 Duty <15% (Replaces General Duty)",
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
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.32",
    program: "232-autos",
    name: "Parts of Vehicles & Light Trucks of the United Kingdom",
    description:
      "Effective with respect to entries on or after [ ], parts of passenger vehicles and light trucks of the United Kingdom, classified in the subheadings enumerated in subdivision (j) of U.S. note 33 to this subchapter. [Compilers note: This heading is effective on or after June 30, 2025. For more information, see 90 Fed. Reg. 27851.]",
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
    source: { revision: "2026HTSRev5", citation: "90 FR 27851" },
  },
  {
    code: "9903.94.40",
    program: "232-autos",
    name: "Vehicles & Light Trucks of Japan, Duty >=15%",
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
    name: "Vehicles & Light Trucks of Japan, Duty <15% (Replaces General Duty)",
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
    name: "Parts of Vehicles & Light Trucks of Japan, Duty >=15%",
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
    name: "Parts of Vehicles & Light Trucks of Japan, Duty <15% (Replaces General Duty)",
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
    name: "Vehicles & Light Trucks of the European Union, Duty >=15%",
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
    name: "Vehicles & Light Trucks of the European Union, Duty <15% (Replaces General Duty)",
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
    name: "Parts of Vehicles & Light Trucks of the European Union, Duty >=15%",
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
    name: "Parts of Vehicles & Light Trucks of the European Union, Duty <15% (Replaces General Duty)",
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
    name: "Vehicles & Light Trucks of South Korea, Duty >=15%",
    description:
      "Passenger vehicles and light trucks that are products of South Korea as specified in subdivision (s) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent",
    scope: {
      countries: ["KR"],
      codes: [{ list: "automobiles33B" }],
    },
    exceptions: ["9903.94.02", "9903.94.04"],
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.60")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.61",
    program: "232-autos",
    name: "Vehicles & Light Trucks of South Korea, Duty <15% (Replaces General Duty)",
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
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.62",
    program: "232-autos",
    name: "Parts of Vehicles & Light Trucks of South Korea (33(g) & 33(t)), Duty >=15%",
    description:
      "Parts of passenger vehicles and light trucks that are products of South Korea as specified in subdivisions (g) and (t) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent",
    scope: {
      countries: ["KR"],
      codes: [{ list: "automobileParts33G" }],
    },
    exceptions: ["9903.94.06"],
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.94.62")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.94.63",
    program: "232-autos",
    name: "Parts of Vehicles & Light Trucks of South Korea (33(g) & 33(t)), Duty <15% (Replaces General Duty)",
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
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
]
