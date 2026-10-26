import { TRY_FREE_HREF } from "@/components/tariff-tracker/access/signup";
import type { CtaKind } from "@/libs/blog/types";
import { getVerifiedRevisions } from "@/tariffs/engine-v2/revisions";
import { REVERSE_TRIAL, TRY_IT_FREE } from "@/components/pricing-calculator/lib/pricing";
import { formatPostDate } from "../lib/format";

// Historical rates go back to the first HTS revision whose tariff data has been verified
const HISTORY_FROM = formatPostDate(getVerifiedRevisions()[0].from, "short").replace(/ \d+,/, "");

const TRACKER_HREF = TRY_FREE_HREF;

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
      "Exemptions and trade preferences that could apply",
      "Compare the same product from every country",
    ],
    button: "Calculate your duty",
    href: "/duty-calculator",
  },
  history: {
    kicker: "Historical tariff rates",
    title: "See what duty applied on a past date",
    body: "Pick an entry date and HTS Hero calculates the duty that applied on that day, from the HTS revision in force at the time. Free, with no account.",
    points: [
      `Verified rates for entries back to ${HISTORY_FROM}`,
      "See how a product's duty changed over time",
      "Every rate tied to its Chapter 99 heading and source",
    ],
    button: "See duty on a past date",
    href: "/duty-calculator",
  },
  tracker: {
    kicker: "Tariff Tracker",
    title: "Eliminate tariff overpayments and surprises",
    body: "Add your HTS codes and countries once. HTS Hero audits your entries for duty you may have overpaid, checks every new tariff action against your imports and tells you exactly how each one is affected.",
    points: [
      "Every entry audited for duty you may have overpaid",
      "Alerts when a tariff change hits your imports",
      "Before and after rates for each import, and the change in %",
      `Free for ${REVERSE_TRIAL.days} days on up to ${REVERSE_TRIAL.imports} imports, no credit card`,
    ],
    button: TRY_IT_FREE,
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
