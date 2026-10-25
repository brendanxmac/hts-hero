import { Countries, Country } from "@/constants/countries";
import { formatImportValue } from "@/components/duty-calculator/lib/usImportsData";
import { preferenceName } from "@/libs/hts-duty-summary";
import { OriginRate } from "@/components/tariff-tracker/product/analysis/analysis";
import { RatePart } from "@/components/tariff-tracker/report";
import type { CaseMatch, MatchableCase } from "@/libs/adcvd/match";
import { countryFlags, isBlocked, SourcingFlag } from "@/libs/sourcing/flags";
import governanceData from "@/libs/sourcing/governance.json";
import transitData from "@/libs/sourcing/transit.json";
import { Bilateral, freightShare, modeMix, TradeData, unitValue } from "@/libs/sourcing/trade";

// Where to source one product from: every country's landed cost (duty from the engine plus the
// freight and insurance Census records), whether it can really make the product (Atlas exports),
// how reliable it is (World Bank governance, compliance flags) and how far away (transit time),
// worked into one row per country with a score out of 100 for each, ranked one metric at a time
// (no overall score). Plain data, so the page only draws it.

// ── Capacity (public/data/sourcing/capacity, from `npm run sourcing:capacity`) ──

export interface CapacityEntry {
  // World exports this year and the prior one, thousands of USD
  w: number;
  wp: number;
  // World exports every year (CapacityFile.years), thousands of USD
  wy: number[];
  // Countries that specialize in it (RCA ≥ 1)
  n: number;
  // [country, exports this year, the prior year (thousands of USD), RCA], largest first
  c: [string, number, number, number][];
}

export interface CapacityFile {
  source: string;
  url: string;
  license: string;
  year: number;
  prior: number;
  years: number[];
  codes: Record<string, CapacityEntry>;
}

// ── Rows ──

export interface Scores {
  cost: number;
  capacity: number;
  reliability: number;
  speed: number;
}

export interface SourcingRow {
  country: Country;
  // The duty, with or without the best trade agreement as asked
  dutyPct: number;
  parts: RatePart[];
  agreement?: { symbol: string; name: string };
  // Why the duty part is missing or zero, said on its bars: the engine couldn't work out the base
  // rate (a compound or specific rate it can't price), or no duty at all (duty-free, or with an
  // agreement)
  dutyNote: string | null;
  // The duty leaves out a base rate the engine couldn't calculate, so it's understated
  dutyIncomplete: boolean;
  // Freight and insurance as a share of value from Census, when enough came by sea or air
  freightPct: number | null;
  // What the landed cost used: the country's own figure, or the typical one when it has none
  freightUsed: number;
  freightEstimated: boolean;
  landedPct: number;
  // Canada and Mexico: mostly by truck and rail
  byLand: boolean;
  us: {
    value: number;
    prior: number;
    // Share of all US imports of it
    share: number;
    growth: number | null;
    monthly: number[];
    mix: ReturnType<typeof modeMix>;
    unitValue: number | null;
    districts: [string, number][];
  } | null;
  // Its exports to every country (not only the US) of the code's whole 6-digit group, the finest
  // level world trade data comes at: "2903.44" holds HFC-125, HFC-143a and HFC-143 together
  world: {
    group: string;
    exports: number;
    prior: number;
    share: number;
    rank: number;
    rca: number;
    growth: number | null;
  } | null;
  transit: { port: string; via?: string; west: number; east: number; gulf: number; days: number; coast: Coast } | null;
  governance: { rl?: number; cc?: number; pv?: number; ge?: number; rq?: number; lpi?: number } | null;
  flags: SourcingFlag[];
  // Sanctions or no normal trade relations
  blocked: boolean;
  // A realistic option: makes it or ships it to the US, and not blocked
  candidate: boolean;
  // Its US figures rest on very little (a small amount, or only a month or two of shipments), so
  // its freight, unit value and US share say less
  thinUs: boolean;
  // Each metric as a score out of 100, among the realistic options (no overall score: each ranks
  // on its own)
  scores: Scores;
}

export type Coast = "west" | "east" | "gulf";
export const COAST_NAMES: Record<Coast, string> = { west: "West Coast", east: "East Coast", gulf: "Gulf Coast" };

// ── Metrics ──

// In this order everywhere
export const SCORE_NAMES: Record<keyof Scores, string> = { capacity: "Capacity", reliability: "Reliability", speed: "Speed", cost: "Cost" };
export const SCORE_KEYS = Object.keys(SCORE_NAMES) as (keyof Scores)[];

// A country counts as a producer when it exports at least this much of it a year (thousands of USD)
const MIN_WORLD_EXPORTS = 1_000;
// …or ships at least this much of it to the US a year (USD)
const MIN_US_IMPORTS = 100_000;
// US figures below this much in 12 months (USD), or from fewer months than this, are thin
const THIN_US_VALUE = 250_000;
const THIN_US_MONTHS = 3;
// Truck or rail from Canada and Mexico, in days, for the speed score
export const LAND_DAYS = 3;
// By air, door to door
export const AIR_DAYS = 2;
// Share of this product from a country that flies, above which it counts as shipping by air
const MOSTLY_AIR = 0.5;

// How long this product takes to reach the US from a country, and how it travels: by air when
// most of it flies (Census's mode of transport for this product), else Canada and Mexico by truck
// or rail, else by sea from the country's main port to the nearest US coast. Always a time.
export const transitOf = (row: Pick<SourcingRow, "byLand" | "transit" | "us">): { days: number | null; mode: string } => {
  const air = row.us?.mix?.air ?? 0;
  if (air >= MOSTLY_AIR) return { days: AIR_DAYS, mode: `by air (${Math.round(air * 100)}% of this product from here flies)` };
  if (row.byLand) return { days: LAND_DAYS, mode: "by truck or rail" };
  if (row.transit) return { days: row.transit.days, mode: `by sea, ${row.transit.port}${row.transit.via ? ` (${row.transit.via})` : ""} to the ${COAST_NAMES[row.transit.coast]}` };
  return { days: null, mode: "no estimate" };
};
const LAND = new Set(["CA", "MX"]);
// The smallest spread in landed cost, in percent of value, that runs the cost score from 100 to 0
const COST_SPAN = 10;

const clamp = (v: number) => Math.max(0, Math.min(100, v));
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
};
// 0 to 1 on a log scale between the smallest and largest value
const logScale = (values: number[]) => {
  const logs = values.filter((v) => v > 0).map(Math.log10);
  const lo = Math.min(...logs);
  const hi = Math.max(...logs);
  return (v: number) => (v > 0 && hi > lo ? (Math.log10(v) - lo) / (hi - lo) : v > 0 ? 1 : 0);
};

const portTransit = (code: string): SourcingRow["transit"] => {
  const t = (transitData.countries as Record<string, { port: string; via?: string; west: { days: number }; east: { days: number }; gulf: { days: number } }>)[code];
  if (!t) return null;
  const coast = (["west", "east", "gulf"] as Coast[]).reduce((best, c) => (t[c].days < t[best].days ? c : best), "west" as Coast);
  return { port: t.port, via: t.via, west: t.west.days, east: t.east.days, gulf: t.gulf.days, days: t[coast].days, coast };
};

// The AD/CVD cases that may cover it from this country, as flags
const adcvdFlags = (matches: CaseMatch[], cases: MatchableCase[]): SourcingFlag[] => {
  const live = matches.filter((m) => m.level !== "history");
  if (!live.length) return [];
  const likely = live.some((m) => m.level === "likely");
  const products = Array.from(new Set(live.map((m) => cases.find((c) => c.case_number === m.case_number)?.product).filter(Boolean)));
  return [
    {
      id: "adcvd",
      tone: likely ? "error" : "warning",
      label: likely ? "AD/CVD likely" : "AD/CVD may apply",
      detail: `${live.length === 1 ? "An antidumping or countervailing duty case" : `${live.length} antidumping or countervailing duty cases`} ${likely ? "likely covers" : "may cover"} this code from here (${live.map((m) => m.case_number).join(", ")}${products.length ? `: ${products.slice(0, 2).join("; ")}` : ""}). These duties come on top of the rate shown and can be large; check the scope in the Calculator's AD/CVD check.`,
      source: "U.S. Department of Commerce, ITA",
      url: "https://www.trade.gov/us-antidumping-and-countervailing-duties",
    },
  ];
};

// The US records far more of this code from a country than the country reports exporting of its
// whole 6-digit group to every market, and it rose fast: new production, or goods made elsewhere
// routed through it (transshipment), which CBP investigates as evasion. A flag to check origin,
// never a finding. The world figures run a year or two behind US ones, so a fast-growing new
// producer can trip it too; the detail says so.
const MISMATCH_MIN = 1_000_000;
// A feeder's exports to the flagged country in the latest year must be at least this many times
// their low point in the years before, and at least this much (thousands of USD)
const FEEDER_RISE = 1.75;
const FEEDER_MIN = 250;

// Countries whose exports of the group to a flagged country rose sharply, from their low point in
// the Atlas's years to the latest: the ones under AD/CVD cases first, the largest rise first
const feeders = (bilateral: Bilateral, to: string, underOrders: string[]) => {
  const { years } = bilateral;
  return Object.entries(bilateral.e)
    .filter(([from]) => from !== to && from !== "US")
    .map(([from, x]) => {
      const flow = x.d[to];
      if (!flow) return null;
      const earlier = flow.slice(0, -1);
      const low = Math.min(...earlier);
      return { code: from, first: low, last: flow[flow.length - 1], from: years[earlier.indexOf(low)], to: years[years.length - 1] };
    })
    .filter((f): f is { code: string; first: number; last: number; from: number; to: number } => Boolean(f && f.last >= FEEDER_MIN && f.last >= f.first * FEEDER_RISE))
    .sort((a, b) => Number(underOrders.includes(b.code)) - Number(underOrders.includes(a.code)) || b.last - b.first - (a.last - a.first))
    .slice(0, 2)
    .map((f) => ({ ...f, name: Countries.find((c) => c.code === f.code)?.name ?? f.code }));
};
const MISMATCH_RATIO = 4;
const mismatchFlag = ({
  country,
  code,
  htsno,
  last,
  prior,
  world,
  worldYear,
  underOrders,
  bilateral,
}: {
  country: string;
  code: string;
  htsno: string;
  last: number;
  prior: number;
  world: number;
  worldYear?: number;
  underOrders: string[];
  bilateral?: Bilateral | null;
}): SourcingFlag[] => {
  if (last < MISMATCH_MIN || last < world * MISMATCH_RATIO || prior > last / 2) return [];
  const others = underOrders.filter((c) => c !== code).map((c) => Countries.find((x) => x.code === c)?.name ?? c);
  const group = htsno.slice(0, 7);
  const feeding = bilateral ? feeders(bilateral, code, underOrders) : [];
  return [
    {
      id: "mismatch",
      tone: "warning",
      label: "Supply mismatch",
      detail: `The US recorded ${formatImportValue(last)} of this code from ${country} in the last 12 months (${prior > 0 ? `up from ${formatImportValue(prior)}` : "from almost nothing"} the year before), far more than ${country} reported exporting of the whole ${group} group to every country${worldYear ? ` in ${worldYear}` : ""} (${world > 0 ? formatImportValue(world) : "none"})${others.length ? `, and it grew as ${others.slice(0, 2).join(" and ")} came under AD/CVD cases on this product` : ""}. That can be new production, but it's also the pattern of goods made elsewhere and routed through ${country}. ${
        feeding.length
          ? ` Meanwhile ${feeding
              .map((f) => `${f.name}'s exports of ${group} to ${country} rose from ${f.first > 0 ? formatImportValue(f.first * 1000) : "none"} in ${f.from} to ${formatImportValue(f.last * 1000)} in ${f.to}`)
              .join(", and ")}.`
          : ""
      } Confirm where the goods are actually made with your supplier before relying on it.`,
      source: "U.S. Census Bureau and the Atlas of Economic Complexity (country to country); CBP investigates evasion under EAPA",
      url: "https://www.cbp.gov/trade/trade-enforcement/tftea/eapa",
    },
  ];
};

export const sourcingRows = ({
  rates,
  withAgreements,
  trade,
  capacity,
  htsno,
  adcvd,
  worldYear,
  bilateral,
}: {
  rates: OriginRate[];
  withAgreements: boolean;
  trade: TradeData | null;
  capacity: CapacityEntry | null;
  htsno: string;
  // Each country's AD/CVD matches and the cases they name, once loaded
  adcvd: { matches: Map<string, CaseMatch[]>; cases: MatchableCase[] } | null;
  // The year the world export figures are for
  worldYear?: number;
  // Where each country's exports of the group go, for the supply mismatch flag's evidence
  bilateral?: Bilateral | null;
}): SourcingRow[] => {
  // Countries with a live AD/CVD case that may cover this code, for the supply mismatch flag
  const underOrders = adcvd
    ? Array.from(adcvd.matches.entries())
        .filter(([, m]) => m.some((x) => x.level !== "history"))
        .map(([c]) => c)
    : [];
  const usTotal = trade?.total.last.value ?? 0;
  const worldRank = new Map((capacity?.c ?? []).map(([code], i) => [code, i + 1]));
  const worldOf = new Map((capacity?.c ?? []).map((c) => [c[0], c]));
  const govern = governanceData.countries as Record<string, SourcingRow["governance"]>;

  const rows = rates.map((r): Omit<SourcingRow, "scores" | "score" | "freightUsed" | "freightEstimated" | "landedPct"> => {
    const code = r.country.code;
    const agreement = withAgreements && r.agreement ? r.agreement : undefined;
    const t = trade?.countries[code];
    const w = worldOf.get(code);
    const flags = [
      ...countryFlags(code, htsno, agreement?.symbol),
      ...(adcvd ? adcvdFlags(adcvd.matches.get(code) ?? [], adcvd.cases) : []),
      ...mismatchFlag({ country: r.country.name, code, htsno, last: t?.last.value ?? 0, prior: t?.prior ?? 0, world: w ? w[1] * 1000 : 0, worldYear, underOrders, bilateral }),
    ];
    const blocked = isBlocked(flags);
    const us = t
      ? {
          value: t.last.value,
          prior: t.prior,
          share: usTotal > 0 ? t.last.value / usTotal : 0,
          growth: t.prior > 0 ? (t.last.value - t.prior) / t.prior : null,
          monthly: t.monthly,
          mix: modeMix(t.last),
          unitValue: unitValue(t.last),
          districts: t.districts,
        }
      : null;
    const world =
      w && capacity
        ? { group: htsno.slice(0, 7), exports: w[1], prior: w[2], share: capacity.w > 0 ? w[1] / capacity.w : 0, rank: worldRank.get(code)!, rca: w[3], growth: w[2] > 0 ? (w[1] - w[2]) / w[2] : null }
        : null;
    return {
      country: r.country,
      dutyPct: agreement ? agreement.pct : r.pct,
      parts: agreement ? agreement.parts : r.parts,
      agreement: agreement ? { symbol: agreement.symbol, name: agreement.name } : undefined,
      dutyIncomplete: r.result.baseNotCalculated,
      dutyNote: r.result.baseNotCalculated
        ? "Base duty not calculated: open it in the Calculator"
        : (agreement ? agreement.pct : r.pct) < 0.005
          ? agreement
            ? `Duty-free with ${preferenceName(agreement.name)}`
            : "Duty-free"
          : null,
      freightPct: t ? freightShare(t.last) : null,
      byLand: LAND.has(code),
      us,
      world,
      transit: portTransit(code),
      governance: govern[code] ?? null,
      flags,
      blocked,
      candidate: !blocked && ((world?.exports ?? 0) >= MIN_WORLD_EXPORTS || (us?.value ?? 0) >= MIN_US_IMPORTS),
      thinUs: Boolean(us && us.value > 0 && (us.value < THIN_US_VALUE || us.monthly.slice(-12).filter((v) => v > 0).length < THIN_US_MONTHS)),
    };
  });

  // Countries without enough sea or air shipments take the typical freight of those with them
  const typicalFreight = median(rows.map((r) => r.freightPct).filter((f): f is number => f !== null && f < 60));
  const landed = rows.map((r) => {
    // By land the recorded charges are near nothing: no freight share is added for Canada and Mexico
    const freightUsed = r.byLand ? 0 : (r.freightPct ?? typicalFreight);
    return { ...r, freightUsed, freightEstimated: !r.byLand && r.freightPct === null, landedPct: r.dutyPct + freightUsed };
  });

  // Scores, among the realistic options
  const pool = landed.filter((r) => r.candidate);
  const costs = pool.map((r) => r.landedPct).sort((a, b) => a - b);
  const cheapest = costs[0] ?? 0;
  // The dearest 10% would squeeze everyone else to the top, so the scale stops short of them; and
  // it spans at least COST_SPAN, so where every country lands within a percent or two (duty-free
  // goods) cost hardly separates them and capacity decides
  const dearest = Math.max(cheapest + COST_SPAN, costs[Math.floor(costs.length * 0.9)] ?? 0);
  const worldScale = logScale(pool.map((r) => r.world?.exports ?? 0));
  const usScale = logScale(pool.map((r) => r.us?.value ?? 0));

  return landed
    .map((r): SourcingRow => {
      const g = r.governance;
      const governed = g && g.rl !== undefined ? ((g.rl ?? 0) + (g.cc ?? 0) + (g.pv ?? 0)) / 3 : 50;
      const penalty = r.flags.reduce((sum, f) => sum + (f.id === "uflpa" ? 20 : f.id === "adcvd" ? (f.tone === "error" ? 30 : 12) : f.id === "mismatch" ? 15 : 0), 0);
      const days = transitOf(r).days ?? 30;
      const scores: Scores = {
        cost: clamp(((dearest - r.landedPct) / (dearest - cheapest)) * 100),
        capacity: clamp(100 * (0.45 * worldScale(r.world?.exports ?? 0) + 0.25 * Math.min(r.world?.rca ?? 0, 3) / 3 + 0.3 * usScale(r.us?.value ?? 0))),
        reliability: clamp(governed - penalty),
        speed: clamp(((32 - days) / (32 - LAND_DAYS)) * 100),
      };
      return { ...r, scores };
    })
    // Realistic options first, the most capacity first
    .sort((a, b) => Number(b.candidate) - Number(a.candidate) || b.scores.capacity - a.scores.capacity || a.landedPct - b.landedPct);
};

// Plain-words reasons a country stands out, for its card
export const reasonsFor = (row: SourcingRow): { label: string; tone: "success" | "primary" | "neutral" }[] => {
  const reasons: { label: string; tone: "success" | "primary" | "neutral" }[] = [];
  if (row.scores.cost >= 90) reasons.push({ label: "Among the cheapest to land", tone: "success" });
  if (row.agreement) reasons.push({ label: `${preferenceName(row.agreement.name)} may apply`, tone: "success" });
  // Every reason is about this product, and says so
  if (row.world && row.world.rca >= 1) reasons.push({ label: `${row.world.rca >= 3 ? "A core export here" : "Export focus"}: ${row.world.rca < 10 ? row.world.rca.toFixed(1) : Math.round(row.world.rca)}× world avg`, tone: "primary" });
  if (row.world && row.world.rank <= 5) reasons.push({ label: `#${row.world.rank} exporter of ${row.world.group} worldwide`, tone: "primary" });
  if (row.us && row.us.share >= 0.05) reasons.push({ label: `${Math.round(row.us.share * 100)}% of US imports of it`, tone: "primary" });
  if (row.us?.growth !== null && row.us?.growth !== undefined && row.us.growth >= 0.25 && row.us.value >= MIN_US_IMPORTS) reasons.push({ label: `Its US sales up ${Math.round(row.us.growth * 100)}%`, tone: "primary" });
  const { days, mode } = transitOf(row);
  if (days !== null && days <= 10) reasons.push({ label: `~${days} days ${mode.split(" (")[0].split(",")[0]}`, tone: "neutral" });
  return reasons;
};
