import { HtsSection } from "../../interfaces/hts";
import { TrackedProduct } from "./report";

// Filters for the catalog. Each is a definition in CATALOG_FILTERS; the filter bar, the option
// counts and the matching all work from the definitions, so a new filter is one more entry here.
//
// Today every filter is an "options" filter: it reads values off a product (its country, its
// chapter) and the user picks some of them. Within a filter, a product matches if it has any
// picked value; across filters, it must match all of them. Other kinds (a rate range, a date
// range) can join the CatalogFilter union with their own control and matcher.

// What filters may need beyond the products, such as names for codes
export interface FilterContext {
  sections: HtsSection[];
}

export interface FilterOption {
  value: string;
  label: string;
  // A second line, such as a chapter's description
  detail?: string;
  // A flag or other mark before the label
  icon?: string;
}

interface OptionsFilter {
  kind: "options";
  id: string;
  // On the filter's button and its chips
  label: string;
  // The values a product has for this filter
  valuesOf: (product: TrackedProduct) => string[];
  // How a value is shown. `example` is a product that has it.
  describe: (value: string, example: TrackedProduct, context: FilterContext) => FilterOption;
  // The order options are listed in; by label unless given
  compare?: (a: FilterOption, b: FilterOption) => number;
}

export type CatalogFilter = OptionsFilter;

// The picked values, by filter id. Empty or missing means the filter is off.
export type FilterState = Record<string, string[]>;

const chapterOf = (product: TrackedProduct) => String(Number(product.entry.element.chapter)).padStart(2, "0");

export const CATALOG_FILTERS: CatalogFilter[] = [
  {
    kind: "options",
    id: "country",
    label: "Country of origin",
    valuesOf: (p) => [p.entry.country.code],
    describe: (value, { entry }) => ({ value, label: entry.country.name, icon: entry.country.flag }),
  },
  {
    kind: "options",
    id: "chapter",
    label: "HTS chapter",
    valuesOf: (p) => [chapterOf(p)],
    describe: (value, _example, { sections }) => {
      const chapter = sections.flatMap((s) => s.chapters).find((c) => c.number === Number(value));
      return { value, label: `Chapter ${value}`, detail: chapter?.description };
    },
    compare: (a, b) => a.value.localeCompare(b.value),
  },
];

// ── Matching ──

const matches = (filter: CatalogFilter, picked: string[], product: TrackedProduct) =>
  filter.valuesOf(product).some((v) => picked.includes(v));

// The filters that are on: ones with picked values that some product still has, so a value
// whose last product left the catalog doesn't hide everything
export const activeFilters = (products: TrackedProduct[], state: FilterState) =>
  CATALOG_FILTERS.map((filter) => {
    const present = new Set(products.flatMap(filter.valuesOf));
    return { filter, picked: (state[filter.id] ?? []).filter((v) => present.has(v)) };
  }).filter(({ picked }) => picked.length > 0);

// The products every active filter lets through, optionally ignoring one filter
export const applyFilters = (products: TrackedProduct[], state: FilterState, ignore?: string) => {
  const active = activeFilters(products, state).filter(({ filter }) => filter.id !== ignore);
  return active.length === 0
    ? products
    : products.filter((p) => active.every(({ filter, picked }) => matches(filter, picked, p)));
};

export interface CountedOption extends FilterOption {
  // Products with this value, among those the other filters let through
  count: number;
}

// A filter's options: every value in the catalog, counted against the other active filters, so
// each count says how many products picking it would add
export const filterOptions = (
  filter: CatalogFilter,
  products: TrackedProduct[],
  state: FilterState,
  context: FilterContext
): CountedOption[] => {
  const counts = new Map<string, number>();
  applyFilters(products, state, filter.id).forEach((p) =>
    filter.valuesOf(p).forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1))
  );
  const examples = new Map<string, TrackedProduct>();
  products.forEach((p) => filter.valuesOf(p).forEach((v) => examples.has(v) || examples.set(v, p)));
  const compare = filter.compare ?? ((a: FilterOption, b: FilterOption) => a.label.localeCompare(b.label));
  return Array.from(examples, ([value, example]) => ({
    ...filter.describe(value, example, context),
    count: counts.get(value) ?? 0,
  })).sort(compare);
};
