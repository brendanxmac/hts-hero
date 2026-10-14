import type { TemplatePropsMap } from "./types"

// Placeholder props, so every composition opens in Remotion Studio (npm run social:studio).
// Real posts get their props from libs/social-studio/build.ts.

const base = { theme: "dark" as const, asOf: "2026-10-14", source: "HTS Hero tariff engine · US Census Bureau" }
const CN = { code: "CN", name: "China", flag: "🇨🇳" }
const VN = { code: "VN", name: "Vietnam", flag: "🇻🇳" }
const MX = { code: "MX", name: "Mexico", flag: "🇲🇽" }
const TW = { code: "TW", name: "Taiwan", flag: "🇹🇼" }

export const SAMPLES: TemplatePropsMap = {
  RateTimeline: {
    ...base,
    headline: "Sample: a product's tariff from 25% to 70% and back",
    product: "Sample product",
    htsCode: "0000.00.0000",
    country: CN,
    points: [
      { from: "2025-11-17", pct: 25 },
      { from: "2026-01-01", pct: 45 },
      { from: "2026-02-24", pct: 70 },
      { from: "2026-06-01", pct: 35 },
    ],
    end: "2026-10-14",
    events: [
      { date: "2026-01-01", label: "Sample +20%", tone: "up" },
      { date: "2026-02-24", label: "Sample +25%", tone: "up" },
      { date: "2026-06-01", label: "Sample −35%", tone: "down" },
    ],
  },
  BigNumber: {
    ...base,
    eyebrow: "Sample product from China",
    value: "70%",
    label: "Sample: the tariff on this product today",
    tone: "up",
    parts: [
      { label: "Base duty", pct: 2.5 },
      { label: "Section 301", pct: 25 },
      { label: "Section 232", pct: 42.5 },
    ],
  },
  HeadToHead: {
    ...base,
    headline: "Sample: same product, very different tariff",
    product: "Sample product",
    htsCode: "0000.00.0000",
    left: { country: CN, ratePct: 70, importValue: 1_200_000_000, importChangePct: -32 },
    right: { country: VN, ratePct: 20, importValue: 860_000_000, importChangePct: 41 },
    year: 2025,
  },
  Ranking: {
    ...base,
    headline: "Sample: what one product pays, by country",
    product: "Sample product",
    htsCode: "0000.00.0000",
    rows: [
      { country: CN, ratePct: 70 },
      { country: VN, ratePct: 20 },
      { country: TW, ratePct: 15 },
      { country: MX, ratePct: 0 },
    ],
  },
  TradeShift: {
    ...base,
    headline: "Sample: where the US bought this product",
    product: "Sample product",
    htsCode: "0000.00.0000",
    year: 2025,
    prior: 2024,
    rows: [
      { country: CN, ratePct: 70, importValue: 1_200_000_000, priorValue: 1_800_000_000 },
      { country: VN, ratePct: 20, importValue: 860_000_000, priorValue: 600_000_000 },
      { country: MX, ratePct: 0, importValue: 400_000_000, priorValue: 380_000_000 },
    ],
  },
  SourcingSaver: {
    ...base,
    headline: "Sourcing a sample product from China?",
    product: "Sample product",
    htsCode: "0000.00.0000",
    from: { country: CN, ratePct: 37.5 },
    options: [
      { country: TW, ratePct: 10, savingPts: 27.5, importValue: 157_000_000 },
      { country: VN, ratePct: 12.5, savingPts: 25, importValue: 49_000_000 },
    ],
    year: 2025,
  },
  CountrySnapshot: {
    ...base,
    headline: "Vietnam by the numbers",
    country: VN,
    stats: [
      { label: "US imports 2025", value: "$150B", detail: "+10% on 2024", tone: "brand" },
      { label: "Rank", value: "#6", detail: "of all US suppliers" },
    ],
    products: [
      { label: "Sample product", htsCode: "0000.00.0000", value: 9_000_000_000, rate: "20%" },
      { label: "Another product", htsCode: "0000.00.0001", value: 5_000_000_000, rate: "0%" },
    ],
    year: 2025,
  },
  RateSpread: {
    ...base,
    headline: "Sample: one product, rates from 0% to 70%",
    product: "Sample product",
    htsCode: "0000.00.0000",
    rows: [
      { country: CN, ratePct: 70 },
      { country: VN, ratePct: 20 },
      { country: TW, ratePct: 20 },
      { country: MX, ratePct: 0 },
    ],
  },
  TopList: {
    ...base,
    kind: "Top 3",
    headline: "Sample: a ranked list",
    rows: [
      { label: "First", value: "350%", share: 1, tone: "up" },
      { label: "Second", value: "163%", share: 0.47 },
      { label: "Third", value: "131%", share: 0.37 },
    ],
  },
  Quiz: {
    ...base,
    question: "Which pays the higher tariff on this sample product?",
    product: "Sample product",
    htsCode: "0000.00.0000",
    options: [
      { country: CN, ratePct: 37.5 },
      { country: VN, ratePct: 12.5 },
    ],
    reveal: "China pays 3× Vietnam's rate on the same product.",
  },
  News: {
    ...base,
    source: "Federal Register · CBP",
    headline: "Sample: tariffs on a product rise",
    authority: "Section 232",
    kindLabel: "Rate change",
    tone: "up",
    rateBefore: "25%",
    rateAfter: "50%",
    rateNote: "on sample products",
    countries: [CN, VN],
    products: "Sample products",
    effectiveOn: "2026-11-01",
    stage: 3,
    imports: { value: 4_200_000_000, year: 2025 },
    slug: "sample",
  },
}
