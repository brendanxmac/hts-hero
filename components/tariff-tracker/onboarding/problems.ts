import type { CatalogError } from "../parse";

// Why rows couldn't be added, grouped by cause, each with what to do about it. Keyed off the
// messages parse.ts readProduct gives (and the pasted list's own).
type Problem = { kind: string; test: (e: CatalogError) => boolean; title: (count: number, word: string) => string; fix: (errors: CatalogError[]) => string };
const plural = (count: number, word: string) => (count === 1 ? word : `${word}s`);
const PROBLEMS: Problem[] = [
  {
    kind: "hs6",
    test: (e) => /\(this has 6\)|isn't a real HTS code/.test(e.message),
    title: (c, w) => `${plural(c, w)} with a 6-digit HS code (or one with zeros added to the end)`,
    fix: () =>
      "A 6-digit code is the international part only and can't be matched to a US duty rate. Use the full 8 or 10-digit US code: it's in column 29 of your entry summaries, or ask your broker.",
  },
  {
    kind: "digits",
    test: (e) => /need 8 or 10 digits/.test(e.message),
    title: (c, w) => `${plural(c, w)} with the wrong number of digits`,
    fix: () => "HTS codes have 8 or 10 digits. Check for a missing or extra digit; Excel can drop a leading zero if the column is formatted as numbers.",
  },
  {
    kind: "not_in_hts",
    test: (e) => /isn't in the current HTS/.test(e.message),
    title: (c) => `${plural(c, "code")} not in the current HTS`,
    fix: () => "They may be mistyped, or out of date: codes change when the HTS is revised. Check the latest code on your recent entries or with your broker.",
  },
  {
    kind: "unknown_country",
    test: (e) => /isn't a country code or name we know/.test(e.message),
    title: (c, w) => `${plural(c, w)} with a country we don't recognize`,
    fix: (errors) => {
      const examples = Array.from(new Set(errors.map((e) => e.message.match(/“(.*)”/)?.[1]).filter(Boolean))).slice(0, 3);
      return `${examples.length ? `Like ${examples.map((x) => `“${x}”`).join(", ")}. ` : ""}Use the country's name (Vietnam) or its two-letter code (VN).`;
    },
  },
  {
    kind: "missing_country",
    test: (e) => /Add a country of origin/.test(e.message),
    title: (c, w) => `${plural(c, w)} with no country of origin`,
    fix: () =>
      "Each code needs the country of origin declared on your entries next to it. If it's blank in your file, check your entry summaries or ask your broker.",
  },
  {
    kind: "missing_code",
    test: (e) => /Add an HTS code|Start the line with an HTS code/.test(e.message),
    title: (c, w) => `${plural(c, w)} with no HTS code`,
    fix: () => "Each row needs an HTS code. In a pasted list, put the code first and the country after it.",
  },
  {
    kind: "us",
    test: (e) => /can't be the United States/.test(e.message),
    title: (c, w) => `${plural(c, w)} with the United States as the origin`,
    fix: () => "The Tracker follows goods imported into the US, so the origin is another country.",
  },
];
const OTHER: Problem = { kind: "other", test: () => true, title: (c, w) => `other ${plural(c, w)}`, fix: (errors) => errors[0]?.message ?? "" };

export const problemGroups = (errors: CatalogError[]) => {
  const groups = new Map<Problem, CatalogError[]>();
  errors.forEach((e) => {
    const problem = PROBLEMS.find((p) => p.test(e)) ?? OTHER;
    groups.set(problem, [...(groups.get(problem) ?? []), e]);
  });
  return [...groups.entries()].map(([p, list]) => ({ ...p, errors: list })).sort((a, b) => b.errors.length - a.errors.length);
};
