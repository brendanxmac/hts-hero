import { TariffI } from "../interfaces/tariffs";
import { EuropeanUnionCountries } from "../constants/countries";

const upholsteredWoodenProducts = [
  "9401.61.40.11",
  "9401.61.40.31",
  "9401.61.60.11",
  "9401.61.60.31",
];

const completedKitchenCabinetsAndVanities = [
  "9403.40.90.60",
  "9403.60.80.93",
  "9403.91.00.80",
];

export const woodTariffs: TariffI[] = [
  {
    code: "9903.76.01",
    name: "Softwood & Timber Products",
    description: "TODO",
    general: 10,
    special: 10,
    other: 10,
    inclusions: {
      codes: [
        "4403.11.00",
        "4403.23.01",
        "4403.26.01",
        "4406.91.00",
        "4407.13.00",
        "4403.21.01",
        "4403.24.01",
        "4403.99.01",
        "4407.11.00",
        "4407.14.00",
        "4403.22.01",
        "4403.25.01",
        "4406.11.00",
        "4407.12.00",
        "4407.19.00",
      ],
    },
    exceptions: [
      "9903.94.01",
      "9903.94.03",
      // Auto Parts
      "9903.94.05",
      // Auto Parts Certified for the production or repair of automobiles in the United States
      "9903.94.07",
      // Medium & Heavy Duty Vehicle Parts
      "9903.74.08",
      // Parts used for Medium & Heavy Duty Vehicle Production or Repair in the US
      "9903.74.09",
      // Auto Parts of UK
      "9903.94.33",
      // Auto Parts of EU >15%
      "9903.94.44",
      // Auto Parts of EU <=15%
      "9903.94.45",
      // Auto Parts of Japan >15%
      "9903.94.54",
      // Auto Parts of Japan <=15%
      "9903.94.55",
    ],
  },
  {
    code: "9903.76.02",
    name: "Upholstered Wooden Furniture Products",
    description: "TODO",
    general: 25,
    special: 25,
    other: 25,
    exclusions: {
      countries: ["GB", "JP", ...EuropeanUnionCountries],
    },
    inclusions: {
      codes: upholsteredWoodenProducts,
    },
    exceptions: [
      "9903.94.01",
      "9903.94.03",
      // Auto Parts
      "9903.94.05",
      // Auto Parts Certified for the production or repair of automobiles in the United States
      "9903.94.07",
      // Medium & Heavy Duty Vehicle Parts
      "9903.74.08",
      // Parts used for Medium & Heavy Duty Vehicle Production or Repair in the US
      "9903.74.09",
      // Auto Parts of UK
      "9903.94.33",
      // Auto Parts of EU >15%
      "9903.94.44",
      // Auto Parts of EU <=15%
      "9903.94.45",
      // Auto Parts of Japan >15%
      "9903.94.54",
      // Auto Parts of Japan <=15%
      "9903.94.55",
    ],
  },
  {
    code: "9903.76.03",
    name: "Completed Kitchen Cabinets & Vanities (and parts thereof)",
    description: "TODO",
    general: 25,
    special: 25,
    other: 25,
    // requiresReview: true,
    exclusions: {
      countries: ["GB", "JP", ...EuropeanUnionCountries],
    },
    inclusions: {
      codes: completedKitchenCabinetsAndVanities,
    },
    exceptions: [
      "9903.94.01",
      "9903.94.03",
      "9903.76.04",
      // Auto Parts
      "9903.94.05",
      // Auto Parts Certified for the production or repair of automobiles in the United States
      "9903.94.07",
      // Medium & Heavy Duty Vehicle Parts
      "9903.74.08",
      // Parts used for Medium & Heavy Duty Vehicle Production or Repair in the US
      "9903.74.09",
      // Auto Parts of UK
      "9903.94.33",
      // Auto Parts of EU >15%
      "9903.94.44",
      // Auto Parts of EU <=15%
      "9903.94.45",
      // Auto Parts of Japan >15%
      "9903.94.54",
      // Auto Parts of Japan <=15%
      "9903.94.55",
    ],
  },
  {
    code: "9903.76.04",
    name: "Not Completed Kitchen Cabinets & Vanities (and parts thereof)",
    description: "TODO",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      codes: completedKitchenCabinetsAndVanities,
    },
  },
  {
    code: "9903.76.20",
    name: "Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from the United Kingdom",
    description: "TODO",
    general: 10,
    special: 10,
    other: 0,
    inclusions: {
      countries: ["GB"],
      codes: [
        ...upholsteredWoodenProducts,
        ...completedKitchenCabinetsAndVanities,
      ],
    },
    exceptions: ["9903.94.01", "9903.94.03", "9903.94.05"],
  },
  {
    code: "9903.76.21",
    name: "Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from Japan",
    description: "TODO",
    general: 15,
    special: 15,
    other: 0,
    inclusions: {
      countries: ["JP"],
      codes: [
        ...upholsteredWoodenProducts,
        ...completedKitchenCabinetsAndVanities,
      ],
    },
    exceptions: ["9903.94.01", "9903.94.03", "9903.94.05"],
  },
  {
    code: "9903.76.22",
    name: "Upholstered Wooden Furniture Products & Completed Cabinets & Vanities and their parts from the European Union",
    description: "TODO",
    general: 15,
    special: 15,
    other: 0,
    inclusions: {
      countries: EuropeanUnionCountries,
      codes: [
        ...upholsteredWoodenProducts,
        ...completedKitchenCabinetsAndVanities,
      ],
    },
    exceptions: ["9903.94.01", "9903.94.03", "9903.94.05"],
  },
];
