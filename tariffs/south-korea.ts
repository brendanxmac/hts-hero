import { TariffI } from "../interfaces/tariffs";
import {
  automobileParts33G,
  automobiles33B,
  civilAircraftAndPartsOf,
} from "./lists";
import { recriprocalTariffExemptions } from "./reciprocal";

export const southKoreaTariffs: TariffI[] = [
  {
    code: "9903.02.79",
    description:
      "Except for products described in headings 9903.01.30–9903.01.33, 9903.02.78, and 9903.02.81, and except as provided for in headings 9903.01.34, 9903.02.01, articles the product of South Korea, with an ad valorem (or ad valorem equivalent) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent, as provided for in subdivision (v)(xxiii)(a) of U.S. note 2 to this subchapter.",
    name: "South Korea Reciprocal Tariff (General Duty >=15%)",
    general: 0,
    special: 0,
    other: 0,
    inclusions: {
      countries: ["KR"],
    },
    exceptions: [...recriprocalTariffExemptions],
  },
  {
    code: "9903.02.80",
    description:
      "Except for products described in headings 9903.01.30–9903.01.33, 9903.02.78, and 9903.02.81, and except as provided for in headings 9903.01.34, 9903.02.01, articles the product of South Korea, with an ad valorem (or ad valorem equivalent) rate of duty under column 1-General or column 1-Special less than 15 percent, as provided for in subdivision (v)(xxiii)(a) of U.S. note 2 to this subchapter.",
    name: "South Korea Reciprocal Tariff (General Duty <15%)",
    general: 15,
    special: 15,
    other: 0,
    inclusions: {
      countries: ["KR"],
    },
    exceptions: [...recriprocalTariffExemptions],
  },
  {
    code: "9903.02.81",
    description:
      "Articles of civil aircraft (all aircraft other than military aircraft); their engines, parts, and components; their other parts, components, and subassemblies; and ground flight simulators and their parts and components of South Korea, excluding unmanned aircraft, provided for in subdivision (v)(xxiii)(b) of U.S. note 2 to this subchapter",
    name: "Articles of Civil Aircraft of South Korea",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true, // in order to determine if it is an article of civil aircraft, as opposed to anything else
    inclusions: {
      countries: ["KR"],
      codes: civilAircraftAndPartsOf,
    },
  },
  {
    code: "9903.94.60",
    description:
      "Passenger vehicles and light trucks that are products of South Korea as specified in subdivision (s) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent",
    name: "Vehicles & Light Trucks of South Korea, Duty >=15%",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    exceptions: ["9903.94.02", "9903.94.04"],
    inclusions: {
      countries: ["KR"],
      codes: automobiles33B,
    },
  },
  {
    code: "9903.94.61",
    description:
      "Passenger vehicles and light trucks that are products of South Korea as specified in subdivision (s) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special less than 15 percent",
    name: "Vehicles & Light Trucks of South Korea, Duty <15%",
    general: 15,
    special: 15,
    other: 0,
    requiresReview: true,
    exceptions: ["9903.94.02", "9903.94.04"],
    inclusions: {
      countries: ["KR"],
      codes: automobiles33B,
    },
  },
  {
    code: "9903.94.62",
    description:
      "Parts of passenger vehicles and light trucks that are products of South Korea as specified in subdivisions (g) and (t) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special equal to or greater than 15 percent",
    name: "Parts of Vehicles & Light Trucks of South Korea (33(g) & 33(t)), Duty >=15%",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    exceptions: ["9903.94.06"],
    inclusions: {
      countries: ["KR"],
      codes: automobileParts33G,
    },
  },
  {
    code: "9903.94.63",
    description:
      "Parts of passenger vehicles and light trucks that are products of South Korea as specified in subdivisions (g) and (t) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1-General or column 1-Special less than 15 percent",
    name: "Parts of Vehicles & Light Trucks of South Korea (33(g) & 33(t)), Duty <15%",
    general: 15,
    special: 15,
    other: 0,
    requiresReview: true,
    exceptions: ["9903.94.06"],
    inclusions: {
      countries: ["KR"],
      codes: automobileParts33G,
    },
  },
];
