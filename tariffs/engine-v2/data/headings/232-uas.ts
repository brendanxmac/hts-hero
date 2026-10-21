// Section 232 – Unmanned Aircraft Systems: U.S. note 43 to subchapter III and headings
// 9903.08.20–.26, from 2026HTSRev18 (Proclamation 11055, effective 2026-09-03). See
// HowTariffsWork.md §6.
//
// 43(a): "Except for heading 9903.08.20, headings 9903.08.21–9903.08.26 … are mutually exclusive".
// 43(b): collected on top of any special rate, so preference claims don't remove them. Each
// heading's `exceptions` lists the headings that win over it, first wins:
//   .20 not for use with unmanned aircraft (the default for the general-purpose codes, decision)
//   .25 onshoring plan (DHS / Department of War), .26 onshoring plan (Commerce)
//   .23 UK, .24 JP/LI/KR/CH/TW/EU, when the critical components test (43(d)) is confirmed
//   .22 drones without thermal imaging (the default for the (c)(3)/(4) codes, decision)
//   .21 everything else in (c)(1)–(3)
// The free headings win over the others; the note doesn't order onshoring against .23/.24.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"

const PROGRAM = "232-uas"
const FROM = "2026-09-03"
const SOURCE = { revision: "2026HTSRev18", citation: "Proclamation 11055" }
// Column 2: "No change"
const COLUMN2_FREE = { column2: { kind: "free" } }
const OVER_COUNTRY = ["9903.08.20", "9903.08.25", "9903.08.26"]
const OVER_GENERAL = [...OVER_COUNTRY, "9903.08.23", "9903.08.24"]
const ALLIED_COMPONENTS =
  "43(d): only if substantially all the critical components and technology are the product of the United States, Japan, the Republic of Korea, Taiwan, Switzerland, Liechtenstein, a member nation of the European Union or the United Kingdom"

export const headings: Tariff[] = [
  {
    code: "9903.08.20",
    program: PROGRAM,
    name: "Section 232 Drones Exemption: Not for Use With Drones",
    description:
      "Articles provided for in the enumerated provisions of subdivision (c) of U.S. note 43 to this subchapter that are not for use in or with the products described therein",
    // The general-purpose codes in (c)(1)–(2) (docking station parts, aircraft parts) aren't UAS
    // goods unless the importer says they are (`uasForUse`)
    scope: {
      countries: "all",
      codes: [{ list: "uas43cGeneralPurpose" }],
    },
    requires: [{ kind: "answer", input: "uasForUse", equals: false, assume: true }],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 43(a), (c)" },
  },
  {
    code: "9903.08.21",
    program: PROGRAM,
    name: "Section 232 Drones: Drones, Parts and Components",
    description:
      "Except as provided in headings 9903.08.23–9903.08.26, unmanned aircraft, their parts and components, as provided for in subdivisions (c)(1)–(3) of U.S. note 43 to this subchapter",
    scope: {
      countries: "all",
      codes: [{ list: "uas43c" }],
    },
    // .22 takes the (c)(3)/(4) drones without thermal imaging; .20 the general-purpose codes not
    // for unmanned aircraft
    exceptions: [...OVER_GENERAL, "9903.08.22"],
    rate: { kind: "adValorem", pct: 100 },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 43(c)(1)–(3)" },
  },
  {
    code: "9903.08.22",
    program: PROGRAM,
    name: "Section 232 Drones: Drones Without Thermal Imaging",
    description:
      "Except as provided in headings 9903.08.23–9903.08.26, unmanned aircraft, as provided for in subdivision (c)(4) of U.S. note 43 to this subchapter",
    scope: {
      countries: "all",
      codes: [{ list: "uas43c34" }],
    },
    // Unless the importer says it has thermal imaging, (c)(3) and 9903.08.21
    requires: [{ kind: "answer", input: "uasThermalImaging", equals: false, assume: true }],
    exceptions: OVER_GENERAL,
    rate: { kind: "adValorem", pct: 25 },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 43(c)(4)" },
  },
  {
    code: "9903.08.23",
    program: PROGRAM,
    name: "Section 232 Drones: Drones of the United Kingdom (Critical Components From the United States or Allies)",
    description:
      "Unmanned aircraft, their parts and components that are the product of the United Kingdom, as provided for in subdivisions (d) of U.S. note 43 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: [{ list: "uas43c" }],
    },
    // 43(d)
    requires: [confirm("9903.08.23")],
    exceptions: OVER_COUNTRY,
    rate: { kind: "adValorem", pct: 10 },
    rateByColumn: COLUMN2_FREE,
    effective: { from: FROM },
    source: { ...SOURCE, note: ALLIED_COMPONENTS },
  },
  {
    code: "9903.08.24",
    program: PROGRAM,
    name: "Section 232 Drones: Drones of Japan, South Korea, Taiwan, Switzerland, Liechtenstein or the European Union (15% Including Base Duty)",
    description:
      "Unmanned aircraft, their parts and components that are the product of Japan, Liechtenstein, South Korea, Switzerland, Taiwan or a member nation of the European Union, as provided for in subdivisions (d) of U.S. note 43 to this subchapter",
    scope: {
      countries: ["JP", "LI", "KR", "CH", "TW", { list: "eu-members" }],
      codes: [{ list: "uas43c" }],
    },
    // 43(d); "the sum of the column 1 rate of duty and the additional ad valorem rate of duty …
    // will total 15 percent ad valorem"
    requires: [confirm("9903.08.24")],
    exceptions: OVER_COUNTRY,
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: COLUMN2_FREE,
    effective: { from: FROM },
    source: { ...SOURCE, note: ALLIED_COMPONENTS },
  },
  {
    code: "9903.08.25",
    program: PROGRAM,
    name: "Section 232 Drones Exemption: Onshoring Plan Approved by Homeland Security or the Department of War",
    description:
      "Unmanned aircraft, their parts and components, as provided for in subdivision (c) of U.S. note 43, imported for companies subject to an onshoring plan approved by the Department of Homeland Security or the Department of War",
    scope: {
      countries: "all",
      codes: [{ list: "uas43c" }],
    },
    requires: [confirm("9903.08.25")],
    exceptions: ["9903.08.20"],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: SOURCE,
  },
  {
    code: "9903.08.26",
    program: PROGRAM,
    name: "Section 232 Drones Exemption: Onshoring Plan Approved by Commerce",
    description:
      "Unmanned aircraft, their parts and components, as provided for in subdivision (c) of U.S. note 43, imported subject to an onshoring plan approved by the Secretary of Commerce in accordance with a process to be established in a Federal Register notice",
    scope: {
      countries: "all",
      codes: [{ list: "uas43c" }],
    },
    requires: [confirm("9903.08.26")],
    exceptions: ["9903.08.20", "9903.08.25"],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: SOURCE,
  },
]
