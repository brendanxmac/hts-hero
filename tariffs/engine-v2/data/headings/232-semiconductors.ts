// Migrated from the legacy tariff data (2026HTSRev5), then reviewed by hand. The legacy engine
// was removed on Oct 1, 2026; this file is now the source. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"

export const headings: Tariff[] = [
  {
    code: "9903.79.01",
    program: "232-semiconductors",
    name: "Section 232 Semiconductors: Certain Advanced Computing Chips",
    description:
      "Semiconductor articles as provided for in subdivisions (a) and (b) of U.S. note 39 to this subchapter",
    scope: {
      countries: "all",
      codes: [{ list: "semicondutorArticles39B" }],
    },
    requires: [confirm("9903.79.01")],
    rate: { kind: "adValorem", pct: 25 },
    effective: {},
    source: { revision: "2026HTSRev5" },
  },
]
