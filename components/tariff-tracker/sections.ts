import {
  ArrowTrendingUpIcon,
  CalculatorIcon,
  BellAlertIcon,
  ChartPieIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ReceiptPercentIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";

// The Tariff Tracker's sections, in sidebar order: tabs on the one /tariff-tracker page, picked
// with ?tab=. Sections that aren't built yet show what's planned.

export type SectionSlug =
  | "calculator"
  | "catalog"
  | "history"
  | "alerts"
  | "entries"
  | "sourcing"
  | "trends"
  | "savings"
  | "charts"
  | "expert-help";

export interface TrackerSection {
  slug: SectionSlug;
  // In the sidebar
  label: string;
  Icon: typeof Squares2X2Icon;
  // At the top of the section's page
  title: string;
  summary: string;
  ready: boolean;
  // What the section will do, until it's built
  planned: string[];
}

export const TRACKER_PATH = "/tariff-tracker";

// The tab with no ?tab=
export const DEFAULT_SECTION: SectionSlug = "catalog";

const section = (s: TrackerSection) => s;

export const SECTIONS: TrackerSection[] = [
  section({
    slug: "calculator",
    label: "Calculator",
    Icon: CalculatorIcon,
    title: "Calculator",
    summary: "Every duty on one shipment of any product, from any country.",
    ready: true,
    planned: [],
  }),
  section({
    slug: "catalog",
    label: "Catalog",
    Icon: Squares2X2Icon,
    title: "Catalog",
    summary: "Every product you import, and the duty rate on it today.",
    ready: true,
    planned: [],
  }),
  section({
    slug: "history",
    label: "Rate history",
    Icon: ClockIcon,
    title: "Rate history",
    summary: "How the rate on each of your products has changed, and why.",
    ready: false,
    planned: [
      "The rate for every product in your catalog on any past date",
      "A timeline of each change: the program, the HTS revision and the date it took effect",
      "Any two dates side by side, to see exactly what moved",
    ],
  }),
  section({
    slug: "alerts",
    label: "Alerts",
    Icon: BellAlertIcon,
    title: "Alerts",
    summary: "Know as soon as a tariff change affects one of your products.",
    ready: false,
    planned: [
      "An email and an in-app alert whenever a new HTS revision or tariff action changes a rate in your catalog",
      "What changed, which products it hits, and the difference in duty",
      "Badges on affected products until you've reviewed them",
    ],
  }),
  section({
    slug: "entries",
    label: "Entry audit",
    Icon: ClipboardDocumentCheckIcon,
    title: "Entry audit",
    summary: "Check the duty paid on every shipment against the rates in force that day.",
    ready: false,
    planned: [
      "Log each entry you clear: product, country, entry date, value and the duty you paid",
      "An instant check against the rates in force on the entry date",
      "Overpayments you could recover, and underpayments to fix before Customs finds them",
    ],
  }),
  section({
    slug: "sourcing",
    label: "Sourcing",
    Icon: GlobeAltIcon,
    title: "Sourcing",
    summary: "Find the country with the lowest tariffs for any product.",
    ready: false,
    planned: [
      "Every country of origin ranked by total duty for a product, new or already in your catalog",
      "Trade agreements and preference programs that apply to each",
      "What moving production would save across your catalog",
    ],
  }),
  section({
    slug: "trends",
    label: "Trends",
    Icon: ArrowTrendingUpIcon,
    title: "Trends",
    summary: "How tariffs on your catalog, and across the whole schedule, have moved over time.",
    ready: false,
    planned: [
      "Your catalog's average duty rate over time",
      "Your exposure by program (Section 232, 301, 122 and more) and by country",
      "Tariff trends across every HTS code and country, beyond your own products",
    ],
  }),
  section({
    slug: "savings",
    label: "Savings",
    Icon: ReceiptPercentIcon,
    title: "Savings",
    summary: "Ways to pay less duty on the products you already import.",
    ready: false,
    planned: [
      "Exemptions and trade preferences your products may qualify for",
      "The questions whose answers could lower a product's rate",
      "The total you could save across your catalog",
    ],
  }),
  section({
    slug: "charts",
    label: "Charts",
    Icon: ChartPieIcon,
    title: "Charts",
    summary: "Clear, shareable charts of your tariffs for your team or your audience.",
    ready: false,
    planned: [
      "Charts of your rates, history, exposure and savings, ready to share",
      "Links for your team, and images sized for LinkedIn and X",
    ],
  }),
  section({
    slug: "expert-help",
    label: "Expert help",
    Icon: ChatBubbleLeftRightIcon,
    title: "Expert help",
    summary: "Work with the HTS Hero team on your tariff strategy.",
    ready: false,
    planned: [
      "A review of your catalog by the HTS Hero team",
      "Help confirming you're on the right track, and finding ways to save",
    ],
  }),
];

export const sectionBySlug = (slug: string | null) => SECTIONS.find((s) => s.slug === slug);

// The address of a tab
export const sectionUrl = (slug: SectionSlug) =>
  slug === DEFAULT_SECTION ? TRACKER_PATH : `${TRACKER_PATH}?tab=${slug}`;

// The address of a catalog product's own view
export const productUrl = (key: string) =>
  `${TRACKER_PATH}?${DEFAULT_SECTION === "catalog" ? "" : "tab=catalog&"}product=${encodeURIComponent(key)}`;
