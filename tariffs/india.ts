import { TariffI } from "../interfaces/tariffs";
import { reciprocalTariffExemptionsList } from "./exclusion-lists.ts/reciprocal-tariff-exlcusions";

export const indiaTariffs: TariffI[] = [
  {
    code: "9903.01.84",
    description:
      "Except for products described in headings 9903.01.85-9903.01.89, articles the product of India that are entered for consumption, or withdrawn from warehouse for consumption, after 12:01 a.m. eastern daylight time on August 27, 2025, as provided for in subdivision (z) of U.S. note 2 to this subchapter",
    name: "India 25% IEEPA - Russian Oil Consumption Penalty",
    general: 25,
    special: 25,
    other: 0,
    inclusions: {
      countries: ["IN"],
    },
    exceptions: [
      "9903.01.85",
      "9903.01.86",
      "9903.01.87",
      "9903.01.88",
      "9903.01.89",
      // tied to .86 here
      "9903.01.32",
      // tied to .87 here
      // iron & steel
      "9903.81.87",
      "9903.81.88",
      // iron & steel derivatives
      "9903.81.89",
      "9903.81.90",
      "9903.81.91",
      "9903.81.92",
      "9903.81.93",
      // aluminum
      "9903.85.02",
      // aluminum derivatives
      "9903.85.04",
      "9903.85.07",
      "9903.85.08",
      "9903.85.09",
      // vehicles
      "9903.94.01",
      "9903.94.03",
      // Parts of vehicles
      "9903.94.05",
      // Copper & derivatives
      "9903.78.01",
    ],
  },
  {
    code: "9903.01.85",
    description:
      "Articles the product of India that (1) were loaded onto a vessel at the port of loading and in transit on the final mode of transit prior to entry into the United States, before 12:01 a.m. eastern daylight time on August 27, 2025; and (2) are entered for consumption, or withdrawn from warehouse for consumption, before 12:01 a.m. eastern daylight time on September 17, 2025",
    name: "India Imports in Transit Before August 27th, 2025; Entered for Consumption Before September 17th, 2025",
    general: 0,
    special: 0,
    other: 0,
    inclusions: {
      countries: ["IN"],
    },
    requiresReview: true,
  },
  {
    code: "9903.01.86", // Same as 9903.01.32, reciprocal tariff exemptions
    description:
      "Articles the product of India, classified in the subheadings enumerated in subdivision (v)(iii) of U.S. note 2 to this subchapter",
    name: "Excluded Subheadings of India",
    general: 0,
    special: 0,
    other: 0,
    inclusions: {
      countries: ["IN"],
      codes: reciprocalTariffExemptionsList,
    },
  },
  {
    code: "9903.01.87", // Section 232 exemptions - Same as 9903.01.33 minus UK exemptions
    description:
      "Articles of iron or steel, derivative articles of iron or steel, articles of aluminum, derivative articles of aluminum, passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks and parts of passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks, and semi-finished copper and intensive copper derivative products, of India, as provided in subdivision (z)(iii) through (z)(ix) of note 2 to this subchapter",
    name: "Exemption for Section 232 Articles of India (Iron, Steel, Aluminum, Copper, Autos, Auto Parts, and Wood)",
    general: 0,
    special: 0,
    other: 0,
    inclusions: {
      tariffs: [
        // iron & steel
        "9903.81.87",
        "9903.81.88",
        // iron & steel derivatives
        "9903.81.89",
        "9903.81.90",
        "9903.81.91",
        "9903.81.92",
        "9903.81.93",
        // aluminum
        "9903.85.02",
        // aluminum derivatives
        "9903.85.04",
        "9903.85.07",
        "9903.85.08",
        "9903.85.09",
        // vehicles
        "9903.94.01",
        "9903.94.03",
        // Parts of vehicles
        "9903.94.05",
        // Copper & derivatives
        "9903.78.01",
        // Wood
        "9903.76.01",
        "9903.76.02",
        "9903.76.03",
        "9903.76.20",
        "9903.76.21",
        "9903.76.22",
      ],
      countries: ["IN"],
    },
  },
  {
    code: "9903.01.88",
    description:
      "Articles the product of India that are donations, by persons subject to the jurisdiction of the United States, such as food, clothing, and medicine, intended to be used to relieve human suffering, as provided for in subdivision (z)(x) of U.S. note 2 to this subchapter",
    name: "Humanitarian Aid Articles of India",
    general: 0,
    special: 0,
    other: 0,
    inclusions: {
      countries: ["IN"],
    },
    requiresReview: true,
  },
  {
    code: "9903.01.89",
    description:
      "Articles the product of India that are informational materials, including but not limited to, publications, films, posters, phonograph records, photographs, microfilms, microfiche, tapes, compact disks, CD ROMs, artworks, and news wire feeds, as provided for in subdivision (z)(xi) of U.S. note 2 to this subchapter",
    name: "Informational Materials of India",
    general: 0,
    special: 0,
    other: 0,
    inclusions: {
      countries: ["IN"],
    },
    requiresReview: true,
  },
];
