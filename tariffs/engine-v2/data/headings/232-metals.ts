// Migrated from the legacy tariff data (2026HTSRev5), then reviewed by hand. The legacy engine
// was removed on Oct 1, 2026; this file is now the source. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"
import { tariffVersions } from "../../versioning"

export const headings: Tariff[] = [
  ...tariffVersions(
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
          { list: "copperArticles16cviii" },
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
      source: {
        revision: "2026HTSRev7",
        note: "Added to the HTS by Notice effective 2026-04-06 (retroactive); listed from 2026HTSRev7. Scope now includes subdivision (c)(viii), per the heading text",
      },
    },
    [
      {
        from: "2026-06-08",
        set: {
          scope: {
            countries: "all",
            codes: [
              { list: "aluminum16ci" },
              { list: "aluminumDerivatives16cii" },
              { list: "aluminumDerivatives16cix" },
              { list: "aluminumDerivatives16cvi" },
              { list: "copper16cv" },
              { list: "copperArticles16cviii" },
              { list: "motorcycleParts16cg" },
              { list: "steel16ciii" },
              { list: "steelDerivatives16civ" },
              { list: "steelDerivatives16cvii" },
              { list: "steelDerivatives16cx" },
              { list: "steelDerivatives16cxi" },
            ],
          },
        },
        source: {
          revision: "2026HTSRev10",
          citation: "Proclamation 11032",
          note: "Scope adds U.S. note 16(c)(xi); effective 2026-06-08",
        },
      },
    ],
  ),
  ...tariffVersions(
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
        "9903.82.15",
      ],
      rate: { kind: "adValorem", pct: 50 },
      effective: {},
      source: { revision: "2026HTSRev5" },
    },
    [
      {
        // Note 16(a): headings 9903.82.02–9903.82.19 are mutually exclusive
        from: "2026-04-23",
        set: {
          exceptions: [
            "9903.82.01",
            "9903.82.14",
            "9903.85.67",
            "9903.85.68",
            "9903.82.03",
            "9903.82.04",
            "9903.82.06",
            "9903.82.15",
            "9903.82.18",
            "9903.82.19",
          ],
        },
        source: {
          revision: "2026HTSRev6",
          note: "U.S. note 16(a) range extended to 9903.82.19; effective date from the change record",
        },
      },
    ],
  ),
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
  ...tariffVersions(
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
      exceptions: ["9903.82.01", "9903.82.03", "9903.82.06", "9903.82.13"],
      requires: [confirm("9903.82.05")],
      rate: { kind: "adValorem", pct: 15 },
      rateByColumn: {
        column2: { kind: "free" },
      },
      effective: {},
      source: { revision: "2026HTSRev5" },
    },
    [
      {
        from: "2026-06-08",
        set: {
          exceptions: [
            "9903.82.01",
            "9903.82.03",
            "9903.82.06",
            "9903.82.13",
            "9903.82.23",
            "9903.82.24",
            "9903.82.25",
            "9903.82.26",
          ],
        },
        source: {
          revision: "2026HTSRev10",
          citation: "Proclamation 11032",
          note: "Gives way to the 16(k) parts headings 9903.82.23–.26 (note 16(a): one heading per article); effective 2026-06-08",
        },
      },
    ],
  ),
  ...tariffVersions(
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
          { list: "copperArticles16cviii" },
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
        "9903.82.13",
      ],
      requires: [confirm("9903.82.06")],
      rate: { kind: "adValorem", pct: 10 },
      effective: {},
      source: {
        revision: "2026HTSRev7",
        note: "U.S. note 16(e) sentence limiting this heading to (c)(ii), (iv), (vi) and (vii) removed by Notice effective 2026-04-06 (retroactive); scope follows the heading text, adding (c)(viii)",
      },
    },
    [
      {
        from: "2026-06-08",
        set: {
          name: "Section 232 Metal Articles 85% smelted, cast, or poured in the US",
          description:
            "Except as provided for in headings 9903.82.15 and 9903.85.68, articles of copper and derivative aluminum and steel articles, as provided for in subdivisions (c)(ii), (iv), (vi)\u2013(viii), (xi) and (e) of U.S. note 16 to this subchapter",
          scope: {
            countries: "all",
            codes: [
              { list: "aluminumDerivatives16cii" },
              { list: "aluminumDerivatives16cvi" },
              { list: "copperArticles16cviii" },
              { list: "steelDerivatives16civ" },
              { list: "steelDerivatives16cvii" },
              { list: "steelDerivatives16cxi" },
            ],
          },
          exceptions: [
            "9903.82.01",
            "9903.82.15",
            "9903.85.68",
            "9903.82.03",
            "9903.82.13",
            "9903.82.23",
            "9903.82.24",
          ],
        },
        source: {
          revision: "2026HTSRev10",
          citation: "Proclamation 11032",
          note: "Scope adds 16(c)(xi); 16(e) U.S.-content threshold 85%; gives way to 9903.82.23/.24 (16(k)); effective 2026-06-08",
        },
      },
    ],
  ),
  ...tariffVersions(
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
    [
      {
        from: "2026-06-08",
        set: {
          name: "Section 232 Metal Articles, with metals 85%+ smelted, cast, or poured in the US, and <10% Column 1 Ad Valorem Rate of Duty (Replaces General Duty)",
        },
        source: {
          revision: "2026HTSRev10",
          citation: "Proclamation 11032",
          note: "16(e) U.S.-content threshold lowered to 85%; effective 2026-06-08",
        },
      },
    ],
  ),
  ...tariffVersions(
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
      ],
      requires: [
        { kind: "baseRate", op: ">=", pct: 10 },
        confirm("9903.82.08"),
      ],
      rate: { kind: "free" },
      effective: {},
      source: { revision: "2026HTSRev5" },
    },
    [
      {
        from: "2026-06-08",
        set: {
          name: "Section 232 Metal Articles, with metals 85%+ smelted, cast, or poured in the US, and 10%+ Column 1 Ad Valorem Rate of Duty",
        },
        source: {
          revision: "2026HTSRev10",
          citation: "Proclamation 11032",
          note: "16(e) U.S.-content threshold lowered to 85%; effective 2026-06-08",
        },
      },
    ],
  ),
  ...tariffVersions(
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
        "9903.82.15",
      ],
      rate: { kind: "adValorem", pct: 25 },
      effective: {},
      source: { revision: "2026HTSRev5" },
    },
    [
      {
        from: "2026-06-08",
        set: {
          description:
            "Except as provided for in headings 9903.82.16, 9903.82.20\u20139903.82.26 and 9903.85.68, articles of copper and derivative aluminum and steel articles, as provided for in subdivisions (c)(vi)\u2013(viii) and (xi) of U.S. note 16 to this subchapter",
          scope: {
            countries: "all",
            codes: [
              { list: "aluminumDerivatives16cvi" },
              { list: "steelDerivatives16cvii" },
              { list: "steelDerivatives16cxi" },
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
            "9903.82.15",
            "9903.82.20",
            "9903.82.21",
            "9903.82.22",
            "9903.82.23",
            "9903.82.24",
            "9903.82.25",
            "9903.82.26",
          ],
        },
        source: {
          revision: "2026HTSRev10",
          citation: "Proclamation 11032",
          note: "Scope adds 16(c)(xi); gives way to 9903.82.20\u2013.26 per its heading text; effective 2026-06-08",
        },
      },
    ],
  ),
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
    ],
    rate: { kind: "adValorem", pct: 25 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  ...tariffVersions(
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
      exceptions: ["9903.82.01", "9903.82.03"],
      requires: [confirm("9903.82.13")],
      rate: { kind: "free" },
      effective: {},
      source: {
        revision: "2026HTSRev7",
        note: "9903.82.01 added as an exception: U.S. note 16(a) as modified by Notice effective 2026-04-06 (retroactive)",
      },
    },
    [
      {
        from: "2026-06-08",
        set: {
          scope: {
            countries: "all",
            codes: [
              // 16(g): (vi)–(viii) and (xi) articles in chapters 84, 85 or 87
              { list: "metalsPartsForEquipment16k" },
              { list: "steelDerivatives16cxi" },
            ],
          },
        },
        source: {
          revision: "2026HTSRev10",
          citation: "Proclamation 11032",
          note: "16(g) adds subdivision (c)(xi); effective 2026-06-08",
        },
      },
    ],
  ),
  {
    code: "9903.82.14",
    program: "232-metals",
    name: "Section 232 Metal Articles from Russia",
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
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.06", "9903.82.15"],
    rate: { kind: "adValorem", pct: 50 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  ...tariffVersions(
    {
      code: "9903.82.15",
      program: "232-metals",
      name: "Section 232 Metal Articles from Russia, 95%+ smelted, cast, or poured in the US",
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
      requires: [confirm("9903.82.15")],
      exceptions: ["9903.82.01", "9903.82.03", "9903.82.13"],
      rate: { kind: "adValorem", pct: 10 },
      effective: {},
      source: { revision: "2026HTSRev5" },
    },
    [
      {
        from: "2026-06-08",
        set: {
          name: "Section 232 Metal Articles from Russia, 85%+ smelted, cast, or poured in the US",
          description:
            "Articles of copper and derivative steel the product of the Russian Federation, as provided for in subdivisions (c)(iv), (vii), (viii), (xi) and (e) of U.S. note 16 to this subchapter",
          scope: {
            countries: ["RU"],
            codes: [
              { list: "copperArticles16cviii" },
              { list: "steelDerivatives16civ" },
              { list: "steelDerivatives16cvii" },
              { list: "steelDerivatives16cxi" },
            ],
          },
        },
        source: {
          revision: "2026HTSRev10",
          citation: "Proclamation 11032",
          note: "Scope adds 16(c)(xi); 16(e) U.S.-content threshold 85%; effective 2026-06-08",
        },
      },
    ],
  ),
  ...tariffVersions(
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
      exceptions: [
        "9903.82.01",
        "9903.82.03",
        "9903.82.06",
        "9903.82.13",
        "9903.82.15",
      ],
      rate: { kind: "adValorem", pct: 25 },
      effective: {},
      source: { revision: "2026HTSRev5" },
    },
    [
      {
        from: "2026-06-08",
        set: {
          description:
            "Articles of copper and derivative steel the product of the Russian Federation, as provided for in subdivisions (c)(vii)\u2013(viii) and (xi) of U.S. note 16 to this subchapter",
          scope: {
            countries: ["RU"],
            codes: [
              { list: "copperArticles16cviii" },
              { list: "steelDerivatives16cvii" },
              { list: "steelDerivatives16cxi" },
            ],
          },
        },
        source: {
          revision: "2026HTSRev10",
          citation: "Proclamation 11032",
          note: "Scope adds 16(c)(xi); effective 2026-06-08",
        },
      },
    ],
  ),
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
  // Rate is in the Special column only ("no change" under General and Column 2), so these
  // apply only when USMCA is claimed. The confirmation covers the other conditions of
  // note 16(h)/(i): melted and poured (smelted and cast) in Canada or Mexico, and a
  // Commerce-authorized limited quantity under clause 13 of Proclamation 10984.
  {
    code: "9903.82.18",
    program: "232-metals",
    name: "Section 232 Steel of Canada or Mexico Authorized by Commerce for a Reduced Rate (USMCA)",
    description:
      "Certain articles of steel, as provided for in subdivisions (c)(iii) and (h) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["CA", "MX"],
      codes: [{ list: "steel16ciii" }],
    },
    requires: [
      { kind: "preferenceClaimed", symbols: ["S", "S+"] },
      confirm("9903.82.18"),
    ],
    exceptions: ["9903.82.01"],
    rate: { kind: "adValorem", pct: 25 },
    effective: { from: "2026-04-23" },
    source: {
      revision: "2026HTSRev6",
      citation: "Proclamation 10984, clause 13",
      note: "U.S. note 16(h). Effective date from the change record (Notice)",
    },
  },
  {
    code: "9903.82.19",
    program: "232-metals",
    name: "Section 232 Aluminum of Canada or Mexico Authorized by Commerce for a Reduced Rate (USMCA)",
    description:
      "Certain articles of aluminum, as provided for in subdivision (c)(i) and subdivision (i) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["CA", "MX"],
      codes: [{ list: "aluminum16ci" }],
    },
    requires: [
      { kind: "preferenceClaimed", symbols: ["S", "S+"] },
      confirm("9903.82.19"),
    ],
    exceptions: ["9903.82.01"],
    rate: { kind: "adValorem", pct: 25 },
    effective: { from: "2026-04-23" },
    source: {
      revision: "2026HTSRev6",
      citation: "Proclamation 10984, clause 13",
      note: "U.S. note 16(i). Effective date from the change record (Notice)",
    },
  },
  {
    code: "9903.82.20",
    program: "232-metals",
    name: "Section 232 Mobile Industrial Equipment (16(c)(xi)) under USMCA: Non-U.S. Content and U.S. Content Above 40%",
    description:
      "Derivative steel articles as provided in subdivision (j) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["CA", "MX"],
      codes: [{ list: "steelDerivatives16cxi" }],
    },
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.06", "9903.82.13"],
    requires: [{ kind: "preferenceClaimed", symbols: ["S", "S+"] }],
    basis: { kind: "usContentShare", cap: 40, part: "rest" },
    rate: { kind: "adValorem", pct: 25 },
    effective: { from: "2026-06-08" },
    source: {
      revision: "2026HTSRev10",
      citation: "Proclamation 11032",
      note: "U.S. note 16(j); effective 2026-06-08",
    },
  },
  {
    code: "9903.82.21",
    program: "232-metals",
    name: "Section 232 Mobile Industrial Equipment (16(c)(xi)) under USMCA: U.S. Content up to 40% (No Duty)",
    description:
      "Derivative steel articles as provided in subdivision (j) of U.S. note 16 to this subchapter",
    scope: {
      countries: ["CA", "MX"],
      codes: [{ list: "steelDerivatives16cxi" }],
    },
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.06", "9903.82.13"],
    requires: [{ kind: "preferenceClaimed", symbols: ["S", "S+"] }],
    basis: { kind: "usContentShare", cap: 40, part: "upToCap" },
    rate: { kind: "free" },
    effective: { from: "2026-06-08" },
    source: {
      revision: "2026HTSRev10",
      citation: "Proclamation 11032",
      note: "U.S. note 16(j); effective 2026-06-08",
    },
  },
  {
    // TODO(review): the heading rate is a plain "15%". Modeled as a total including the base rate
    // (topUpTo), like 9903.82.23/.25 whose notes say so, per the reviewer (Rev 10 plan, Oct 2026).
    // Revisit if a later note or CBP guidance says it is 15% on top of the base rate.
    code: "9903.82.22",
    program: "232-metals",
    name: "Section 232 Mobile Industrial Equipment (16(c)(xi)) of Partner Countries: 15% Including Base Duty",
    description:
      "Derivative steel articles the product of Argentina, Ecuador, El Salvador, Guatemala, Japan, the Republic of Korea, Liechtenstein, Switzerland, Taiwan, the United Kingdom, or a member nation of the European Union, as provided for in subdivision (c)(xi) of U.S. note 16 to this subchapter",
    scope: {
      countries: [
        "AR",
        "EC",
        "SV",
        "GT",
        "JP",
        "KR",
        "LI",
        "CH",
        "TW",
        "GB",
        { list: "eu-members" },
      ],
      codes: [{ list: "steelDerivatives16cxi" }],
    },
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.06", "9903.82.13"],
    requires: [],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: { from: "2026-06-08" },
    source: {
      revision: "2026HTSRev10",
      citation: "Proclamation 11032",
      note: "U.S. note 16(c)(xi); effective 2026-06-08",
    },
  },
  {
    code: "9903.82.23",
    program: "232-metals",
    name: "Parts for Agricultural/Industrial Equipment (16(k)), 85%+ U.S.-Melted Metal, <10% Column 1 Rate (Topped Up to 10%)",
    description:
      "Articles of copper and derivative aluminum and steel articles with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 10 percent, as provided for in subdivisions (e) and (k) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["BY", "CU", "KP", "RU"],
      codes: [{ list: "metalsPartsForEquipment16k" }],
    },
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.13", "9903.85.68"],
    requires: [{ kind: "baseRate", op: "<", pct: 10 }, confirm("9903.82.23")],
    rate: { kind: "topUpTo", pct: 10 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: { from: "2026-06-08" },
    source: {
      revision: "2026HTSRev10",
      citation: "Proclamation 11032",
      note: "U.S. notes 16(e) and 16(k); effective 2026-06-08",
    },
  },
  {
    code: "9903.82.24",
    program: "232-metals",
    name: "Parts for Agricultural/Industrial Equipment (16(k)), 85%+ U.S.-Melted Metal, 10%+ Column 1 Rate",
    description:
      "Articles of copper and derivative aluminum and steel articles with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 10 percent, as provided for in subdivisions (e) and (k) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["BY", "CU", "KP", "RU"],
      codes: [{ list: "metalsPartsForEquipment16k" }],
    },
    exceptions: ["9903.82.01", "9903.82.03", "9903.82.13", "9903.85.68"],
    requires: [{ kind: "baseRate", op: ">=", pct: 10 }, confirm("9903.82.24")],
    rate: { kind: "free" },
    effective: { from: "2026-06-08" },
    source: {
      revision: "2026HTSRev10",
      citation: "Proclamation 11032",
      note: "U.S. notes 16(e) and 16(k); effective 2026-06-08",
    },
  },
  {
    code: "9903.82.25",
    program: "232-metals",
    name: "Parts for Agricultural/Industrial Equipment (16(k)), <15% Column 1 Rate (Topped Up to 15%)",
    description:
      "Articles of copper and derivative aluminum and steel articles with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent, as provided for in subdivisions (f) and (k) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["BY", "CU", "KP", "RU"],
      codes: [{ list: "metalsPartsForEquipment16k" }],
    },
    exceptions: [
      "9903.82.01",
      "9903.82.03",
      "9903.82.13",
      "9903.85.68",
      "9903.82.06",
      "9903.82.23",
      "9903.82.24",
    ],
    requires: [{ kind: "baseRate", op: "<", pct: 15 }, confirm("9903.82.25")],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: { from: "2026-06-08" },
    source: {
      revision: "2026HTSRev10",
      citation: "Proclamation 11032",
      note: "U.S. notes 16(f) and 16(k); effective 2026-06-08",
    },
  },
  {
    code: "9903.82.26",
    program: "232-metals",
    name: "Parts for Agricultural/Industrial Equipment (16(k)), 15%+ Column 1 Rate",
    description:
      "Articles of copper and derivative aluminum and steel articles with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent, as provided for in subdivisions (f) and (k) of U.S. note 16 to this subchapter",
    scope: {
      countries: "all",
      excludeCountries: ["BY", "CU", "KP", "RU"],
      codes: [{ list: "metalsPartsForEquipment16k" }],
    },
    exceptions: [
      "9903.82.01",
      "9903.82.03",
      "9903.82.13",
      "9903.85.68",
      "9903.82.06",
      "9903.82.23",
      "9903.82.24",
    ],
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }, confirm("9903.82.26")],
    rate: { kind: "free" },
    effective: { from: "2026-06-08" },
    source: {
      revision: "2026HTSRev10",
      citation: "Proclamation 11032",
      note: "U.S. notes 16(f) and 16(k); effective 2026-06-08",
    },
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
