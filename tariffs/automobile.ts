import { EuropeanUnionCountries } from "../constants/countries";
import { TariffI } from "../interfaces/tariffs";
import {
  automobileParts33G,
  automobiles33B,
  autoPartsOfUK33J,
  ch72Headings,
  ch73Headings,
  ch76Headings,
  partsOfMHDVs38i,
} from "./lists";

export const automobileTariffs: TariffI[] = [
  // Automobiles (Section 232)
  {
    code: "9903.94.01",
    description:
      "Except for products described in headings 9903.94.02, 9903.94.03, 9903.94.04, 9903.94.31, 9903.94.40, 9903.94.41, 9903.94.50, and 9903.94.51, passenger vehicles (sedans, sport utility vehicles, crossover utility vehicles, minivans, and cargo vans) and light trucks, as specified in note 33 to this subchapter, as provided for in subdivision (b) of U.S. note 33 to this subchapter",
    name: "Automobiles (Section 232)",
    general: 25,
    special: 25,
    other: 25,
    inclusions: {
      codes: automobiles33B,
    },
    exceptions: [
      "9903.94.02",
      "9903.94.03",
      "9903.94.04",
      "9903.94.31",
      "9903.94.40",
      "9903.94.41",
      "9903.94.50",
      "9903.94.51",
    ],
  },
  {
    code: "9903.94.02",
    description:
      "Effective with respect to entries on or after April 3, 2025, articles as provided for in subdivision (c) of U.S. note 33 to this subchapter.",
    name: "The U.S Content of Articles of Ch.99, III, 33(b) OR non passenger vehicles / light trucks of those headings",
    general: 0,
    special: 0,
    other: 0,
    inclusions: {
      codes: automobiles33B,
    },
    requiresReview: true, // again, this could just be a date within inclusions...
  },
  {
    code: "9903.94.03",
    description:
      "Effective with respect to entries on or after April 3, 2025, certain passenger vehicles and light trucks, as provided for in subdivision (d) of U.S. note 33 to this subchapter.",
    name: "Tariff On Only The Non-US Content of Passenger Vehicles / Light Trucks If Approved by Secretary of Commerce",
    // TODO: need slider,
    general: 25, // on the % of the non U.S. content
    special: 25, // on the % of the non U.S. content
    other: 0,
    inclusions: {
      codes: automobiles33B,
      // TODO: consider adding a field here like "percent" and a title like "non u.s. content"
      // This would need to get reviewed by secretary of commerce for approval regardless...
    },
    requiresReview: true,
  },
  {
    code: "9903.94.04",
    description:
      "Effective with respect to entries on or after April 3, 2025, certain passenger vehicles and light trucks, as provided for in subdivision (e) of U.S. note 33 to this subchapter.",
    name: "Manufactured at least 25 Years Prior to Date of Entry",
    general: 0,
    special: 0,
    other: 0,
    inclusions: {
      codes: automobiles33B,
    },
    requiresReview: true,
  },
  {
    code: "9903.94.31",
    description:
      "Effective with respect to entries on or after [ ], passenger vehicles that are products of the United Kingdom as specified in subdivision (i) of U.S. note 33 to this subchapter, when entered under the terms of subdivision (i) of U.S. note 33 to this subchapter. [Compilers note: This heading is effective on or after June 30, 2025. For more information, see 90 Fed. Reg. 27851.]",
    name: "Passenger Vehicles from the United Kingdom",
    general: 7.5,
    special: 0,
    other: 0,
    inclusions: {
      countries: ["GB"],
      codes: [
        // 33(i)
        "8703.22.01",
        "8703.32.01",
        "8703.60.00",
        "8703.23.01",
        "8703.33.01",
        "8703.70.00",
        "8703.24.01",
        "8703.40.00",
        "8703.80.00",
        "8703.31.01",
        "8703.50.00",
        "8703.90.01",
      ],
      //   TODO: consider adding "amount" to inclusions to handle cases like this where:
      //   aggregate annual import volume must be limited to 65,205 passenger vehicles...
      //   then after jan 1 2026, 100,000 passenger vehicles per year.
      //   and MANY more conditions too....
    },
    requiresReview: true,
  },
  // Auto Parts (Section 232)
  {
    code: "9903.94.05",
    description:
      "Except for products described in headings 9903.94.06, 9903.94.32, 9903.94.33, 9903.94.42, 9903.94.43, 9903.94.44, 9903.94.45, 9903.94.52, 9903.94.53, 9903.94.54, 9903.94.55, automobile parts, as provided for in subdivision (g) of U.S. note 33 to this subchapter",
    name: "Auto Parts",
    general: 25,
    special: 25,
    other: 25,
    exceptions: [
      "9903.94.06",
      "9903.94.32",
      "9903.94.33",
      "9903.94.42",
      "9903.94.43",
      "9903.94.44",
      "9903.94.45",
      "9903.94.52",
      "9903.94.53",
      "9903.94.54",
      "9903.94.55",
      "9903.74.08",
      "9903.74.09",
    ],
    inclusions: {
      codes: automobileParts33G,
    },
  },
  {
    // https://www.federalregister.gov/d/2025-09066/p-18
    code: "9903.94.06",
    description:
      "Effective with respect to entries on or after May 3, 2025, articles provided for in subdivision (h) of U.S. note 33 to this subchapter.",
    //   TODO: Adding quick ability to see USCMA notes would be BIG differentiator
    // becausse for this one USCMA quaifications or being a part but not for passenger vehicles or light trucks is the big thing
    name: "Exclusion: (1) USCMA Eligible other than automobile knock-down kits or parts compilations; (2) Not part for passenger vehicles or light trucks",
    general: 0,
    special: 0,
    other: 0,
    inclusions: {
      codes: automobileParts33G,
    },
    requiresReview: true, // the review here would be: "is this USMCA qualified or is the part not actually for passenger vehicles or light trucks?"
  },
  {
    // https://www.federalregister.gov/d/2025-09066/p-18
    code: "9903.94.07",
    description:
      "Except as provided for in headings 9903.94.33, 9903.94.44, 9903.94.45, 9903.94.54 and 9903.94.55, automobile parts as provided for in subdivision (p) of U.S. note 33 to this subchapter.",
    name: "Parts for the production or repair of automobiles in the United States as certified by the importer of record",
    general: 25,
    special: 25,
    other: 25,
    requiresReview: true,
    inclusions: {
      codes: ["*"],
    },
    exceptions: [
      "9903.94.33",
      "9903.94.44",
      "9903.94.45",
      "9903.94.54",
      "9903.94.55",
      "9903.94.06",
      "9903.94.32",
      "9903.94.42",
      "9903.94.43",
      "9903.94.52",
      "9903.94.53",
    ],
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
    code: "9903.94.33",
    description:
      "Automobile parts the product of the United Kingdom as provided for in subdivision (q) of U.S. note 33 to this subchapter",
    name: "Automobile parts of the United Kingdom that will be used in Automobiles of the United Kingdom",
    general: 10,
    special: 10,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["GB"],
      codes: ["*"],
    },
    exclusions: {
      codes: [
        ...partsOfMHDVs38i,
        ...autoPartsOfUK33J,
        ...ch72Headings,
        ...ch73Headings,
        ...ch76Headings,
      ],
    },
  },
  {
    code: "9903.94.44",
    description:
      "Automobile parts the product of the European Union with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent, as provided for in subdivision (r) of U.S. note 33 to this subchapter.",
    name: "Automobile parts of the European Union with Column 1 Duty <15%",
    general: 15,
    special: 15,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: EuropeanUnionCountries,
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
    code: "9903.94.45",
    description:
      "Automobile parts the product of the European Union with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent, as provided for in subdivision (r) of U.S. note 33 to this subchapter.",
    name: "Automobile parts of the European Union with Column 1 Duty <15%",
    general: 15,
    special: 15,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: EuropeanUnionCountries,
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
    code: "9903.94.54",
    description:
      "Automobile parts the product of Japan with an ad valorem (or ad valorem equivalent) rate of duty under column 1 equal to or greater than 15 percent, as provided for in subdivision (r) of U.S. note 33 to this subchapter.",
    name: "Automobile parts of the Japan with Column 1 Duty >=15%",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: ["JP"],
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
    code: "9903.94.55",
    description:
      "Automobile parts the product of Japan with an ad valorem (or ad valorem equivalent) rate of duty under column 1 less than 15 percent, as provided for in subdivision (r) of U.S. note 33 to this subchapter.",
    name: "Automobile parts of Japan with Column 1 Duty <15%",
    general: 15,
    special: 15,
    other: 0,
    requiresReview: true,
    inclusions: {
      countries: EuropeanUnionCountries,
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
];
