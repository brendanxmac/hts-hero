import { TariffI } from "../interfaces/tariffs";
import {
  mediumAndHeavyDutyVehicles,
  busesAndSimilarVehicles,
  partsOfMHDVs38i,
  automobileParts33G,
  ch72Headings,
  ch73Headings,
  ch76Headings,
} from "./lists";

export const heavyVehicleTariffs: TariffI[] = [
  {
    code: "9903.74.01",
    description:
      "Medium- and heavy-duty vehicles as provided for in subdivision (b) of U.S. note 38 to this subchapter.",
    name: "Medium & Heavy Duty Vehicles",
    general: 25,
    special: 25,
    other: 25,
    exceptions: ["9903.74.03", "9903.74.05", "9903.74.06", "9903.74.07"],
    inclusions: {
      codes: mediumAndHeavyDutyVehicles,
    },
  },
  {
    code: "9903.74.02",
    description:
      "Buses and other vehicles classified in HTSUS heading 8702 as provided for in subdivision (c) of U.S. note 38 to this subchapter.",
    name: "Buses & Similar Vehicles",
    general: 10,
    special: 10,
    other: 10,
    exceptions: [
      "9903.74.03",
      "9903.74.05",
      "9903.74.06",
      "9903.74.07",
      "9903.74.09",
    ],
    inclusions: {
      codes: busesAndSimilarVehicles,
    },
  },
  {
    code: "9903.74.03",
    description:
      "Medium- and heavy-duty vehicles, as provided for in subdivision (d) of U.S. note 38 to this subchapter.",
    name: "US Content Exemption: Pay 25% on ONLY the Non-US Content of Heavy Duty Vehicles that are USMCA Eligible & Approved by Secretary of Commerce",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      codes: mediumAndHeavyDutyVehicles,
    },
    // exceptions: ["9903.74.05"],
  },
  {
    code: "9903.74.05",
    description:
      "Articles as provided for in subdivision (e) of U.S. note 38 to this subchapter.",
    name: "Article is NOT a Medium or Heavy Duty Vehicle",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      codes: mediumAndHeavyDutyVehicles,
    },
  },
  {
    code: "9903.74.06",
    description:
      "Articles as provided for in subdivision (f) of U.S. note 38 to this subchapter.",
    name: "The US Content of an Article that Qualifies for 9903.74.03",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      codes: mediumAndHeavyDutyVehicles,
    },
  },
  {
    code: "9903.74.07",
    description:
      "Medium- and heavy-duty vehicles, as provided for in subdivision (g) of U.S. note 38 to this subchapter.",
    name: "Heavy Duty Vehicles, Buses, and Similar Vehicles that were Manufactured Over 25 Years Prior to Enrty",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      codes: [...mediumAndHeavyDutyVehicles, ...busesAndSimilarVehicles],
    },
  },
  {
    code: "9903.74.08",
    description:
      "Medium- and heavy-duty vehicle parts, as provided for in subdivision (i) of U.S. note 38 to this subchapter.",
    name: "Parts of Medium or Heavy Duty Vehicles",
    general: 25,
    special: 25,
    other: 25,
    requiresReview: true,
    exceptions: ["9903.74.10", "9903.74.11"],
    inclusions: {
      codes: partsOfMHDVs38i,
    },
  },
  {
    code: "9903.74.09",
    description:
      "Medium- and heavy-duty vehicle parts, as provided for in subdivision (j) of U.S. note 38 to this subchapter.",
    name: "Parts for Production or Repair of Medium & Heavy Duty Vehicles in the US",
    general: 25,
    special: 25,
    other: 25,
    requiresReview: true,
    exceptions: ["9903.74.10", "9903.74.11"],
    inclusions: {
      codes: ["*"],
    },
    exclusions: {
      codes: [
        ...partsOfMHDVs38i,
        ...automobileParts33G,
        ...ch72Headings,
        ...ch73Headings,
        ...ch76Headings,
      ],
    },
  },
  {
    code: "9903.74.10",
    description:
      "Articles as provided for in subdivision (k) of U.S. note 38 to this subchapter",
    name: "USCMA Qualified Medium & Heavy Duty Vehicle Parts that are NOT knock-down kits or parts compilations, whether or not being imported by an importer who produces or repairs MHDV's",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      codes: ["*"],
      countries: ["MX", "CA"],
    },
  },
  {
    code: "9903.74.11",
    description:
      "Articles as provided for in subdivision (l) of U.S. note 38 to this subchapter.",
    name: "Is not a part for medium of heavy duty vehicles",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      codes: partsOfMHDVs38i,
    },
  },
];
