import type { Theme, Tone } from "./brand"

// The data each post template draws. Every number is worked out before it reaches a template
// (libs/social-studio/build.ts, from the tariff engine and Census files), so a template only
// lays it out. Props are plain JSON: they're saved, edited in the studio and passed to Remotion.

export interface PostCountry {
  code: string // ISO2
  name: string
  flag: string // emoji
}

// What every post carries: its look and the footer's source line
export interface PostBase {
  theme: Theme
  asOf: string // "YYYY-MM-DD"
  source: string // "HTS Hero tariff engine · US Census Bureau"
}

export interface RatePoint {
  from: string // "YYYY-MM-DD"
  pct: number
}

export interface RateEvent {
  date: string
  label: string // "Section 301 +25%"
  tone: Tone
}

// One product from one country: its rate over the verified data, as steps
export interface RateTimelineProps extends PostBase {
  headline: string
  product: string
  htsCode: string
  country: PostCountry
  points: RatePoint[] // in date order; each holds until the next
  end: string // the chart's last date
  events: RateEvent[] // at most 4, shown as pills on the chart
}

// One number, big
export interface BigNumberProps extends PostBase {
  eyebrow: string
  value: string // "70%"
  label: string // the sentence under it
  tone: Tone
  // What adds up to the number, drawn as one stacked bar
  parts: { label: string; pct: number }[]
  footnote?: string
}

export interface CountrySide {
  country: PostCountry
  ratePct: number
  importValue?: number // USD, the latest Census year
  importChangePct?: number // vs the year before
}

// Two origins for the same product
export interface HeadToHeadProps extends PostBase {
  headline: string
  product: string
  htsCode: string
  left: CountrySide
  right: CountrySide
  year?: number // Census year for the import figures
}

// The same product from several origins, highest rate first
export interface RankingProps extends PostBase {
  headline: string
  product: string
  htsCode: string
  rows: CountrySide[]
}

// Who the US bought a product from, this year vs last, with what each pays now
export interface TradeShiftProps extends PostBase {
  headline: string
  product: string
  htsCode: string
  year: number
  prior: number
  rows: (CountrySide & { importValue: number; priorValue: number })[]
}

// If you source from one origin, what the others that really sell it to the US pay. Savings are
// only ever potential: "could save", "up to"
export interface SourcingSaverProps extends PostBase {
  headline: string // "Sourcing e-bikes from China?"
  product: string
  htsCode: string
  from: CountrySide
  options: (CountrySide & { savingPts: number })[] // lowest rate first, at most 4
  year?: number // Census year for the import figures
}

// A country by the numbers: what the US buys from it and what its top products pay
export interface CountrySnapshotProps extends PostBase {
  headline: string
  country: PostCountry
  stats: { label: string; value: string; detail?: string; tone?: Tone }[] // at most 4 tiles
  products: { label: string; htsCode: string; value: number; rate: string }[] // at most 5
  year: number
}

// Every origin of one product on one tariff scale
export interface RateSpreadProps extends PostBase {
  headline: string
  product: string
  htsCode: string
  rows: CountrySide[]
}

// Any ranked list: the highest base rates in the HTS, the fastest-growing suppliers
export interface TopListProps extends PostBase {
  kind: string // the frame's pill: "Top 8", "Fun fact"
  headline: string
  subhead?: string
  rows: { label: string; sublabel?: string; value: string; share: number; tone?: Tone; flag?: string }[] // share 0–1, sizes the bar
  footnote?: string
}

// A question, a countdown, the answer: for Reels and Shorts. The still is the answer.
export interface QuizProps extends PostBase {
  question: string
  product: string
  htsCode: string
  options: { country: PostCountry; ratePct: number }[] // 2–4
  reveal: string // the line under the answer
}

// A tariff action from the /tariff-updates feed: what changed, for whom, from when, and how far
// it has got from announcement to the HTS
export interface NewsProps extends PostBase {
  headline: string
  authority: string // "Section 232"
  kindLabel: string // "Rate change"
  tone: Tone // up: tariffs rise, down: they fall or end
  rateBefore?: string // "25%"
  rateAfter?: string // "50%"
  rateNote?: string // "on steel and aluminum from Canada"
  countries: PostCountry[] // empty: all countries
  products?: string
  effectiveOn?: string // "YYYY-MM-DD"
  stage: number // 0 announced … 5 in the HTS
  imports?: { value: number; year: number } // US imports under the codes named, Census
  slug: string
}

export type TemplateId =
  | "RateTimeline"
  | "BigNumber"
  | "HeadToHead"
  | "Ranking"
  | "TradeShift"
  | "SourcingSaver"
  | "CountrySnapshot"
  | "RateSpread"
  | "TopList"
  | "Quiz"
  | "News"

export interface TemplatePropsMap {
  RateTimeline: RateTimelineProps
  BigNumber: BigNumberProps
  HeadToHead: HeadToHeadProps
  Ranking: RankingProps
  TradeShift: TradeShiftProps
  SourcingSaver: SourcingSaverProps
  CountrySnapshot: CountrySnapshotProps
  RateSpread: RateSpreadProps
  TopList: TopListProps
  Quiz: QuizProps
  News: NewsProps
}

// One post: a template and its props, plus a name for the studio's list
export interface Post<T extends TemplateId = TemplateId> {
  key: string // unique within a batch
  template: T
  title: string
  props: TemplatePropsMap[T]
}
