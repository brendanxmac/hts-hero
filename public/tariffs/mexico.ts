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
      // FIXME: turning this on causes infinite loop
      // cause they reference eachother as exceptions
      "9903.01.05",
      // Aluminum
      "9903.85.02",
      "9903.85.04",
      "9903.85.07",
      "9903.85.08",
      // Steel
      "9903.81.87", // not .88 according to steel note (i)?
      "9903.81.89",
      "9903.81.90",
      "9903.81.91",
      "9903.81.93",
      // Passenger Vehicles & Trucks
      "9903.94.01",
      // Auto Parts
      "9903.94.05",
    ],
  },
  {
    code: "9903.01.02",
    description:
      "Articles the product of Mexico that are donations, by persons subject to the jurisdiction of the United States, of articles, such as food, clothing, and medicine, intended to be used to relieve human suffering, as provided for in U.S. note 2(b) to this subchapter",
    name: "Donation Exception",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["MX"],
    },
  },
  {
    code: "9903.01.03",
    description:
      "Articles the product of Mexico that are informational materials, including but not limited to, publications, films, posters, phonograph records, photographs, microfilms, microfiche, tapes, compact disks, CD ROMs, artworks, and news wire feeds",
    name: "Informational Material & Artworks Exception",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["MX"],
    },
  },
  {
    code: "9903.01.04",
    description:
      "Articles that are entered free of duty under the terms of general note 11 to the HTSUS, including any treatment set forth in subchapter XXIII of chapter 98 and subchapter XXII of chapter 99 of the HTS, as related to the USMCA",
    name: "USMCA Qualifying Exception",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["MX"],
    },
  },
  {
    code: "9903.01.05",
    description:
      "Potash that is a product of Mexico, as provided for in U.S. note 2(c) to this subchapter",
    name: "Potash of Mexico",
    general: 10,
    special: 0,
    other: 0,
    // exceptions: ["9903.01.01", "9903.01.02", "9903.01.03", "9903.01.04"],
    requiresReview: true,
    inclusions: {
      countries: ["MX"],
    },
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
