import { TariffI } from "../../interfaces/tariffs";

export const canadaTariffs: TariffI[] = [
  {
    code: "9903.01.10",
    description:
      "Except for products described in headings 9903.01.11, 9903.01.12, 9903.01.13, 9903.01.14 or 9903.01.15, articles the product of Canada, as provided for in U.S. note 2(j) to this subchapter",
    name: "Canada 35% IEEPA",
    general: 35,
    special: 35,
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
    code: "9903.01.11",
    description:
      "Articles the product of Canada that are donations, by persons subject to the jurisdiction of the United States, of articles, such as food, clothing, and medicine, intended to be used to relieve human suffering, as provided for in U.S. note 2(k) to this subchapter",
    name: "Donations Exemption",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["CA"],
    },
  },
  {
    code: "9903.01.11",
    description:
      "Articles the product of Canada that are donations, by persons subject to the jurisdiction of the United States, of articles, such as food, clothing, and medicine, intended to be used to relieve human suffering, as provided for in U.S. note 2(k) to this subchapter",
    name: "Donations Exemption",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["CA"],
    },
  },
  {
    code: "9903.01.12",
    description:
      "Articles the product of Canada that are informational materials, including but not limited to, publications, films, posters, phonograph records, photographs, microfilms, microfiche, tapes, compact disks, CD ROMs, artworks, and news wire feeds",
    name: "Informational Material & Artworks Exemption",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["CA"],
    },
  },
  {
    code: "9903.01.13",
    description:
      "Crude oil, natural gas, lease condensates, natural gas liquids, refined petroleum products, uranium, coal, biofuels, geothermal heat, the kinetic movement of flowing water, and critical minerals, as defined by 30 U.S.C. 1606(a)(3)",
    name: "Energy Exemption",
    general: 10,
    special: 10,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["CA"],
    },
  },
  {
    code: "9903.01.14",
    description:
      "Articles that are entered free of duty under the terms of general note 11 to the HTSUS, including any treatment set forth in subchapter XXIII of chapter 98 and subchapter XXII of chapter 99 of the HTS, as related to the USMCA.",
    name: "USMCA Qualifying Exception",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["CA"],
    },
  },
  {
    code: "9903.01.15",
    description:
      "Potash that is a product of Canada, as provided for in U.S. note 2(I) to this subchapter",
    name: "Potash of Canada",
    exceptions: ["9903.01.11", "9903.01.12", "9903.01.14"],
    general: 10,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["CA"],
    },
  },
  {
    // TODO: This one is purely additive, and does not apply to goods from 1.11,12,14
    // FIXME: Doesn't apply when USMCA does -- need to figure this one out
    code: "9903.01.16",
    description:
      "Except for products described in 9903.01.11, 9903.01.12, and 9903.01.14, articles the product of Canada as provided for in subdivision (m) to note 2 to this subchapter and determined by CBP to have been transshipped to evade applicable duties",
    name: "Transshipped through Canada to Evade Duties",
    exceptions: ["9903.01.11", "9903.01.12", "9903.01.14"],
    general: 40,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["CA"],
    },
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
