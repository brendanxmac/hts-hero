import { TariffI } from "./tariffs";

export const mexicoTariffs: TariffI[] = [
  {
    code: "9903.01.01",
    description:
      "Except for products described in headings 9903.01.02, 9903.01.03, 9903.01.04 and 9903.01.05 articles the product of Mexico, as provided for in U.S. note 2(a) to this subchapter",
    name: "Mexico 25% IEEPA",
    general: 25,
    special: 25,
    other: 0,
    inclusions: {
      countries: ["MX"],
    },
    exceptions: [
      // Does not include the bits from 98 in 2a...
      "9903.01.02",
      "9903.01.03",
      "9903.01.04",
      "9903.01.05",
    ],
  },
  {
    code: "9903.01.27",
    description:
      "Articles the product of Mexico, as provided for in subdivision (v)(v) of U.S. note 2 to this subchapter",
    name: "Mexico Reciprocal Exception",
    inclusions: {
      countries: ["MX"],
    },
    general: 0,
    special: 0,
    other: 0,
  },
];
