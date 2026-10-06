// The example classifications shown on the homepage. Their shared pages (/c/<shareToken>) are
// public and get search titles; every other shared classification keeps the site default.

export interface ClassificationExample {
  htsCode: string;
  description: string;
  defense?: string;
  shareToken: string;
  // The shared page's title and description: worded like the searches it already shows up for
  seoTitle: string;
  seoDescription: string;
  image: string;
  classificationPath: string[];
  stats: {
    levels: number;
    crossRulings: number;
  };
}

export const CLASSIFICATION_EXAMPLES: ClassificationExample[] = [
  {
    htsCode: "6813.20.00.60",
    description:
      "Ceramic brake pads for passenger vehicles, semi-metallic compound with copper-free formulation",
    shareToken: "TKWXwgrFN9M",
    seoTitle: "Brake Pad HS Code: 6813.20.00.60 for Ceramic Brake Pads",
    seoDescription:
      "Ceramic brake pads for passenger vehicles classify under HTS 6813.20.00.60. See the full classification, the GRI analysis and the CBP rulings that support it.",
    image: '/brakes.png',
    classificationPath: [
      "Section XIII",
      "Chapter 68",
      "Heading 6813",
      "6813.20.00.60",
    ],
    stats: { levels: 4, crossRulings: 3 },
  },
  {
    htsCode: "7323.93.00.85",
    description:
      "Stainless steel double-wall vacuum insulated water bottle, 32oz with leak-proof lid",
    shareToken: "XYjXJH10Ws4",
    seoTitle: "Vacuum Flask HS Code: 7323.93.00.85 for Stainless Steel Bottles",
    seoDescription:
      "A stainless steel, vacuum insulated water bottle classifies under HTS 7323.93.00.85. See the full classification, the GRI analysis and the CBP rulings that support it.",
    image: '/bottle.png',
    classificationPath: [
      "Section XV",
      "Chapter 73",
      "Heading 7323",
      "7323.93.00.85",
    ],
    stats: { levels: 3, crossRulings: 5 },
  },
  {
    htsCode: "6110.12.20.40",
    description:
      "Women's 100% cashmere crew-neck pullover sweater, knitted, with ribbed cuffs",
    shareToken: "NTUh3omQZ6Q",
    seoTitle: "Cashmere Sweater HS Code: 6110.12.20.40 for Women's Knit Sweaters",
    seoDescription:
      "A women's 100% cashmere knitted sweater classifies under HTS 6110.12.20.40. See the full classification, the GRI analysis and the CBP rulings that support it.",
    image: '/sweater.png',
    classificationPath: [
      "Section XI",
      "Chapter 61",
      "Heading 6110",
      "6110.12.20.40",
    ],
    stats: { levels: 6, crossRulings: 4 },
  },
];

export const classificationExampleByToken = (token: string) =>
  CLASSIFICATION_EXAMPLES.find((e) => e.shareToken === token);
