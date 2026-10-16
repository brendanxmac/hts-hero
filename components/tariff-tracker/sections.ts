import {
  BoltIcon,
  CalculatorIcon,
  BellAlertIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  NewspaperIcon,
  ReceiptPercentIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid"

// The Tariff Tracker's sections, in sidebar order: tabs on the one /tariff-tracker page, picked
// with ?tab=. Sections that aren't built yet, or are held back as coming soon, show what's
// planned. Every built section is open to an account; the paid-only sections need a plan
// (PRICING.md). Expert help sells the managed service, sold apart from the plans.

export type SectionSlug =
  | "overview"
  | "health"
  | "calculator"
  | "catalog"
  | "history"
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
  // Where it sits in the sidebar
  group: "workspace" | "intelligence"
  // Needs a paid plan (the usage-based trial doesn't include it)
  paidOnly: boolean
  // Still experimental
  beta?: boolean
  // Held back for now: marked Coming soon, and shows what's planned (Savings and Entry audit
  // are built; flip ready back to true to open them again)
  comingSoon?: boolean
  // What the section will do, until it's built
  planned: string[]
}

export const TRACKER_PATH = "/tariff-tracker"

// The tab with no ?tab=
export const DEFAULT_SECTION: SectionSlug = "overview"

const section = (s: TrackerSection) => s

export const SECTIONS: TrackerSection[] = [
  section({
    slug: "overview",
    label: "Overview",
    Icon: HomeIcon,
    title: "Overview",
    summary:
      "Your imports' tariffs at a glance: what you pay, what changed and where to save.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [],
  }),
  section({
    slug: "health",
    label: "Tariff health",
    Icon: HeartIcon,
    title: "Tariff health",
    summary: "How well your imports are covered: alerts on, savings reviewed and entries audited.",
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
    slug: "catalog",
    label: "Your imports",
    Icon: Squares2X2Icon,
    title: "Your imports",
    summary: "Everything you import, with the duty on each today.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [],
  }),
  section({
    slug: "alerts",
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
    label: "Tariff news",
    Icon: NewspaperIcon,
    title: "Tariff news",
    summary: "Every new US tariff action, as it happens, with the official documents behind it.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [],
  }),
  section({
    slug: "impact",
    label: "Tariff Impacts",
    Icon: BoltIcon,
    title: "Tariff Impacts",
    summary: "Pick any tariff action and see exactly which of your imports it hits, and by how much.",
    ready: true,
    group: "workspace",
    paidOnly: false,
    planned: [],
  }),
  section({
    slug: "history",
    label: "Rate history",
    Icon: ClockIcon,
    title: "Rate history",
    summary: "How the rate on each of your products has changed, and why.",
    ready: true,
    group: "intelligence",
    paidOnly: false,
    planned: [
      "The rate on every one of your imports on any past date",
      "A timeline of each change: the program, the HTS revision and the date it took effect",
      "Any two dates side by side, to see exactly what moved",
    ],
  }),
  section({
    slug: "savings",
    label: "Savings",
    Icon: ReceiptPercentIcon,
    title: "Savings",
    summary: "Ways you could pay less duty on the products you already import.",
    ready: false,
    comingSoon: true,
    group: "intelligence",
    paidOnly: false,
    planned: [
      "Trade programs your products can claim from the countries they come from",
      "The lowest-duty countries of origin for every product",
      "Exemptions worth checking, and the total you could potentially save",
    ],
  }),
  section({
    slug: "sourcing",
    label: "Sourcing",
    Icon: GlobeAltIcon,
    title: "Sourcing",
    summary:
      "Find cheaper countries that already make your products for the US.",
    ready: true,
    group: "intelligence",
    paidOnly: false,
    planned: [
      "Cheaper countries of origin for each product that already ship it to the US, with how much",
      "The trade agreements that could lower each country's rate",
      "The countries that could supply the most of your imports for less, and what moving could save",
    ],
  }),
  section({
    slug: "entries",
    label: "Entry audit",
    Icon: ClipboardDocumentCheckIcon,
    title: "Entry audit",
    comingSoon: true,
    summary:
      "Check the duty paid on every shipment against the rates in force that day.",
    ready: false,
    group: "intelligence",
    paidOnly: false,
    planned: [
      "Log each entry you clear: product, country, entry date, value and the duty you paid",
      "An instant check against the rates in force on the entry date",
      "Overpayments you could recover, and underpayments to fix before Customs finds them",
    ],
  }),
  section({
    slug: "expert-help",
    label: "Expert help",
    Icon: ChatBubbleLeftRightIcon,
    title: "Expert help",
    summary: "HTS Hero as your tariff team: we manage every tariff on your imports, with you.",
    ready: true,
    group: "intelligence",
    paidOnly: false,
    planned: [],
  }),
]

export const sectionBySlug = (slug: string | null) =>
  SECTIONS.find((s) => s.slug === slug)

// The address of a tab
export const sectionUrl = (slug: SectionSlug) =>
  slug === DEFAULT_SECTION ? TRACKER_PATH : `${TRACKER_PATH}?tab=${slug}`

// A catalog product's own view's tabs, in order; Duty is where it opens
export type ProductTab = "duty" | "compare" | "history" | "savings" | "audit"

export const PRODUCT_TABS: ProductTab[] = ["duty", "compare", "history", "savings", "audit"]

export const isProductTab = (tab: string | null): tab is ProductTab => PRODUCT_TABS.includes(tab as ProductTab)

// The address of a catalog product's own view, on one of its tabs (Duty when left out)
export const productUrl = (key: string, productTab?: ProductTab) =>
  `${TRACKER_PATH}?tab=catalog&product=${encodeURIComponent(key)}${productTab && productTab !== "duty" ? `&ptab=${productTab}` : ""}`
