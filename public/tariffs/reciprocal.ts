import { TariffI } from "./tariffs";

export const reciprocalTariffs: TariffI[] = [
  // ===========================
  // WORLDWIDE RECIPROCAL TARIFF
  // ===========================
  {
    code: "9903.01.25",
    description:
      "Articles the product of any country, except for products described in headings 9903.01.26–9903.01.33, except as provided for in heading 9903.01.34, and except as provided for in heading 9903.96.01, as provided for in subdivision (v) of U.S. note 2 to this subchapter",
    name: "Worldwide Reciprocal 10% (IEEPA)",
    general: 10,
    special: 10,
    other: 0,
    inclusions: {
      countries: ["*"],
      // When a tariff applies to all countries we just do *
    },
    exceptions: [
      "9903.01.26",
      "9903.01.27",
      "9903.01.28",
      "9903.01.29",
      "9903.01.30",
      "9903.01.31",
      "9903.01.32",
      // TODO: If the article is >20% US originating, then 01.25 only applies to
      // the % of non-U.S originating. If <20% then the full thing hit with 01.25
      // Need slider for this one to set the % of US originating (IF 01.25 applies)
      "9903.01.34",
      "9903.01.33",
      // FIXME: I uncommented all of these for now... in case they exist on their own
      // and so that they're not nested beneath 9903.01.33
      // "9903.96.01",
      // "9903.81.87", // \/
      // "9903.81.88", // \/
      // "9903.81.89", // \/
      // "9903.81.90", // \/
      // "9903.81.91", // \/
      // "9903.81.92", // \/
      // "9903.81.93", // \/
      // "9903.85.02", // ---> All of thses are within 9903.01.33 TODO: should we join or..? not common enough to create edge case?
      // "9903.85.04", // ^ --> steel, aluminum, derivatives, autos, auto parts, civil aircraft.. maybe others?
      // "9903.85.07", // ^
      // "9903.85.08", // ^
      // "9903.85.09", // ^
      // "9903.94.01", // ^
      // "9903.94.03", // ^
      // "9903.94.05", // ^
      // xii of this note is suspended -- it covered addition tariffs on a per country basis
      // comes back to this on August 1st to review, or once the next HTS revision is live
    ],
  },
];
