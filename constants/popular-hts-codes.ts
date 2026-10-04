// Commonly imported products, linked from the homepage so crawlers reach their /hts pages.
// `code` is the element's htsno in the HTS (10 digits when the 8-digit line has no
// statistical breakouts), checked against 2026 HTS Revision 20.

export interface PopularHtsCode {
  code: string;
  label: string;
}

export const POPULAR_HTS_CODES: { category: string; codes: PopularHtsCode[] }[] = [
  {
    category: "Apparel, footwear & bags",
    codes: [
      { code: "6109.10.00", label: "Cotton T-shirts" },
      { code: "6110.20.20", label: "Cotton sweaters & sweatshirts" },
      { code: "6104.43.20", label: "Women's synthetic dresses" },
      { code: "6404.11.90", label: "Sneakers & athletic shoes" },
      { code: "6403.99.60", label: "Men's leather shoes" },
      { code: "4202.92.31", label: "Backpacks & travel bags" },
      { code: "4202.21.60.00", label: "Leather handbags" },
    ],
  },
  {
    category: "Electronics",
    codes: [
      { code: "8517.13.00.00", label: "Smartphones" },
      { code: "8471.30.01.00", label: "Laptops" },
      { code: "8528.72.64", label: "Flat-panel TVs" },
      { code: "8518.30.20.00", label: "Headphones & earbuds" },
      { code: "9504.50.00.00", label: "Video game consoles" },
      { code: "8443.32.10", label: "Printers" },
      { code: "8806.21.00.00", label: "Drones (250 g or less)" },
      { code: "8536.69.40", label: "Electrical connectors" },
    ],
  },
  {
    category: "Energy & vehicles",
    codes: [
      { code: "8507.60.00", label: "Lithium-ion batteries" },
      { code: "8541.43.00", label: "Solar panels" },
      { code: "8703.80.00", label: "Electric vehicles" },
      { code: "8711.60.00", label: "E-bikes & electric motorcycles" },
      { code: "8708.30.50", label: "Brake parts for cars" },
      { code: "8708.99.81", label: "Other auto parts" },
    ],
  },
  {
    category: "Home & kitchen",
    codes: [
      { code: "9403.60.80", label: "Wooden furniture" },
      { code: "9401.61.60", label: "Upholstered wooden seating" },
      { code: "9404.21.00", label: "Foam mattresses" },
      { code: "8418.10.00", label: "Refrigerator-freezers" },
      { code: "8450.11.00", label: "Washing machines" },
      { code: "8415.10.30", label: "Window & wall air conditioners" },
      { code: "8414.51.90", label: "Electric fans" },
      { code: "8509.40.00", label: "Blenders & food processors" },
      { code: "7323.93.00", label: "Stainless steel kitchenware" },
      { code: "9617.00.10.00", label: "Vacuum flasks & insulated bottles" },
      { code: "3924.10.20.00", label: "Plastic plates, cups & bowls" },
      { code: "9503.00.00", label: "Toys" },
      { code: "9506.91.00", label: "Exercise & fitness equipment" },
    ],
  },
  {
    category: "Metals & materials",
    codes: [
      { code: "7308.90.95", label: "Steel structures & parts" },
      { code: "7318.15.20", label: "Steel bolts & nuts" },
      { code: "7606.12.30", label: "Aluminum alloy sheet" },
      { code: "7403.11.00.00", label: "Copper cathodes" },
      { code: "4407.11.00", label: "Pine lumber" },
      { code: "3926.90.99", label: "Other plastic articles" },
    ],
  },
  {
    category: "Food, drink & personal care",
    codes: [
      { code: "0901.21.00", label: "Roasted coffee" },
      { code: "0306.17.00", label: "Frozen shrimp" },
      { code: "0804.40.00", label: "Avocados" },
      { code: "2204.21.50", label: "Bottled wine" },
      { code: "2208.30.60", label: "Whisky" },
      { code: "3004.90.92", label: "Medicines" },
      { code: "3304.99.50.00", label: "Cosmetics & skin care" },
      { code: "3305.10.00.00", label: "Shampoo" },
      { code: "7113.19.50", label: "Gold & precious-metal jewelry" },
    ],
  },
];
