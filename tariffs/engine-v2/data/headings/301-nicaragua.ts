// Section 301 – Nicaragua: U.S. note 29 to subchapter III and heading 9903.89.01, from 2026HTSBasic.
// USTR's Notice of Action (90 FR 57807, Dec 12, 2025) on Nicaragua's acts, policies and practices
// related to labor rights, human rights and fundamental freedoms, and the rule of law: a tariff
// phased in at 0% (2026), 10% (2027) and 15% (from 2028) on goods not originating under CAFTA-DR.
// See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { tariffVersions } from "../../versioning"

const SOURCE = {
  revision: "2026HTSBasic",
  citation: "USTR Notice of Action, Section 301: Nicaragua (90 FR 57807); U.S. note 29(b)",
  url: "https://www.govinfo.gov/content/pkg/FR-2025-12-12/html/2025-22690.htm",
  publishedOn: "2025-12-12",
}

// U.S. note 29(b): "If entered during the period from January 1, 2026, though December 31, 2026,
// ..... 0% If entered during the period from January 1, 2027, though December 31, 2027, ..... 10%
// If entered on or after January 1, 2028, ..... 15%"
export const headings: Tariff[] = tariffVersions(
  {
    code: "9903.89.01",
    program: "301-nicaragua",
    name: "Section 301 – Nicaragua",
    description: "Articles the product of Nicaragua, as provided for in U.S. note 29 to this subchapter",
    scope: { countries: ["NI"], codes: "all" },
    // U.S. note 29(a): "The additional duties do not apply to originating goods of Nicaragua under
    // the Dominican Republic-Central America-United States Free Trade Agreement (CAFTA-DR)"; they
    // apply to products subject to column 1-general (the special column reads "No change"). It
    // stacks with the Nicaragua reciprocal 9903.02.47 while that applied
    requires: [{ kind: "preferenceClaimed", symbols: ["P", "P+"], equals: false }],
    rate: { kind: "adValorem", pct: 0 },
    effective: { from: "2026-01-01" },
    source: {
      ...SOURCE,
      note: "U.S. note 29: 0% for goods entered Jan 1–Dec 31, 2026. Added Oct 8, 2026 (not modeled before; first seen in 2026HTSBasic)",
    },
  },
  [
    { from: "2027-01-01", set: { rate: { kind: "adValorem", pct: 10 } }, source: { ...SOURCE, note: "U.S. note 29(b): 10% for goods entered Jan 1–Dec 31, 2027" } },
    { from: "2028-01-01", set: { rate: { kind: "adValorem", pct: 15 } }, source: { ...SOURCE, note: "U.S. note 29(b): 15% for goods entered on or after Jan 1, 2028" } },
  ]
)
