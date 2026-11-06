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
  dek?: string // one or two plain sentences under the headline: what changes, for whom
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
  htsCount?: number // HTS codes the action names (Chapter 99 left out)
  slug: string
}

// One part of an odd rate, worked out on the standard shipment, or the question the calculator
// asks to work it out
export interface OddRateStep {
  rate: string // "15¢/jewel over 7"
  detail?: string // "× 1,000 kg", "of $10,000.00"
  amount?: string // "$150.00"
  asks?: string // "What is the value of the case?"
}

// A rate the HTS charges in an odd way (per jewel, by the degree, in fractions), word for word,
// and how HTS Hero works it out
export interface OddRateProps extends PostBase {
  headline: string
  product: string
  htsCode: string
  rate: string // as the HTS writes it
  column: string // "General rate", "Column 2 rate"
  columnNote?: string // who the column applies to
  shipment: string // "On a $10,000 shipment of 1,000 units"
  steps: OddRateStep[]
  total?: string // the base duty, when no part needs an answer
  footnote?: string
}

// A Duty Guard launch teaser: a hook, the punch line, one product card on its own, then the reveal
export interface LaunchTeaserProps {
  theme: Theme
  accent?: LaunchColor
  showVisual?: boolean // off: the card's beat is cut, and the video with it
  visual: LaunchFeature // the product card, on its own beat after the punch
  hook: string
  punch: string
  name: string // "Duty Guard"
  tagline: string
  date: string // "Coming soon", "Launching Nov 10"
}

export type LaunchFeature = "audit" | "savings" | "alerts"

// The accent a launch post is drawn in (cobalt is HTS Hero's own)
export type LaunchColor = "cobalt" | "green" | "red" | "amber" | "sky" | "violet"

// A launch teaser drawn as a declassified memo: its lines typed out one sentence at a time,
// then the subject's name and the date
export interface LaunchMemoProps {
  theme: Theme
  accent?: LaunchColor
  to: string
  subject: string // closes the video: "HTS Hero: Built for Trade Pros" puts what follows the colon big (no colon: the last words)
  line1: string
  line2: string
  line3: string
  stamp?: string // no longer shown (the memo is declassified); kept so older posts still load
  date: string
}

// A launch teaser in big type on a full-color ground: three setups, each slammed shut by one
// word, a blurred glimpse of the product, then the name
export interface LaunchSlamProps {
  theme: Theme
  accent?: LaunchColor
  showVisual?: boolean // the blurred glimpse of the product
  line1: string
  word1: string
  line2: string
  word2: string
  line3: string
  word3: string
  glimpse: string // over the blurred product
  name: string
  date: string
}

// The Duty Guard launch video: an opener, the three features in `order`, then the call to action
// The Weekly Tariff Digest's promo (/tariff-digest): the promise in big type, then the digest
// email itself arriving, drawn with the email's own React Email parts (emails/kit/parts.tsx) and
// real updates from /tariff-updates, then where to subscribe
export interface DigestPromoProps {
  theme: Theme
  eyebrow: string // "The Weekly Tariff Digest"
  line1: string // "Every US tariff change."
  line2: string // "One email. Every Monday."
  cta: string // "Subscribe free"
  url: string // "htshero.com/tariff-digest"
  emailSubject: string // the inbox line: the digest's real subject
  emailHeading: string
  updates: DigestPromoUpdate[] // 3 or 4, real, newest first
}

// One update as the digest email shows it (emails/kit/parts.tsx UpdateSummary)
export interface DigestPromoUpdate {
  slug: string
  title: string
  summary: string
  authorityLabel: string
  stageLabel: string
  effectiveOn: string | null
  countriesLabel: string | null
  tone: Tone
}

export interface LaunchVideoProps {
  theme: Theme
  accent?: LaunchColor
  showVisual?: boolean // off: each feature as words alone
  opener: string
  openerSub: string
  order: LaunchFeature[]
  auditTitle: string
  auditLine: string
  savingsTitle: string
  savingsLine: string
  alertsTitle: string
  alertsLine: string
  cta: string
  ctaSub: string
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
  | "OddRate"
  | "LaunchTeaser"
  | "LaunchVideo"
  | "LaunchMemo"
  | "LaunchSlam"
  | "DigestPromo"

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
  OddRate: OddRateProps
  LaunchTeaser: LaunchTeaserProps
  LaunchVideo: LaunchVideoProps
  LaunchMemo: LaunchMemoProps
  LaunchSlam: LaunchSlamProps
  DigestPromo: DigestPromoProps
}

// Where a claim in a post can be checked: an official document or dataset, or the HTS Hero
// calculator showing the duty breakdown
export interface SourceLink {
  claim: string // what it verifies: "China: 37.5% today"
  label: string // what the link opens
  url: string // absolute, or relative to HTS Hero
  official: boolean // a government source (USITC, Federal Register, CBP, Census…)
}

// One post: a template and its props, plus a name for the studio's list and the sources that
// verify every figure in it
export interface Post<T extends TemplateId = TemplateId> {
  key: string // unique within a batch
  template: T
  title: string
  props: TemplatePropsMap[T]
  sources: SourceLink[]
}
