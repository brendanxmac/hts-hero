import { indiaRussianOilConsumptionExclusions } from "../exclusion-lists.ts/india-oil-issue-exclusions";
import { reciprocalTariffExclusionsList } from "../exclusion-lists.ts/reciprocal-tariff-exlcusions";
import { august_15_FR_232_impacted_codes_list } from "./232-FR-August-15";

export interface ListExample {
  name: string;
  list: string;
}

export interface TariffCodeSet {
  id: string;
  name: string;
  source_name?: string;
  source?: string;
  codes: string[];
  note?: string;
  published_at: string; // ISO Date String
  created_at: string; // ISO Date String
  updated_at: string; // ISO Date String
}

export interface TariffImpactResult {
  code: string;
  impacted: boolean | null;
  error?: string;
}

export const ExampleHtsCodeList = [
  "2602.00.00.40",
  "8544.49.20.00",
  "9701.21.00.00",
  "9403.99.90.10",
  "4408.90.01",
  "4408.90.01.10",
  "9701.21.00.00",
  "2825.80.00.00",
  "7614.10.10.00",
  "7614.10.50.00",
  "2106.90.99.98",
];

const commaSeparatedList = ExampleHtsCodeList.join(", ");
const newlineSeparatedList = [...ExampleHtsCodeList]
  .sort(() => Math.random() - 0.5)
  .join("\n");
const spaceSeparatedList = [...ExampleHtsCodeList]
  .sort(() => Math.random() - 0.5)
  .join(" ");
// const mixedSeparatedList =
//   "2602.00.00.40, 9701.21.00.00\n4408.90.01, 4408.90.01.10\n97.01.21.00.00, 2825.80.00.00\n8544.49.20.00, 9403.99.90.10\n7614.10.10.00, 7614.10.50.00\n2106.90.99.98";
export const exampleLists: ListExample[] = [
  {
    name: "Example 1",
    list: commaSeparatedList,
  },
  {
    name: "Example 2",
    list: newlineSeparatedList,
  },
  {
    name: "Example 3",
    list: spaceSeparatedList,
  },
];

// const indiaOilBasedExclusions: TariffCodeSet = {
//   name: "Exemptions for India's 'Russian Oil' 25% Tariff",
//   source_name: "CSMS #66027027",
//   source: "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3ef7e13",
//   codes: indiaRussianOilConsumptionExclusions,
//   published_at: new Date("2025-08-25"),
//   note: "This specific announcement is only applicable to imports from India. Additional exemptions exist if the import is a qualified donation, information materials, or chapter 98 provision. Certain exemptions come with exclusions which you can see by clicking the HTS Code in the results table. Always contact a customs broker for proper import assistance and guidance.",
// };

// const section232SteelAndAluminumChanges: TariffCodeSet = {
//   name: "Additional Articles of Steel and Aluminum",
//   source_name: "Federal Register",
//   source:
//     "https://www.federalregister.gov/public-inspection/2025-15819/adoption-and-procedures-of-the-section-232-steel-and-aluminum-tariff-inclusions-process",
//   codes: august_15_FR_232_impacted_codes_list,
//   published_at: new Date("2025-08-19"),
// };

// const reciprocalTariffExclusions: TariffCodeSet = {
//   name: "Exemptions for Reciprocal Tariffs",
//   source_name: "USITC - Chapter 99 Subchapter 3 Note 2(v)(iii) ",
//   source: "https://hts.usitc.gov/search?query=9903.01.32",
//   codes: reciprocalTariffExclusionsList,
//   published_at: new Date("2025-04-05"),
// };

// export const tariffAnnouncementLists: TariffCodeSet[] = [
//   section232SteelAndAluminumChanges,
//   indiaOilBasedExclusions,
//   reciprocalTariffExclusions,
// ];
