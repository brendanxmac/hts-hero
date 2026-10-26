import { longDate } from "./heading";
import { countriesLabel, type ProgramPage } from "./program";

// A program page's questions, shown in its FAQ and FAQPage schema (which must match what's visible)
export const hubFaqs = (page: ProgramPage, lead: string): [string, string][] => {
  const { hub, inForce, codes, allProducts, ended } = page;
  const live = inForce.length > 0;
  const topRates = inForce
    .slice()
    .sort((a, b) => (b.ratePct ?? 0) - (a.ratePct ?? 0))
    .slice(0, 4)
    .map((p) => `${p.rate.replace(/^\+/, "")} under ${p.code} (${p.name}${countriesLabel(p) === "All countries" ? "" : `, ${countriesLabel(p)}`})`);
  return [
    [`What are the ${hub.short}?`, `${hub.law} ${lead}`],
    [
      `Are the ${hub.short} still in effect?`,
      live
        ? `Yes. On ${longDate(page.asOf)}, ${inForce.length} of their Chapter 99 headings are in force.${ended.length > 0 ? ` ${ended.length} earlier heading${ended.length === 1 ? " has" : "s have"} ended.` : ""}`
        : lead,
    ],
    ...(live && codes.length > 0
      ? [
          [
            `Which HTS codes are subject to the ${hub.short}?`,
            `${codes.length.toLocaleString("en-US")} HTS codes are listed under the headings in force on ${longDate(page.asOf)}. This page lists every one, with its heading and rate. A listed code covers every line under it, and whether a product is in scope also depends on the written description in the U.S. notes to Chapter 99.`,
          ] as [string, string],
        ]
      : []),
    ...(live && codes.length === 0 && allProducts.length > 0
      ? [
          [
            `Which products are subject to the ${hub.short}?`,
            `Every product from the countries the headings name, unless a heading that takes precedence (an exemption or another program) applies. The countries covered: ${Array.from(new Set(allProducts.flatMap((p) => (p.countries.all ? ["every country"] : p.countries.names)))).slice(0, 12).join(", ")}${allProducts.length > 12 ? " and others" : ""}.`,
          ] as [string, string],
        ]
      : []),
    ...(live
      ? [[`What are the ${hub.short} rates?`, `Rates range from ${page.rateRange}. The highest: ${topRates.join("; ")}. They are added on top of the regular duty and any other Chapter 99 duties, except where the rules say one replaces another.`] as [string, string]]
      : []),
    [
      `How do I check whether the ${hub.short} apply to my import?`,
      `Find your HTS code in the tables on this page, or enter it with the country of origin in the free HTS Hero tariff calculator, which applies every Chapter 99 heading in force on the entry date. Scope also depends on the written description of the products covered, which the importer or their customs broker decides.`,
    ],
    ...(hub.slug === "ieepa" && ended[0]?.refund ? [[`Can I get a refund of IEEPA duties?`, ended[0].refund.text] as [string, string]] : []),
  ];
};
