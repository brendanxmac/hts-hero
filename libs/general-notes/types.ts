// The HTS General Notes and appendices, as `npm run notes:general` writes them for the current
// revision (scripts/general-notes/build.ts), so a saving's question can show the exact text it
// turns on. Public files under /data/general-notes, fetched only when a question needs one.

// One General Note's opening: its title and the text up to its first subdivisions' end (or a
// length cap), with the GN page each paragraph is on
export interface GeneralNoteFile {
  revision: string;
  note: number;
  title: string;
  // The running label on its pages ("USMCA", "Korea", "General Note 3")
  label: string;
  page: number;
  paragraphs: { page: number; text: string }[];
  // There's more of the note than is shown
  truncated: boolean;
  // Chapters with product-specific rules of origin (files under rules/gn-<note>/)
  ruleChapters: number[];
}

// One rule of origin in a trade agreement's product-specific rules
export interface OriginRule {
  // "3"; "Rule" for a chapter's one unnumbered rule; "Subheading rule" for a note on some codes
  label: string;
  text: string;
  page: number;
  // The codes it's for, as digit prefixes ("9403", "940210"), each a range
  covers: [string, string][];
}

// One chapter of a trade agreement's product-specific rules
export interface OriginRuleChapter {
  revision: string;
  note: number;
  chapter: number;
  page: number;
  // The chapter's own notes, before its first rule
  preamble: string;
  rules: OriginRule[];
  // USITC's warning that the rules haven't been updated for later HTS changes
  warning?: string;
}

// The products named in an appendix (GN 13 pharmaceuticals, GN 14 dye intermediates)
export interface AppendixFile {
  revision: string;
  note: number;
  products: { cas?: string; name: string; table: number }[];
  // Pharmaceutical appendix table 2: prefixes and suffixes of salts, esters and hydrates
  affixes?: string[];
}

// Whether a rule covers an HTS code (digits only), by its ranges of digit prefixes
export const ruleCovers = (rule: Pick<OriginRule, "covers">, digits: string) =>
  rule.covers.some(([from, to]) => digits.slice(0, from.length) >= from && digits.slice(0, to.length) <= to);

// The rules for a code: the most specific ones that cover it (a subheading's over its heading's)
export const rulesFor = (chapter: OriginRuleChapter, htsno: string): OriginRule[] => {
  const digits = htsno.replace(/\D/g, "");
  const matching = chapter.rules.filter((r) => ruleCovers(r, digits));
  const depth = (r: OriginRule) => Math.max(...r.covers.filter(([f, t]) => digits.slice(0, f.length) >= f && digits.slice(0, t.length) <= t).map(([f]) => f.length));
  const best = Math.max(0, ...matching.map(depth));
  return matching.filter((r) => depth(r) === best || r.label.endsWith("rule"));
};
