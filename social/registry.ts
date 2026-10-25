import type { TemplateId } from "./types"

// Every post template, how long its video runs, and the id Remotion renders it by
// ("RateTimeline-portrait"). The video's last frame is the still. The components themselves are
// in components.ts, so server code can read this without loading fonts.

export const TEMPLATES: Record<TemplateId, { label: string; seconds: number; about: string }> = {
  RateTimeline: { label: "Rate history", seconds: 7, about: "One product from one country, its tariff over time" },
  BigNumber: { label: "Big number", seconds: 6, about: "One striking number and what adds up to it" },
  HeadToHead: { label: "Head to head", seconds: 6, about: "The same product from two countries" },
  Ranking: { label: "By country", seconds: 6, about: "The same product from up to 8 countries, ranked" },
  TradeShift: { label: "Trade shift", seconds: 7, about: "Who the US bought it from, this year vs last, and their tariffs" },
  SourcingSaver: { label: "Sourcing saver", seconds: 6, about: "Sourcing from one country? What the US's other suppliers pay" },
  CountrySnapshot: { label: "Country snapshot", seconds: 6, about: "A country by the numbers, with its top products' tariffs" },
  RateSpread: { label: "Rate spread", seconds: 6, about: "Every origin of one product on one tariff scale" },
  TopList: { label: "Top list", seconds: 6, about: "Any ranked list of facts" },
  Quiz: { label: "Guess the tariff", seconds: 7, about: "A question, a countdown, the answer (for Reels and Shorts)" },
  News: { label: "Tariff news", seconds: 6, about: "A tariff action from /tariff-updates, with where it stands" },
  OddRate: { label: "Odd rate", seconds: 7, about: "A rate the HTS charges in an odd way, word for word, and how HTS Hero works it out" },
}

export const TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[]

export const compositionId = (template: TemplateId, format: string) => `${template}-${format}`
