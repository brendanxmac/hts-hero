import { Countries, Country } from "../../../../constants/countries";
import { calculate } from "../../../../tariffs/engine-v2/calculate";
import { AllRules } from "../../../../tariffs/engine-v2/data";
import { CalculationInput, CalculationResult } from "../../../../tariffs/engine-v2/types";
import { RatePart, rateParts, TrackedProduct } from "../../report";

// Tariff intelligence for one product: its duty from every country of origin, worked out for the
// product's own shipment and answers, with and without the trade agreements each origin could
// claim. Everything here is plain data, so the charts only draw it.

export interface OriginRate {
  country: Country;
  result: CalculationResult;
  // No trade agreement claimed
  pct: number;
  parts: RatePart[];
  // The agreement that lowers it most, when one does
  agreement?: { symbol: string; name: string; pct: number; parts: RatePart[] };
  // The product's own origin
  isOrigin: boolean;
}

// Standard rates, or with each origin's best trade agreement claimed
export type RateBasis = "standard" | "agreements";

export const rateOf = (o: OriginRate, basis: RateBasis) =>
  basis === "agreements" && o.agreement ? o.agreement.pct : o.pct;

export const partsOf = (o: OriginRate, basis: RateBasis) =>
  basis === "agreements" && o.agreement ? o.agreement.parts : o.parts;

// Rates within a hundredth of a point are the same rate
export const rateKey = (pct: number) => Math.round(pct * 100) / 100;

export const originRates = (product: TrackedProduct): OriginRate[] => {
  const { input, customsValue, adjustments, entry } = product;
  const answers = adjustments.answers ?? {};
  return Countries.filter((c) => c.code !== "US").map((country) => {
    const base: Omit<CalculationInput, "answers"> = { ...input, country: country.code, claimedPreference: undefined };
    const result = calculate(AllRules, { ...base, answers });
    const pct = (result.totalDuty / customsValue) * 100;
    let agreement: OriginRate["agreement"];
    result.availablePreferences.forEach((p) => {
      const claimed = calculate(AllRules, { ...base, answers, claimedPreference: p.symbol });
      const claimedPct = (claimed.totalDuty / customsValue) * 100;
      if (claimedPct < pct - 0.005 && (!agreement || claimedPct < agreement.pct)) {
        agreement = { symbol: p.symbol, name: p.name, pct: claimedPct, parts: rateParts(claimed, customsValue) };
      }
    });
    return {
      country,
      result,
      pct,
      parts: rateParts(result, customsValue),
      agreement,
      isOrigin: country.code === entry.country.code,
    };
  });
};

// ── Choosing countries ──

// The countries the analysis shows: every origin (null), or the chosen ones. The product's own
// origin always stays, as the one to compare against.
export type CountrySelection = string[] | null;

export const visibleOrigins = (rates: OriginRate[], selection: CountrySelection) => {
  if (!selection) return rates;
  const chosen = new Set(selection);
  return rates.filter((r) => r.isOrigin || chosen.has(r.country.code));
};

export type PresetId = "sources" | "agreements" | "cheaper";

// Ready-made selections, worked out from the rates as they are now
export const presetCountries = (
  preset: PresetId,
  rates: OriginRate[],
  basis: RateBasis,
  topSources: string[]
): string[] => {
  const origin = rates.find((r) => r.isOrigin);
  const yours = origin ? rateKey(rateOf(origin, basis)) : Infinity;
  const pick = {
    sources: (r: OriginRate) => topSources.includes(r.country.code),
    agreements: (r: OriginRate) => Boolean(r.agreement),
    cheaper: (r: OriginRate) => rateKey(rateOf(r, basis)) < yours,
  }[preset];
  return rates.filter((r) => !r.isOrigin && pick(r)).map((r) => r.country.code);
};

// ── Facts ──

export interface AnalysisFacts {
  origin: OriginRate | undefined;
  originPct: number;
  // 1 is the lowest; origins tied on a rate share a rank
  rank: number;
  total: number;
  cheaper: OriginRate[];
  lowest: { pct: number; origins: OriginRate[] };
  highest: { pct: number; origins: OriginRate[] };
  // Percentage points the cheapest origin would save over the product's own
  bestSaving: number;
}

export const analysisFacts = (rates: OriginRate[], basis: RateBasis): AnalysisFacts => {
  const origin = rates.find((r) => r.isOrigin);
  const originPct = origin ? rateOf(origin, basis) : 0;
  const values = rates.map((r) => rateOf(r, basis));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const cheaper = rates.filter((r) => rateKey(rateOf(r, basis)) < rateKey(originPct));
  const at = (pct: number) => rates.filter((r) => rateKey(rateOf(r, basis)) === rateKey(pct));
  return {
    origin,
    originPct,
    rank: new Set(cheaper.map((r) => rateKey(rateOf(r, basis)))).size + 1,
    total: rates.length,
    cheaper,
    lowest: { pct: min, origins: at(min) },
    highest: { pct: max, origins: at(max) },
    bestSaving: Math.max(0, originPct - min),
  };
};

// ── Tiers ──

export interface RateTier {
  pct: number;
  origins: OriginRate[];
  // The parts of the first origin in the tier; origins on one rate usually share them
  parts: RatePart[];
}

// Every distinct rate, lowest first, with the origins that pay it
export const rateTiers = (rates: OriginRate[], basis: RateBasis): RateTier[] => {
  const tiers = new Map<number, OriginRate[]>();
  rates.forEach((r) => {
    const key = rateKey(rateOf(r, basis));
    tiers.set(key, [...(tiers.get(key) ?? []), r]);
  });
  return Array.from(tiers, ([pct, origins]) => ({
    pct,
    origins: origins.sort((a, b) => Number(b.isOrigin) - Number(a.isOrigin) || a.country.name.localeCompare(b.country.name)),
    parts: partsOf(origins[0], basis),
  })).sort((a, b) => a.pct - b.pct);
};

// ── Swarm layout ──
// Every origin on one axis by its rate. A rate shared by many origins becomes one pile (sized by
// how many) rather than a tower; the product's own origin always keeps its own flag. Flags and
// piles stack upward from the axis, each in the lowest spot where it doesn't overlap a neighbor,
// so rates that are close but not equal sit side by side instead of on top of each other.

export type SwarmNode =
  | { kind: "flag"; key: string; pct: number; origin: OriginRate }
  | { kind: "pile"; key: string; pct: number; origins: OriginRate[] };

export const swarmNodes = (rates: OriginRate[], basis: RateBasis, pileFrom: number): SwarmNode[] =>
  rateTiers(rates, basis).flatMap((tier): SwarmNode[] => {
    if (tier.origins.length < pileFrom) {
      return tier.origins.map((origin) => ({ kind: "flag", key: origin.country.code, pct: tier.pct, origin }));
    }
    const own = tier.origins.filter((o) => o.isOrigin);
    const others = tier.origins.filter((o) => !o.isOrigin);
    return [
      ...own.map((origin): SwarmNode => ({ kind: "flag", key: origin.country.code, pct: tier.pct, origin })),
      { kind: "pile", key: `pile-${tier.pct}`, pct: tier.pct, origins: others },
    ];
  });

export interface PlacedNode {
  node: SwarmNode;
  // Center, in pixels from the left
  cx: number;
  // Bottom edge, in pixels above the axis
  y: number;
  size: number;
}

// Each node is a circle `sizeOf(node)` across. Every node goes on the lowest spot above the axis
// where it overlaps nothing already placed: on the axis if it's free, otherwise on top of
// whatever it would overlap.
export const layoutSwarm = (
  nodes: SwarmNode[],
  x: (pct: number) => number,
  sizeOf: (node: SwarmNode) => number,
  gap = 2
): PlacedNode[] => {
  const placed: PlacedNode[] = [];
  // Piles first: they're the big landmarks; then flags, lowest rates first
  const order = [...nodes].sort((a, b) => Number(b.kind === "pile") - Number(a.kind === "pile") || a.pct - b.pct);
  order.forEach((node) => {
    const cx = x(node.pct);
    const size = sizeOf(node);
    const beside = placed.filter((p) => Math.abs(p.cx - cx) < (p.size + size) / 2 + gap);
    const fits = (y: number) => beside.every((p) => y >= p.y + p.size + gap || y + size + gap <= p.y);
    const y = [0, ...beside.map((p) => p.y + p.size + gap)].sort((a, b) => a - b).find(fits) ?? 0;
    placed.push({ node, cx, y, size });
  });
  return placed;
};
