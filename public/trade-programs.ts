export enum TradeProgramStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  SUSPENDED = "suspended",
  DELETED = "deleted",
}

export interface TradeProgram {
  name: string;
  filePath: string;
  symbol: string;
  qualifyingCountries?: string[];
  status: TradeProgramStatus;
  requiresReview?: boolean;
}

export const TradePrograms: TradeProgram[] = [
  {
    name: "Generalized System of Preferences (GSP)",
    filePath: "/general/General Note 4.pdf",
    symbol: "A",
    qualifyingCountries: [],
    status: TradeProgramStatus.EXPIRED,
  },
  {
    name: "Generalized System of Preferences (GSP)",
    filePath: "/general/General Note 4.pdf",
    symbol: "A*",
    status: TradeProgramStatus.EXPIRED,
    qualifyingCountries: [],
  },
  {
    name: "Generalized System of Preferences (GSP)",
    filePath: "/general/General Note 4.pdf",
    symbol: "A+",
    status: TradeProgramStatus.EXPIRED,
    qualifyingCountries: [],
  },
  {
    name: "Automotive Products Trade Act",
    filePath: "/general/General Note 5.pdf",
    symbol: "B",
    qualifyingCountries: ["CA"],
    status: TradeProgramStatus.ACTIVE,
    requiresReview: true,
  },
  {
    name: "Agreement on Trade in Civil Aircraft",
    filePath: "/general/General Note 6.pdf",
    symbol: "C",
    status: TradeProgramStatus.ACTIVE,
    requiresReview: true, // to determine if article is civil aircraft
  },
  {
    name: "Caribbean Basin Economic Recovery Act (CBERA)",
    filePath: "/general/General Note 7.pdf",
    symbol: "E",
    qualifyingCountries: [
      "AG",
      "AW",
      "BS",
      "BB",
      "BZ",
      "CW",
      "DM",
      "GD",
      "GY",
      "HT",
      "JM",
      "MS",
      "KN",
      "LC",
      "VC",
      "TT",
      "VG",
    ],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "Caribbean Basin Economic Recovery Act (CBERA)",
    filePath: "/general/General Note 7.pdf",
    symbol: "E*",
    qualifyingCountries: [
      "AG",
      "AW",
      "BS",
      "BB",
      "BZ",
      "CW",
      "DM",
      "GD",
      "GY",
      "HT",
      "JM",
      "MS",
      "KN",
      "LC",
      "VC",
      "TT",
      "VG",
    ],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Israel Free Trade Area Implementation Act of 1985",
    filePath: "/general/General Note 8.pdf",
    symbol: "IL",
    qualifyingCountries: ["IL"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Canada Free-Trade Agreement-Suspended",
    filePath: "/general/General Note 9.pdf",
    symbol: null,
    qualifyingCountries: ["CA", "MX"],
    status: TradeProgramStatus.SUSPENDED,
  },
  //   {
  // FIXME: currently not supported, but could be
  // Looks like it only covers:
  //  - Marshall Islands
  //  - Micronesia, Federated States of
  //  - Republic of Palau
  // Which we do not currently show in the list of countries...
  //     name: "Products of the Freely Associated States",
  //     filePath: "/general/General Note 10.pdf",
  //     symbol: null,
  //     qualifyingCountries: [],
  //     status: TradeProgramStatus.ACTIVE,
  //     requiresReview: true,
  //   },
  {
    name: "United States-Mexico-Canada Agreement",
    filePath: "/general/General Note 11.pdf",
    symbol: "S",
    qualifyingCountries: ["CA", "MX"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Mexico-Canada Agreement",
    filePath: "/general/General Note 11.pdf",
    symbol: "S+",
    qualifyingCountries: ["CA", "MX"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "North American Free Trade Agreement-Deleted",
    filePath: "/general/General Note 12.pdf",
    symbol: null,
    qualifyingCountries: [],
    status: TradeProgramStatus.DELETED,
  },
  {
    name: "Pharmaceutical products and related appendix",
    filePath: "/general/General Note 13.pdf",
    symbol: "K",
    status: TradeProgramStatus.ACTIVE,
    // FIXME: this one applies to products listed in the
    // Pharmaceutical Appendix of the HTS and needs reivew
    // Currently we should leave this one out from auto
    // calculations and just add checkbox for the user...
    requiresReview: true,
  },
  {
    // FIXME: User will need to check if article is listed in the
    // intermediate chemicals for dyes appendix of the HTS
    name: "Intermediate chemicals for dyes and related appendix",
    filePath: "/general/General Note 14.pdf",
    symbol: "L",
    status: TradeProgramStatus.ACTIVE,
    requiresReview: true,
  },
  {
    // FIXME: This one is about imports exlcuded from rate quotas
    // Could maybe be a checkbox? Does give detail about Ch.2-52
    // which would be easy enough to add a check for and checkbox
    // if the code lands in one of those chapters
    name: "Exclusions from tariff rate quotas",
    filePath: "/general/General Note 15.pdf",
    symbol: null,
    status: TradeProgramStatus.ACTIVE,
    requiresReview: true,
  },
  {
    name: "African Growth and Opportunity Act (AGOA)",
    filePath: "/general/General Note 16.pdf",
    symbol: "D",
    qualifyingCountries: [
      "AO",
      "BJ",
      "MR",
      "BW",
      "MU",
      "MZ",
      "NA",
      "CV",
      "NG",
      "TD",
      "RW",
      "KM",
      "ST",
      "CG",
      "SN",
      "CI",
      "SL",
      "DJ",
      "ZA",
      "SZ",
      "GM",
      "TZ",
      "GH",
      "TG",
      "GW",
      "KE",
      "ZM",
      "LS",
      "LR",
      "MG",
      "MW",
    ],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Caribbean Basin Trade Partnership Act of 2000 (CBPTA)",
    filePath: "/general/General Note 17.pdf",
    symbol: "R",
    qualifyingCountries: ["BB", "BZ", "CW", "GY", "HT", "JM", "LC", "TT"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Jordan Free Trade Area Implementation Act",
    filePath: "/general/General Note 18.pdf",
    symbol: "JO",
    qualifyingCountries: ["JO"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Singapore Free Trade Agreement",
    filePath: "/general/General Note 25.pdf",
    symbol: "SG",
    qualifyingCountries: ["SG"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Chile Free Trade Agreement",
    filePath: "/general/General Note 26.pdf",
    symbol: "CL",
    qualifyingCountries: ["CL"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Morocco Free Trade Agreement",
    filePath: "/general/General Note 27.pdf",
    symbol: "MA",
    qualifyingCountries: ["MA"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Australia Free Trade Agreement",
    filePath: "/general/General Note 28.pdf",
    symbol: "AU",
    qualifyingCountries: ["AU"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "Dominican Republic-Central America-United States Free Trade Agreement (DR-CAFTA)",
    filePath: "/general/General Note 29.pdf",
    symbol: "P",
    qualifyingCountries: ["CR", "DO", "SV", "GT", "HN", "NI"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "Dominican Republic-Central America-United States Free Trade Agreement (DR-CAFTA)",
    filePath: "/general/General Note 29.pdf",
    symbol: "P+",
    qualifyingCountries: ["CR", "DO", "SV", "GT", "HN", "NI"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Bahrain Free Trade Agreement",
    filePath: "/general/General Note 30.pdf",
    symbol: "BH",
    qualifyingCountries: ["BH"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Oman Free Trade Agreement",
    filePath: "/general/General Note 31.pdf",
    symbol: "OM",
    qualifyingCountries: ["OM"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Peru Trade Promotion Agreement",
    filePath: "/general/General Note 32.pdf",
    symbol: "PE",
    qualifyingCountries: ["PE"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Korea Free Trade Agreement",
    filePath: "/general/General Note 33.pdf",
    symbol: "KR",
    qualifyingCountries: ["KR"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Colombia Trade Promotion Agreement",
    filePath: "/general/General Note 34.pdf",
    symbol: "CO",
    qualifyingCountries: ["CO"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "United States-Panama Trade Promotion Agreement",
    filePath: "/general/General Note 35.pdf",
    symbol: "PA",
    qualifyingCountries: ["PA"],
    status: TradeProgramStatus.ACTIVE,
  },
  {
    name: "Trade Agreement between the United States and Japan",
    filePath: "/general/General Note 36.pdf",
    symbol: "JP",
    qualifyingCountries: ["JP"],
    status: TradeProgramStatus.ACTIVE,
  },
];
