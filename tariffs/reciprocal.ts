import { EuropeanUnionCountries } from "../constants/countries";
import { TariffI } from "../interfaces/tariffs";
import { reciprocalTariffExemptionsList } from "./exclusion-lists.ts/reciprocal-tariff-exlcusions";

// Via 99,III,2(v)(i)
export const recriprocalTariffExemptions = [
  // Product of Canada
  "9903.01.26",
  // Product of Mexico
  "9903.01.27",
  // Loaded before April 5
  "9903.01.28",
  // Column 2 countries
  "9903.01.29",
  // Donations
  "9903.01.30",
  // Information Materials
  "9903.01.31",
  // Excluded Subheading Articles
  "9903.01.32",
  // Catch all for 232's
  "9903.01.33",
  // U.S. Content > 20%
  "9903.01.34",
  // Transhipping Identified
  "9903.02.01",
  // Iron or Steel
  "9903.81.87",
  "9903.81.88",
  // Iron or Steel Derivatives
  "9903.81.89",
  "9903.81.90",
  "9903.81.91",
  "9903.81.92",
  "9903.81.93",
  // Aluminum
  "9903.85.02",
  // Aluminum Derivatives
  "9903.85.04",
  "9903.85.07",
  "9903.85.08",
  "9903.85.09",
  // Autos
  "9903.94.01",
  "9903.94.03",
  // Auto Parts
  "9903.94.05",
  // Copper
  "9903.78.01",
  // U.K. Civil Aircraft, Engines, Parts, Components, & Subassemblies
  "9903.96.01",
  // Japan Civil Aircraft, Engines, Parts, Components, & Subassemblies
  "9903.96.02",
  // EU Articles
  "9903.02.74",
  "9903.02.75",
  "9903.02.76", // EU Civil Aircraft
  "9903.02.77",
  // Wood
  "9903.76.01",
  "9903.76.02",
  "9903.76.03",
  "9903.76.20",
  "9903.76.21",
  "9903.76.22",
  "9903.76.23",
  // Medium & Heavy Duty Vehicles
  "9903.74.01",
  // Buses & Similar Vehicles
  "9903.74.02",
  // Non-US Content of Medium & Heavy Duty Vehicles
  "9903.74.03",
  // Medium & Heavy Duty Vehicle Parts
  "9903.74.08",
  // Parts used for Medium & Heavy Duty Vehicle Production or Repair in the US
  "9903.74.09",
  "9903.94.07",
  // Auto Parts of the UK
  "9903.94.33",
  // Auto Parts of the EU >15%
  "9903.94.44",
  // Auto Parts of the EU <=15%
  "9903.94.45",
  // Auto Parts of Japan >15%
  "9903.94.54",
  // Auto Parts of Japan <=15%
  "9903.94.55",
  // Argicultural Exceptions
  "9903.02.78",
  // NOTE: Removed because these both reference this element, causing recursion
  // South Korea >= 15%
  // "9903.02.79",
  // South Korea < 15%
  // "9903.02.80",
  // South Korea Civil Aircraft
  "9903.02.81",
  // South Korea Autos >= 15%
  "9903.94.60",
  // South Korea Autos < 15%
  "9903.94.61",
  // South Korea Auto Parts >= 15%
  "9903.94.62",
  // South Korea Auto Parts < 15%
  "9903.94.63",
  // South Korea Parts Not elsewhere specified >= 15%
  "9903.94.64",
  // South Korea Parts Not elsewhere specified < 15%
  "9903.94.65 ",
];

export const worldwideReciprocalTariff: TariffI[] = [
  // ===========================
  // WORLDWIDE RECIPROCAL TARIFF
  // ===========================
  {
    code: "9903.01.25",
    description:
      "Articles the product of any country, except for products described in headings 9903.01.26– 9903.01.33, 9903.02.02–9903.02.77, 9903.96.01, and 9903.96.02, and except as provided for in headings 9903.01.34 and 9903.02.01, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Worldwide Reciprocal 10% (IEEPA)",
    general: 10,
    special: 10,
    other: 10, // is 0 but works when set as 10 because we exclude all column 2's via .01.29
    exclusions: {
      countries: [
        "AF",
        "DZ",
        "AO",
        "BD",
        "BO",
        "BA",
        "BW",
        "BR",
        "BN",
        "KH",
        "CM",
        "TD",
        "CR",
        "CI",
        "CD",
        "EC",
        "EC",
        "AT",
        "BE",
        "BG",
        "HR",
        "CY",
        "CZ",
        "DK",
        "EE",
        "FI",
        "FR",
        "DE",
        "GR",
        "HU",
        "IE",
        "IT",
        "LV",
        "LT",
        "LU",
        "MT",
        "NL",
        "PL",
        "PT",
        "RO",
        "SK",
        "SI",
        "ES",
        "SE",
        "AT",
        "BE",
        "BG",
        "HR",
        "CY",
        "CZ",
        "DK",
        "EE",
        "FI",
        "FR",
        "DE",
        "GR",
        "HU",
        "IE",
        "IT",
        "LV",
        "LT",
        "LU",
        "MT",
        "NL",
        "PL",
        "PT",
        "RO",
        "SK",
        "SI",
        "ES",
        "SE",
        "FK",
        "FJ",
        "GH",
        "GY",
        "IS",
        "IN",
        "ID",
        "IQ",
        "IL",
        "JP",
        "JO",
        "KZ",
        "LA",
        "LS",
        "LY",
        "LI",
        "MG",
        "MW",
        "MY",
        "MU",
        "MD",
        "MZ",
        "MM",
        "NA",
        "NR",
        "NZ",
        "NI",
        "NG",
        "MK",
        "NO",
        "PK",
        "PG",
        "PH",
        "RS",
        "ZA",
        "KR",
        "LK",
        "CH",
        "SY",
        "TW",
        "TH",
        "TT",
        "TN",
        "TR",
        "UG",
        "GB",
        "VU",
        "VE",
        "VN",
        "ZM",
        "ZW",
      ],
    },
    inclusions: {
      // When a tariff applies to all countries we just do *
      countries: ["*"],
    },
    exceptions: [
      ...recriprocalTariffExemptions,
      // Countries with Specific Reciprocal Tariffs (9903.02.02–9903.02.71)
      "9903.02.02",
      "9903.02.03",
      "9903.02.04",
      "9903.02.05",
      "9903.02.06",
      "9903.02.07",
      "9903.02.08",
      "9903.02.09",
      "9903.02.10",
      "9903.02.11",
      "9903.02.12",
      "9903.02.13",
      "9903.02.14",
      "9903.02.15",
      "9903.02.16",
      "9903.02.17",
      "9903.02.18",
      "9903.02.19",
      "9903.02.20",
      "9903.02.21",
      "9903.02.22",
      "9903.02.23",
      "9903.02.24",
      "9903.02.25",
      "9903.02.26",
      "9903.02.27",
      "9903.02.28",
      "9903.02.29",
      // "9903.02.30", Terminated
      "9903.02.31",
      "9903.02.32",
      "9903.02.33",
      "9903.02.34",
      "9903.02.35",
      "9903.02.36",
      "9903.02.37",
      "9903.02.38",
      "9903.02.39",
      "9903.02.40",
      "9903.02.41",
      "9903.02.42",
      "9903.02.43",
      "9903.02.44",
      "9903.02.45",
      "9903.02.46",
      "9903.02.47",
      "9903.02.48",
      "9903.02.49",
      "9903.02.50",
      "9903.02.51",
      "9903.02.52",
      "9903.02.53",
      "9903.02.54",
      "9903.02.55",
      // "9903.02.56", Replaced by US-Korea Trade deal tariffs
      "9903.02.57",
      "9903.02.58",
      "9903.02.59",
      "9903.02.60",
      "9903.02.61",
      "9903.02.62",
      "9903.02.63",
      "9903.02.64",
      "9903.02.65",
      "9903.02.66",
      "9903.02.67",
      "9903.02.68",
      "9903.02.69",
      "9903.02.70",
      "9903.02.71",
      "9903.02.72",
      "9903.02.73",
      // Medium & Heavy Duty Vehicle Parts
      "9903.74.08",
      // Parts used for Medium & Heavy Duty Vehicle Production or Repair in the US
      "9903.74.09",
    ],
  },
  {
    // TODO: This one is purely additive?
    code: "9903.02.01",
    description:
      "Articles the product of any country determined by U.S. Customs and Border Protection to have been transshipped to evade applicable duties under section 2 of Executive Order [Insert EO number], as amended [Compiler's note: [Insert EO Number] refers to Executive Order 14326, 90 Fed. Reg. 37963.]",
    name: "Transshipped to Evade Duties",
    general: 40,
    special: 40,
    other: 0,
    requiresReview: true,
    exceptions: [
      // Iron or Steel
      "9903.81.87",
      "9903.81.88",
      // Iron or Steel Derivatives
      "9903.81.89",
      "9903.81.90",
      "9903.81.91",
      "9903.81.92",
      "9903.81.93",
      // Aluminum
      "9903.85.02",
      // Aluminum Derivatives
      "9903.85.04",
      "9903.85.07",
      "9903.85.08",
      "9903.85.09",
      // Autos
      "9903.94.01",
      "9903.94.03",
      // Auto Parts
      "9903.94.05",
      // Copper
      "9903.78.01",
    ],
    exclusions: {
      countries: ["CA"], // TODO: should this be here? Since CA already has transshiiping add-on via .01.16
    },
    inclusions: {
      countries: ["*"],
    },
  },
  {
    code: "9903.02.02",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Afghanistan, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Afghanistan Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["AF"],
    },
  },
  {
    code: "9903.02.03",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Algeria, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Algeria Reciprocal Tariff",
    general: 30,
    special: 30,
    other: 30,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["DZ"],
    },
  },
  {
    code: "9903.02.04",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Angola, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Angola Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["AO"],
    },
  },
  {
    code: "9903.02.05",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Bangladesh, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Bangladesh Reciprocal Tariff",
    general: 20,
    special: 20,
    other: 20,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["BD"],
    },
  },
  {
    code: "9903.02.06",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Bolivia, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Bolivia Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["BO"],
    },
  },
  {
    code: "9903.02.07",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Bosnia and Herzegovina, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Bosnia and Herzegovina Reciprocal Tariff",
    general: 30,
    special: 30,
    other: 30,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["BA"],
    },
  },
  {
    code: "9903.02.08",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Botswana, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Botswana Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["BW"],
    },
  },
  {
    code: "9903.02.09",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Brazil, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Brazil Reciprocal Tariff",
    general: 10,
    special: 10,
    other: 10,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["BR"],
    },
  },
  {
    code: "9903.02.10",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Brunei, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Brunei Reciprocal Tariff",
    general: 25,
    special: 25,
    other: 25,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["BN"],
    },
  },
  {
    code: "9903.02.11",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Cambodia, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Cambodia Reciprocal Tariff",
    general: 19,
    special: 19,
    other: 19,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["KH"],
    },
  },
  {
    code: "9903.02.12",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Cameroon, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Cameroon Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["CM"],
    },
  },
  {
    code: "9903.02.13",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Chad, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Chad Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["TD"],
    },
  },
  {
    code: "9903.02.14",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Costa Rica, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Costa Rica Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["CR"],
    },
  },
  {
    code: "9903.02.15",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Côte D’Ivoire, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Côte D’Ivoire Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["CI"],
    },
  },
  {
    code: "9903.02.16",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Democratic Republic of the Congo, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Democratic Republic of the Congo Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["CD"],
    },
  },
  {
    code: "9903.02.17",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Ecuador, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Ecuador Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["EC"],
    },
  },
  {
    code: "9903.02.18",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Equatorial Guinea, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Equatorial Guinea Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["EC"],
    },
  },
  {
    // TODO: this one does NOT add with the base tariff
    code: "9903.02.19",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025,except for products described in headings 9903.01.30–9903.01.33 and 9903.02.74– 9903.02.77, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of the European Union, with an ad valorem (or ad valorem equivalent) rate of duty under column 1-General equal to or greater than 15 percent, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "EU Reciprocal Tariff (General Duty >= 15%)",
    general: 0,
    special: 0,
    other: 0,
    exceptions: [
      ...recriprocalTariffExemptions,
      "9903.02.74",
      "9903.02.75",
      "9903.02.76",
      "9903.02.77",
    ],
    inclusions: {
      countries: EuropeanUnionCountries,
    },
  },
  {
    // TODO: this one does NOT add with the base tariff
    code: "9903.02.20",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30–9903.01.33 and 9903.02.74– 9903.02.77, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of the European Union, with an ad valorem (or ad valorem equivalent) rate of duty under column 1-General less than 15 percent, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "EU Reciprocal Tariff (General Duty < 15%)",
    general: 15,
    special: 15,
    other: 0,
    exceptions: [
      ...recriprocalTariffExemptions,
      "9903.02.74",
      "9903.02.75",
      "9903.02.76",
      "9903.02.77",
    ],
    inclusions: {
      countries: EuropeanUnionCountries,
    },
  },
  {
    code: "9903.02.21",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Falkland Islands, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Falkland Islands Reciprocal Tariff",
    general: 10,
    special: 10,
    other: 10,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["FK"],
    },
  },
  {
    code: "9903.02.22",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Fiji, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Fiji Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["FJ"],
    },
  },
  {
    code: "9903.02.23",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Ghana, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Ghana Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["GH"],
    },
  },
  {
    code: "9903.02.24",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Guyana, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Guyana Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["GY"],
    },
  },
  {
    code: "9903.02.25",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Iceland, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Iceland Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["IS"],
    },
  },
  {
    code: "9903.02.26",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of India, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "India Reciprocal Tariff",
    general: 25,
    special: 25,
    other: 25,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["IN"],
    },
  },
  {
    code: "9903.02.27",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Indonesia, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Indonesia Reciprocal Tariff",
    general: 19,
    special: 19,
    other: 19,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["ID"],
    },
  },
  {
    code: "9903.02.28",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Iraq, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Iraq Reciprocal Tariff",
    general: 35,
    special: 35,
    other: 35,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["IQ"],
    },
  },
  {
    code: "9903.02.29",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Israel, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Israel Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["IL"],
    },
  },
  // {
  //   code: "9903.02.30", // Terminated
  //   description:
  //     "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Japan, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
  //   name: "Japan Reciprocal Tariff",
  //   general: 15,
  //   special: 15,
  //   other: 15,
  //   exceptions: recriprocalTariffExemptions,
  //   inclusions: {
  //     countries: ["JP"],
  //   },
  // },
  {
    code: "9903.02.31",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Jordan, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Jordan Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["JO"],
    },
  },
  {
    code: "9903.02.32",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Kazakhstan, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Kazakhstan Reciprocal Tariff",
    general: 25,
    special: 25,
    other: 25,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["KZ"],
    },
  },
  {
    code: "9903.02.33",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Laos, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Laos Reciprocal Tariff",
    general: 40,
    special: 40,
    other: 40,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["LA"],
    },
  },
  {
    code: "9903.02.34",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Lesotho, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Lesotho Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["LS"],
    },
  },
  {
    code: "9903.02.35",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Libya, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Libya Reciprocal Tariff",
    general: 30,
    special: 30,
    other: 30,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["LY"],
    },
  },
  {
    code: "9903.02.36",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Liechtenstein, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Liechtenstein Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["LI"],
    },
  },
  {
    code: "9903.02.37",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Madagascar, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Madagascar Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["MG"],
    },
  },
  {
    code: "9903.02.38",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Malawi, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Malawi Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["MW"],
    },
  },
  {
    code: "9903.02.39",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Malaysia, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Malaysia Reciprocal Tariff",
    general: 19,
    special: 19,
    other: 19,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["MY"],
    },
  },
  {
    code: "9903.02.40",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Mauritius, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Mauritius Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["MU"],
    },
  },
  {
    code: "9903.02.41",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Moldova, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Moldova Reciprocal Tariff",
    general: 25,
    special: 25,
    other: 25,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["MD"],
    },
  },
  {
    code: "9903.02.42",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Mozambique, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Mozambique Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["MZ"],
    },
  },
  {
    code: "9903.02.43",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Myanmar (Burma), as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Myanmar (Burma) Reciprocal Tariff",
    general: 40,
    special: 40,
    other: 40,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["MM"],
    },
  },
  {
    code: "9903.02.44",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Namibia, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Namibia Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["NA"],
    },
  },
  {
    code: "9903.02.45",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Nauru, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Nauru Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["NR"],
    },
  },
  {
    code: "9903.02.46",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of New Zealand, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "New Zealand Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["NZ"],
    },
  },
  {
    code: "9903.02.47",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Nicaragua, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Nicaragua Reciprocal Tariff",
    general: 18,
    special: 18,
    other: 18,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["NI"],
    },
  },
  {
    code: "9903.02.48",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Nigeria, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Nigeria Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["NG"],
    },
  },
  {
    code: "9903.02.49",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of North Macedonia, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "North Macedonia Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["MK"],
    },
  },
  {
    code: "9903.02.50",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Norway, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Norway Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["NO"],
    },
  },
  {
    code: "9903.02.51",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Pakistan, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Pakistan Reciprocal Tariff",
    general: 19,
    special: 19,
    other: 19,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["PK"],
    },
  },
  {
    code: "9903.02.52",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Papua New Guinea, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Papua New Guinea Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["PG"],
    },
  },
  {
    code: "9903.02.53",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of the Philippines, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Philippines Reciprocal Tariff",
    general: 19,
    special: 19,
    other: 19,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["PH"],
    },
  },
  {
    code: "9903.02.54",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Serbia, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Serbia Reciprocal Tariff",
    general: 35,
    special: 35,
    other: 35,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["RS"],
    },
  },
  {
    code: "9903.02.55",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of South Africa, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "South Africa Reciprocal Tariff",
    general: 30,
    special: 30,
    other: 30,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["ZA"],
    },
  },
  // NOTE: Replaced by US/Korea Trade Deal
  // {
  //   code: "9903.02.56",
  //   description:
  //     "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of South Korea, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
  //   name: "South Korea Reciprocal Tariff",
  //   general: 15,
  //   special: 15,
  //   other: 15,
  //   exceptions: recriprocalTariffExemptions,
  //   inclusions: {
  //     countries: ["KR"],
  //   },
  // },
  {
    code: "9903.02.57",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Sri Lanka, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Sri Lanka Reciprocal Tariff",
    general: 20,
    special: 20,
    other: 20,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["LK"],
    },
  },
  {
    code: "9903.02.58",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Switzerland, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Switzerland Reciprocal Tariff",
    general: 39,
    special: 39,
    other: 39,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["CH"],
    },
  },
  {
    code: "9903.02.59",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Syria, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Syria Reciprocal Tariff",
    general: 41,
    special: 41,
    other: 41,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["SY"],
    },
  },
  {
    code: "9903.02.60",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Taiwan, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Taiwan Reciprocal Tariff",
    general: 20,
    special: 20,
    other: 20,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["TW"],
    },
  },
  {
    code: "9903.02.61",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Thailand, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Thailand Reciprocal Tariff",
    general: 19,
    special: 19,
    other: 19,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["TH"],
    },
  },
  {
    code: "9903.02.62",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Trinidad and Tobago, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Trinidad and Tobago Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["TT"],
    },
  },
  {
    code: "9903.02.63",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Tunisia, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Tunisia Reciprocal Tariff",
    general: 25,
    special: 25,
    other: 25,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["TN"],
    },
  },
  {
    code: "9903.02.64",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Turkey, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Turkey Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["TR"],
    },
  },
  {
    code: "9903.02.65",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Uganda, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Uganda Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["UG"],
    },
  },
  {
    code: "9903.02.66",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of United Kingdom, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "United Kingdom Reciprocal Tariff",
    general: 10,
    special: 10,
    other: 10,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["GB"],
    },
  },
  {
    code: "9903.02.67",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Vanuatu, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Vanuatu Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["VU"],
    },
  },
  {
    code: "9903.02.68",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Venezuela, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Venezuela Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["VE"],
    },
  },
  {
    code: "9903.02.69",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Vietnam, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Vietnam Reciprocal Tariff",
    general: 20,
    special: 20,
    other: 20,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["VN"],
    },
  },
  {
    code: "9903.02.70",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Zambia, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Zambia Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["ZM"],
    },
  },
  {
    code: "9903.02.71",
    description:
      "Except for goods loaded onto a vessel at the port of loading and in transit on the final mode of transit before 12:01 a.m. eastern daylight time on August 7, 2025, and entered for consumption or withdrawn from warehouse for consumption before 12:01 a.m. eastern daylight time on October 5, 2025, except for products described in headings 9903.01.30-9903.01.33, and except as provided for in headings 9903.01.34 and 9903.02.01, articles the product of Zimbabwe, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Zimbabwe Reciprocal Tariff",
    general: 15,
    special: 15,
    other: 15,
    exceptions: recriprocalTariffExemptions,
    inclusions: {
      countries: ["ZW"],
    },
  },
];
