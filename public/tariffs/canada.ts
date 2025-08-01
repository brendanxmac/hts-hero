import { TariffI } from "./tariffs";

export const canadaTariffs: TariffI[] = [
  {
    code: "9903.01.10",
    description:
      "Except for products described in headings 9903.01.11, 9903.01.12, 9903.01.13, 9903.01.14 or 9903.01.15, articles the product of Canada, as provided for in U.S. note 2(j) to this subchapter",
    name: "Canada 25% IEEPA",
    general: 25,
    special: 25,
    other: 0,
    inclusions: {
      countries: ["CA"],
    },
    exceptions: [
      // Does not include the bits from 98 in 2j
      "9903.01.11",
      "9903.01.12",
      "9903.01.13",
      "9903.01.14",
      "9903.01.15",
    ],
  },
  {
    code: "9903.01.26",
    description:
      "Articles the product of Canada, as provided for in subdivision (v)(iv) of U.S. note 2 to this subchapter",
    name: "Canada Reciprocal Exception",
    inclusions: {
      countries: ["CA"],
    },
    general: 0,
    special: 0,
    other: 0,
  },
];
