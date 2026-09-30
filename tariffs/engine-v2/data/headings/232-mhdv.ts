// Migrated from the legacy tariff data (2026HTSRev5) by scripts/engine-v2/migrate-legacy.ts,
// then reviewed by hand. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"

export const headings: Tariff[] = [
  {
    code: "9903.74.01",
    program: "232-mhdv",
    name: "Medium & Heavy Duty Vehicles",
    description:
      "Medium- and heavy-duty vehicles as provided for in subdivision (b) of U.S. note 38 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "mediumAndHeavyDutyVehicles" }],
    },
    exceptions: ["9903.74.03", "9903.74.05", "9903.74.06", "9903.74.07"],
    rate: { kind: "adValorem", pct: 25 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.74.02",
    program: "232-mhdv",
    name: "Buses & Similar Vehicles",
    description:
      "Buses and other vehicles classified in HTSUS heading 8702 as provided for in subdivision (c) of U.S. note 38 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "busesAndSimilarVehicles" }],
    },
    exceptions: [
      "9903.74.03",
      "9903.74.05",
      "9903.74.06",
      "9903.74.07",
      "9903.74.09",
    ],
    rate: { kind: "adValorem", pct: 10 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.74.03",
    program: "232-mhdv",
    name: "US Content Exemption: Pay 25% on ONLY the Non-US Content of Heavy Duty Vehicles that are USMCA Eligible & Approved by Secretary of Commerce",
    description:
      "Medium- and heavy-duty vehicles, as provided for in subdivision (d) of U.S. note 38 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "mediumAndHeavyDutyVehicles" }],
    },
    requires: [confirm("9903.74.03")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.74.05",
    program: "232-mhdv",
    name: "Article is NOT a Medium or Heavy Duty Vehicle",
    description:
      "Articles as provided for in subdivision (e) of U.S. note 38 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "mediumAndHeavyDutyVehicles" }],
    },
    requires: [confirm("9903.74.05")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.74.06",
    program: "232-mhdv",
    name: "The US Content of an Article that Qualifies for 9903.74.03",
    description:
      "Articles as provided for in subdivision (f) of U.S. note 38 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "mediumAndHeavyDutyVehicles" }],
    },
    requires: [confirm("9903.74.06")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.74.07",
    program: "232-mhdv",
    name: "Heavy Duty Vehicles, Buses, and Similar Vehicles that were Manufactured Over 25 Years Prior to Enrty",
    description:
      "Medium- and heavy-duty vehicles, as provided for in subdivision (g) of U.S. note 38 to this subchapter.",
    scope: {
      countries: "all",
      codes: [
        { list: "busesAndSimilarVehicles" },
        { list: "mediumAndHeavyDutyVehicles" },
      ],
    },
    requires: [confirm("9903.74.07")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.74.08",
    program: "232-mhdv",
    name: "Parts of Medium or Heavy Duty Vehicles",
    description:
      "Medium- and heavy-duty vehicle parts, as provided for in subdivision (i) of U.S. note 38 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "partsOfMHDVs38i" }],
    },
    exceptions: ["9903.74.10", "9903.74.11"],
    requires: [confirm("9903.74.08")],
    rate: { kind: "adValorem", pct: 25 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.74.09",
    program: "232-mhdv",
    name: "Parts for Production or Repair of Medium & Heavy Duty Vehicles in the US",
    description:
      "Medium- and heavy-duty vehicle parts, as provided for in subdivision (j) of U.S. note 38 to this subchapter.",
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
    exceptions: ["9903.74.10", "9903.74.11"],
    requires: [confirm("9903.74.09")],
    rate: { kind: "adValorem", pct: 25 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.74.10",
    program: "232-mhdv",
    name: "USCMA Qualified Medium & Heavy Duty Vehicle Parts that are NOT knock-down kits or parts compilations, whether or not being imported by an importer who produces or repairs MHDV's",
    description:
      "Articles as provided for in subdivision (k) of U.S. note 38 to this subchapter",
    scope: {
      countries: ["MX", "CA"],
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
    requires: [confirm("9903.74.10")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.74.11",
    program: "232-mhdv",
    name: "Is not a part for medium of heavy duty vehicles",
    description:
      "Articles as provided for in subdivision (l) of U.S. note 38 to this subchapter.",
    scope: {
      countries: "all",
      codes: [{ list: "partsOfMHDVs38i" }],
    },
    requires: [confirm("9903.74.11")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
]
