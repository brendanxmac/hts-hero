// Chapters that can't hold vehicle parts, for the Section 232 "certified for U.S. production or
// repair" parts headings: 9903.94.07 (U.S. note 33(p)) and 9903.74.09 (U.S. note 38(j)).
//
// Neither note lists the codes it covers. Each covers "automobile parts" / "parts of medium- and
// heavy-duty vehicles" certified for U.S. production or repair, outside chapters 72, 73 and 76 and
// the 33(g) and 38(i) lists. Note 33(f) describes automobile parts as "engines and engine parts,
// transmissions and powertrain parts, electrical components, and parts of passenger vehicles … and
// light trucks". So an article has to be a vehicle part to qualify, but any chapter could hold one.
//
// This list is an engine judgment, not note text: the chapters whose goods can't be engines,
// powertrain, electrical components or vehicle parts, so the engine stops asking about these
// headings for coffee, apparel or toys. Chapters with materials that are cut or made into vehicle
// parts stay in scope (plastics, rubber, leather articles, wood, cork, paper, fabrics and carpets,
// made-up textiles, glass, base metals, machinery, electrical, vehicles, instruments, clocks,
// furniture). Revisit when a note or CBP guidance narrows either heading.
import { CodeList } from "../../types"

// By chapter, with what keeps each out
const CHAPTERS: [string[], string][] = [
  [range(1, 24), "food, agricultural products, beverages and tobacco"],
  [["25", "26", "27"], "salt, stone, ores, mineral fuels and oils"],
  [["30", "31", "33", "37"], "pharmaceuticals, fertilizers, cosmetics, photographic goods"],
  [["41", "43"], "raw hides, leather and furskins"],
  [["46", "47", "49"], "basketwork, pulp and printed matter"],
  [["50", "51", "52", "53"], "silk, wool, cotton and other vegetable fibers and yarns"],
  [["61", "62", "64", "65", "66", "67"], "apparel, footwear, headgear, umbrellas, feathers"],
  [["71"], "jewelry and precious metals"],
  [["86", "88", "89"], "railway, aircraft and ships, and their parts"],
  [["92", "93"], "musical instruments, arms and ammunition"],
  [["95", "96", "97"], "toys, games and sports equipment, miscellaneous articles, works of art"],
]

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, i) => String(from + i).padStart(2, "0"))
}

export const vehiclePartsLists: CodeList[] = [
  {
    id: "notVehiclePartChapters",
    kind: "hts",
    description:
      "Chapters that can't hold vehicle parts (engine judgment), for headings 9903.94.07 and 9903.74.09",
    versions: [
      {
        codes: CHAPTERS.flatMap(([chapters]) => chapters),
        effective: {},
        source: {
          revision: "2026HTSRev20",
          note: "Engine judgment from U.S. note 33(f) and (p) and U.S. note 38(j), which require the article to be a vehicle part but list no codes",
        },
      },
    ],
  },
]
