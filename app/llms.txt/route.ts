import config from "@/config";
import { DEFINITION } from "@/components/home/lib/copy";
import {
  ALERT_TIERS,
  AUDIT_TIERS,
  CLASSIFY_PLANS,
  LOWEST_PER_IMPORT,
  REVERSE_TRIAL,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { CATEGORIES } from "@/libs/blog/catalog";
import { getPostsInCategory } from "@/libs/blog/posts";
import { COMPARE_PAGES, comparePageTitle } from "@/libs/compare/pages";
import { COUNTRY_PAGES, capitalized } from "@/libs/country-pages/countries";
import { PROGRAM_HUBS } from "@/libs/tariff-programs/hubs";

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

  const programs = PROGRAM_HUBS.map((h) => `- [${h.title}](${SITE}/tariffs/${h.slug}): every Chapter 99 heading and HTS code it covers, with rates, dates and sources`).join("\n");

  const comparisons = COMPARE_PAGES.map((p) => `- [${comparePageTitle(p)}](${SITE}/compare/${p.slug})`).join("\n");

  const body = `# HTS Hero

> ${DEFINITION} Its tariff data is checked against each new revision of the Harmonized Tariff Schedule, with every change logged in a public changelog. Tariff results are also available by API and MCP for ERP, TMS and internal systems.

## Tools

- [US Tariff Calculator](${SITE}/duty-calculator): every duty on an import, line by line, with exemptions and rates by country. Free and unlimited, no account. A free account adds duty over time, comparing countries side by side, the tariff news on each import, the plain-English why behind every result (why each tariff applies and why others don't), sourcing intelligence (the duty from every country of origin) and the AD/CVD check: for any HTS code and country of origin, the live antidumping and countervailing duty cases and new petitions that may cover the import, with the deposit rates Commerce set (all-others and company-specific) and the companies named. AD/CVD duties are shown separately and aren't added to the duty estimate; whether a case applies depends on the scope's written description, which the importer or their customs broker decides. Without an account, the calculator only says that an AD/CVD case may apply
- [Tariff Alerts](${SITE}/tariff-alerts): alerts by email, and in Slack or Microsoft Teams on plans for 100 or more products, when a new US tariff hits your products (one HTS code from one country of origin), with the rate before and after and the official source, AD/CVD alerts and updates, and impact checks that show how any tariff action affects each product. From ${formatPrice(ALERT_TIERS[0].price)}/mo for up to ${ALERT_TIERS[0].maxPairs} products. Every new account gets a ${REVERSE_TRIAL.days}-day free trial of Duty Guard, with no credit card required. Tracking any number of products, with their current duty, rate history and exports, stays free; alerts need a paid plan
- [Duty Guard Pro](${SITE}/duty-audit): everything in Duty Guard Essentials, plus every entry checked against the duty in force on its date, flagging possible over and underpayments, and savings detection for trade programs, exemptions and lower-duty origins a product may qualify for. From ${formatPrice(AUDIT_TIERS[0].price)}/mo for up to ${AUDIT_TIERS[0].maxPairs} products. HTS Hero finds and flags; the importer's licensed broker decides and files. Also how US import duty on past entries is recalculated at each entry date, and where IEEPA, Section 122 and other refunds stand
- [Latest US tariff updates](${SITE}/tariff-updates): every new US tariff action from the White House, Federal Register, CBP and USTR, summarized in plain English with its official sources and the stage it has reached, checked every hour
- [Duty calculator FAQ](${SITE}/duty-calculator/faq): how US import duty is calculated, the 2026 tariff programs, fees and what's included
- [HTS Explorer](${SITE}/explore): browse and search the full Harmonized Tariff Schedule
- [HTS code pages](${SITE}/hts/6109.10.00): duty rates by country for each HTS code, and the AD/CVD cases whose scope lists the code
- [Classification assistant](${SITE}/classify): AI-assisted HTS classification that finds candidate headings, checks them against the legal notes and CROSS rulings, and produces audit-ready classification reports. From ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo
- [Pricing](${SITE}/pricing-calculator): the Duty Calculator is free with no account; a free account adds unlimited product tracking, the plain-English why, sourcing intelligence and the AD/CVD check on any product. Duty Guard Essentials is ${ALERT_TIERS.map((t) => `${formatPrice(t.price)} for up to ${t.maxPairs}`).join(", ")} products a month, as low as ${formatPrice(LOWEST_PER_IMPORT)} per product. Duty Guard Pro is ${AUDIT_TIERS.map((t) => `${formatPrice(t.price)} for up to ${t.maxPairs}`).join(", ")} products a month. Annual billing is 15% off, and both are free for ${REVERSE_TRIAL.days} days with no credit card required. Classification from ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo

${guides.join("\n")}
## US tariff programs

- [US tariff programs](${SITE}/tariffs): every Section 232, 301, 338, 122, 201 and IEEPA tariff program, with what each has in force today
${programs}
- Chapter 99 heading pages (e.g. [9903.88.15](${SITE}/hts/9903.88.15)): what each heading is, its program, rate, status and dates, the codes it covers and its legal text

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
