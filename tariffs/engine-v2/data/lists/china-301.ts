// Section 301 China lists from U.S. note 31 to subchapter III (four-year review increases).
// See HowTariffsWork.md §7.
import { CodeList } from "../../types"
import { codeListVersions } from "../../versioning"

const FOUR_YEAR_REVIEW = {
  citation: "USTR notice of modification, FR Doc. 2024-21217 (Sep 18, 2024)",
  url: "https://www.federalregister.gov/documents/2024/09/18/2024-21217/notice-of-modification-chinas-acts-policies-and-practices-related-to-technology-transfer",
}

export const china301Lists: CodeList[] = [
  // 31(f): 2025 increases (9903.91.05, 50%). Medical gloves moved to 31(i) at 100% on
  // Jan 1, 2026, so they leave this list then instead of paying both rates.
  codeListVersions(
    {
      id: "china31f",
      kind: "hts",
      description: "Section 301 China, U.S. note 31(f): 2025 increases",
      codes: [
        "2804.61.00",
        "3818.00.00",
        "4015.12.10",
        "8541.10.00",
        "8541.21.00",
        "8541.29.00",
        "8541.30.00",
        "8541.49.10",
        "8541.49.70",
        "8541.49.80",
        "8541.49.95",
        "8541.51.00",
        "8541.59.00",
        "8541.90.00",
        "8542.31.00",
        "8542.32.00",
        "8542.33.00",
        "8542.39.00",
        "8542.90.00",
      ],
      effective: { from: "2025-01-01" },
      source: { revision: "2026HTSRev5", ...FOUR_YEAR_REVIEW },
    },
    [
      {
        from: "2026-01-01",
        remove: ["4015.12.10"],
        source: {
          ...FOUR_YEAR_REVIEW,
          note: "Medical gloves: 50% in 2025, 100% from 2026 under 9903.91.08 (31(i))",
        },
      },
    ],
  ),
  {
    id: "china31g",
    kind: "hts",
    description:
      "Section 301 China, U.S. note 31(g): natural graphite, permanent magnets, lithium-ion non-EV batteries",
    versions: [
      {
        // 8507.60.00 as provided; it also covers EV batteries (8507.60.00.10), which
        // 9903.91.01 already covers. See PROGRESS.md.
        codes: [
          "2504.10.10",
          "2504.10.50",
          "2504.90.00",
          "8505.11.00",
          "8507.60.00",
        ],
        effective: { from: "2026-01-01" },
        source: FOUR_YEAR_REVIEW,
      },
    ],
  },
  {
    id: "china31h",
    kind: "hts",
    description:
      "Section 301 China, U.S. note 31(h): respirators and face masks of textiles",
    versions: [
      {
        codes: [
          "6307.90.98.42", // N95 respirators of textiles
          "6307.90.98.44", // N95 respirators of textiles
          "6307.90.98.50", // Respirators of textiles, other than N95
          "6307.90.98.70", // Face masks of textiles
          "6307.90.98.75", // Face masks of textiles
        ],
        effective: { from: "2026-01-01" },
        source: FOUR_YEAR_REVIEW,
      },
    ],
  },
  {
    id: "china31i",
    kind: "hts",
    description: "Section 301 China, U.S. note 31(i): medical gloves of rubber",
    versions: [
      {
        codes: ["4015.12.10"],
        effective: { from: "2026-01-01" },
        source: FOUR_YEAR_REVIEW,
      },
    ],
  },
]
