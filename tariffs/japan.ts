import { TariffI } from "../interfaces/tariffs";
import {
  automobiles33B,
  automobileParts33G,
  civilAircraftAndPartsOf,
} from "./lists";
import { recriprocalTariffExemptions } from "./reciprocal";

export const japanTariffs: TariffI[] = [
  {
    code: "9903.02.72",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34, 9903.02.01, and 9903.96.02, articles the product of Japan, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Japan Reciprocal Tariff (General Duty >=15%)",
    general: 0,
    special: 0,
    other: 0,
    inclusions: {
      countries: ["JP"],
    },
    exceptions: [
      ...recriprocalTariffExemptions,
      // "9903.01.30", ^
      // "9903.01.31", ^
      // "9903.01.32", ^
      // "9903.01.33", ^
      // "9903.01.34", ^
      // "9903.02.01", ^
      "9903.96.02", // Japan Civil Aircraft
    ],
  },
  {
    code: "9903.02.73",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34, 9903.02.01, and 9903.96.02, articles the product of Japan, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Japan Reciprocal Tariff (General Duty <15%)",
    general: 15,
    special: 15,
    other: 0,
    inclusions: {
      countries: ["JP"],
    },
    exceptions: [
      ...recriprocalTariffExemptions,
      // "9903.01.30",
      // "9903.01.31",
      // "9903.01.32",
      // "9903.01.33",
      // "9903.01.34",
      // "9903.02.01",
      "9903.96.02",
    ],
  },
  {
    code: "9903.94.40",
    description:
      "Passenger vehicles and light trucks that are products of Japan as provided for in subdivision (k) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent as provided for in subdivision (m) of U.S. note 33 to this subchapter",
    name: "Vehicles & Light Trucks of Japan, Duty >=15%",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    exceptions: ["9903.94.02", "9903.94.04"],
    inclusions: {
      countries: ["JP"],
      codes: automobiles33B,
    },
  },
  {
    code: "9903.94.41",
    description:
      "Passenger vehicles and light trucks that are products of Japan provided for in subdivision (k) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent as provided for in subdivision (m) of U.S. note 33 to this subchapter.",
    name: "Vehicles & Light Trucks of Japan, Duty <15%",
    general: 15,
    special: 15,
    other: 0,
    requiresReview: true,
    exceptions: ["9903.94.02", "9903.94.04"],
    inclusions: {
      countries: ["JP"],
      codes: automobiles33B,
    },
  },
  {
    code: "9903.94.42",
    description:
      "Parts of passenger vehicles and light trucks that are products of Japan as provided for subdivision (l) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent as provided for in subdivision (m) of U.S. note 33 to this subchapter.",
    name: "Parts of Vehicles & Light Trucks of Japan, Duty >=15%",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    exceptions: ["9903.94.06"],
    inclusions: {
      countries: ["JP"],
      codes: automobileParts33G,
    },
  },
  {
    code: "9903.94.43",
    description:
      "Parts of passenger vehicles and light trucks that are products of Japan as provided for subdivision (l) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent as provided for in subdivision (m) of U.S. note 33 to this subchapter.",
    name: "Parts of Vehicles & Light Trucks of Japan, Duty <15%",
    general: 15,
    special: 15,
    other: 0,
    requiresReview: true,
    exceptions: ["9903.94.06"],
    inclusions: {
      countries: ["JP"],
      codes: automobileParts33G,
    },
  },
  {
    code: "9903.96.02",
    description:
      "Articles of civil aircraft (all aircraft other than military aircraft); their engines, parts, and components; their other parts, components, and subassemblies; and ground flight simulators and their parts and components of Japan, excluding unmanned aircraft, classified in the subheadings enumerated in subdivision (b) of U.S. note 35 to this subchapter.",
    name: "Articles of Civil Aircraft of Japan",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true, // in order to determine if it is an article of civil aircraft
    exceptions: ["9903.94.06"],
    inclusions: {
      countries: ["JP"],
      codes: civilAircraftAndPartsOf,
    },
  },
];
