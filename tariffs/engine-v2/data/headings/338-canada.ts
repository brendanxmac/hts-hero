// Section 338 – Canada: U.S. note 51 to subchapter III and headings 9903.03.12–.16, from
// 2026HTSRev17 (Proclamations 11046, 11047, 11048 and 11056, effective 2026-08-22). See
// HowTariffsWork.md §6.
//
// 51(a): the duties apply to the listed products of Canada, stack with every other additional duty
// in this subchapter and subchapter IV (except as in (c) and (d)), and apply even when special
// tariff treatment is claimed (general note 3(c)(i), so USMCA too). The context mentions a
// temporary suspension, but the HTS text has none; applied as written (decision, Oct 3, 2026).
import { Tariff } from "../../types"
import { confirm } from "../confirmations"
import { tariffVersions } from "../../versioning"
import { section232ArticleHeadingsFromJuly31 } from "./122"

const PROGRAM = "338-canada"
const FROM = "2026-08-22"
const SOURCE = { revision: "2026HTSRev17", citation: "Proclamations 11046, 11047, 11048, 11056" }
const EXCEPTIONS = ["9903.03.15", "9903.03.16"]
// Column 2: "No change"
const COLUMN2_FREE = { column2: { kind: "free" } }

const duty = (code: string, subdivision: string, list: string, proclamation: string): Tariff => ({
  code,
  program: PROGRAM,
  name: `Section 338 – Canada (note 51${subdivision})`,
  description: `Articles the product of Canada as provided in subdivision ${subdivision} of U.S. note 51 to this subchapter`,
  scope: {
    countries: ["CA"],
    codes: [{ list }],
  },
  exceptions: EXCEPTIONS,
  rate: { kind: "adValorem", pct: 50 },
  rateByColumn: COLUMN2_FREE,
  effective: { from: FROM },
  source: { revision: "2026HTSRev17", citation: `${proclamation}, Proclamation 11056`, note: `U.S. note 51(a), ${subdivision}` },
})

// 2026HTSRev19, 51(c): "the additional duties imposed by heading 9903.03.13 shall not apply to"
// Section 232 goods (was headings 9903.03.12–9903.03.14), from September 15, 2026 (PP 11064, PP
// 11065). So .12 and .14 stack with Section 232 from then; only .13 keeps the .15 exemption.
const without232Exemption = (proclamation: string) => ({
  from: "2026-09-15",
  set: { exceptions: ["9903.03.16"] },
  source: { revision: "2026HTSRev19", citation: proclamation, note: "U.S. note 51(c): the Section 232 exemption (9903.03.15) now covers only 9903.03.13" },
})

export const headings: Tariff[] = [
  ...tariffVersions(duty("9903.03.12", "(b)(1)", "canada338b1", "Proclamation 11046"), [without232Exemption("Proclamation 11064")]),
  duty("9903.03.13", "(b)(2)", "canada338b2", "Proclamation 11047"),
  ...tariffVersions(duty("9903.03.14", "(b)(3)", "canada338b3", "Proclamation 11048"), [without232Exemption("Proclamation 11065")]),
  {
    code: "9903.03.15",
    program: PROGRAM,
    name: "Section 338 Canada Exemption: Section 232 Articles",
    description:
      "Articles of aluminum, of steel or of copper or derivative aluminum or steel articles; passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans) and light trucks; parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans and cargo vans) and light trucks; medium- and heavy-duty vehicles; parts of medium- and heavy-duty vehicles; wood products; semiconductor articles; and patented pharmaceutical articles, as provided in subdivision (c) of U.S. note 51 to this subchapter",
    scope: {
      countries: ["CA"],
      codes: "all",
      // Note 51(c)(1)–(8): the same headings as notes 50(a)(vi) and 52(f)
      whenApplies: { codes: section232ArticleHeadingsFromJuly31 },
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 51(c)" },
  },
  {
    code: "9903.03.16",
    program: PROGRAM,
    name: "Section 338 Canada Exemption: Civil Aircraft Articles",
    description:
      "Articles of civil aircraft (all aircraft other than military aircraft and unmanned aircraft); their engines, parts and components; their other parts, components and subassemblies; and ground flight simulators and their parts and components the product of Canada, as provided for in subdivision (d) of U.S. note 51 to this subchapter",
    scope: {
      countries: ["CA"],
      codes: [{ list: "canada338d" }],
    },
    // Must meet the criteria of general note 6
    requires: [confirm("9903.03.16")],
    rate: { kind: "free" },
    effective: { from: FROM },
    // The change record dates 51(d)'s modification 8/12/2026, a typo for 8/22 (decision)
    source: { ...SOURCE, note: "U.S. note 51(d)" },
  },
]
