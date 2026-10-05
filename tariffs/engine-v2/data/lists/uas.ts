// Section 232 – Unmanned Aircraft Systems lists from U.S. note 43(c) to subchapter III
// (2026HTSRev18, Proclamation 11055, effective 2026-09-03), and the lean beef trimmings quota
// numbers from U.S. note 7(c). See HowTariffsWork.md §7.
import { CodeList } from "../../types"

const FROM = "2026-09-03"
const SOURCE = { revision: "2026HTSRev18", citation: "Proclamation 11055" }

const list = (id: string, description: string, codes: string[], note: string): CodeList => ({
  id,
  kind: "hts",
  description,
  versions: [{ codes, effective: { from: FROM }, source: { ...SOURCE, note } }],
})

export const uasLists: CodeList[] = [
  // 43(c)(1): unmanned aircraft in these provisions are always 9903.08.21
  list("uas43c1Aircraft", "Unmanned aircraft, U.S. note 43(c)(1) to subchapter III", ["8806.24.00", "8806.29.00", "8806.94.00", "8806.99.00"], "U.S. note 43(c)(1)"),
  // 43(c)(1): docking stations and their parts, under general-purpose provisions
  list("uas43c1DockingStations", "Docking stations for unmanned aircraft and their parts, U.S. note 43(c)(1) to subchapter III", ["8504.40.95.80", "8537.10.91.70"], "U.S. note 43(c)(1)"),
  // 43(c)(2): parts for systems over 25 kg, not for retail delivery, agriculture or the Department of War
  list("uas43c2", "Parts and components for unmanned aircraft systems over 25 kg, U.S. note 43(c)(2) to subchapter III", ["8807.10.00", "8807.20.00", "8807.30.00", "8807.90.90"], "U.S. note 43(c)(2)"),
  // 43(c)(3) and (4): the same provisions, with thermal imaging (3) or without (4)
  list("uas43c34", "Unmanned aircraft with or without thermal imaging, U.S. note 43(c)(3)–(4) to subchapter III", ["8806.21.00", "8806.22.00", "8806.23.00", "8806.91.00", "8806.92.00", "8806.93.00"], "U.S. note 43(c)(3)–(4)"),
  // Everything in 43(c)
  {
    id: "uas43c",
    kind: "hts",
    description: "Unmanned aircraft systems, their parts and components, U.S. note 43(c) to subchapter III",
    versions: [
      {
        includes: [{ list: "uas43c1Aircraft" }, { list: "uas43c1DockingStations" }, { list: "uas43c2" }, { list: "uas43c34" }],
        effective: { from: FROM },
        source: { ...SOURCE, note: "U.S. note 43(c)" },
      },
    ],
  },
  // Codes that could be for unmanned aircraft or not
  {
    id: "uas43cGeneralPurpose",
    kind: "hts",
    description: "General-purpose provisions in U.S. note 43(c)(1)–(2) to subchapter III (docking station parts, aircraft parts)",
    versions: [
      {
        includes: [{ list: "uas43c1DockingStations" }, { list: "uas43c2" }],
        effective: { from: FROM },
        source: { ...SOURCE, note: "U.S. note 43(c)(1)–(2)" },
      },
    ],
  },
  // 7(c): lean beef trimmings
  {
    id: "leanBeefTrimmings7c",
    kind: "hts",
    description: "Lean beef trimmings, U.S. note 7(c) to subchapter III",
    versions: [
      {
        codes: ["0201.30.50.91", "0201.30.50.97", "0202.30.50.91", "0202.30.50.97"],
        effective: { from: "2026-09-01" },
        source: { revision: "2026HTSRev18", citation: "Proclamation 11059", note: "U.S. note 7(c)" },
      },
    ],
  },
]
