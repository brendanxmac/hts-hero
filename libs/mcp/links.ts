import config from "../../config";
import { calculatorUrl } from "../../components/duty-calculator/lib/estimate";
import { DutyCalculation } from "./duty";

// Links back into HTS Hero from MCP results. They're informational (the full breakdown, the
// analysis, the code's page), never pricing, so they're allowed in every AI client's directory.
// Each carries UTM tags so signups can be traced to the client and tool.

export const SITE_URL = process.env.MCP_PUBLIC_SITE_URL || `https://${config.domainName}`;

// The Tariff Tracker's address; its sections module pulls in icons, so it isn't imported here
const TRACKER_PATH = "/tariff-tracker";

export interface LinkContext {
  client: string; // "claude", "chatgpt", "cursor", "other"
  tool: string;
}

const utm = (ctx: LinkContext) => ({
  utm_source: ctx.client,
  utm_medium: "mcp",
  utm_campaign: ctx.tool,
});

const withUtm = (url: string, ctx: LinkContext) => {
  const u = new URL(url);
  Object.entries(utm(ctx)).forEach(([k, v]) => u.searchParams.set(k, v));
  return u.toString();
};

const calculatorParams = (calc: DutyCalculation) => ({
  origin: SITE_URL,
  code: calc.line.element.htsno,
  country: calc.country.code,
  value: calc.customsValue,
  units: calc.quantity,
  date: calc.asOf,
  mode: calc.transportMode,
  pref: calc.result.claimedPreference,
  answers: calc.answers,
});

// The public calculator with every input filled in
export const fullBreakdownUrl = (calc: DutyCalculation, ctx: LinkContext) =>
  calculatorUrl({ ...calculatorParams(calc), extra: utm(ctx) });

// The Tariff Tracker's calculator, opened on its Analysis: the duty from every origin, the globe,
// the time-lapse
export const analysisUrl = (calc: DutyCalculation, ctx: LinkContext) =>
  calculatorUrl({
    ...calculatorParams(calc),
    path: TRACKER_PATH,
    extra: { tab: "calculator", view: "analysis", ...utm(ctx) },
  });

export const htsPageUrl = (htsno: string, ctx: LinkContext) =>
  withUtm(`${SITE_URL}/hts/${encodeURIComponent(htsno)}`, ctx);

export const changelogUrl = (ctx: LinkContext) => withUtm(`${SITE_URL}/duty-calculator/changelog`, ctx);
