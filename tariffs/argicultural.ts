import { TariffI } from "../interfaces/tariffs";

export const argiculturalTariffs: TariffI[] = [
  {
    code: "9903.02.78",
    description:
      "Articles the product of any country, as provided for in subdivision (v)(iii)(b) of U.S. note 2 to this subchapter",
    name: "Argicultural Products Exempt from Reciprocal Tariffs",
    general: 0,
    special: 0,
    other: 0,
    requiresReview: true,
    inclusions: {
      codes: [
        "0805.90.01", // Etrogs
        "0811.90.80", // Tropical fruit, not elsewhere specified or included, frozen, whether or not previously steamed or boiled",
        "1404.90.90", // Date palm branches, Myrtus branches or other vegetable material, for religious purposes only",
        "1905.90.10", // Bread, pastry, cakes, biscuits and similar baked products, not elsewhere specified or included, and puddings, whether or not containing chocolate, fruit, nuts or confectionery, for religious purposes only",
        "1905.90.90", // Bakers’ wares, communion wafers, sealing wafers, rice paper and similar products, not elsewhere specified or included, for religious purposes only",
        "2008.99.21", // Acai",
        "2009.31.60", // Citrus juice of any single citrus fruit (other than orange, grapefruit or lime), of a Brix value not exceeding 20, concentrated, unfermented, except for lemon juice",
        "2009.89.70", // Coconut water or juice of acai",
        "2009.90.40", // Coconut water juice blends, not from concentrate, packaged for retail sale",
        "2106.90.99", // Acai preparations for the manufacture of beverages",
        "3301.29.51", // Essential oils other than those of citrus fruit, not elsewhere specified or included, for religious purposes only",
      ],
    },
  },
];
