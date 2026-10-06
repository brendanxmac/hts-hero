import { HTS_HERO } from "./tools/htsHero";
import { FLEXPORT } from "./tools/flexport";
import { GINGER_CONTROL } from "./tools/gingerControl";
import { GATEWAY_LINES } from "./tools/gatewayLines";
import { AMZ_PREP } from "./tools/amzPrep";
import { TARIFFS_API } from "./tools/tariffsApi";
import { AIRLIFT_USA, AVALARA, DESCARTES, EASYSHIP, SIMPLY_DUTY, ZONOS } from "./tools/globalLandedCost";
import type { Tool } from "./types";

export { HTS_HERO };

// Every competitor, in the roundup's order: the best-known names first (Flexport, then the
// large duty and landed-cost platforms), then the smaller single-purpose calculators. The order
// also decides which tools fill the side-by-side tables and the alternatives lists.
export const COMPETITORS: Tool[] = [
  FLEXPORT,
  AVALARA,
  ZONOS,
  DESCARTES,
  SIMPLY_DUTY,
  GINGER_CONTROL,
  GATEWAY_LINES,
  AIRLIFT_USA,
  TARIFFS_API,
  EASYSHIP,
  AMZ_PREP,
];

export const ROUNDUP_SLUG = "best-us-tariff-calculators";

export const vsSlug = (tool: Tool) => `hts-hero-vs-${tool.slug}`;

export type ComparePage =
  | { kind: "roundup"; slug: string }
  | { kind: "vs"; slug: string; tool: Tool }
  | { kind: "alternatives"; slug: string; tool: Tool };

// Every page under /compare/[slug]
export const COMPARE_PAGES: ComparePage[] = [
  { kind: "roundup", slug: ROUNDUP_SLUG },
  ...COMPETITORS.filter((t) => t.vs).map((tool) => ({ kind: "vs" as const, slug: vsSlug(tool), tool })),
  ...COMPETITORS.filter((t) => t.alternatives).map((tool) => ({
    kind: "alternatives" as const,
    slug: tool.alternatives!.slug,
    tool,
  })),
];

export const comparePage = (slug: string) => COMPARE_PAGES.find((p) => p.slug === slug);

// The competitors ranked after HTS Hero on a page about `tool`'s alternatives: the roundup's
// order, without the tool itself
export const alternativesTo = (tool: Tool, count = 5) => COMPETITORS.filter((t) => t.slug !== tool.slug).slice(0, count);

// The page's title, for links, metadata and the social image
export const comparePageTitle = (page: ComparePage) => {
  if (page.kind === "roundup") return "The Best US Tariff Calculators in 2026";
  if (page.kind === "vs") return `HTS Hero vs ${page.tool.name}`;
  return `${page.tool.alternatives!.title} (2026)`;
};
