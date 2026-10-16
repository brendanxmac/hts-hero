import config from "@/config";
import { DEFINITION } from "@/components/home/lib/copy";
import {
  CLASSIFY_PLANS,
  TRACKER_TIERS,
  TRIAL_ALLOWANCE,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { SAVINGS_AUDITS_SOON } from "@/libs/tariff-tracker/features";
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

- [US Tariff Calculator](${SITE}/duty-calculator): every duty on an import, line by line, with exemptions and rates by country. Free and unlimited, no account, including duty over time. A free account adds the plain-English why behind every result (why each tariff applies and why others don't) and the duty from every country of origin
- [Tariff Tracker](${SITE}/tariff-monitor): track every tariff on your imports by HTS code and country of origin, with alerts by email, in-app, Slack or Microsoft Teams when a tariff change hits one (rate before and after), impact checks that show exactly how any tariff action affects each import, Tariff News, rate history, and exports of every tariff to CSV or Excel. Free to start: upload your whole catalog and track ${TRIAL_ALLOWANCE.alertImports} imports, no credit card. ${SAVINGS_AUDITS_SOON}
- [Tariff audit](${SITE}/tariff-audit): how US import duty on past entries is recalculated at each entry date, and where IEEPA, Section 122 and other refunds stand
- [Latest US tariff updates](${SITE}/tariff-updates): every new US tariff action from the White House, Federal Register, CBP and USTR, summarized in plain English with its official sources and the stage it has reached, checked every 15 minutes
- [Duty calculator FAQ](${SITE}/duty-calculator/faq): how US import duty is calculated, the 2026 tariff programs, fees and what's included
- [HTS Explorer](${SITE}/explore): browse and search the full Harmonized Tariff Schedule
- [HTS code pages](${SITE}/hts/6109.10.00): duty rates by country for each HTS code
- [Classification assistant](${SITE}/classify): AI-assisted HTS classification that finds candidate headings, checks them against the legal notes and CROSS rulings, and produces audit-ready classification reports. From ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo
- [Pricing](${SITE}/pricing-calculator): the Tariff Calculator is free; the Tariff Tracker starts free (track ${TRIAL_ALLOWANCE.alertImports} imports with alerts and impact checks, no time limit), then from ${formatPrice(TRACKER_TIERS[0].price)}/mo for up to ${TRACKER_TIERS[0].maxPairs} imports, billed monthly; classification from ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo

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
