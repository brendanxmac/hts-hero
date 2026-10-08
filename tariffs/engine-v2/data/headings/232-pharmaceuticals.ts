// Section 232 – Pharmaceuticals: U.S. note 40 to subchapter III and headings 9903.04.60–.69,
// from 2026HTSRev14 (Proclamation 11020, effective 2026-07-31). See HowTariffsWork.md §6.
//
// Note 40(a): the headings "are mutually exclusive, such that an imported article will be subject
// to no more than one of these headings. Pharmaceutical articles … are subject to heading
// 9903.04.60 unless another of these headings applies." Each heading's `exceptions` lists the
// headings that win over it, in this order (first wins):
//   1. .69 not a pharmaceutical article, .67 generic, .68 U.S. API in dosage form (not patented)
//   2. .61 companies identified by the Secretary, before September 29, 2026
//   3. .66 specialty products, .65 onshoring plan with a Most-Favored-Nation pricing agreement
//   4. .64 onshoring plan, when confirmed
//   5. .62 Japan, EU, South Korea, Switzerland, Liechtenstein; .63 United Kingdom
//   6. .60 everything else in 40(c)
// The note doesn't order .64 against .62/.63 (they apply to articles "that would otherwise be
// subject to … 9903.04.60"). Decision (Oct 2, 2026): the country heading applies by default, and a
// confirmed onshoring plan takes precedence. The free headings (.61, .65–.69) give the same duty
// whichever wins; the order only decides which line shows.
//
// 40(b): the duties apply in addition to any special rate, so preference claims don't remove them.
import { Tariff } from "../../types";
import { confirm } from "../confirmations";
import { tariffVersions } from "../../versioning";

const PROGRAM = "232-pharmaceuticals";
const FROM = "2026-07-31";
const SOURCE = { revision: "2026HTSRev14", citation: "Proclamation 11020" };
const SCOPE_CODES = [{ list: "pharmaceuticals40c" }];
// Column 2: "The duty provided in the applicable subheading" (no additional duty)
const COLUMN2_FREE = { column2: { kind: "free" } };

// Headings that win over each level (see the order above)
const NOT_PATENTED = ["9903.04.69", "9903.04.67", "9903.04.68"];
const OVER_ONSHORING = [
  ...NOT_PATENTED,
  "9903.04.61",
  "9903.04.66",
  "9903.04.65",
];
const OVER_COUNTRY = [...OVER_ONSHORING, "9903.04.64"];

const base: Tariff[] = [
  {
    code: "9903.04.60",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: Patented Pharmaceuticals",
    description:
      "Except as provided in heading 9903.04.61, patented pharmaceutical articles as provided for in subdivisions (c) and (d) of U.S. note 40 to this subchapter",
    scope: {
      countries: "all",
      codes: SCOPE_CODES,
    },
    exceptions: [...OVER_COUNTRY, "9903.04.62", "9903.04.63"],
    // 40(d): "the sum of the column 1 duty rate and the additional ad valorem rate of duty shall be
    // the rate of duty provided by heading 9903.04.60" (100%)
    rate: { kind: "topUpTo", pct: 100 },
    rateByColumn: COLUMN2_FREE,
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 40(a), (c), (d)" },
  },
  {
    code: "9903.04.61",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: Companies Identified by Commerce",
    description:
      "Patented pharmaceutical articles entered before 12:01 a.m. eastern time on September 29, 2026 as provided for in subdivisions (c) and (e) of U.S. note 40 to this subchapter",
    scope: {
      countries: "all",
      codes: SCOPE_CODES,
    },
    exceptions: NOT_PATENTED,
    requires: [confirm("9903.04.61")],
    rate: { kind: "free" },
    effective: { from: FROM, to: "2026-09-29" },
    source: { ...SOURCE, note: "U.S. note 40(e)" },
  },
  {
    code: "9903.04.62",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: EU, Japan, South Korea, Switzerland, Liechtenstein (15% Including Base Duty)",
    description:
      "Patented pharmaceutical articles that are the product of Japan, of a European Union member country, of South Korea, of Switzerland, or of Liechtenstein as provided for in subdivisions (c) and (f) of U.S. note 40 to this subchapter",
    scope: {
      countries: ["JP", { list: "eu-members" }, "KR", "CH", "LI"],
      codes: SCOPE_CODES,
    },
    exceptions: OVER_COUNTRY,
    // 40(f): the column 1 rate plus the additional duty totals 15%
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: COLUMN2_FREE,
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 40(f)" },
  },
  {
    code: "9903.04.63",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: United Kingdom",
    description:
      "Patented pharmaceutical articles that are the product of the United Kingdom as defined in subdivisions (c) and (g) of U.S. note 40 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: SCOPE_CODES,
    },
    exceptions: OVER_COUNTRY,
    // "The duty provided in the applicable subheading +0%" (2026HTSRev15, Notice effective
    // 2026-07-31, the heading's start, so edited in place; it was "+ 10%" in 2026HTSRev14). Still
    // filed as a $0 line, and a confirmed onshoring plan (.64) still takes precedence, by decision.
    rate: { kind: "free" },
    effective: { from: FROM },
    source: {
      revision: "2026HTSRev14",
      citation: "Proclamation 11020",
      note: "U.S. note 40(g); rate changed to +0% from 2026-07-31 in 2026HTSRev15 (Notice)",
    },
  },
  {
    code: "9903.04.64",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: Qualifying Onshoring Plan",
    description:
      "Patented pharmaceutical articles subject to a qualifying onshoring plan, as provided for in subdivisions (c) and (h)(i) of U.S. note 40 to this subchapter",
    scope: {
      countries: "all",
      codes: SCOPE_CODES,
    },
    exceptions: OVER_ONSHORING,
    requires: [confirm("9903.04.64")],
    rate: { kind: "adValorem", pct: 20 },
    rateByColumn: COLUMN2_FREE,
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 40(h)(i)" },
  },
  {
    code: "9903.04.65",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: Onshoring Plan and MFN Pricing Agreement",
    description:
      "Pharmaceutical articles subject to a qualifying onshoring plan and a Most-Favored-Nation pharmaceutical pricing agreement, as provided for in subdivisions (c) and (h)(ii) of U.S. note 40 to this subchapter",
    scope: {
      countries: "all",
      codes: SCOPE_CODES,
    },
    exceptions: [...NOT_PATENTED, "9903.04.61", "9903.04.66"],
    requires: [confirm("9903.04.65")],
    // "The duty provided in the applicable subheading + 0%"
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 40(h)(ii)" },
  },
  {
    code: "9903.04.66",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: Specialty Products",
    description:
      "Drugs and pharmaceutical articles for the specific uses provided in subdivisions (c) and (h)(iii) of U.S. note 40 to this subchapter",
    scope: {
      countries: "all",
      codes: SCOPE_CODES,
    },
    exceptions: [...NOT_PATENTED, "9903.04.61"],
    requires: [confirm("9903.04.66")],
    // "The duty provided in the applicable subheading + 0%"
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 40(h)(iii)" },
  },
  {
    code: "9903.04.67",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: Generic Pharmaceuticals",
    description:
      "Generic pharmaceutical articles, as provided for in subdivision (c) of U.S. note 40 to this subchapter",
    scope: {
      countries: "all",
      codes: SCOPE_CODES,
    },
    exceptions: ["9903.04.69"],
    requires: [confirm("9903.04.67")],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 40(c)(iii)" },
  },
  {
    code: "9903.04.68",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: U.S. Active Ingredient in Dosage Form",
    description:
      "Pharmaceutical products with an active pharmaceutical ingredient packaged in dosage form that is a product of the United States",
    scope: {
      countries: "all",
      codes: SCOPE_CODES,
    },
    exceptions: ["9903.04.69", "9903.04.67"],
    requires: [confirm("9903.04.68")],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: SOURCE,
  },
  {
    code: "9903.04.69",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: Not a Pharmaceutical Article",
    description:
      "Articles as provided for in subdivision (i) of U.S. note 40 to this subchapter",
    scope: {
      countries: "all",
      codes: SCOPE_CODES,
    },
    requires: [confirm("9903.04.69")],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 40(i)" },
  },
];

// 2026HTSRev20 (Notice effective 2026-09-29): 40(a) now reads "Headings 9903.04.60–9903.04.70 …
// are mutually exclusive". 9903.04.70, articles solely for clinical trials, research and
// development or other non-commercial use, is a "not a patented pharmaceutical" exemption, so it
// wins over the patented headings .60–.66 (after .69, .67 and .68; all are free).
// (9903.04.61 ends on 2026-09-29, the day .70 starts, so it never overlaps .70)
const PATENTED = [
  "9903.04.60",
  "9903.04.62",
  "9903.04.63",
  "9903.04.64",
  "9903.04.65",
  "9903.04.66",
];
const REV20 = { revision: "2026HTSRev20", citation: "Notice" };

export const headings: Tariff[] = [
  ...base.flatMap((tariff) =>
    PATENTED.includes(tariff.code)
      ? tariffVersions(tariff, [
          {
            from: "2026-09-29",
            set: { exceptions: [...(tariff.exceptions ?? []), "9903.04.70"] },
            source: {
              ...REV20,
              note: "U.S. note 40(a): 9903.04.70 added to the mutually exclusive headings",
            },
          },
        ])
      : [tariff],
  ),
  {
    code: "9903.04.70",
    program: PROGRAM,
    name: "Section 232 Pharmaceuticals: Clinical Trials, R&D and Non-Commercial Use",
    description:
      "Pharmaceutical articles and associated ingredients provided for in subdivision (c) of U.S. note 40 to this subchapter that are solely for use in clinical trials, research and development, or other non-commercial applications",
    scope: {
      countries: "all",
      codes: SCOPE_CODES,
    },
    exceptions: NOT_PATENTED,
    requires: [confirm("9903.04.70")],
    // "The duty provided in the applicable subheading + 0%"
    rate: { kind: "free" },
    effective: { from: "2026-09-29" },
    source: { ...REV20, note: "U.S. note 40(a), (c)" },
  },
];
