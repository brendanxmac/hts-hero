import config from "@/config";
import { CATEGORIES } from "@/libs/blog/catalog";
import { getPostsInCategory } from "@/libs/blog/posts";

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

  const body = `# HTS Hero

> HTS Hero is a US tariff calculator and auditing tool for importers, customs brokers and trade compliance teams. It calculates the full US import duty for an HTS code, country of origin and entry date: the base rate, every Chapter 99 tariff (Section 232, Section 301 and others) with its exemptions and stacking rules, and customs fees. Its tariff data is checked against each new revision of the Harmonized Tariff Schedule.

## Tools

- [US Tariff Calculator](${SITE}/duty-calculator): every duty on an import, line by line, with exemptions, rates by country and duty over time
- [HTS Explorer](${SITE}/explore): browse and search the full Harmonized Tariff Schedule
- [HTS code pages](${SITE}/hts/6109.10.00): duty rates by country for each HTS code
- [HTS Classification](${SITE}/classify): find and document an HTS code for a product
- [Pricing](${SITE}/pricing-calculator)

${guides.join("\n")}
## Optional

- [Blog](${SITE}/blog): all guides and tariff updates
- [Tariff calculator changelog](${SITE}/duty-calculator/changelog): every change to the calculator's tariff data
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
