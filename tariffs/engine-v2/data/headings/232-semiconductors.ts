// Migrated from the legacy tariff data (2026HTSRev5), then reviewed by hand. The legacy engine
// was removed on Oct 1, 2026; this file is now the source. See HowTariffsWork.md §6.
import { Tariff } from "../../types"
import { confirm } from "../confirmations"
import { PP_11002_FROM, pp11002Source } from "./2026-basic-text"

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
    // Proclamation 11002 clause (3): "on or after 12:01 a.m. eastern standard time on January 15, 2026"
    effective: { from: PP_11002_FROM },
    source: {
      revision: "2026HTSRev5",
      ...pp11002Source,
      note: "Start date backfilled from 2026HTSRev1's change record (PP 11002, effective Jan 15, 2026). 9903.79.02–.09 (note 39(c)–(d)) are covered by this heading's confirmation",
    },
  },
]
