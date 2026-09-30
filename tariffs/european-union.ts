import { EuropeanUnionCountries } from "../constants/countries"
import { TariffI } from "../interfaces/tariffs"
import { automobiles33B, automobileParts33G } from "./lists"

export const europeanUnionTariffs: TariffI[] = [
  {
    code: "9903.94.50",
    description:
      "Passenger vehicles and light trucks that are products of the European Union as specified in subdivision (n) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1 equal to or greater than 15 percent.",
    name: "Vehicles & Light Trucks of the European Union, Duty >=15%",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: EuropeanUnionCountries,
      codes: automobiles33B,
    },
  },
  {
    code: "9903.94.51",
    description:
      "Passenger vehicles and light trucks that are products of the European Union as specified in subdivision (n) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1 less than 15 percent",
    name: "Vehicles & Light Trucks of the European Union, Duty <15% (Replaces General Duty)",
    general: 15,
    special: 15,
    other: 0,
    suppressesBaseDuty: true,
    requiresReview: true,
    inclusions: {
      countries: EuropeanUnionCountries,
      codes: automobiles33B,
    },
  },
  {
    code: "9903.94.52",
    description:
      "Parts of passenger vehicles and light trucks that are products of the European Union as specified in subdivision (o) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column 1 equal to or greater than 15 percent.",
    name: "Parts of Vehicles & Light Trucks of the European Union, Duty >=15%",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: EuropeanUnionCountries,
      codes: automobileParts33G,
    },
  },
  {
    code: "9903.94.53",
    description:
      "Parts of passenger vehicles and light trucks that are products of the European Union as specified in subdivision (o) of U.S. note 33 to this subchapter, with an ad valorem (or ad valorem equivalent as provided for in subdivision (m) of U.S. note 33 to this subchapter) rate of duty under column1 less than 15 percent.",
    name: "Parts of Vehicles & Light Trucks of the European Union, Duty <15% (Replaces General Duty)",
    general: 15,
    special: 15,
    other: 0,
    suppressesBaseDuty: true,
    requiresReview: true,
    inclusions: {
      countries: EuropeanUnionCountries,
      codes: automobileParts33G,
    },
  },
]
