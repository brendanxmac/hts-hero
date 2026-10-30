import config from "@/config";
import { DEFINITION } from "@/components/home/lib/copy";
import {
  CLASSIFY_PLANS,
  LOWEST_PER_IMPORT,
  REVERSE_TRIAL,
  TRACKER_TIERS,
  formatPrice,
  perImportPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { FREE_FOREVER_SHORT, SAVINGS_AUDITS_INCLUDED } from "@/components/ui/marketing/comingSoon";
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

- [US Tariff Calculator](${SITE}/duty-calculator): every duty on an import, line by line, with exemptions and rates by country. Free and unlimited, no account, including duty over time. A free account adds the plain-English why behind every result (why each tariff applies and why others don't), sourcing intelligence (the duty from every country of origin) and the AD/CVD check: for any HTS code and country of origin, the live antidumping and countervailing duty cases and new petitions that may cover the import, with the deposit rates Commerce set (all-others and company-specific) and the companies named. AD/CVD duties are shown separately and aren't added to the duty estimate; whether a case applies depends on the scope's written description, which the importer or their customs broker decides. Without an account, the calculator only says that an AD/CVD case may apply
- [Tariff Tracker](${SITE}/tariff-monitor): track every tariff on your imports by HTS code and country of origin, with alerts by email, in-app, Slack or Microsoft Teams when a tariff change hits one (rate before and after), AD/CVD alerts and updates, impact checks that show exactly how any tariff action affects each import, Insights across the catalog, Tariff News, rate history, and exports of every tariff to CSV or Excel. Every new account gets a ${REVERSE_TRIAL.days}-day free trial of everything on up to ${REVERSE_TRIAL.imports} imports, with no credit card; after it, ${FREE_FOREVER_SHORT} stay free, forever, the AD/CVD check on any import stays free with any account, and alerts on the account's own imports (AD/CVD alerts included) need a paid plan. ${SAVINGS_AUDITS_INCLUDED} Savings detection checks every import for trade programs, exemptions and lower-duty origins it may qualify for; automatic auditing checks every entry against the duty in force on its date and flags possible over- and underpayments.
- [Tariff audit](${SITE}/duty-audits): how US import duty on past entries is recalculated at each entry date, and where IEEPA, Section 122 and other refunds stand
- [Latest US tariff updates](${SITE}/tariff-updates): every new US tariff action from the White House, Federal Register, CBP and USTR, summarized in plain English with its official sources and the stage it has reached, checked every hour
- [Duty calculator FAQ](${SITE}/duty-calculator/faq): how US import duty is calculated, the 2026 tariff programs, fees and what's included
- [HTS Explorer](${SITE}/explore): browse and search the full Harmonized Tariff Schedule
- [HTS code pages](${SITE}/hts/6109.10.00): duty rates by country for each HTS code, and the AD/CVD cases whose scope lists the code
- [Classification assistant](${SITE}/classify): AI-assisted HTS classification that finds candidate headings, checks them against the legal notes and CROSS rulings, and produces audit-ready classification reports. From ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo
- [Pricing](${SITE}/pricing-calculator): the Tariff Calculator is free, and a free account adds the plain-English why, sourcing intelligence and the AD/CVD check on any import; the Tariff Tracker is free for ${REVERSE_TRIAL.days} days on up to ${REVERSE_TRIAL.imports} imports (no credit card), then from ${formatPrice(TRACKER_TIERS[0].price)}/mo for up to ${TRACKER_TIERS[0].maxPairs} imports, billed monthly; per import per month that's ${TRACKER_TIERS.map((t) => `${formatPrice(perImportPrice(t))} (up to ${t.maxPairs})`).join(", ")}, as low as ${formatPrice(LOWEST_PER_IMPORT)} (${FREE_FOREVER_SHORT} stay free, forever); classification from ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo

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
