import { TariffI } from "../interfaces/tariffs"
import { semicondutorArticles39B } from "./lists"

export const semiconductorTariffs: TariffI[] = [
  {
    code: "9903.79.01",
    description:
      "Semiconductor articles as provided for in subdivisions (a) and (b) of U.S. note 39 to this subchapter",
    name: "Semiconductor Articles Possibly Subject to Additional Tariffs",
    general: 25,
    special: 25,
    other: 25,
    requiresReview: true,
    inclusions: {
      codes: semicondutorArticles39B,
    },
  },
]
