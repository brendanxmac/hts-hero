import {
  BoltIcon,
  CalculatorIcon,
  BellAlertIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  LightBulbIcon,
  NewspaperIcon,
  ReceiptPercentIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid"

// The Tariff Tracker's sections, in sidebar order: tabs on the one /tariff-tracker page, picked
// with ?tab=. Sections that aren't built yet show what's planned. Every built section is open to an account; the paid-only sections need a plan
// (PRICING.md). Expert help sells the managed service, sold apart from the plans.

export type SectionSlug =
  | "overview"
  | "calculator"
  | "changes"
  | "catalog"
  | "history"
  | "insights"
  | "alerts"
  | "news"
  | "impact"
  | "entries"
  | "sourcing"
  | "savings"
  | "expert-help"

export interface TrackerSection {
  slug: SectionSlug
  // In the sidebar
  label: string
  Icon: typeof Squares2X2Icon
  // At the top of the section's page
  title: string
  summary: string
  ready: boolean
  // Where it sits in the sidebar: the main list, or the foot (beside the plan and the account)
  group: "workspace" | "foot"
  // Needs a paid plan (the usage-based trial doesn't include it)
  paidOnly: boolean
  // Still experimental
  beta?: boolean
  // What the section will do, until it's built
  planned: string[]
  // Left out of the sidebar for now (links into it still open it)
  hidden?: boolean
}

export const TRACKER_PATH = "/tariff-tracker"

// The tab with no ?tab=
export const DEFAULT_SECTION: SectionSlug = "overview"

const section = (s: TrackerSection) => s

export const SECTIONS: TrackerSection[] = [
  section({
    slug: "overview",
    label: "Home",
    Icon: HomeIcon,
    title: "Home",
    summary: "What needs your attention on your imports today.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [],
  }),
  section({
    slug: "catalog",
    label: "Your Imports",
    Icon: Squares2X2Icon,
    title: "Your Imports",
    summary: "Everything you import, with the duty on each today.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [],
  }),
  section({
    slug: "calculator",
    label: "Calculator",
    Icon: CalculatorIcon,
    title: "Calculator",
    summary: "Every duty on one shipment of any product, from any country.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [],
  }),
  section({
    slug: "changes",
    label: "Tariff Changes",
    Icon: BoltIcon,
    title: "Tariff Changes",
    summary: "Every US tariff action, what it does to your imports, and your alerts.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [],
  }),
  section({
    slug: "savings",
    label: "Savings",
    Icon: ReceiptPercentIcon,
    title: "Savings",
    summary: "Ways you could pay less duty on the products you already import.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [
      "Trade programs your products can claim from the countries they come from",
      "The lowest-duty countries of origin for every product",
      "Exemptions worth checking, and the total you could potentially save",
    ],
  }),
  section({
    slug: "entries",
    label: "Audits",
    Icon: ClipboardDocumentCheckIcon,
    title: "Audits",
    summary:
      "Check the duty paid on every shipment against the rates in force that day.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [
      "Log each entry you clear: product, country, entry date, value and the duty you paid",
      "An instant check against the rates in force on the entry date",
      "Overpayments you could recover, and underpayments to fix before Customs finds them",
    ],
  }),
  section({
    slug: "alerts",
    // Moved into another section (MOVED_TABS): its old address opens it there
    hidden: true,
    label: "Alerts",
    Icon: BellAlertIcon,
    title: "Alerts",
    summary: "Know as soon as a tariff change affects one of your products.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [
      "An email and an in-app alert whenever a new HTS revision or tariff action changes a rate on one of your imports",
      "What changed, which products it hits, and the difference in duty",
      "Badges on affected products until you've reviewed them",
    ],
  }),
  section({
    slug: "news",
    // Moved into another section (MOVED_TABS): its old address opens it there
    hidden: true,
    label: "Tariff News",
    Icon: NewspaperIcon,
    title: "Tariff News",
    summary:
      "Every new US tariff action, as it happens, with the official documents behind it.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [],
  }),
  section({
    slug: "impact",
    // Moved into another section (MOVED_TABS): its old address opens it there
    hidden: true,
    label: "Tariff Impacts",
    Icon: BoltIcon,
    title: "Tariff Impacts",
    summary:
      "Pick any tariff action and see exactly which of your imports it hits, and by how much.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [],
  }),
  section({
    slug: "insights",
    // Moved into another section (MOVED_TABS): its old address opens it there
    hidden: true,
    label: "Insights",
    Icon: LightBulbIcon,
    title: "Insights",
    summary: "Where your duty comes from, what moved it, and what to watch.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [
      "Where your duty comes from, by tariff, country of origin and HTS chapter",
      "How much of your catalog changed in the last 12 months, and which tariffs moved it",
      "Your most exposed imports and countries, one click from the imports behind them",
    ],
  }),
  section({
    slug: "history",
    // Moved into another section (MOVED_TABS): its old address opens it there
    hidden: true,
    label: "Rate History",
    Icon: ClockIcon,
    title: "Rate History",
    summary: "How the rate on each of your products has changed, and why.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [
      "The rate on every one of your imports on any past date",
      "A timeline of each change: the program, the HTS revision and the date it took effect",
      "Any two dates side by side, to see exactly what moved",
    ],
  }),
  section({
    slug: "sourcing",
    // Off for now (2026-10-25): its Storage files aren't in prod yet
    hidden: true,
    label: "Sourcing",
    Icon: GlobeAltIcon,
    title: "Sourcing",
    summary:
      "Where to source any product: every country ranked on landed cost, proven production, reliability and transit time.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [
      "Every country's landed cost for any HTS code: duty plus the freight Census records",
      "Who really makes it: world exports, specialization and what the US already buys from each country",
      "Reliability, compliance flags and days at sea, with the source behind every figure",
    ],
  }),
  section({
    slug: "expert-help",
    label: "Expert Help",
    Icon: ChatBubbleLeftRightIcon,
    title: "Expert Help",
    summary:
      "HTS Hero as your tariff team: we manage every tariff on your imports, with you.",
    ready: true,
    group: "foot",
    paidOnly: false,
    planned: [],
  }),
]

export const sectionBySlug = (slug: string | null) =>
  SECTIONS.find((s) => s.slug === slug)

// Sections folded into another one (the sidebar is organized by what people come to do): Tariff
// News, Tariff Impacts, Rate History and the alert settings are views of Tariff Changes, and
// Insights a view of Your Imports. Their old addresses (in sent emails, Slack, bookmarks) open
// them there.
export const MOVED_TABS: Partial<Record<SectionSlug, { tab: SectionSlug; view?: string }>> = {
  news: { tab: "changes" },
  impact: { tab: "changes" },
  history: { tab: "changes", view: "history" },
  alerts: { tab: "changes", view: "alerts" },
  insights: { tab: "catalog", view: "insights" },
}

// The address of a tab (a moved one's new home)
export const sectionUrl = (slug: SectionSlug): string => {
  const moved = MOVED_TABS[slug]
  if (moved) return `${TRACKER_PATH}?tab=${moved.tab}${moved.view ? `&view=${moved.view}` : ""}`
  return slug === DEFAULT_SECTION ? TRACKER_PATH : `${TRACKER_PATH}?tab=${slug}`
}

// A catalog product's own view's tabs, in order; Overview is where it opens. AD/CVD is part of Duty,
// and History and News are Changes: their old names still open them there. Savings and Audits are
// always shown.
export type ProductView = "overview" | "duty" | "compare" | "changes" | "savings" | "audit"
export type ProductTab = ProductView | "adcvd" | "history" | "news"

export const PRODUCT_TABS: ProductView[] = ["overview", "duty", "compare", "changes", "savings", "audit"]

const FOLDED: Record<string, ProductView> = { adcvd: "duty", history: "changes", news: "changes" }

export const isProductTab = (tab: string | null): tab is ProductTab =>
  !!tab && (PRODUCT_TABS.includes(tab as ProductView) || tab in FOLDED)

// The view a tab name opens
export const productViewOf = (tab: ProductTab): ProductView => FOLDED[tab] ?? (tab as ProductView)

// The address of a catalog product's own view, on one of its tabs (the Overview when left out)
export const productUrl = (key: string, productTab?: ProductTab) =>
  `${TRACKER_PATH}?tab=catalog&product=${encodeURIComponent(key)}${productTab && productTab !== "overview" ? `&ptab=${productTab}` : ""}`
