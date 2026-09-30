import { TariffI } from "../interfaces/tariffs"
import { automobileParts33G, automobiles33B } from "./lists"

export const southKoreaTariffs: TariffI[] = [
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
    name: "Vehicles & Light Trucks of South Korea, Duty <15% (Replaces General Duty)",
    general: 15,
    special: 15,
    other: 0,
    suppressesBaseDuty: true,
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
    name: "Parts of Vehicles & Light Trucks of South Korea (33(g) & 33(t)), Duty <15% (Replaces General Duty)",
    general: 15,
    special: 15,
    other: 0,
    suppressesBaseDuty: true,
    requiresReview: true,
    exceptions: ["9903.94.06"],
    inclusions: {
      countries: ["KR"],
      codes: automobileParts33G,
    },
  },
]
