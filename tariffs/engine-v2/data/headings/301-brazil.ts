// Section 301 – Brazil: U.S. note 50 to subchapter III and headings 9903.05.01–.09, from
// 2026HTSRev12 (Notice effective 2026-07-22). The structure copies Section 122's note 2(aa) and
// headings 9903.03.01–.11. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { tariffVersions } from "../../versioning"
import { confirm } from "../confirmations"
import { section232ArticleHeadingsFromJuly31, section232ArticleHeadingsFromJune8 } from "./122"

const FROM = "2026-07-22"
const SOURCE = { revision: "2026HTSRev12", citation: "Notice" }

export const headings: Tariff[] = [
  {
    code: "9903.05.01",
    program: "301-brazil",
    name: "Section 301 – Brazil",
    description:
      "Except for products described in headings 9903.05.02–9903.05.09, articles the product of Brazil, as provided for in subdivision (a) of U.S. note 50 to this subchapter",
    // Note 50(a)(i): also subject to any other additional duty in this subchapter or subchapter
    // IV, and applies even when special tariff treatment (general note 3(c)(i)) is claimed
    scope: {
      countries: ["BR"],
      codes: "all",
    },
    exceptions: [
      "9903.05.02",
      "9903.05.03",
      "9903.05.04",
      "9903.05.05",
      "9903.05.06",
      "9903.05.07",
      "9903.05.08",
      "9903.05.09",
    ],
    rate: { kind: "adValorem", pct: 25 },
    rateByColumn: { column2: { kind: "free" } },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 50(a)(i)" },
  },
  {
    code: "9903.05.02",
    program: "301-brazil",
    name: "Section 301 Brazil Exemption: Articles Loaded Before July 22, Entered Before July 29",
    description:
      "Articles the product of Brazil that (1) were loaded onto a vessel at the port of loading and in transit on the final mode of transit prior to entry into the United States before 12:01 a.m. eastern time on July 22, 2026; and (2) are entered for consumption, or withdrawn from warehouse for consumption, before 12:01 a.m. eastern time on July 29, 2026",
    scope: {
      countries: ["BR"],
      codes: "all",
    },
    requires: [{ kind: "dateBefore", input: "loadingDate", date: "2026-07-22" }],
    rate: { kind: "free" },
    effective: { from: FROM, to: "2026-07-29" },
    source: SOURCE,
  },
  {
    code: "9903.05.03",
    program: "301-brazil",
    name: "Section 301 Brazil Exemption: Specific Articles",
    description:
      "Articles the product of Brazil, as provided for in subdivision (a)(ii) of U.S. note 50 to this subchapter",
    scope: {
      countries: ["BR"],
      codes: [{ list: "brazilExempt50aii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 50(a)(ii)" },
  },
  {
    code: "9903.05.04",
    program: "301-brazil",
    name: "Section 301 Brazil Exemption: Particular Articles",
    description:
      "Articles the product of Brazil, as provided for in subdivision (a)(iii) of U.S. note 50 to this subchapter",
    scope: {
      countries: ["BR"],
      codes: [{ list: "brazilExempt50aiii" }],
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 50(a)(iii)" },
  },
  {
    code: "9903.05.05",
    program: "301-brazil",
    name: "Section 301 Brazil Exemption: Civil Aircraft Articles",
    description:
      "Articles of civil aircraft (all aircraft other than military aircraft); their engines, parts and components; their other parts, components and subassemblies; and ground flight simulators and their parts and components of Brazil, as provided for in subdivision (a)(iv) of U.S. note 50 to this subchapter",
    scope: {
      countries: ["BR"],
      codes: [{ list: "brazilCivilAircraft50aiv" }],
    },
    // Must meet the criteria of general note 6
    requires: [confirm("9903.05.05")],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 50(a)(iv)" },
  },
  {
    code: "9903.05.06",
    program: "301-brazil",
    name: "Section 301 Brazil Exemption: Articles for Use in Pharmaceutical Applications",
    description:
      "Articles the product of Brazil that are articles for use in pharmaceutical applications, as provided for in subdivision (a)(v) of U.S. note 50 to this subchapter",
    scope: {
      countries: ["BR"],
      codes: [{ list: "brazilPharma50av" }],
    },
    // An end-use test ("for use in pharmaceutical applications"), so it's confirmed
    requires: [confirm("9903.05.06")],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 50(a)(v)" },
  },
  ...tariffVersions(
  {
    code: "9903.05.07",
    program: "301-brazil",
    name: "Section 301 Brazil Exemption: Section 232 Articles",
    description:
      "Articles of aluminum, of steel, or of copper or derivative aluminum or steel articles; passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks; parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks; medium- and heavy-duty vehicles; parts of medium- and heavy-duty vehicles; wood products; and semiconductor articles, of Brazil, as provided in subdivision (a)(vi) of U.S. note 50 to this subchapter",
    scope: {
      countries: ["BR"],
      codes: "all",
      // Note 50(a)(vi)(1)–(7): the same headings as note 2(aa)(v)
      whenApplies: { codes: section232ArticleHeadingsFromJune8 },
    },
    rate: { kind: "free" },
    effective: { from: FROM },
    source: { ...SOURCE, note: "U.S. note 50(a)(vi)" },
  },
    [
      {
        from: "2026-07-31",
        set: {
          description:
            "Articles of aluminum, of steel, or of copper or derivative aluminum or steel articles; passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks; parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks; medium- and heavy-duty vehicles; parts of medium- and heavy-duty vehicles; wood products; patented pharmaceutical articles; and semiconductor articles, of Brazil, as provided in subdivision (a)(vi) of U.S. note 50 to this subchapter",
          scope: {
            countries: ["BR"],
            codes: "all",
            // Note 50(a)(vi)(1)–(8): (8) adds patented pharmaceuticals, 9903.04.60–.66
            whenApplies: { codes: section232ArticleHeadingsFromJuly31 },
          },
        },
        source: { revision: "2026HTSRev14", citation: "Notice", note: "U.S. note 50(a)(vi)(8)" },
      },
    ],
  ),
  {
    code: "9903.05.08",
    program: "301-brazil",
    name: "Section 301 Brazil Exemption: Donation",
    description:
      "Articles the product of Brazil that are donations by persons subject to the jurisdiction of the United States, such as food, clothing and medicine, intended to be used to relieve human suffering",
    scope: {
      countries: ["BR"],
      codes: "all",
    },
    requires: [{ kind: "answer", input: "isDonation", equals: true }],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: SOURCE,
  },
  {
    code: "9903.05.09",
    program: "301-brazil",
    name: "Section 301 Brazil Exemption: Information Material",
    description:
      "Articles the product of Brazil that are informational materials, including but not limited to publications, films, posters, phonograph records, photographs, microfilms, microfiche, tapes, compact disks, CD ROMs, artworks and news wire feeds",
    scope: {
      countries: ["BR"],
      codes: "all",
    },
    requires: [{ kind: "answer", input: "isInformationalMaterial", equals: true }],
    rate: { kind: "free" },
    effective: { from: FROM },
    source: SOURCE,
  },
]
