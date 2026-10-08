// Section 301 – Forced Labor: U.S. note 52 to subchapter III and headings 9903.05.20–9903.06.21,
// from 2026HTSRev13 (USTR notice, 91 FR 47318, effective 2026-07-24, replacing Section 122, which expired at the
// close of July 23). Country rates (9903.05.20–.84) with exemptions (9903.05.85–9903.06.21); the
// structure copies Section 122's note 2(aa). Generated from the revision's reviewed heading text
// (tariffs/revision-diffs/2026HTSRev13/headings.md), then checked. See HowTariffsWork.md §6.
//
// Pairs for the EU, Japan, South Korea, Switzerland and Taiwan total 10% or 12.5% including the
// column 1 rate (note 52(k)). The ad valorem equivalent of a specific or compound rate is the duty
// payable divided by the customs value, which is what baseRate compares (§9.3).
import { Tariff } from "../../types";
import { tariffVersions } from "../../versioning";
import { confirm } from "../confirmations";
import {
  section232ArticleHeadingsFromJuly31,
  section232ArticleHeadingsFromJune8,
} from "./122";

const PROGRAM = "301-forced-labor";
const FROM = "2026-07-24";
// "applicable with respect to products that are entered for consumption, or withdrawn from
// warehouse for consumption, on or after 12:01 a.m. eastern time on July 24, 2026" (dockets
// USTR-2026-0265 and USTR-2026-0266)
const SOURCE = {
  revision: "2026HTSRev13",
  citation: "USTR, Notice of Actions in Section 301 Investigations (forced labor), 91 FR 47318",
  url: "https://www.govinfo.gov/content/pkg/FR-2026-07-28/html/2026-15181.htm",
  publishedOn: "2026-07-28",
};

export const headings: Tariff[] = [
  {
    code: "9903.05.20",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Algeria",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Algeria, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["DZ"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.21",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Angola",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Angola, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["AO"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.22",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Argentina",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.06.10–9903.06.11, articles the product of Argentina, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["AR"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.06.10",
      "9903.06.11",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.23",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Australia",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Australia, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["AU"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.24",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Bahamas",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of the Bahamas, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["BS"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.25",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Bahrain",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Bahrain, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["BH"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.26",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Bangladesh",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.06.12–9903.06.13, articles the product of Bangladesh, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["BD"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.06.12",
      "9903.06.13",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.27",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Brazil",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Brazil, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["BR"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.28",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Cambodia",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.06.02–9903.06.03, articles the product of Cambodia, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["KH"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.06.02",
      "9903.06.03",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.29",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Canada",
    description:
      "Except for products described in headings 9903.05.85–9903.05.93, articles the product of Canada, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["CA"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.93",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.30",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Chile",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Chile, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["CL"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.31",
    program: PROGRAM,
    name: "Section 301 Forced Labor – China",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of China, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["CN"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.32",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Colombia",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Colombia, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["CO"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.33",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Costa Rica",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.95, articles the product of Costa Rica, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["CR"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.95",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.34",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Dominican Republic",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.95, articles the product of Dominican Republic, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["DO"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.95",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.35",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Ecuador",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.06.18–9903.06.19, articles the product of Ecuador, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["EC"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.06.18",
      "9903.06.19",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.36",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Egypt",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Egypt, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["EG"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.37",
    program: PROGRAM,
    name: "Section 301 Forced Labor – El Salvador",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, 9903.05.95 and 9903.06.07–9903.06.09, articles the product of El Salvador, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["SV"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.95",
      "9903.06.07",
      "9903.06.08",
      "9903.06.09",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.38",
    program: PROGRAM,
    name: "Section 301 Forced Labor – the European Union (Base Duty 10% or More)",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.97, articles the product of a member state of the European Union, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 10 percent, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: [{ list: "eu-members" }],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 10 }],
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.97",
    ],
    rate: { kind: "free" },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.39",
    program: PROGRAM,
    name: "Section 301 Forced Labor – the European Union (10% Including Base Duty)",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.97, articles the product of a member state of the European Union, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 10 percent, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: [{ list: "eu-members" }],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: "<", pct: 10 }],
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.97",
    ],
    rate: { kind: "topUpTo", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.40",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Guatemala",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, 9903.05.95 and 9903.06.04–9903.06.06, articles the product of Guatemala, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["GT"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.95",
      "9903.06.04",
      "9903.06.05",
      "9903.06.06",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.41",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Guyana",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Guyana, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["GY"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.42",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Honduras",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.95, articles the product of Honduras, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["HN"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.95",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.43",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Hong Kong, China",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Hong Kong, China, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["HK"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.44",
    program: PROGRAM,
    name: "Section 301 Forced Labor – India",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of India, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["IN"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.45",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Indonesia",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.06.16–9903.06.17, articles the product of Indonesia, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["ID"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.06.16",
      "9903.06.17",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.46",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Iraq",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Iraq, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["IQ"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.47",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Israel",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Israel, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["IL"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.48",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Japan (Base Duty 12.5% or More)",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Japan, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 12.5 percent, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["JP"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 12.5 }],
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "free" },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.49",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Japan (12.5% Including Base Duty)",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Japan, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 12.5 percent, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["JP"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: "<", pct: 12.5 }],
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "topUpTo", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.50",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Jordan",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.06.20–9903.06.21, articles the product of Jordan, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["JO"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.06.20",
      "9903.06.21",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.51",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Kazakhstan",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Kazakhstan, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["KZ"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.52",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Kuwait",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Kuwait, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["KW"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.53",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Libya",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Libya, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["LY"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.54",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Malaysia",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.99–9903.06.01, articles the product of Malaysia, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["MY"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.99",
      "9903.06.01",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.55",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Mexico",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.94, articles the product of Mexico, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["MX"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.94",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.56",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Morocco",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Morocco, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["MA"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.57",
    program: PROGRAM,
    name: "Section 301 Forced Labor – New Zealand",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of New Zealand, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["NZ"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.58",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Nicaragua",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.95, articles the product of Nicaragua, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["NI"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.95",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.59",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Nigeria",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Nigeria, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["NG"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.60",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Norway",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Norway, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["NO"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.61",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Oman",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Oman, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["OM"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.62",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Pakistan",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Pakistan, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["PK"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.63",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Peru",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Peru, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["PE"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.64",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Philippines",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of the Philippines, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["PH"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.65",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Qatar",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Qatar, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["QA"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.66",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Russia",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Russia, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["RU"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2 is the same as column 1 (+ 12.5%), so it applies to Column 2 countries too
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.67",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Saudi Arabia",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Saudi Arabia, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["SA"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.68",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Singapore",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Singapore, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["SG"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.69",
    program: PROGRAM,
    name: "Section 301 Forced Labor – South Africa",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of South Africa, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["ZA"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.70",
    program: PROGRAM,
    name: "Section 301 Forced Labor – South Korea (Base Duty 12.5% or More)",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of South Korea, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 12.5 percent, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["KR"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 12.5 }],
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "free" },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.71",
    program: PROGRAM,
    name: "Section 301 Forced Labor – South Korea (12.5% Including Base Duty)",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of South Korea, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 12.5 percent, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["KR"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: "<", pct: 12.5 }],
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "topUpTo", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.72",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Sri Lanka",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Sri Lanka, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["LK"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.73",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Switzerland (Base Duty 12.5% or More)",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.98, articles the product of Switzerland, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 12.5 percent, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["CH"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 12.5 }],
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.98",
    ],
    rate: { kind: "free" },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.74",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Switzerland (12.5% Including Base Duty)",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.98, articles the product of Switzerland, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 12.5 percent, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["CH"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: "<", pct: 12.5 }],
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.98",
    ],
    rate: { kind: "topUpTo", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.75",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Taiwan (Base Duty 10% or More)",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.06.14–9903.06.15, articles the product of Taiwan, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 10 percent, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["TW"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 10 }],
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.06.14",
      "9903.06.15",
    ],
    rate: { kind: "free" },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.76",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Taiwan (10% Including Base Duty)",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.06.14–9903.06.15, articles the product of Taiwan, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 10 percent, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["TW"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: "<", pct: 10 }],
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.06.14",
      "9903.06.15",
    ],
    rate: { kind: "topUpTo", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.77",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Thailand",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Thailand, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["TH"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.78",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Trinidad and Tobago",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Trinidad and Tobago, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["TT"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.79",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Türkiye",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Türkiye, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["TR"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.80",
    program: PROGRAM,
    name: "Section 301 Forced Labor – United Arab Emirates",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of the United Arab Emirates, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["AE"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.81",
    program: PROGRAM,
    name: "Section 301 Forced Labor – United Kingdom",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92 and 9903.05.96, articles the product of the United Kingdom, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
      "9903.05.96",
    ],
    rate: { kind: "adValorem", pct: 10 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.82",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Uruguay",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Uruguay, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["UY"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.83",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Venezuela",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Venezuela, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["VE"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.84",
    program: PROGRAM,
    name: "Section 301 Forced Labor – Vietnam",
    description:
      "Except for products described in headings 9903.05.85–9903.05.92, articles the product of Vietnam, as provided for in U.S. note 52 to this subchapter",
    scope: {
      countries: ["VN"],
      codes: "all",
    },
    exceptions: [
      "9903.05.85",
      "9903.05.86",
      "9903.05.87",
      "9903.05.88",
      "9903.05.89",
      "9903.05.90",
      "9903.05.91",
      "9903.05.92",
    ],
    rate: { kind: "adValorem", pct: 12.5 },
    // Column 2: "The duty provided in the applicable subheading" (no additional duty)
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(a)" },
  },
  {
    code: "9903.05.85",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Articles Loaded Before July 24, Entered Before July 28",
    description:
      "Articles that (1) were loaded onto a vessel at the port of loading and in transit on the final mode of transit prior to entry into the United States before 12:01 a.m. eastern time on July 24, 2026; and (2) are entered for consumption, or withdrawn from warehouse for consumption, before 12:01 a.m. eastern time on July 28, 2026",
    scope: {
      countries: "all",
      codes: "all",
    },
    requires: [
      { kind: "dateBefore", input: "loadingDate", date: "2026-07-24" },
    ],
    rate: { kind: "free" },
    effective: { from: FROM, to: "2026-07-28" },
    source: SOURCE,
  },
  {
    code: "9903.05.86",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products",
    description:
      "Articles provided for in subdivision (b) of U.S. note 52 to this subchapter",
    scope: {
      countries: "all",
      codes: [{ list: "forcedLabor52b" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(b)" },
  },
  {
    code: "9903.05.87",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products",
    description:
      "Articles provided for in subdivision (c) of U.S. note 52 to this subchapter",
    scope: {
      countries: "all",
      codes: [{ list: "forcedLabor52c" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(c)" },
  },
  {
    code: "9903.05.88",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Civil Aircraft Articles",
    description:
      "Articles of civil aircraft (all aircraft other than military aircraft); their engines, parts and components; their other parts, components and subassemblies; and ground flight simulators and their parts and components, as provided for in subdivision (d) of U.S. note 52 to this subchapter",
    scope: {
      countries: "all",
      codes: [{ list: "forcedLabor52d" }],
    },
    requires: [confirm("9903.05.88")],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(d); must meet general note 6" },
  },
  {
    code: "9903.05.89",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Articles for Use in Pharmaceutical Applications",
    description:
      "Articles for use in pharmaceutical applications, as provided for in subdivision (e) of U.S. note 52 to this subchapter",
    scope: {
      countries: "all",
      codes: [{ list: "forcedLabor52e" }],
    },
    requires: [confirm("9903.05.89")],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: {
      ...SOURCE,
      note: "U.S. note 52(e); an end-use test, so it's confirmed",
    },
  },
  ...tariffVersions(
    {
      code: "9903.05.90",
      program: PROGRAM,
      name: "Section 301 Forced Labor Exemption: Section 232 Articles",
      description:
        "Articles of aluminum, of steel or of copper or derivative aluminum or steel articles; passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans) and light trucks; parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans) and light trucks; medium- and heavy-duty vehicles; parts of medium- and heavy-duty vehicles; wood products; and semiconductor articles, as provided in subdivision (f) of U.S. note 52 to this subchapter",
      scope: {
        countries: "all",
        codes: "all",
        // Note 52(f)(1)–(7): the same headings as note 2(aa)(v)
        whenApplies: { codes: section232ArticleHeadingsFromJune8 },
      },
      rate: { kind: "free" },
      effective: { from: FROM },
      source: { ...SOURCE, note: "U.S. note 52(f)" },
    },
    [
      {
        from: "2026-07-31",
        set: {
          description:
            "Articles of aluminum, of steel or of copper or derivative aluminum or steel articles; passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans) and light trucks; parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans) and light trucks; medium- and heavy-duty vehicles; parts of medium- and heavy-duty vehicles; wood products; patented pharmaceutical articles; and semiconductor articles, as provided in subdivision (f) of U.S. note 52 to this subchapter",
          scope: {
            countries: "all",
            codes: "all",
            // Note 52(f)(1)–(8): (8) adds patented pharmaceuticals, 9903.04.60–.66
            whenApplies: { codes: section232ArticleHeadingsFromJuly31 },
          },
        },
        source: {
          revision: "2026HTSRev14",
          citation: "Notice",
          note: "U.S. note 52(f)(8)",
        },
      },
    ],
  ),
  {
    code: "9903.05.91",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Donations",
    description:
      "Articles that are donations by persons subject to the jurisdiction of the United States, such as food, clothing and medicine, intended to be used to relieve human suffering",
    scope: {
      countries: "all",
      codes: "all",
    },
    requires: [{ kind: "answer", input: "isDonation", equals: true }],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: SOURCE,
  },
  {
    code: "9903.05.92",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Informational Materials",
    description:
      "Articles that are informational materials, including but not limited to publications, films, posters, phonograph records, photographs, microfilms, microfiche, tapes, compact disks, CD ROMs, artworks and news wire feeds",
    scope: {
      countries: "all",
      codes: "all",
    },
    requires: [
      { kind: "answer", input: "isInformationalMaterial", equals: true },
    ],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: SOURCE,
  },
  {
    code: "9903.05.93",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Articles of Canada Entered via USMCA",
    description:
      "Articles the product of Canada, as provided for in subdivision (g) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["CA"],
      codes: "all",
    },
    requires: [{ kind: "preferenceClaimed", symbols: ["S", "S+"] }],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(g)" },
  },
  {
    code: "9903.05.94",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Articles of Mexico Entered via USMCA",
    description:
      "Articles the product of Mexico, as provided for in subdivision (h) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["MX"],
      codes: "all",
    },
    requires: [{ kind: "preferenceClaimed", symbols: ["S", "S+"] }],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(h)" },
  },
  {
    code: "9903.05.95",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Textiles or Apparel Entered via CAFTA-DR",
    description:
      "Articles of textiles or apparel the product of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras or Nicaragua, as provided for in subdivision (i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["CR", "DO", "SV", "GT", "HN", "NI"],
      codes: "all",
    },
    requires: [
      { kind: "preferenceClaimed", symbols: ["P", "P+"] },
      confirm("9903.05.95"),
    ],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: {
      ...SOURCE,
      note: "U.S. note 52(i); a textile or apparel good under general note 29(d)(v)",
    },
  },
  {
    code: "9903.05.96",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Articles of the United Kingdom",
    description:
      "Articles the product of the United Kingdom, as provided for in subdivision (j)(1) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: [{ list: "forcedLabor52j1" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(1)" },
  },
  {
    code: "9903.05.97",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Articles of the European Union",
    description:
      "Articles the product of a member state of the European Union, as provided for in subdivision (j)(2) of U.S. note 52 to this subchapter",
    scope: {
      countries: [{ list: "eu-members" }],
      codes: [{ list: "forcedLabor52j2" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(2)" },
  },
  {
    code: "9903.05.98",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Articles of Switzerland",
    description:
      "Articles the product of Switzerland, as provided for in subdivision (j)(3) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["CH"],
      codes: [{ list: "forcedLabor52j3" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(3)" },
  },
  {
    code: "9903.05.99",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products of Malaysia",
    description:
      "Articles the product of Malaysia, as provided for in subdivision (j)(4)(i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["MY"],
      codes: [{ list: "forcedLabor52j4i" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(4)(i)" },
  },
  {
    code: "9903.06.01",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products of Malaysia",
    description:
      "Articles the product of Malaysia, as provided for in subdivision (j)(4)(ii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["MY"],
      codes: [{ list: "forcedLabor52j4ii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(4)(ii)" },
  },
  {
    code: "9903.06.02",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products of Cambodia",
    description:
      "Articles the product of Cambodia, as provided for in subdivision (j)(5)(i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["KH"],
      codes: [{ list: "forcedLabor52j5i" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(5)(i)" },
  },
  {
    code: "9903.06.03",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products of Cambodia",
    description:
      "Articles the product of Cambodia, as provided for in subdivision (j)(5)(ii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["KH"],
      codes: [{ list: "forcedLabor52j5ii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(5)(ii)" },
  },
  {
    code: "9903.06.04",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products of Guatemala",
    description:
      "Articles the product of Guatemala, as provided for in subdivision (j)(6)(i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["GT"],
      codes: [{ list: "forcedLabor52j6i" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(6)(i)" },
  },
  {
    code: "9903.06.05",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products of Guatemala",
    description:
      "Articles the product of Guatemala, as provided for in subdivision (j)(6)(ii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["GT"],
      codes: [{ list: "forcedLabor52j6ii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(6)(ii)" },
  },
  {
    code: "9903.06.06",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Articles of Guatemala Entered via CAFTA-DR",
    description:
      "Articles of textiles or apparel the product of Guatemala, as provided for in subdivision (j)(6)(iii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["GT"],
      codes: [{ list: "forcedLabor52j6iii" }],
    },
    requires: [{ kind: "preferenceClaimed", symbols: ["P", "P+"] }],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(6)(iii)" },
  },
  {
    code: "9903.06.07",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products of El Salvador",
    description:
      "Articles the product of El Salvador, as provided for in subdivision (j)(7)(i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["SV"],
      codes: [{ list: "forcedLabor52j7i" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(7)(i)" },
  },
  {
    code: "9903.06.08",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products of El Salvador",
    description:
      "Articles the product of El Salvador, as provided for in subdivision (j)(7)(ii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["SV"],
      codes: [{ list: "forcedLabor52j7ii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(7)(ii)" },
  },
  {
    code: "9903.06.09",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Articles of El Salvador Entered via CAFTA-DR",
    description:
      "Articles of textiles or apparel the product of El Salvador, as provided for in subdivision (j)(7)(iii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["SV"],
      codes: [{ list: "forcedLabor52j7iii" }],
    },
    requires: [{ kind: "preferenceClaimed", symbols: ["P", "P+"] }],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(7)(iii)" },
  },
  {
    code: "9903.06.10",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products of Argentina",
    description:
      "Articles the product of Argentina, as provided for in subdivision (j)(8)(i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["AR"],
      codes: [{ list: "forcedLabor52j8i" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(8)(i)" },
  },
  {
    code: "9903.06.11",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products of Argentina",
    description:
      "Articles the product of Argentina, as provided for in subdivision (j)(8)(ii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["AR"],
      codes: [{ list: "forcedLabor52j8ii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(8)(ii)" },
  },
  {
    code: "9903.06.12",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products of Bangladesh",
    description:
      "Articles the product of Bangladesh, as provided for in subdivision (j)(9)(i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["BD"],
      codes: [{ list: "forcedLabor52j9i" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(9)(i)" },
  },
  {
    code: "9903.06.13",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products of Bangladesh",
    description:
      "Articles the product of Bangladesh, as provided for in subdivision (j)(9)(ii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["BD"],
      codes: [{ list: "forcedLabor52j9ii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(9)(ii)" },
  },
  {
    code: "9903.06.14",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products of Taiwan",
    description:
      "Articles the product of Taiwan, as provided for in subdivision (j)(10)(i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["TW"],
      codes: [{ list: "forcedLabor52j10i" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(10)(i)" },
  },
  {
    code: "9903.06.15",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products of Taiwan",
    description:
      "Articles the product of Taiwan, as provided for in subdivision (j)(10)(ii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["TW"],
      codes: [{ list: "forcedLabor52j10ii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(10)(ii)" },
  },
  {
    code: "9903.06.16",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products of Indonesia",
    description:
      "Articles the product of Indonesia, as provided for in subdivision (j)(11)(i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["ID"],
      codes: [{ list: "forcedLabor52j11i" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(11)(i)" },
  },
  {
    code: "9903.06.17",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products of Indonesia",
    description:
      "Articles the product of Indonesia, as provided for in subdivision (j)(11)(ii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["ID"],
      codes: [{ list: "forcedLabor52j11ii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(11)(ii)" },
  },
  {
    code: "9903.06.18",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products of Ecuador",
    description:
      "Articles the product of Ecuador, as provided for in subdivision (j)(12)(i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["EC"],
      codes: [{ list: "forcedLabor52j12i" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(12)(i)" },
  },
  {
    code: "9903.06.19",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products of Ecuador",
    description:
      "Articles the product of Ecuador, as provided for in subdivision (j)(12)(ii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["EC"],
      codes: [{ list: "forcedLabor52j12ii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(12)(ii)" },
  },
  {
    code: "9903.06.20",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Listed Products of Jordan",
    description:
      "Articles the product of Jordan, as provided for in subdivision (j)(13)(i) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["JO"],
      codes: [{ list: "forcedLabor52j13i" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(13)(i)" },
  },
  {
    code: "9903.06.21",
    program: PROGRAM,
    name: "Section 301 Forced Labor Exemption: Described Products of Jordan",
    description:
      "Articles the product of Jordan, as provided for in subdivision (j)(13)(ii) of U.S. note 52 to this subchapter",
    scope: {
      countries: ["JO"],
      codes: [{ list: "forcedLabor52j13ii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 52(j)(13)(ii)" },
  },
];
