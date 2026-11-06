import { htsCodeDigitsOnly } from "../../libs/hts-code";
import { Adjustments, readAdjustments, writeAdjustments } from "./adjustments";
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
  // Every import across the lists, each code and country once (with its `covered` pick): what
  // billing, the trial trigger, alerts and impact checks read
  items: CatalogItem[];
  // The named lists (a brokerage's clients), each with its own copy of its imports and their
  // adjustments. Absent: one list, "My Imports", is `items` with the stored adjustments.
  lists?: StoredList[];
}

// ── Lists ──
// A user keeps several named lists of imports; Duty Guard shows one at a time. Each list has its
// own copy of an import and its adjustments (two clients can bring in the same code from different
// makers), but an import counts once for the plan, however many lists it's in (PRICING.md: one HTS
// code from one country). Ids are stable, so a later share link can point at one.

export interface ImportList {
  id: string;
  name: string;
  createdAt?: string;
  items: CatalogItem[];
  adjustments: Record<string, Adjustments>;
}

type StoredList = ImportList;

export const DEFAULT_LIST_ID = "default";
export const DEFAULT_LIST_NAME = "My Imports";

export const newListId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `list-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// What a list's items keep: the plan's picks are kept once, on the account's imports (`covered`)
const listItem = ({ covered: _covered, ...item }: CatalogItem): CatalogItem => item;

// Every list's imports, each code and country once (the first list's copy), with the picks
export const unionItems = (lists: ImportList[], covered: Record<string, boolean>): CatalogItem[] => {
  const byKey = new Map<string, CatalogItem>();
  for (const list of lists)
    for (const item of list.items) {
      const key = itemKey(item);
      const was = byKey.get(key);
      if (!was) byKey.set(key, { ...listItem(item), ...(covered[key] !== undefined && { covered: covered[key] }) });
      // One of the user's own in any list makes it theirs; the earliest addition counts
      else {
        const next = { ...was };
        if (was.example && !item.example) delete next.example;
        if (item.addedAt && (!was.addedAt || item.addedAt < was.addedAt)) next.addedAt = item.addedAt;
        byKey.set(key, next);
      }
    }
  return [...byKey.values()];
};

// Each import's adjustments from the first list that has any
export const unionAdjustments = (lists: ImportList[]): Record<string, Adjustments> => {
  const out: Record<string, Adjustments> = {};
  for (const list of lists) for (const [key, adj] of Object.entries(list.adjustments)) if (!(key in out)) out[key] = adj;
  return out;
};

// The names of the lists each import is in
export const listNamesByKey = (lists: Pick<ImportList, "name" | "items">[]) => {
  const out = new Map<string, string[]>();
  for (const list of lists)
    for (const item of list.items) {
      const names = out.get(itemKey(item)) ?? [];
      if (!names.includes(list.name)) names.push(list.name);
      out.set(itemKey(item), names);
    }
  return out;
};

const isList = (x: unknown): x is StoredList =>
  typeof x === "object" && x !== null && typeof (x as StoredList).id === "string" && typeof (x as StoredList).name === "string" && Array.isArray((x as StoredList).items);

export interface StoredLists {
  lists: ImportList[];
  // The plan's picks (code-country → tracked or not), across every list
  covered: Record<string, boolean>;
}

// The lists as stored (on the device or the account's row): the catalog's text and the
// adjustments' text. A catalog from before lists is one list, "My Imports".
export const readLists = (rawItems: string | null, rawAdjustments: string | null): StoredLists | null => {
  if (!rawItems) return null;
  let stored: StoredCatalog;
  try {
    stored = JSON.parse(rawItems) as StoredCatalog;
  } catch {
    return null;
  }
  if (stored?.version !== 1 || !Array.isArray(stored.items)) return null;
  const all = stored.items.filter(isItem);
  const covered = Object.fromEntries(all.filter((i) => typeof i.covered === "boolean").map((i) => [itemKey(i), i.covered as boolean]));
  const lists: ImportList[] =
    Array.isArray(stored.lists) && stored.lists.some(isList)
      ? stored.lists.filter(isList).map((l) => ({
          id: l.id,
          name: l.name,
          ...(l.createdAt && { createdAt: l.createdAt }),
          items: l.items.filter(isItem).map(listItem),
          adjustments: l.adjustments && typeof l.adjustments === "object" ? l.adjustments : {},
        }))
      : [{ id: DEFAULT_LIST_ID, name: DEFAULT_LIST_NAME, items: all.map(listItem), adjustments: readAdjustments(rawAdjustments) }];
  return { lists, covered };
};

// The lists as stored: the catalog (every import once, plus the lists) and the adjustments (each
// import's from its first list, for anything that reads one set)
export const writeLists = ({ lists, covered }: StoredLists) => ({
  items: JSON.stringify({ version: 1, items: unionItems(lists, covered), lists } satisfies StoredCatalog),
  adjustments: writeAdjustments(unionAdjustments(lists)),
});

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
