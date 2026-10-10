// Migrated from the legacy tariff data (2026HTSRev5), then reviewed by hand. The legacy engine
// was removed on Oct 1, 2026; this file is now the source. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"
import { tariffVersions } from "../../versioning"

export const headings: Tariff[] = [
  {
    code: "9903.96.01",
    program: "aircraft-agreements",
    name: "Civil Aircraft, Engines and Parts of the United Kingdom",
    description:
      "Effective with respect to entries on or after June 30, 2025, articles of civil aircraft (all aircraft other than military aircraft); their engines, parts, and components; their other parts, components, and subassemblies; and ground flight simulators and their parts and components of the United Kingdom, classified in the subheadings enumerated in subdivision (a) of U.S. note 35 to this subchapter",
    scope: {
      countries: ["GB"],
      codes: [
        { list: "civilAircraftAndPartsOf" },
        { list: "civilAircraftArticleExemptFromSection122Tariff" },
      ],
    },
    requires: [confirm("9903.96.01")],
    rate: { kind: "free" },
    effective: { from: "2025-06-30" },
    source: {
      revision: "2026HTSRev9",
      citation: "90 FR 27851",
      note: "Description from 2026HTSRev9 (effective date filled in); unchanged otherwise",
    },
  },
  {
    code: "9903.02.72",
    program: "deal-jp",
    name: "Japan Deal Tariff (Base Duty 15% or More)",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33 and 9903.02.78, and except as provided for in headings 9903.01.34, 9903.02.01, and 9903.96.02, articles the product of Japan, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    scope: {
      countries: ["JP"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }],
    exceptions: [
      "9903.01.30",
      "9903.01.31",
      "9903.01.32",
      "9903.01.33",
      "9903.02.78",
      "9903.01.34",
      "9903.02.01",
      "9903.96.02",
    ],
    rate: { kind: "free" },
    effective: { to: "2026-02-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "Corrected to the 2026HTSRev3 text (Oct 2026): description, and exceptions as the heading lists them; Section 232 goods go through 9903.01.33, which spares only the metal content of steel and aluminum articles. IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE",
    },
  },
  {
    code: "9903.02.73",
    program: "deal-jp",
    name: "Japan Deal Tariff (15% Including Base Duty)",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33 and 9903.02.78, and except as provided for in headings 9903.01.34, 9903.02.01, and 9903.96.02, articles the product of Japan, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    scope: {
      countries: ["JP"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: "<", pct: 15 }],
    exceptions: [
      "9903.01.30",
      "9903.01.31",
      "9903.01.32",
      "9903.01.33",
      "9903.02.78",
      "9903.01.34",
      "9903.02.01",
      "9903.96.02",
    ],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: { to: "2026-02-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "Corrected to the 2026HTSRev3 text (Oct 2026): description, and exceptions as the heading lists them; Section 232 goods go through 9903.01.33, which spares only the metal content of steel and aluminum articles. IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE",
    },
  },
  {
    code: "9903.96.02",
    program: "aircraft-agreements",
    name: "Articles of Civil Aircraft of Japan",
    description:
      "Articles of civil aircraft (all aircraft other than military aircraft); their engines, parts, and components; their other parts, components, and subassemblies; and ground flight simulators and their parts and components of Japan, excluding unmanned aircraft, classified in the subheadings enumerated in subdivision (b) of U.S. note 35 to this subchapter.",
    scope: {
      countries: ["JP"],
      codes: [{ list: "civilAircraftAndPartsOf" }],
    },
    exceptions: ["9903.94.06"],
    requires: [confirm("9903.96.02")],
    rate: { kind: "free" },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
  {
    code: "9903.96.03",
    program: "aircraft-agreements",
    name: "Civil Aircraft Components of Taiwan (Exempt From Section 232 Metals)",
    description:
      "Civil aircraft (all aircraft other than military aircraft and unmanned aircraft) components that are products of Taiwan, provided for in subdivision (c) of U.S. note 35 to this subchapter",
    scope: {
      countries: ["TW"],
      codes: [{ list: "civilAircraftComponents35c" }],
    },
    // Components must meet General Note 6 criteria, which the calculator can't check
    requires: [confirm("9903.96.03")],
    rate: { kind: "free" },
    effective: { from: "2026-05-01" },
    source: {
      revision: "2026HTSRev9",
      citation:
        "Commerce/USTR notice, Implementing Certain Tariff-Related Elements of a Trade and Security Agreement Between the American Institute in Taiwan and the Taipei Economic and Cultural Representative Office in the United States, Annex, 91 FR 31818 (FR Doc. 2026-10571)",
      url: "https://www.govinfo.gov/content/pkg/FR-2026-05-28/html/2026-10571.htm",
      publishedOn: "2026-05-28",
      note: "U.S. note 35(c); the notice, effective 2026-05-01 (retroactive). Removes the metals duties via a noStack interaction",
    },
  },
  {
    code: "9903.02.74",
    program: "deal-eu",
    name: "European Union Deal Exemption: Listed Products",
    description:
      "Articles the product of the European Union, as provided for in subdivision (v)(xx) of U.S. note 2 to this subchapter",
    scope: {
      countries: [{ list: "eu-members" }],
      // TODO(list): "9903.02.74" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.02.74" }],
    },
    rate: { kind: "free" },
    effective: { to: "2026-02-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE",
    },
  },
  {
    code: "9903.02.75",
    program: "deal-eu",
    name: "European Union Deal Exemption: Essential Oils",
    description:
      "Articles the product of the European Union, as provided for in subdivision (v)(xxi) of U.S. note 2 to this subchapter",
    scope: {
      countries: [{ list: "eu-members" }],
      // TODO(list): "9903.02.75" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.02.75" }],
    },
    rate: { kind: "free" },
    effective: { to: "2026-02-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE",
    },
  },
  // Its IEEPA role ended Feb 24, 2026, but the Section 232 civil aircraft reduction it implements
  // (U.S. note 2(v)(xxii)) continues: Proclamation 11021 clause (10) "does not alter or supersede"
  // those agreements. The metals exemption is a noStack in interactions.ts.
  ...tariffVersions(
    {
      code: "9903.02.76",
      program: "deal-eu",
      name: "European Union Deal Exemption: Civil Aircraft",
      description:
        "Articles of civil aircraft (all aircraft other than military aircraft); their engines, parts, and components; their other parts, components, and subassemblies; and ground flight simulators and their parts and components of the European Union, excluding unmanned aircraft, provided for in subdivision (v)(xxii) of U.S. note 2 to this subchapter",
      scope: {
        countries: [{ list: "eu-members" }],
        // TODO(list): "9903.02.76" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
        codes: [{ list: "9903.02.76" }],
      },
      requires: [confirm("9903.02.76")],
      rate: { kind: "free" },
      effective: {},
      source: {
        revision: "2026HTSRev5",
        citation: "EO 14389; CSMS # 67834313",
        url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
        publishedOn: "2026-02-20",
        note: "IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE",
      },
    },
    [
      {
        from: "2026-02-24",
        set: {
          program: "aircraft-agreements",
          name: "Articles of Civil Aircraft of the European Union (Section 232 Exemption)",
          description:
            "Articles of civil aircraft (all aircraft other than military aircraft); their engines, parts, and components; their other parts, components, and subassemblies; and ground flight simulators and their parts and components of the European Union, excluding unmanned aircraft, provided for in subdivision (v)(xxii) of U.S. note 2 to this subchapter",
        },
        source: {
          revision: "2026HTSRev5",
          citation: "Proclamation 11021, clause (10)",
          url: "https://www.govinfo.gov/content/pkg/FR-2026-04-09/html/2026-06960.htm",
          publishedOn: "2026-04-02",
          note: "Section 232 civil aircraft reduction continues after IEEPA ended (U.S. note 2(v)(xxii)). Correction: previously ended on Feb 24, 2026 with the IEEPA headings",
        },
      },
    ],
  ),
  {
    code: "9903.02.77",
    program: "deal-eu",
    name: "European Union Deal Exemption: Non-Patented Pharmaceutical Articles",
    description:
      "Articles the product of the European Union that are non-patented articles for use in pharmaceutical applications, provided for in subdivision (v)(xxiii) of U.S. note 2 to this subchapter",
    scope: {
      countries: [{ list: "eu-members" }],
      // TODO(list): "9903.02.77" is the migrated legacy list for this heading. Replace it with a list named after its U.S. note subdivision.
      codes: [{ list: "9903.02.77" }],
    },
    requires: [confirm("9903.02.77")],
    rate: { kind: "free" },
    effective: { to: "2026-02-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE",
    },
  },
  {
    code: "9903.02.19",
    program: "deal-eu",
    name: "European Union Deal Tariff (Base Duty 15% or More)",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025,except for products described in headings 9903.01.30–9903.01.33 and 9903.02.78 and 9903.02.74–9903.02.77, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of the European Union, with an ad valorem (or ad valorem equivalent) rate of duty under column 1-General equal to or greater than 15 percent, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    scope: {
      countries: [{ list: "eu-members" }],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }],
    exceptions: [
      "9903.01.30",
      "9903.01.31",
      "9903.01.32",
      "9903.01.33",
      "9903.02.78",
      "9903.02.74",
      "9903.02.75",
      "9903.02.76",
      "9903.02.77",
      "9903.01.34",
      "9903.02.01",
    ],
    rate: { kind: "free" },
    effective: { to: "2026-02-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "Corrected to the 2026HTSRev3 text (Oct 2026): description, and exceptions as the heading lists them; Section 232 goods go through 9903.01.33, which spares only the metal content of steel and aluminum articles. IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE",
    },
  },
  {
    code: "9903.02.20",
    program: "deal-eu",
    name: "European Union Deal Tariff (15% Including Base Duty)",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30–9903.01.33 and 9903.02.78 and 9903.02.74–9903.02.77, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of the European Union, with an ad valorem (or ad valorem equivalent) rate of duty under column 1-General less than 15 percent, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    scope: {
      countries: [{ list: "eu-members" }],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: "<", pct: 15 }],
    exceptions: [
      "9903.01.30",
      "9903.01.31",
      "9903.01.32",
      "9903.01.33",
      "9903.02.78",
      "9903.02.74",
      "9903.02.75",
      "9903.02.76",
      "9903.02.77",
      "9903.01.34",
      "9903.02.01",
    ],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    effective: { to: "2026-02-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "Corrected to the 2026HTSRev3 text (Oct 2026): description, and exceptions as the heading lists them; Section 232 goods go through 9903.01.33, which spares only the metal content of steel and aluminum articles. IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE",
    },
  },
  {
    code: "9903.02.78",
    program: "ieepa-reciprocal",
    name: "IEEPA Reciprocal Exemption: Listed Agricultural Products",
    description:
      "Articles the product of any country, as provided for in subdivision (v)(iii)(b) of U.S. note 2 to this subchapter",
    scope: {
      countries: "all",
      codes: [{ list: "argiculturalArticlesExemptFromCertainTariffs" }],
    },
    requires: [confirm("9903.02.78")],
    rate: { kind: "free" },
    effective: { to: "2026-02-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE",
    },
  },
  {
    code: "9903.02.79",
    program: "deal-kr",
    name: "South Korea Deal Tariff (Base Duty 15% or More)",
    description:
      "Except for products described in headings 9903.01.30-9903.01.33, 9903.02.78, and 9903.02.81, and except as provided for in headings 9903.01.34, 9903.02.01, articles the product of South Korea, with an ad valorem (or ad valorem equivalent) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent, as provided for in subdivision (v)(xxiv)(a) of U.S. note 2 to this subchapter",
    scope: {
      countries: ["KR"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: ">=", pct: 15 }],
    exceptions: [
      "9903.01.30",
      "9903.01.31",
      "9903.01.32",
      "9903.01.33",
      "9903.02.78",
      "9903.02.81",
      "9903.01.34",
      "9903.02.01",
    ],
    rate: { kind: "free" },
    // Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part B: "on or after 12:01 a.m. eastern time on November 14, 2025". Retroactive
    effective: { from: "2025-11-14", to: "2026-02-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "Corrected to the 2026HTSRev3 text (Oct 2026): description, and exceptions as the heading lists them; Section 232 goods go through 9903.01.33, which spares only the metal content of steel and aluminum articles. IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE. Starts with goods entered on or after 12:01 a.m. ET Nov 14, 2025 (Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part B; retroactive, published Dec 4, 2025), backfilled from 2025HTSRev32's change record",
    },
  },
  {
    code: "9903.02.80",
    program: "deal-kr",
    name: "South Korea Deal Tariff (15% Including Base Duty)",
    description:
      "Except for products described in headings 9903.01.30-9903.01.33, 9903.02.78, and 9903.02.81, and except as provided for in headings 9903.01.34, 9903.02.01, articles the product of South Korea, with an ad valorem (or ad valorem equivalent) rate of duty under column 1-General or column 1-Special less than 15 percent, as provided for in subdivision (v)(xxiv)(a) of U.S. note 2 to this subchapter",
    scope: {
      countries: ["KR"],
      codes: "all",
    },
    requires: [{ kind: "baseRate", op: "<", pct: 15 }],
    exceptions: [
      "9903.01.30",
      "9903.01.31",
      "9903.01.32",
      "9903.01.33",
      "9903.02.78",
      "9903.02.81",
      "9903.01.34",
      "9903.02.01",
    ],
    rate: { kind: "topUpTo", pct: 15 },
    rateByColumn: {
      column2: { kind: "free" },
    },
    // Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part B: "on or after 12:01 a.m. eastern time on November 14, 2025". Retroactive
    effective: { from: "2025-11-14", to: "2026-02-24" },
    source: {
      revision: "2026HTSRev5",
      citation: "EO 14389; CSMS # 67834313",
      url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
      publishedOn: "2026-02-20",
      note: "Corrected to the 2026HTSRev3 text (Oct 2026): description, and exceptions as the heading lists them; Section 232 goods go through 9903.01.33, which spares only the metal content of steel and aluminum articles. IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE. Starts with goods entered on or after 12:01 a.m. ET Nov 14, 2025 (Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part B; retroactive, published Dec 4, 2025), backfilled from 2025HTSRev32's change record",
    },
  },
  // Its IEEPA role ended Feb 24, 2026, but the Section 232 civil aircraft reduction it implements
  // (U.S. note 2(v)(xxiv)(b)) continues: Proclamation 11021 clause (10) "does not alter or supersede"
  // those agreements. The metals exemption is a noStack in interactions.ts.
  ...tariffVersions(
    {
      code: "9903.02.81",
      program: "deal-kr",
      name: "South Korea Deal Exemption: Civil Aircraft",
      description:
        "Articles of civil aircraft (all aircraft other than military aircraft); their engines, parts, and components; their other parts, components, and subassemblies; and ground flight simulators and their parts and components of South Korea, excluding unmanned aircraft, provided for in subdivision (v)(xxiv)(b) of U.S. note 2 to this subchapter",
      scope: {
        countries: ["KR"],
        codes: [{ list: "civilAircraftAndPartsOf" }],
      },
      requires: [confirm("9903.02.81")],
      rate: { kind: "free" },
      // Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part B: "on or after 12:01 a.m. eastern time on November 14, 2025". Retroactive
      effective: { from: "2025-11-14" },
      source: {
        revision: "2026HTSRev5",
        citation: "EO 14389; CSMS # 67834313",
        url: "https://www.govinfo.gov/content/pkg/DCPD-202600131/html/DCPD-202600131.htm",
        publishedOn: "2026-02-20",
        note: "IEEPA duties ended for entries on or after 12:00 a.m. ET Feb 24, 2026 (CSMS # 67834313), after the Supreme Court ruling of Feb 20, 2026; all IEEPA headings inactive in ACE. Starts with goods entered on or after 12:01 a.m. ET Nov 14, 2025 (Commerce/USTR notice, U.S.-Korea Strategic Trade and Investment Deal (90 FR 55964), Annex Part B; retroactive, published Dec 4, 2025), backfilled from 2025HTSRev32's change record",
      },
    },
    [
      {
        from: "2026-02-24",
        set: {
          program: "aircraft-agreements",
          name: "Articles of Civil Aircraft of South Korea (Section 232 Exemption)",
          description:
            "Articles of civil aircraft (all aircraft other than military aircraft); their engines, parts, and components; their other parts, components, and subassemblies; and ground flight simulators and their parts and components of South Korea, excluding unmanned aircraft, provided for in subdivision (v)(xxiv)(b) of U.S. note 2 to this subchapter",
        },
        source: {
          revision: "2026HTSRev5",
          citation: "Proclamation 11021, clause (10)",
          url: "https://www.govinfo.gov/content/pkg/FR-2026-04-09/html/2026-06960.htm",
          publishedOn: "2026-04-02",
          note: "Section 232 civil aircraft reduction continues after IEEPA ended (U.S. note 2(v)(xxiv)(b)). Correction: previously ended on Feb 24, 2026 with the IEEPA headings",
        },
      },
    ],
  ),
]
