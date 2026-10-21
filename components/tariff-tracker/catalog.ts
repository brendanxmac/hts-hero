import { htsCodeDigitsOnly } from "../../libs/hts-code";
import { Adjustments } from "./adjustments";
import { parseCatalog } from "./parse";

// The catalog as it's stored: one item per product, an HTS code and a country of origin. Items
// are matched to the current HTS when rates are worked out, so a stored code that a later
// revision drops is kept (and reported), not lost. Each product appears once: the key is the
// same one adjustments are remembered by.

export interface CatalogItem {
  // 8 or 10 digits, no dots
  code: string;
  // Two-letter country code
  country: string;
  // Picked by the user for their plan's coverage (true), or taken out of it (false). Unset, it
  // can fill a spare slot (highest duty first). See TrackerContext.
  covered?: boolean;
  // How many shipments of it a year, for yearly savings (1 when unset)
  shipmentsPerYear?: number;
  // A secured change of origin: the country it's moving to (the new origin is its own product)
  movingTo?: string;
  // When it was added (ISO). Tariff updates already alerted before then aren't alerted for it.
  addedAt?: string;
  // From the example list, to look around with: not one of the user's imports, so it doesn't
  // start the trial or finish onboarding (see realItems). Cleared when they add it themselves.
  example?: true;
}

// What's kept about a product besides its code and origin
export type CatalogItemMeta = Pick<CatalogItem, "shipmentsPerYear" | "movingTo">;

// A product on its way into the catalog, with any adjustments it brings (from a CSV upload)
export interface NewProduct extends CatalogItem {
  adjustments?: Adjustments;
}

export const itemKey = (item: CatalogItem) => `${item.code}-${item.country}`;

// The user's own imports: everything but the example list's
export const realItems = <T extends Pick<CatalogItem, "example">>(items: T[]) => items.filter((item) => !item.example);

// Adds products, skipping any already in the catalog (or repeated in what's added). An example
// product added again for real becomes the user's own (and counts as added).
export const mergeItems = (existing: CatalogItem[], incoming: CatalogItem[]) => {
  const index = new Map(existing.map((item, i) => [itemKey(item), i]));
  const items = [...existing];
  let added = 0;
  incoming.forEach((item) => {
    const key = itemKey(item);
    const at = index.get(key);
    if (at !== undefined) {
      if (items[at].example && !item.example) {
        const { example: _example, ...own } = items[at];
        items[at] = own;
        added++;
      }
      return;
    }
    index.set(key, items.length);
    items.push({ code: item.code, country: item.country, ...(item.addedAt && { addedAt: item.addedAt }), ...(item.example && { example: true as const }) });
    added++;
  });
  return { items, added, duplicates: incoming.length - added };
};

// ── Storage ──
// Kept on this device until catalogs are saved to accounts. Versioned, so the shape can change.

export const CATALOG_ITEMS_KEY = "hts-hero-tariff-tracker-products";
// The catalog as text, from before it was a list of products (and the Tariff Watcher's before that)
export const LEGACY_TEXT_KEYS = ["hts-hero-tariff-tracker-catalog", "hts-hero-tariff-watch-list"];

interface StoredCatalog {
  version: 1;
  items: CatalogItem[];
}

const isItem = (x: unknown): x is CatalogItem =>
  typeof x === "object" &&
  x !== null &&
  typeof (x as CatalogItem).code === "string" &&
  typeof (x as CatalogItem).country === "string";

export const readCatalog = (raw: string | null): CatalogItem[] | null => {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as StoredCatalog;
    return stored?.version === 1 && Array.isArray(stored.items) ? stored.items.filter(isItem) : null;
  } catch {
    return null;
  }
};

export const writeCatalog = (items: CatalogItem[]) => JSON.stringify({ version: 1, items } satisfies StoredCatalog);

// A catalog kept as text, as items. Codes aren't checked against the HTS here (it may not be
// loaded yet); ones it doesn't have are reported when rates are worked out.
export const itemsFromText = (text: string): CatalogItem[] =>
  mergeItems(
    [],
    parseCatalog(text, (digits) => digits).entries.map((e) => ({
      code: htsCodeDigitsOnly(e.element),
      country: e.country.code,
    }))
  ).items;
