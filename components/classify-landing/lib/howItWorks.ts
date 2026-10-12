// The how-it-works demo's data, carried over unchanged from the original homepage section: three
// sample products with their candidate headings, evidence and reasoning, and the four steps.

export const PRODUCTS = [
  {
    label: "Brake pads",
    description:
      "Ceramic brake pads for passenger vehicles, copper-free semi-metallic compound",
    selectedIndex: 1,
    candidates: [
      {
        code: "8113",
        title: "Cermets and articles thereof, including waste and scrap",
      },
      {
        code: "8708",
        title:
          "Parts and accessories of the motor vehicles of headings 8701 to 8705",
      },
      {
        code: "6914",
        title: "Other ceramic articles",
      },
    ],
    legalNotes: [
      { source: "Section XVII Note 3" },
      { source: "Section XVII Note 2" },
      { source: "Heading 8703" },
    ],
    crossRulings: [{ id: "NY N349345" }, { id: "NY N345796" }],
    notesWhy:
      "Section XVII Note 3 requires parts to be suitable solely with vehicles of chapters 86–88. These pads are made for passenger vehicles, provided for by heading 8703. Note 2 does not exclude ceramic brake pads as parts of general use.",
    rulingsWhy:
      "NY N349345 and NY N345796 classify comparable ceramic brake pads as motor-vehicle parts of heading 8708.",
    summary:
      "I selected 8708. These pads are made for passenger vehicles of heading 8703, so they satisfy Section XVII Note 3 (suitable solely or principally with chapter 87 vehicles). Note 2 does not treat ceramic brake pads as parts of general use or as another excluded class, so they remain vehicle parts. NY N349345 and NY N345796 classify comparable pads in 8708. 8113 and 6914 don’t match the use.",
  },
  {
    label: "Stainless Steel Bottle",
    description:
      "Stainless steel double-wall vacuum insulated water bottle, 32oz with leak-proof lid",
    selectedIndex: 0,
    candidates: [
      {
        code: "9617",
        title:
          "Vacuum flasks and other vacuum vessels, complete; parts thereof other than glass inners",
      },
      {
        code: "7310",
        title:
          "Tanks, casks, drums, cans, boxes and similar containers, for any material (other than compressed or liquefied gas), of iron or steel, of a capacity not exceeding 300 liters, whether or not lined or heat insulated, but not fitted with mechanical or thermal equipment",
      },
      {
        code: "7323",
        title:
          "Table, kitchen or other household articles and parts thereof, of iron or steel; iron or steel wool; pot scourers and scouring or polishing pads, gloves and the like, of iron or steel",
      },
      {
        code: "7326",
        title: "Other articles of iron or steel",
      },
    ],
    legalNotes: [
      { source: "Section XV Note 3" },
      { source: "Chapter 96 Note 1(d)" },
    ],
    crossRulings: [{ id: "NY N353266" }],
    notesWhy:
      "Section XV Note 3 and Chapter 96 Note 1(d) take complete vacuum vessels out of the iron and steel headings. A double-wall vacuum bottle belongs in 9617, not 7310, 7323, or 7326.",
    rulingsWhy:
      "NY N353266 classifies a similar vacuum-insulated steel bottle as a vacuum vessel of heading 9617.",
    summary:
      "This is a complete vacuum-insulated vessel, not a steel kitchen article or residual container. Chapter 96 Note 1(d) and Section XV Note 3 keep vacuum flasks out of the base-metal headings. NY N353266 supports 9617, so that’s the heading I’m taking.",
  },
  {
    label: "Cashmere sweater",
    description:
      "Women's 100% cashmere crew-neck pullover sweater, knitted, with ribbed cuffs",
    selectedIndex: 0,
    candidates: [
      {
        code: "6110",
        title: "Sweaters, pullovers and similar articles, knitted",
      },
      {
        code: "6114",
        title: "Other garments, knitted or crocheted",
      },
      {
        code: "6206",
        title: "Women's or girls' blouses, shirts and shirt-blouses",
      },
    ],
    legalNotes: [
      { source: "Chapter 61 Note 1" },
      { source: "Chapter 51 Note 1(b)" },
    ],
    crossRulings: [
      { id: "NY E87476" },
      { id: "NY K85590" },
      { id: "NY E85451" },
    ],
    notesWhy:
      "Chapter 61 Note 1 keeps knitted garments in Chapter 61, so woven heading 6206 is out. Chapter 51 Note 1(b) treats cashmere as fine animal hair, which is why 6110 is the right knitted pullover heading.",
    rulingsWhy:
      "NY E87476, NY K85590, and NY E85451 all classify knitted cashmere pullovers in heading 6110.",
    summary:
      "The terms of this heading are nearly spot on for this article. The sweater is knitted not woven. Chapter 61 Note 1, helps rule out 6206 based on this. Cashmere is fine animal hair under Chapter 51 Note 1(b). NY E87476, NY K85590, and NY E85451 all point to 6110 as the best heading for this article.",
  },
] as const;

export const STEPS = [
  {
    title: "Enter Product Description",
    description: "Type a good description of the product you need to classify",
  },
  {
    title: "See Candidates & Evidence",
    description: "Get a list of headings and an analysis of related HTS notes and CROSS rulings",
  },
  {
    title: "Select",
    description: "You stay in full control of the decision, and get to document your reasoning",
  },
  {
    title: "Repeat",
    description: "Continue the same process until you reach 10 digits",
  },
] as const;

export type Product = (typeof PRODUCTS)[number];
