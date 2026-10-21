// The "Try an example" products on each country page's calculator: goods the US imports most
// from that country, hand-picked as products an importer would price (no gold, precious metals,
// crude oil or fuels). Chosen from US-reported 2025 imports by HS6 (UN Comtrade), then pinned to
// one statistical line of the current HTS. Japan, Chile, Indonesia, Spain and Austria are picked
// from their best-known exports to the US. Refresh when the HTS renumbers one of these codes.

export interface CountryProduct {
  code: string;
  label: string;
}

export const COUNTRY_PRODUCTS: Record<string, CountryProduct[]> = {
  // Mexico
  MX: [
    { code: "8704.31.01.40", label: "Pickup trucks" },
    { code: "8703.23.01.40", label: "Passenger cars" },
    { code: "8471.50.01.50", label: "Computer servers" },
    { code: "8544.30.00.00", label: "Vehicle wiring harnesses" },
    { code: "2203.00.00.30", label: "Beer" },
  ],
  // Canada
  CA: [
    { code: "8703.23.01.40", label: "Passenger cars" },
    { code: "8703.40.00.20", label: "Hybrid SUVs" },
    { code: "4407.11.00.43", label: "Softwood lumber" },
    { code: "7601.10.60.90", label: "Unwrought aluminum" },
    { code: "3901.40.00.00", label: "Polyethylene resin" },
  ],
  // China
  CN: [
    { code: "8517.13.00.00", label: "Smartphones" },
    { code: "8471.30.01.00", label: "Laptops" },
    { code: "8507.60.00.90", label: "Lithium-ion batteries" },
    { code: "9503.00.00.90", label: "Toys" },
    { code: "3924.10.40.00", label: "Plastic kitchenware" },
  ],
  // Taiwan
  TW: [
    { code: "8471.50.01.50", label: "Computer servers" },
    { code: "8473.30.51.00", label: "Computer parts" },
    { code: "8542.31.00.40", label: "Graphics processors (GPUs)" },
    { code: "8523.51.00.00", label: "Solid-state drives" },
    { code: "8517.62.00.20", label: "Network switches and routers" },
  ],
  // Vietnam
  VN: [
    { code: "8471.30.01.00", label: "Laptops" },
    { code: "8517.13.00.00", label: "Smartphones" },
    { code: "8518.30.20.00", label: "Headphones" },
    { code: "6404.11.90.20", label: "Athletic sneakers" },
    { code: "9401.61.40.11", label: "Upholstered wooden chairs" },
  ],
  // Germany
  DE: [
    { code: "8703.23.01.40", label: "Passenger cars" },
    { code: "8703.24.01.50", label: "Luxury cars and SUVs" },
    { code: "8703.80.00.20", label: "Electric cars" },
    { code: "3004.90.92.76", label: "Packaged medicines" },
    { code: "9018.90.80.00", label: "Medical instruments" },
  ],
  // Japan
  JP: [
    { code: "8703.23.01.40", label: "Passenger cars" },
    { code: "8703.40.00.20", label: "Hybrid cars" },
    { code: "8708.99.81.80", label: "Auto parts" },
    { code: "8429.52.10.10", label: "Hydraulic excavators" },
    { code: "4011.10.10.40", label: "Car tires" },
  ],
  // Ireland
  IE: [
    { code: "3004.90.92.76", label: "Packaged medicines" },
    { code: "9021.31.00.00", label: "Artificial joints" },
    { code: "9021.39.00.00", label: "Medical implants" },
    { code: "9018.90.80.00", label: "Medical instruments" },
    { code: "2208.30.30.30", label: "Irish whiskey" },
  ],
  // South Korea
  KR: [
    { code: "8703.23.01.40", label: "Passenger cars" },
    { code: "8703.40.00.20", label: "Hybrid cars" },
    { code: "8473.30.11.40", label: "Memory modules" },
    { code: "8523.51.00.00", label: "Solid-state drives" },
    { code: "4011.10.10.40", label: "Car tires" },
  ],
  // Switzerland
  CH: [
    { code: "3004.90.92.76", label: "Packaged medicines" },
    { code: "9102.21.70", label: "Automatic watches" },
    { code: "0901.21.00.20", label: "Roasted coffee" },
    { code: "1806.32.08.00", label: "Chocolate bars" },
    { code: "9018.90.80.00", label: "Medical instruments" },
  ],
  // India
  IN: [
    { code: "8517.13.00.00", label: "Smartphones" },
    { code: "3004.90.92.76", label: "Generic medicines" },
    { code: "0306.17.00.10", label: "Frozen shrimp" },
    { code: "6302.60.00.20", label: "Cotton towels" },
    { code: "1006.30.90.59", label: "Basmati rice" },
  ],
  // Thailand
  TH: [
    { code: "8517.62.00.20", label: "Network switches and routers" },
    { code: "8471.50.01.50", label: "Computer servers" },
    { code: "8471.70.40.65", label: "Hard disk drives" },
    { code: "8471.30.01.00", label: "Laptops" },
    { code: "4011.10.10.40", label: "Car tires" },
  ],
  // Italy
  IT: [
    { code: "3004.90.92.76", label: "Packaged medicines" },
    { code: "8703.24.01.50", label: "Sports cars" },
    { code: "2204.21.50.40", label: "Red wine" },
    { code: "1509.20.20.90", label: "Extra virgin olive oil" },
    { code: "8481.80.10.30", label: "Kitchen and bath faucets" },
  ],
  // France
  FR: [
    { code: "3303.00.30.00", label: "Perfume" },
    { code: "2204.10.00.75", label: "Champagne" },
    { code: "2204.21.50.40", label: "Red wine" },
    { code: "2208.20.40.00", label: "Cognac" },
    { code: "3004.90.92.76", label: "Packaged medicines" },
  ],
  // the United Kingdom
  GB: [
    { code: "8703.40.00.20", label: "Hybrid SUVs" },
    { code: "8703.24.01.50", label: "Luxury cars" },
    { code: "2208.30.30.30", label: "Scotch whisky" },
    { code: "2208.50.00.30", label: "Gin" },
    { code: "3004.90.92.76", label: "Packaged medicines" },
  ],
  // Malaysia
  MY: [
    { code: "8517.62.00.20", label: "Network switches and routers" },
    { code: "8523.51.00.00", label: "Solid-state drives" },
    { code: "4015.12.10.10", label: "Medical gloves" },
    { code: "8541.43.00.10", label: "Solar panels" },
    { code: "9403.50.90.80", label: "Wooden bedroom furniture" },
  ],
  // Brazil
  BR: [
    { code: "0901.11.00.25", label: "Green coffee" },
    { code: "2009.12.45.00", label: "Orange juice" },
    { code: "7207.12.00.50", label: "Steel slabs" },
    { code: "0202.30.80.25", label: "Frozen beef" },
    { code: "4703.21.00.40", label: "Wood pulp" },
  ],
  // Singapore
  SG: [
    { code: "3004.90.92.76", label: "Packaged medicines" },
    { code: "9019.20.00.00", label: "Respiratory therapy devices" },
    { code: "8523.51.00.00", label: "Solid-state drives" },
    { code: "8486.20.00.00", label: "Chipmaking equipment" },
    { code: "2106.90.99.73", label: "Food preparations" },
  ],
  // the Netherlands
  NL: [
    { code: "8486.20.00.00", label: "Chipmaking machines" },
    { code: "8486.90.00.00", label: "Chipmaking machine parts" },
    { code: "3004.90.92.76", label: "Packaged medicines" },
    { code: "3006.60.00.00", label: "Contraceptives" },
    { code: "2203.00.00.30", label: "Beer" },
  ],
  // Indonesia
  ID: [
    { code: "6404.11.90.20", label: "Athletic sneakers" },
    { code: "6204.62.80.11", label: "Women's denim jeans" },
    { code: "4011.10.10.40", label: "Car tires" },
    { code: "9401.61.40.11", label: "Upholstered wooden chairs" },
    { code: "1511.90.00.00", label: "Palm oil" },
  ],
  // Australia
  AU: [
    { code: "0202.30.80.25", label: "Frozen beef" },
    { code: "0201.30.80.90", label: "Fresh beef" },
    { code: "0204.22.20.20", label: "Lamb legs" },
    { code: "2204.21.50.40", label: "Red wine" },
    { code: "3004.90.92.76", label: "Packaged medicines" },
  ],
  // Belgium
  BE: [
    { code: "3002.41.00.00", label: "Vaccines" },
    { code: "3002.15.00.11", label: "Antibody medicines" },
    { code: "8703.23.01.40", label: "Passenger cars" },
    { code: "1806.32.08.00", label: "Chocolate bars" },
    { code: "2203.00.00.30", label: "Beer" },
  ],
  // Spain
  ES: [
    { code: "1509.20.20.90", label: "Extra virgin olive oil" },
    { code: "6907.21.90.51", label: "Ceramic tiles" },
    { code: "8537.10.91.50", label: "Electrical panel boards" },
    { code: "2005.70.25.42", label: "Spanish-style green olives" },
    { code: "2204.21.50.40", label: "Red wine" },
  ],
  // Israel
  IL: [
    { code: "8542.31.00.45", label: "Processors (CPUs)" },
    { code: "3004.90.92.76", label: "Generic medicines" },
    { code: "8517.62.00.20", label: "Network switches and routers" },
    { code: "9018.90.80.00", label: "Medical instruments" },
    { code: "8504.40.95.77", label: "Solar inverters" },
  ],
  // Chile
  CL: [
    { code: "0304.41.00.10", label: "Farmed salmon fillets" },
    { code: "0806.10.20.15", label: "Fresh red grapes" },
    { code: "0810.40.00.29", label: "Blueberries" },
    { code: "0809.29.00.00", label: "Cherries" },
    { code: "2204.21.50.40", label: "Red wine" },
  ],
  // Colombia
  CO: [
    { code: "0901.11.00.25", label: "Green coffee" },
    { code: "0603.11.00.50", label: "Roses" },
    { code: "0803.90.00.35", label: "Bananas" },
    { code: "0804.40.00.40", label: "Avocados" },
    { code: "7610.10.00.10", label: "Aluminum windows" },
  ],
  // Austria
  AT: [
    { code: "2202.99.91.10", label: "Energy drinks" },
    { code: "8477.10.90.40", label: "Injection molding machines" },
    { code: "8703.23.01.40", label: "Passenger cars" },
    { code: "8708.99.81.80", label: "Auto parts" },
    { code: "3004.90.92.76", label: "Packaged medicines" },
  ],
  // the Philippines
  PH: [
    { code: "8473.30.51.00", label: "Computer parts" },
    { code: "8504.50.80.00", label: "Inductors" },
    { code: "8471.70.40.65", label: "Hard disk drives" },
    { code: "8544.30.00.00", label: "Vehicle wiring harnesses" },
    { code: "1513.19.00.90", label: "Coconut oil" },
  ],
  // South Africa
  ZA: [
    { code: "8703.23.01.40", label: "Passenger cars" },
    { code: "7601.10.60.90", label: "Unwrought aluminum" },
    { code: "0805.10.00.60", label: "Oranges" },
    { code: "0805.21.00.10", label: "Tangerines" },
    { code: "2204.21.50.40", label: "Red wine" },
  ],
  // Turkey
  TR: [
    { code: "8504.23.00.80", label: "Power transformers" },
    { code: "8481.80.50.90", label: "Valves" },
    { code: "7308.90.95.90", label: "Steel structures" },
    { code: "7308.20.00.35", label: "Wind turbine towers" },
    { code: "6302.60.00.20", label: "Cotton towels" },
  ],
};
