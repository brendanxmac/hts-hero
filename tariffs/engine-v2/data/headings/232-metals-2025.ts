// Section 232 steel, aluminum and copper headings as they stood in 2026HTSRev4, before
// Proclamation 11021 terminated them for entries on or after 12:01 a.m. EDT April 6, 2026
// (Annex IV A.11). Each ends on 2026-04-06; their 2025 start dates come with later backfill
// steps. Descriptions are the 2026HTSRev4 heading text. See HowTariffsWork.md §17.13 and
// tariffs/revision-diffs/2026HTSRev4/PLAN.md. The 2018–2025 quota and exemption headings
// (9903.80.xx, 9903.81.01–.86, most of 9903.85) only covered entries before March 12, 2025
// (compiler's notes to notes 16(a) and 19(a)), so they aren't here.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"

const REV4 = {
  revision: "2026HTSRev4",
  citation: "Proclamation 11021",
  url: "https://www.govinfo.gov/content/pkg/FR-2026-04-09/html/2026-06960.htm",
  publishedOn: "2026-04-02",
}
const END = { to: "2026-04-06" }

const backfilled = (note: string) => ({
  ...REV4,
  note: `${note}. Backfilled from 2026HTSRev5's change record; terminated for entries on or after 12:01 a.m. EDT April 6, 2026 (PP 11021, Annex IV A.11)`,
})

export const headings: Tariff[] = [
  {
    code: "9903.81.87",
    program: "232-metals",
    name: "Section 232 Steel (50%)",
    description:
      "Except for derivative iron or steel products described in headings 9903.81.89, 9903.81.90 or 9903.81.91, products of iron or steel provided for in the tariff headings or subheadings enumerated in subdivision (j) of note 16 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["GB"],
      codes: [{ list: "steel16j2025" }],
    },
    exceptions: ["9903.81.88", "9903.81.89", "9903.81.90", "9903.81.91"],
    basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled(
      "U.S. note 16(i)-(j). Chapter 73 goods pay on the steel content (16(i)). .88 is its FTZ twin (same rate)",
    ),
  },
  {
    code: "9903.81.88",
    program: "232-metals",
    name: "Section 232 Steel (50%), FTZ Privileged Foreign Status Before June 4, 2025",
    description:
      'Products of iron or steel provided for in the tariff headings or subheadings enumerated in subdivision (j) of note 16 to this subchapter, admitted to a U.S. foreign trade zone under "privileged foreign status" as defined by 19 CFR 146.41, prior to 12:01 a.m. eastern daylight time on June 4, 2025',
    scope: {
      countries: "all",
      excludeCountries: ["GB"],
      codes: [{ list: "steel16j2025" }],
    },
    requires: [
      {
        kind: "dateBefore",
        input: "ftzPrivilegedForeignAdmissionDate",
        date: "2025-06-04",
      },
    ],
    basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled("U.S. note 16(i)-(j)"),
  },
  {
    code: "9903.81.89",
    program: "232-metals",
    name: "Section 232 Steel Derivatives, Note 16(l) (50%)",
    description:
      "Derivative iron or steel products provided for in the tariff provisions enumerated in subdivision (l) of note 16 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["GB"],
      codes: [{ list: "steelDerivatives16l2025" }],
    },
    exceptions: ["9903.81.93"],
    basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled(
      "U.S. note 16(k)-(l). Chapter 73 goods pay on the steel content; the 8708 stampings on the full value",
    ),
  },
  {
    code: "9903.81.90",
    program: "232-metals",
    name: "Section 232 Steel Derivatives, Note 16(m) (50%)",
    description:
      "Except as provided in heading 9903.81.92, derivative iron or steel products provided for in the tariff subheadings enumerated in subdivision (m) of note 16 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["GB"],
      codes: [{ list: "steelDerivatives16m2025" }],
      excludeCodes: [
        "7317.00.55.03",
        "7317.00.55.05",
        "7317.00.55.07",
        "7317.00.55.60",
        "7317.00.55.80",
        "7317.00.65.60",
      ],
    },
    exceptions: ["9903.81.92", "9903.81.93"],
    basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled(
      "U.S. note 16(k), (m). For 7317.00.55/.65 only the statistical numbers not in 16(l)",
    ),
  },
  {
    code: "9903.81.91",
    program: "232-metals",
    name: "Section 232 Steel Derivatives, Note 16(n) (50% of Steel Content)",
    description:
      "Except as provided in heading 9903.81.92, derivative iron or steel products provided for in the tariff subheadings enumerated in subdivision (n) of note 16 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["GB"],
      codes: [{ list: "steelDerivatives16n2025" }],
    },
    exceptions: ["9903.81.92"],
    basis: { kind: "metalContent", metal: "steel" },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled(
      "U.S. note 16(k), (n): the duty applies only to the declared value of the steel content",
    ),
  },
  {
    code: "9903.81.92",
    program: "232-metals",
    name: "Section 232 Steel Derivatives Processed Abroad from U.S.-Melted Steel (No Additional Duty)",
    description:
      "Derivative iron or steel products provided for in the tariff subheadings enumerated in subdivision subdivisions (m), (n), (t) or (u) of note 16 to this subchapter, where the derivative iron or steel product was processed in another country from steel articles that were melted and poured in the United States",
    scope: {
      countries: "all",
      codes: [
        { list: "steelDerivatives16m2025" },
        { list: "steelDerivatives16n2025" },
      ],
      excludeCodes: [
        "7317.00.55.03",
        "7317.00.55.05",
        "7317.00.55.07",
        "7317.00.55.60",
        "7317.00.55.80",
        "7317.00.65.60",
      ],
    },
    requires: [confirm("9903.81.92")],
    rate: { kind: "free" },
    effective: END,
    source: backfilled(
      "U.S. note 16(m), (n), (t), (u): processed in another country from steel melted and poured in the United States",
    ),
  },
  {
    code: "9903.81.93",
    program: "232-metals",
    name: "Section 232 Steel Derivatives (50%), FTZ Privileged Foreign Status Before June 4, 2025",
    description:
      'Except as provided in headings 9903.81.91 or 9903.81.92, derivative products of iron or steel, as specified in subdivisions (l) and (m) of note 16 to this subchapter, admitted to a U.S. foreign trade zone under "privileged foreign status" as defined by 19 CFR 146.41, prior to 12:01 a.m. eastern daylight time on June 4, 2025',
    scope: {
      countries: "all",
      excludeCountries: ["GB"],
      codes: [
        { list: "steelDerivatives16l2025" },
        { list: "steelDerivatives16m2025" },
      ],
    },
    exceptions: ["9903.81.91", "9903.81.92"],
    requires: [
      {
        kind: "dateBefore",
        input: "ftzPrivilegedForeignAdmissionDate",
        date: "2025-06-04",
      },
    ],
    basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled("U.S. note 16(k)"),
  },
  {
    code: "9903.81.94",
    program: "232-metals",
    name: "Section 232 Steel of the United Kingdom (25%)",
    description:
      "Except for derivative iron or steel products described in headings 9903.81.96, 9903.81.97 or 9903.81.98, products of iron or steel of the United Kingdom provided for in the tariff headings or subheadings enumerated in subdivision (q) of note 16 to this subchapter",
    scope: { countries: ["GB"], codes: [{ list: "steel16j2025" }] },
    exceptions: ["9903.81.95", "9903.81.96", "9903.81.97", "9903.81.98"],
    basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] },
    rate: { kind: "adValorem", pct: 25 },
    effective: END,
    source: backfilled("U.S. note 16(p)-(q); 16(q) repeats the 16(j) list"),
  },
  {
    code: "9903.81.95",
    program: "232-metals",
    name: "Section 232 Steel of the United Kingdom (25%), FTZ Privileged Foreign Status Before June 4, 2025",
    description:
      'Products of iron or steel of the United Kingdom provided for in the tariff headings or subheadings enumerated in subdivision (q) of note 16 to this subchapter, admitted to a U.S. foreign trade zone under "privileged foreign status" as defined by 19 CFR 146.41, prior to 12:01 a.m. eastern daylight time on June 4, 2025',
    scope: { countries: ["GB"], codes: [{ list: "steel16j2025" }] },
    requires: [
      {
        kind: "dateBefore",
        input: "ftzPrivilegedForeignAdmissionDate",
        date: "2025-06-04",
      },
    ],
    basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] },
    rate: { kind: "adValorem", pct: 25 },
    effective: END,
    source: backfilled("U.S. note 16(p)-(q)"),
  },
  {
    code: "9903.81.96",
    program: "232-metals",
    name: "Section 232 Steel Derivatives of the United Kingdom, Note 16(s) (25%)",
    description:
      "Derivative iron or steel products of the United Kingdom provided for in the tariff subheadings enumerated in subdivision (s) of note 16 to this subchapter",
    scope: { countries: ["GB"], codes: [{ list: "steelDerivatives16l2025" }] },
    exceptions: ["9903.81.99"],
    basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] },
    rate: { kind: "adValorem", pct: 25 },
    effective: END,
    source: backfilled("U.S. note 16(r)-(s); 16(s) repeats the 16(l) list"),
  },
  {
    code: "9903.81.97",
    program: "232-metals",
    name: "Section 232 Steel Derivatives of the United Kingdom, Note 16(t) (25%)",
    description:
      "Except as provided in heading 9903.81.92, derivative iron or steel products of the United Kingdom provided for in the tariff subheadings enumerated in subdivision (t) of note 16 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: [{ list: "steelDerivatives16m2025" }],
      excludeCodes: [
        "7317.00.55.03",
        "7317.00.55.05",
        "7317.00.55.07",
        "7317.00.55.60",
        "7317.00.55.80",
        "7317.00.65.60",
      ],
    },
    exceptions: ["9903.81.92", "9903.81.99"],
    basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] },
    rate: { kind: "adValorem", pct: 25 },
    effective: END,
    source: backfilled("U.S. note 16(r), (t); 16(t) repeats the 16(m) list"),
  },
  {
    code: "9903.81.98",
    program: "232-metals",
    name: "Section 232 Steel Derivatives of the United Kingdom, Note 16(u) (25% of Steel Content)",
    description:
      "Except as provided in heading 9903.81.92, derivative iron or steel products of the United Kingdom provided for in the tariff subheadings enumerated in subdivision (u) of note 16 to this subchapter",
    scope: { countries: ["GB"], codes: [{ list: "steelDerivatives16n2025" }] },
    exceptions: ["9903.81.92"],
    basis: { kind: "metalContent", metal: "steel" },
    rate: { kind: "adValorem", pct: 25 },
    effective: END,
    source: backfilled(
      "U.S. note 16(r), (u); 16(u) repeats the 16(n) list; steel content only",
    ),
  },
  {
    code: "9903.81.99",
    program: "232-metals",
    name: "Section 232 Steel Derivatives of the United Kingdom (25%), FTZ Privileged Foreign Status Before June 4, 2025",
    description:
      "Except as provided in headings 9903.81.98 or 9903.81.92, derivative products of iron or steel of the United Kingdom, as specified in subdivisions (s) and (t) of note 16 to this subchapter, admitted to a U.S.foreign trade zone under ''privileged foreign status'' as defined by 19 CFR 146.41, prior to 12:01 a.m. eastern daylight time on June 4, 2025",
    scope: {
      countries: ["GB"],
      codes: [
        { list: "steelDerivatives16l2025" },
        { list: "steelDerivatives16m2025" },
      ],
    },
    exceptions: ["9903.81.98", "9903.81.92"],
    requires: [
      {
        kind: "dateBefore",
        input: "ftzPrivilegedForeignAdmissionDate",
        date: "2025-06-04",
      },
    ],
    basis: { kind: "metalContentInChapters", metal: "steel", chapters: ["73"] },
    rate: { kind: "adValorem", pct: 25 },
    effective: END,
    source: backfilled("U.S. note 16(r)"),
  },
  {
    code: "9903.85.02",
    program: "232-metals",
    name: "Section 232 Aluminum (50%)",
    description:
      "Except as provided in headings 9903.85.67 or 9903.85.69, products of aluminum provided for in the tariff headings or subheadings enumerated in subdivision (g) of note 19 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["GB"],
      codes: [{ list: "aluminum19g2025" }],
    },
    exceptions: ["9903.85.67", "9903.85.69", "9903.85.07"],
    basis: {
      kind: "metalContentInChapters",
      metal: "aluminum",
      chapters: ["76"],
    },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled(
      "U.S. note 19(f)-(g): chapter 76 goods pay on the aluminum content. .07 wins for the 7616.99.51 statistical numbers 19(j) lists by name (same rate)",
    ),
  },
  {
    code: "9903.85.04",
    program: "232-metals",
    name: "Section 232 Aluminum Derivatives, Note 19(i) (50%)",
    description:
      "Except as provided in headings 9903.85.68 or 9903.85.70, derivative aluminum products provided for in the tariff headings or subheadings enumerated in subdivision (i) of note 19 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["GB"],
      codes: [{ list: "aluminumDerivatives19i2025" }],
      excludeCodes: ["8708.10.30.50"],
    },
    exceptions: ["9903.85.68", "9903.85.70"],
    basis: {
      kind: "metalContentInChapters",
      metal: "aluminum",
      chapters: ["76"],
    },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled(
      "U.S. note 19(h)-(i): chapter 76 goods on the aluminum content, the 8708 stampings on the full value. 8708.10.30.50, listed by name in 19(k), goes to .08",
    ),
  },
  {
    code: "9903.85.07",
    program: "232-metals",
    name: "Section 232 Aluminum Derivatives, Note 19(j) (50%)",
    description:
      "Except as provided in headings 9903.85.09, 9903.85.68 or 9903.85.70, derivative aluminum products, provided for in the tariff provisions enumerated in subdivision (j) of note 19 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["GB"],
      codes: [{ list: "aluminumDerivatives19j2025" }],
    },
    exceptions: ["9903.85.09", "9903.85.68", "9903.85.70"],
    basis: {
      kind: "metalContentInChapters",
      metal: "aluminum",
      chapters: ["76"],
    },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled(
      "U.S. note 19(h), (j): all chapter 76, so on the aluminum content",
    ),
  },
  {
    code: "9903.85.08",
    program: "232-metals",
    name: "Section 232 Aluminum Derivatives, Note 19(k) (50% of Aluminum Content)",
    description:
      "Except as provided in heading 9903.85.09, 9903.85.68 or 9903.85.70, derivative aluminum products, provided for in the tariff provisions enumerated in subdivision (k) of note 19 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["GB"],
      codes: [{ list: "aluminumDerivatives19k2025" }],
    },
    exceptions: ["9903.85.09", "9903.85.68", "9903.85.70"],
    basis: { kind: "metalContent", metal: "aluminum" },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled(
      "U.S. note 19(h), (k): the duty applies only to the value of the aluminum content",
    ),
  },
  {
    code: "9903.85.09",
    program: "232-metals",
    name: "Section 232 Aluminum Derivatives Processed Abroad from U.S.-Smelted Aluminum (No Additional Duty)",
    description:
      "Except as provided in heading 9903.85.68 or 9903.85.70, derivative aluminum products provided for in the tariff headings and subheadings enumerated in subdivisions (j), (k), (r) or (s) of note 19 to this subchapter, where the derivative aluminum products were processed in another country from aluminum articles that were smelted and cast in the United States",
    scope: {
      countries: "all",
      codes: [
        { list: "aluminumDerivatives19j2025" },
        { list: "aluminumDerivatives19k2025" },
      ],
    },
    exceptions: ["9903.85.68", "9903.85.70"],
    requires: [confirm("9903.85.09")],
    rate: { kind: "free" },
    effective: END,
    source: backfilled(
      "U.S. note 19(j), (k), (r), (s): processed in another country from aluminum smelted and cast in the United States",
    ),
  },
  {
    code: "9903.85.12",
    program: "232-metals",
    name: "Section 232 Aluminum of the United Kingdom (25%)",
    description:
      "Except as provided in headings 9903.85.67 or 9903.85.69, products of aluminum of the United Kingdom provided for in the tariff headings or subheadings enumerated in subdivision (o) of note 19 to this subchapter",
    scope: { countries: ["GB"], codes: [{ list: "aluminum19g2025" }] },
    exceptions: ["9903.85.67", "9903.85.69", "9903.85.14"],
    basis: {
      kind: "metalContentInChapters",
      metal: "aluminum",
      chapters: ["76"],
    },
    rate: { kind: "adValorem", pct: 25 },
    effective: END,
    source: backfilled(
      "U.S. note 19(n)-(o); 19(o) repeats the 19(g) list. .14 wins for the 7616.99.51 statistical numbers 19(r) lists by name",
    ),
  },
  {
    code: "9903.85.13",
    program: "232-metals",
    name: "Section 232 Aluminum Derivatives of the United Kingdom, Note 19(q) (25%)",
    description:
      "Except as provided in headings 9903.85.68 or 9903.85.70, derivative aluminum products of the United Kingdom provided for in the tariff headings or subheadings enumerated in subdivision (q) of note 19 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: [{ list: "aluminumDerivatives19i2025" }],
      excludeCodes: ["8708.10.30.50"],
    },
    exceptions: ["9903.85.68", "9903.85.70"],
    basis: {
      kind: "metalContentInChapters",
      metal: "aluminum",
      chapters: ["76"],
    },
    rate: { kind: "adValorem", pct: 25 },
    effective: END,
    source: backfilled(
      "U.S. note 19(p)-(q); 19(q) repeats the 19(i) list. 8708.10.30.50 goes to .15",
    ),
  },
  {
    code: "9903.85.14",
    program: "232-metals",
    name: "Section 232 Aluminum Derivatives of the United Kingdom, Note 19(r) (25%)",
    description:
      "Except as provided in headings 9903.85.09, 9903.85.68 or 9903.85.70, derivative aluminum products of the United Kingdom, provided for in the tariff provisions enumerated in subdivision (r) of note 19 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: [{ list: "aluminumDerivatives19j2025" }],
    },
    exceptions: ["9903.85.09", "9903.85.68", "9903.85.70"],
    basis: {
      kind: "metalContentInChapters",
      metal: "aluminum",
      chapters: ["76"],
    },
    rate: { kind: "adValorem", pct: 25 },
    effective: END,
    source: backfilled("U.S. note 19(p), (r); 19(r) repeats the 19(j) list"),
  },
  {
    code: "9903.85.15",
    program: "232-metals",
    name: "Section 232 Aluminum Derivatives of the United Kingdom, Note 19(s) (25% of Aluminum Content)",
    description:
      "Except as provided in heading 9903.85.09, 9903.85.68 or 9903.85.70, derivative aluminum products, provided for in the tariff provisions enumerated in subdivision (s) of note 19 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: [{ list: "aluminumDerivatives19k2025" }],
    },
    exceptions: ["9903.85.09", "9903.85.68", "9903.85.70"],
    basis: { kind: "metalContent", metal: "aluminum" },
    rate: { kind: "adValorem", pct: 25 },
    effective: END,
    source: backfilled(
      'U.S. note 19(p), (s). The heading text omits "of the United Kingdom"; 19(p) and 19(s) say it, and read otherwise it would duplicate .08',
    ),
  },
  {
    code: "9903.85.69",
    program: "232-metals",
    name: "Aluminum Smelted or Cast in Russia (200%), FTZ Privileged Foreign Status Before April 10, 2023",
    description:
      'Except for goods provided for in heading 9903.85.67, aluminum articles that are the product of Russia, or where any amount of primary aluminum used in the manufacture of the aluminum articles is smelted in Russia, or where the aluminum articles are cast in Russia, the foregoing under the terms of note 19(a)(vii)(A) to this subchapter, or note 19(m)(A) to this subchapter, as applicable per the date of entry for consumption or withdrawal from warehouse for consumption, admitted into a U.S. foreign trade zone under "privileged foreign status" as defined in 19 CFR 146.41, prior to 12:01 a.m. eastern standard time on April 10, 2023, except any exclusions that may be determined and announced by the Department of Commerce',
    scope: { countries: ["RU"], codes: [{ list: "aluminum19g2025" }] },
    requires: [
      {
        kind: "dateBefore",
        input: "ftzPrivilegedForeignAdmissionDate",
        date: "2023-04-10",
      },
    ],
    rate: { kind: "adValorem", pct: 200 },
    effective: END,
    source: backfilled(
      'U.S. note 19(m)(A), full value. Its "Except for goods provided for in heading 9903.85.67" is modeled the other way round: .67 gives way to it, as the two can\'t both apply (same rate)',
    ),
  },
  {
    code: "9903.85.70",
    program: "232-metals",
    name: "Derivative Aluminum Smelted or Cast in Russia (200%), FTZ Privileged Foreign Status Before April 10, 2023",
    description:
      'Except for goods provided for in heading 9903.85.68, derivative aluminum articles that are products of Russia, or where any amount of primary aluminum used in the manufacture of the derivative aluminum articles is smelted in Russia, or where the derivative aluminum articles are cast in Russia, when such derivative articles are provided for in the headings or subheadings enumerated in note 19(a)(iii) to this subchapter, or notes 19(i), 19(j) or 19(k) to this subchapter, as applicable per the date of entry for consumption or withdrawal from warehouse for consumption, admitted into a U.S. foreign trade zone under "privileged foreign status" as defined in 19 CFR 146.41, prior to 12:01 a.m. eastern standard time on April 10, 2023, except any exclusions that may be determined and announced by the Department of Commerce',
    scope: { countries: ["RU"], codes: [{ list: "9903.85.68" }] },
    requires: [
      {
        kind: "dateBefore",
        input: "ftzPrivilegedForeignAdmissionDate",
        date: "2023-04-10",
      },
    ],
    rate: { kind: "adValorem", pct: 200 },
    effective: END,
    source: backfilled(
      "U.S. note 19(m)(B), full value; same 19(i)-(k) list as 9903.85.68. Its exception for .68 is modeled the other way round, as for .69",
    ),
  },
  {
    code: "9903.78.01",
    program: "232-metals",
    name: "Section 232 Copper (50% of Copper Content)",
    description:
      "Semi-finished copper and intensive copper derivative products provided for in subdivision (b) of note 36 to this subchapter",
    scope: { countries: "all", codes: [{ list: "copper36b2025" }] },
    basis: { kind: "metalContent", metal: "copper" },
    rate: { kind: "adValorem", pct: 50 },
    effective: END,
    source: backfilled(
      "U.S. note 36(a)-(b): the duty applies only to the declared value of the copper content. The civil aircraft and auto exceptions in 36(a) are noStack interactions",
    ),
  },
  {
    code: "9903.78.02",
    program: "232-metals",
    name: "Section 232 Copper: Non-Copper Content (No Additional Duty)",
    description:
      "Articles as provided for in subdivision (c) of U.S. note 36 to this subchapter",
    scope: { countries: "all", codes: [{ list: "copper36b2025" }] },
    rate: { kind: "free" },
    effective: END,
    source: backfilled(
      "U.S. note 36(c): reported for the non-copper content of 36(b) goods",
    ),
  },
]
