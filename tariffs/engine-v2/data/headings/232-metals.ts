// Migrated from the legacy tariff data (2026HTSRev5) by scripts/engine-v2/migrate-legacy.ts,
// then reviewed by hand. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"

export const headings: Tariff[] = [
  {
    code: "9903.82.01",
    program: "232-metals",
    name: "Section 232 Metal Exemption: Article Contains No Aluminum, Steel, or Copper",
    description:
      "Articles provided for in subdivision (c) of U.S. note 16 to this subchapter that do not contain any aluminum, steel, or copper",
    scope: {
      countries: "all",
      codes: [
        { list: "aluminum16ci" },
        { list: "aluminumDerivatives16cii" },
        { list: "aluminumDerivatives16cix" },
        { list: "aluminumDerivatives16cvi" },
        { list: "copper16cv" },
        { list: "motorcycleParts16cg" },
        { list: "steel16ciii" },
        { list: "steelDerivatives16civ" },
        { list: "steelDerivatives16cvii" },
        { list: "steelDerivatives16cx" },
      ],
    },
    requires: [confirm("9903.82.01")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.02",
    program: "232-metals",
    name: "Section 232 Metals",
    description:
      "Except as provided for in headings 9903.82.14, 9903.85.67 and 9903.85.68, articles of aluminum, of steel or of copper and derivative aluminum or steel articles, as provided for in subdivisions (c)(i)–(v) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      codes: [
        { list: "aluminum16ci" },
        { list: "aluminumDerivatives16cii" },
        { list: "copper16cv" },
        { list: "steel16ciii" },
        { list: "steelDerivatives16civ" },
      ],
    },
    exceptions: [
      "9903.82.01",
      "9903.82.14",
      "9903.85.67",
      "9903.85.68",
      "9903.82.03",
      "9903.82.04",
      "9903.82.06",
    ],
    rate: { kind: "adValorem", pct: 50 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.03",
    program: "232-metals",
    name: "Section 232 Metal Exemption: Aggregate 232 Metal weight is <15% of Article Weight",
    description:
      "Except for articles classifiable in chapters 72, 73, 74 or 76, articles where the weight of the applicable metal is less than 15 percent of the weight of the imported article, as provided for in subdivision (c) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      codes: "all",
      // TODO(list): "9903.82.03:excluded" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      excludeCodes: [{ list: "9903.82.03:excluded" }],
    },
    exceptions: ["9903.82.01"],
    requires: [confirm("9903.82.03")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.04",
    program: "232-metals",
    name: "232 Metals of UK Origin (95%+ Smelted or Most Recently Cast or Poured in UK)",
    description:
      "Articles of aluminum or of steel and derivative aluminum or steel articles the product of the United Kingdom, as provided for in subdivisions (c)(i)–(iv) and (d) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: [
        { list: "aluminum16ci" },
        { list: "aluminumDerivatives16cii" },
        { list: "steel16ciii" },
        { list: "steelDerivatives16civ" },
      ],
    },
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.06"],
    requires: [confirm("9903.82.04")],
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.05",
    program: "232-metals",
    name: "Section 232 Metal Articles of UK Origin (95%+ Smelted or Most Recently Cast or Poured in UK)",
    description:
      "Derivative aluminum or steel articles the product of the United Kingdom, as provided for in subdivisions (c)(vi)–(vii) and (d) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: [
        { list: "aluminumDerivatives16cvi" },
        { list: "steelDerivatives16cvii" },
      ],
    },
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.06"],
    requires: [confirm("9903.82.05")],
    rate: { kind: "adValorem", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.06",
    program: "232-metals",
    name: "Section 232 Metal Articles 95% smelted, cast, or poured in the US",
    description:
      "Except as provided for in headings 9903.82.15 and 9903.85.68, articles of copper and derivative aluminum and steel articles, as provided for in subdivisions (c)(ii), (iv), (vi)–(viii) and (e) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      codes: [
        { list: "aluminumDerivatives16cii" },
        { list: "aluminumDerivatives16cvi" },
        { list: "motorcycleParts16cg" },
        { list: "steelDerivatives16civ" },
        { list: "steelDerivatives16cvii" },
      ],
    },
    exceptions: [
      "9903.82.01",
      "9903.82.15",
      "9903.85.68",
      "9903.82.03",
      "9903.82.04",
    ],
    requires: [confirm("9903.82.06")],
    rate: { kind: "adValorem", pct: 10 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.07",
    program: "232-metals",
    name: "Section 232 Metal Articles, with metals over 95% smelted, cast, or poured in the US, and <10% Column 1 Ad Valorem Rate of Duty (Replaces General Duty)",
    description:
      "Except as provided for in headings 9903.82.12, 9903.82.17 and 9903.85.68, derivative aluminum and steel articles with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 10 percent, as provided for in subdivisions (c)(ix)–(x) and (e) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      codes: [
        { list: "aluminumDerivatives16cix" },
        { list: "steelDerivatives16cx" },
      ],
    },
    exceptions: [
      "9903.82.01",
      "9903.82.12",
      "9903.82.17",
      "9903.85.68",
      "9903.82.03",
      "9903.82.06",
    ],
    requires: [{ kind: "baseRate", op: "<", pct: 10 }, confirm("9903.82.07")],
    rate: { kind: "topUpTo", pct: 10 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.08",
    program: "232-metals",
    name: "Section 232 Metal Articles, with metals 95%+ smelted, cast, or poured in the US, and 10%+ Column 1 Ad Valorem Rate of Duty",
    description:
      "Except as provided for in headings 9903.82.12, 9903.82.17 and 9903.85.68, derivative aluminum and steel articles with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 10 percent, as provided for in subdivisions (c)(ix)–(x) and (e) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      codes: [
        { list: "aluminumDerivatives16cix" },
        { list: "steelDerivatives16cx" },
      ],
    },
    exceptions: [
      "9903.82.01",
      "9903.82.12",
      "9903.82.17",
      "9903.85.68",
      "9903.82.03",
      "9903.82.06",
      "9903.82.11",
    ],
    requires: [{ kind: "baseRate", op: ">=", pct: 10 }, confirm("9903.82.08")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.09",
    program: "232-metals",
    name: "Section 232 Metal Articles provided for in 16(c)(vi)–(viii)",
    description:
      "Except as provided for in headings 9903.82.16 and 9903.85.68, articles of copper and derivative aluminum and steel articles, as provided for in subdivisions (c)(vi)–(viii) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      codes: [
        { list: "aluminumDerivatives16cvi" },
        { list: "motorcycleParts16cg" },
        { list: "steelDerivatives16cvii" },
      ],
    },
    exceptions: [
      "9903.82.01",
      "9903.82.16",
      "9903.85.68",
      "9903.82.03",
      "9903.82.05",
      "9903.82.06",
      "9903.82.13",
    ],
    rate: { kind: "adValorem", pct: 25 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.10",
    program: "232-metals",
    name: "Section 232 Metal Articles, <15% Column 1 Ad Valorem Rate of Duty (Replaces General Duty)",
    description:
      "Except as provided for in headings 9903.82.12, 9903.82.17 and 9903.85.68, derivative aluminum and steel articles with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent, as provided for in subdivision (f) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      codes: [
        { list: "aluminumDerivatives16cix" },
        { list: "steelDerivatives16cx" },
      ],
    },
    exceptions: [
      "9903.82.01",
      "9903.82.12",
      "9903.82.17",
      "9903.85.68",
      "9903.82.03",
      "9903.82.06",
      "9903.82.07",
      "9903.82.08",
    ],
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.82.10")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.11",
    program: "232-metals",
    name: "Section 232 Metal Articles 15%+ Column 1 Ad Valorem Rate of Duty",
    description:
      "Except as provided for in headings 9903.82.12, 9903.82.17 and 9903.85.68, derivative aluminum and steel articles with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent, as provided for in subdivision (f) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      codes: [
        { list: "aluminumDerivatives16cix" },
        { list: "steelDerivatives16cx" },
      ],
    },
    exceptions: [
      "9903.82.01",
      "9903.82.12",
      "9903.82.17",
      "9903.85.68",
      "9903.82.03",
      "9903.82.06",
      "9903.82.07",
      "9903.82.08",
    ],
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.82.11")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.12",
    program: "232-metals",
    name: "Section 232 Metal Articles from Non Normal-Trade Relation Countries listed in General Note 3(B)",
    description:
      "Except as provided for in headings 9903.82.17 and 9903.85.68, derivative aluminum and steel articles the product of any country identified in general note 3(b), as provided for in subdivisions (c)(ix)–(x) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["BY", "KP", "CU", "RU"],
      codes: [
        { list: "aluminumDerivatives16cix" },
        { list: "steelDerivatives16cx" },
      ],
    },
    exceptions: [
      "9903.82.01",
      "9903.82.17",
      "9903.85.68",
      "9903.82.03",
      "9903.82.06",
      "9903.82.11",
      "9903.82.08",
    ],
    rate: { kind: "adValorem", pct: 25 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.13",
    program: "232-metals",
    name: "Section 232 Metal Exemption: Parts for Manufacture of Motorcycles in the US",
    description:
      "Motorcycle parts, as provided for in subdivision (g) of U.S. note 16 to the subchapter",
    scope: {
      countries: "all",
      codes: [{ list: "motorcycleParts16cg" }],
    },
    exceptions: ["9903.82.03", "9903.82.06", "9903.82.09"],
    requires: [confirm("9903.82.13")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.14",
    program: "232-metals",
    name: "Section 232 Metal Articles from Russia with 10%+ Ad Valorem Rate of Base Duty",
    description:
      "Section 232 Metal Articles of Russia, provided for in subdivisions (c)(iii)–(v) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["RU"],
      codes: [
        { list: "copper16cv" },
        { list: "steel16ciii" },
        { list: "steelDerivatives16civ" },
      ],
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 10 }],
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.06"],
    rate: { kind: "adValorem", pct: 50 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.15",
    program: "232-metals",
    name: "Section 232 Metal Articles from Russia with <10% Ad Valorem Rate of Base Duty",
    description:
      "Section 232 Metal Articles of Russia, provided for in subdivisions (c)(iv), (vii), (viii) and (e) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["RU"],
      codes: [
        { list: "copperArticles16cviii" },
        { list: "steelDerivatives16civ" },
        { list: "steelDerivatives16cvii" },
      ],
    },
    requires: [{ kind: "baseRate", op: "<", pct: 10 }],
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.06"],
    rate: { kind: "adValorem", pct: 10 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.16",
    program: "232-metals",
    name: "Section 232 Metal Articles from Russia",
    description:
      "Articles of copper and derivative steel the product of the Russian Federation, as provided for in subdivisions (c)(vii)–(viii) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["RU"],
      codes: [
        { list: "copperArticles16cviii" },
        { list: "steelDerivatives16cvii" },
      ],
    },
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.06"],
    rate: { kind: "adValorem", pct: 25 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.82.17",
    program: "232-metals",
    name: "Section 232 Metal Articles from Russia",
    description:
      "Derivative steel articles the product of the Russian Federation, as provided for in subdivision (c)(x) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["RU"],
      codes: [{ list: "steelDerivatives16cx" }],
    },
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.06"],
    rate: { kind: "adValorem", pct: 25 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.85.67",
    program: "232-metals",
    name: "Aluminum Smelted or Casted in Russia (Section 232)",
    description:
      "Aluminum articles that are the product of Russia, or where any amount of primary aluminum used in the manufacture of the aluminum articles is smelted in Russia, or where the aluminum articles are cast in Russia, the foregoing under the terms of note 19(a)(vii)(A) to this subchapter, or note 19(m)(A) to this subchapter, as applicable per the date of entry for consumption or withdrawal from warehouse for consumption, except any exclusions that may be determined and announced by the Department of Commerce",
    scope: {
      countries: ["RU"],
      // TODO(list): "9903.85.67" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.85.67" }],
    },
    rate: { kind: "adValorem", pct: 200 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.85.68",
    program: "232-metals",
    name: "Derivative Aluminum Articles from Russia where Primary Aluminum is Smelted or Cast in Russia (Section 232)",
    description:
      "Derivative aluminum articles that are products of Russia, or where any amount of primary aluminum used in the manufacture of the derivative articles is smelted in Russia, or where the derivative aluminum articles are cast in Russia, when such derivative articles are provided for in the headings or subheadings enumerated in note 19(a)(iii) to this subchapter, or notes 19(i), 19(j) or 19(k) to this subchapter, as applicable per the date of entry for consumption or withdrawal from warehouse for consumption, except any exclusions that may be determined and announced by the Department of Commerce",
    scope: {
      countries: ["RU"],
      // TODO(list): "9903.85.68" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.85.68" }],
    },
    requires: [confirm("9903.85.68")],
    rate: { kind: "adValorem", pct: 200 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
]
