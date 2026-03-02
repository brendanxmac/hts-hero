import { TariffI } from "../interfaces/tariffs"
import { argiculturalArticlesExemptFromCertainTariffs } from "./lists"

export const argiculturalTariffs: TariffI[] = [
  {
    code: "9903.02.78",
    description:
      "Articles the product of any country, as provided for in subdivision (v)(iii)(b) of U.S. note 2 to this subchapter",
    name: "Argicultural Products Exempt from Reciprocal Tariffs",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      codes: [...argiculturalArticlesExemptFromCertainTariffs],
    },
  },
]
