// Country list from U.S. note 41(c) to subchapter III (Section 201 – Quartz Surface Products,
// 2026HTSRev16, Proclamation 11051, effective 2026-08-15). See HowTariffsWork.md §7.4.
import { CodeList } from "../../types"

export const quartzLists: CodeList[] = [
  // 41(c): "the products of the following countries shall not be subject to the rates of duty and
  // tariff-rate quotas". Kosovo (XK) isn't in the calculator's country list yet. Belize,
  // Dominica, Grenada, Guyana, Haiti, Jamaica, Saint Lucia and Saint Vincent are in both (iii)
  // and (iv).
  {
    id: "quartzSafeguardExempt41c",
    kind: "country",
    description: "Countries exempt from the quartz surface products safeguard, U.S. note 41(c) to subchapter III",
    versions: [
      {
        codes: [
          // (i) Canada and Mexico
          "CA", "MX",
          // (ii) free trade agreement partners
          "AU", "CO", "CR", "DO", "SV", "GT", "HN", "IL", "NI", "PA",
          "PE", "SG", "KR",
          // (iii) developing countries
          "AF", "AL", "DZ", "AO", "AM", "AZ", "BZ", "BJ", "BT", "BO",
          "BA", "BW", "BR", "BF", "MM", "BI", "KH", "CM", "CV", "CF",
          "TD", "KM", "CG", "CD", "CI", "DJ", "DM", "EC", "EG", "ER",
          "SZ", "ET", "FJ", "GA", "GM", "GE", "GH", "GD", "GN", "GW",
          "GY", "HT", "ID", "IQ", "JM", "JO", "KZ", "KE", "KI", "XK",
          "KG", "LB", "LS", "LR", "MG", "MW", "MV", "ML", "MR", "MU",
          "MD", "MN", "ME", "MZ", "NA", "NP", "NE", "NG", "MK", "PK",
          "PG", "PY", "PH", "RW", "LC", "VC", "WS", "ST", "SN", "RS",
          "SL", "SB", "SO", "ZA", "SS", "LK", "SR", "TZ", "TL", "TG",
          "TO", "TN", "TV", "UG", "UA", "UZ", "VU", "YE", "ZM", "ZW",
          // (iv) Caribbean Basin Economic Recovery Act beneficiaries
          "AG", "AW", "BS", "BB", "BZ", "VG", "CW", "DM", "GD", "GY",
          "HT", "JM", "MS", "KN", "LC", "VC", "TT",
        ],
        effective: { from: "2026-08-15" },
        source: { revision: "2026HTSRev16", citation: "Proclamation 11051", note: "U.S. note 41(c)" },
      },
    ],
  },
]
