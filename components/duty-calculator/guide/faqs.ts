// Questions answered on /duty-calculator, shown on the page and in its FAQPage JSON-LD

export const dutyCalculatorFaqs = (revisionTitle: string): { question: string; answer: string }[] => [
  {
    question: "How are US import duties calculated?",
    answer:
      "US import duties depend on the product's HTS (Harmonized Tariff Schedule) code, its country of origin and the date it's entered. The base rate comes from the HTS: Column 1 General for most countries, Column 1 Special when the goods qualify for a trade agreement or preference program such as USMCA, and Column 2 for Cuba, North Korea, Russia and Belarus. Additional Chapter 99 duties are then added, such as Section 232 tariffs on steel, aluminum, copper, autos and wood, and Section 301 tariffs on goods from China, unless an exemption applies. Duties are applied to the customs value (or per unit for specific rates), and customs fees are added: the Merchandise Processing Fee (0.3464%, with a minimum and maximum) and, for ocean shipments, the Harbor Maintenance Fee (0.125%). Antidumping and countervailing duties are set case by case and aren't included in this calculator.",
  },
  {
    question: "What are Section 301 tariffs?",
    answer:
      "Section 301 tariffs are additional duties imposed under Section 301 of the Trade Act of 1974. The longest-running are on goods from China, from 7.5% to 100% depending on the product and, for recent increases, the entry date. Section 301 duties also apply to goods from Brazil and, under the forced-labor action, to imports from many other countries. They're added on top of the standard HTS duty rate, and the HTS Hero calculator applies the lists, rates and exclusions in effect on your entry date.",
  },
  {
    question: "Is this US tariff calculator free?",
    answer:
      "Yes, the HTS Hero duty and tariff calculator is completely free, with no sign-up required. Enter an HTS code, country of origin and entry date to see the full duty breakdown, including the base rate, Section 232, 301 and 122 tariffs, trade preferences, and customs fees.",
  },
  {
    question: "How do I find the tariff rate for imports from a specific country?",
    answer:
      "Enter the product's HTS code, then select the country of origin. The calculator shows the rates that apply to goods from that country on your entry date, including additional tariffs (like Section 301 for China) and preferential rates you can claim (like USMCA for goods from Mexico and Canada that meet its rules of origin).",
  },
  {
    question: "Does the calculator include antidumping and countervailing duties?",
    answer:
      "No. Antidumping and countervailing duties (AD/CVD) are set case by case for specific producers and exporters, so they aren't included. If your product is covered by an AD/CVD order, check the order's rates with CBP or your customs broker and add them to the estimate.",
  },
  {
    question: "How current are the tariff rates?",
    answer: `The calculator is updated with every revision of the Harmonized Tariff Schedule, and each revision's Chapter 99 changes are entered with their effective dates. Tariff data is currently verified through ${revisionTitle}. You can set any entry date, past or future, to see the rates in effect on that day.`,
  },
];
