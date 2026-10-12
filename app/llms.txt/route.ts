import config from "@/config";
import { DEFINITION } from "@/components/home/lib/copy";
import {
  CLASSIFY_PLANS,
  FREE_TRACKED_PAIRS,
  TRACKER_TIERS,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { CATEGORIES } from "@/libs/blog/catalog";
import { getPostsInCategory } from "@/libs/blog/posts";
import { COMPARE_PAGES, comparePageTitle } from "@/libs/compare/pages";
import { COUNTRY_PAGES, capitalized } from "@/libs/country-pages/countries";

// /llms.txt (llmstxt.org): a plain map of the site for AI assistants and answer engines, so
// they can find the tools and the guides worth citing. Rebuilt with every deploy.
export const dynamic = "force-static";

const SITE = `https://${config.domainName}`;

export function GET() {
  const guides = CATEGORIES.map((category) => {
    const posts = getPostsInCategory(category.slug);
    if (posts.length === 0) return "";
    const lines = posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.description}`);
    return `## ${category.title}\n\n${lines.join("\n")}\n`;
  }).filter(Boolean);

  const countries = COUNTRY_PAGES.map(
    (c) => `- [${capitalized(c.name.replace(/^the /, ""))} to US tariff calculator](${SITE}/duty-calculator/${c.slug})`
  ).join("\n");

  const comparisons = COMPARE_PAGES.map((p) => `- [${comparePageTitle(p)}](${SITE}/compare/${p.slug})`).join("\n");

  const body = `# HTS Hero

> ${DEFINITION} Its tariff data is checked against each new revision of the Harmonized Tariff Schedule, with every change logged in a public changelog. Tariff results are also available by API and MCP for ERP, TMS and internal systems.

## Tools

- [US Tariff Calculator](${SITE}/duty-calculator): every duty on an import, line by line, with exemptions and rates by country. Free and unlimited, no account, including duty over time. A free account adds the duty from every country of origin
- [Tariff Tracker](${SITE}/tariff-monitor): tariff monitoring and alerts by HTS code and country of origin, by email, in-app, Slack or Microsoft Teams, with rate history, entry audit and savings discovery. Free for 3 products
- [Tariff audit](${SITE}/tariff-audit): find overpaid US import duty on past entries, recalculated at each entry date, and where IEEPA, Section 122 and other refunds stand. Self-audit free for 14 days with the Tracker trial, or request one free
- [Duty calculator FAQ](${SITE}/duty-calculator/faq): how US import duty is calculated, the 2026 tariff programs, fees and what's included
- [HTS Explorer](${SITE}/explore): browse and search the full Harmonized Tariff Schedule
- [HTS code pages](${SITE}/hts/6109.10.00): duty rates by country for each HTS code
- [Classification assistant](${SITE}/classify): AI-assisted HTS classification that finds candidate headings, checks them against the legal notes and CROSS rulings, and produces audit-ready classification reports. From ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo
- [Pricing](${SITE}/pricing-calculator): the Tariff Calculator is free; the Tariff Tracker is free for ${FREE_TRACKED_PAIRS} products, then from ${formatPrice(TRACKER_TIERS[0].price)}/mo; classification from ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo

${guides.join("\n")}
## Tariff calculators by country

- [US tariffs by country: every country of origin in one table](${SITE}/duty-calculator/countries)
- [US tariffs by country as CSV: every country's forced-labor rate, country tariffs, Column 2 and trade agreements](${SITE}/duty-calculator/countries.csv)
${countries}

## Comparisons

${comparisons}

## Optional

- [Blog](${SITE}/blog): all guides and tariff updates
- [Tariff calculator changelog](${SITE}/duty-calculator/changelog): every change to the calculator's tariff data
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
