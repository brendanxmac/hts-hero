import type { CtaKind } from "@/libs/blog/types";
import { getVerifiedRevisions } from "@/tariffs/engine-v2/revisions";
import { formatPostDate } from "../lib/format";

// Historical rates go back to the first HTS revision whose tariff data has been verified
const HISTORY_FROM = formatPostDate(getVerifiedRevisions()[0].from, "short").replace(/ \d+,/, "");

const TRACKER_HREF = "/tariff-tracker";

// The pitch for each HTS Hero tool. A post picks one in its frontmatter (`cta:`) to match its
// topic, and MDX can drop one inline with <Cta kind="history" />.
export const CTA_CONTENT: Record<
  CtaKind,
  { kicker: string; title: string; body: string; points: string[]; button: string; href: string }
> = {
  calculator: {
    kicker: "Free tariff calculator",
    title: "See every tariff on your import, line by line",
    body: "Enter an HTS code and a country of origin. HTS Hero stacks the base rate with every Chapter 99 tariff that applies and shows you the math.",
    points: [
      "Section 232, Section 301 and every other program, stacked correctly",
      "Exemptions and trade preferences you qualify for",
      "Compare the same product from every country",
    ],
    button: "Calculate your duty",
    href: "/duty-calculator",
  },
  history: {
    kicker: "Historical tariff rates",
    title: "Check what you should have paid on a past entry",
    body: "Pick an entry date and HTS Hero calculates the duty that applied on that day, from the HTS revision in force at the time. Audit past entries and catch overpayments.",
    points: [
      `Verified rates for entries back to ${HISTORY_FROM}`,
      "See how a product's duty changed over time",
      "Every rate tied to its Chapter 99 heading and source",
    ],
    button: "Audit a past entry",
    href: "/duty-calculator",
  },
  tracker: {
    kicker: "Tariff change alerts",
    title: "Know the day a tariff change hits your products",
    body: "Add your HTS codes and countries once. HTS Hero checks every new HTS revision against your catalog and tells you what changed and what it costs you.",
    points: [
      "Alerts when a revision changes duty on your products",
      "Before and after rates for each product",
      "Find lower-duty countries and exemptions",
    ],
    button: "Watch your products",
    href: TRACKER_HREF,
  },
  classify: {
    kicker: "HTS classification",
    title: "Get an HTS code you can defend",
    body: "Your duty is only right if your HTS code is right. HTS Hero walks the tariff schedule with you and backs every decision with notes and CBP rulings.",
    points: [
      "Classifications built on the GRIs and legal notes",
      "Supporting CROSS rulings for every code",
      "A report you can hand to your broker or an auditor",
    ],
    button: "Classify a product",
    href: "/classify",
  },
};
