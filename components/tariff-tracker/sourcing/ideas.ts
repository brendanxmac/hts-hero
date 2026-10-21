import { Country } from "../../../constants/countries";
import type { UsImports } from "../../duty-calculator/lib/usImportsData";
import { OriginCost } from "../insights/savings";
import { TrackedProduct } from "../report";

// Sourcing ideas across the catalog: for each product, the countries that pay less duty than its
// own origin and already ship it to the US (Census), so a lower rate is a real place to make it,
// not just a number. Then the same ideas by country: which countries could supply the most of the
// catalog for less. Plain data, so the tab only draws it.

// Below this a country isn't cheaper
const MIN_PTS = 0.01;

export interface SourcingOption {
  country: Country;
  pct: number;
  agreement?: string;
  // US imports of the product from this country, in USD, last year and the year before
  value: number;
  prior: number;
  // Less duty on one shipment of the product, in points and dollars
  pts: number;
  usd: number;
}

export interface SourcingIdea {
  product: TrackedProduct;
  // Largest supplier to the US first
  options: SourcingOption[];
  // The option that saves the most
  best: SourcingOption;
  imports: UsImports;
}

export interface CountryIdea {
  country: Country;
  // Products it already ships to the US for less duty than their own origin
  products: number;
  // Added up over those products, one shipment each
  usd: number;
}

export interface Sourcing {
  ideas: SourcingIdea[];
  countries: CountryIdea[];
  // Products with Census figures, and without (codes Census has nothing for)
  withFigures: number;
  withoutFigures: number;
  // The best idea on each product, added up
  usd: number;
}

export const sourcingIdeas = (
  products: TrackedProduct[],
  origins: Map<string, OriginCost[]>,
  imports: Map<string, UsImports | null>
): Sourcing => {
  const ideas: SourcingIdea[] = [];
  const byCountry = new Map<string, CountryIdea>();
  let withFigures = 0;
  let withoutFigures = 0;
  products.forEach((product) => {
    const costs = origins.get(product.key);
    const figures = imports.get(product.entry.element.htsno);
    if (!costs) return;
    if (!figures) {
      withoutFigures++;
      return;
    }
    withFigures++;
    const options = costs
      .flatMap((o): SourcingOption[] => {
        const shipped = figures.byCountry.get(o.country.code);
        const pts = product.totalPct - o.pct;
        if (!shipped || shipped.value <= 0 || pts < MIN_PTS) return [];
        return [{ ...o, value: shipped.value, prior: shipped.prior, pts, usd: (pts / 100) * product.customsValue }];
      })
      .sort((a, b) => b.value - a.value);
    if (!options.length) return;
    const best = options.reduce((a, b) => (b.usd > a.usd ? b : a));
    ideas.push({ product, options, best, imports: figures });
    options.forEach((o) => {
      const entry = byCountry.get(o.country.code) ?? { country: o.country, products: 0, usd: 0 };
      entry.products++;
      entry.usd += o.usd;
      byCountry.set(o.country.code, entry);
    });
  });
  return {
    ideas: ideas.sort((a, b) => b.best.usd - a.best.usd),
    countries: Array.from(byCountry.values()).sort((a, b) => b.products - a.products || b.usd - a.usd),
    withFigures,
    withoutFigures,
    usd: ideas.reduce((sum, i) => sum + i.best.usd, 0),
  };
};
