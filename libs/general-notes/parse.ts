import type { AppendixFile, GeneralNoteFile, OriginRule, OriginRuleChapter } from "./types";

// Parses the text of USITC's General Notes PDF (one string per page, as unpdf extracts it) into
// the notes the savings questions cite, and the trade agreements' product-specific rules of
// origin by chapter. Page N of the PDF is "GN p.N". Every page ends with the running label of the
// note on it ("USMCA", "General Note 3"), after the header lines, which are dropped.

// The General Notes that grant a trade program (public/trade-programs.ts)
export const PROGRAM_NOTES = [4, 5, 6, 7, 8, 10, 11, 13, 14, 16, 17, 18, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

// Up to this much of a note's opening is kept to show
const INTRO_CHARS = 3500;

const HEADER = [/^Harmonized Tariff Schedule of the United States/, /^Annotated for Statistical Reporting Purposes/, /^GN p\.\S+$/];

// Numbered lines inside a note that aren't a note's start: rules of origin and the like
const NOT_A_TITLE = /^(A change|No change|For |A good|Any |The |If |Notwithstanding|A |An |In |Subject|Except|Where|When|Goods|This|Each|Such|Articles of|Textile|Apparel)/;

interface Line {
  page: number;
  text: string;
}

const labelOf = (page: string) => page.trim().split("\n").slice(-1)[0].trim();

// Every line of the notes with its page, header and label lines dropped
const linesOf = (pages: string[]): Line[] =>
  pages.flatMap((text, i) => {
    const label = labelOf(text);
    // A stray leading dot on some numbered lines (".5. A change to…") is an extraction artifact
    const rows = text.split("\n").map((l) => l.trim().replace(/^\.+(?=\d)/, ""));
    // The label is the page's last line
    if (rows.length && rows[rows.length - 1] === label) rows.pop();
    return rows.filter((l) => l && !HEADER.some((h) => h.test(l))).map((l) => ({ page: i + 1, text: l }));
  });

// Joins wrapped lines into paragraphs: a new one starts at a numbered or lettered subdivision
const NEW_PARAGRAPH = /^(\d{1,3}[.,]?\s|\([a-z]{1,4}\)|\([A-Z]\)|\(\d{1,2}\)|\[|Chapter \d|(Chapter|Heading|Subheading|Tariff item)s? [Rr]ule)/;
const paragraphs = (lines: Line[]): { page: number; text: string }[] => {
  const out: { page: number; text: string }[] = [];
  for (const l of lines) {
    const last = out[out.length - 1];
    if (!last || NEW_PARAGRAPH.test(l.text)) out.push({ page: l.page, text: l.text });
    else last.text = last.text.endsWith("-") && /^[a-z]/.test(l.text) ? last.text.slice(0, -1) + l.text : `${last.text} ${l.text}`;
  }
  return out;
};

// Codes as digit prefixes, from text like "headings 7322 through 7323", "subheadings 9402.10
// through 9402.90", "heading 94.01", "tariff item 8516.79.00 or 8516.80.80"
const CODE = /\d{2}\.?\d{2}(?:\.\d{2}){0,2}/g;
const digits = (code: string) => code.replace(/\D/g, "");
const TARGET = /\b(?:to|of|for)\s+(?:a good of\s+|goods of\s+|a good provided for in\s+)?(?:any of\s+)?(?:(?:headings?|subheadings?|tariff items?)\s+)?((?:\d{2}\.?\d{2}(?:\.\d{2}){0,2})(?:\s*(?:,|through|or|and|,\s*or)\s*\d{2}\.?\d{2}(?:\.\d{2}){0,2})*)/i;
// "A change to any other good of chapter 64": the whole chapter, below its more specific rules
const WHOLE_CHAPTER = /\bgoods? of chapter (\d{1,2})\b/i;
export const coversOf = (text: string, chapter?: number): [string, string][] => {
  const first = text.split(/\s+from\s+/)[0];
  const m = first.match(TARGET);
  if (!m) {
    const whole = first.match(WHOLE_CHAPTER)?.[1] ?? (chapter && /any other good/i.test(first) ? String(chapter) : undefined);
    return whole ? [[whole.padStart(2, "0"), whole.padStart(2, "0")]] : [];
  }
  const out: [string, string][] = [];
  const parts = m[1].split(/\s*(?:,|\bor\b|\band\b)\s*/).filter(Boolean);
  for (const part of parts) {
    const [from, to] = part.split(/\s*through\s*/);
    const a = from?.match(CODE)?.[0];
    if (!a) continue;
    const b = to?.match(CODE)?.[0] ?? a;
    out.push([digits(a), digits(b)]);
  }
  return out;
};

const RULE_WORDS = String.raw`(?=\([Aa]\)|A change|No change|For |A good|Any |An |The |\[Rule)`;
const RULE_START = new RegExp(String.raw`^(\d{1,3})[.,]?\s+${RULE_WORDS}([\s\S]*)`);
const RULE_MID = new RegExp(String.raw`(?<=[.;:])\s+(\d{1,3}[.,]\s+)${RULE_WORDS}`, "g");

// A chapter's one unnumbered rule, after its notes
const SINGLE = /^([\s\S]*?)(?:^|(?<=[.:])\s+)((?:A change to|No change in tariff classification) [\s\S]*)$/;

// Where each program note starts: the numbered title line, in order through the notes
const noteStarts = (lines: Line[]) => {
  const starts = new Map<number, number>();
  let from = 0;
  for (const n of PROGRAM_NOTES) {
    const at = lines.findIndex((l, i) => {
      if (i < from) return false;
      const m = l.text.match(/^(\d{1,2})\.?\s+([A-Z].*)/);
      return !!m && +m[1] === n && !NOT_A_TITLE.test(m[2]);
    });
    if (at < 0) continue;
    starts.set(n, at);
    from = at + 1;
  }
  return starts;
};

// The General Statistical Notes come after the last note
const endOfNotes = (lines: Line[], pages: string[]) => {
  const at = lines.findIndex((l) => labelOf(pages[l.page - 1]) === "Gen. Stat. Notes");
  return at < 0 ? lines.length : at;
};

// A trade agreement's product-specific rules: "Chapter N." blocks of numbered rules
const ruleChapters = (lines: Line[], note: number, revision: string): OriginRuleChapter[] => {
  const first = lines.findIndex((l) => /^Chapter 1\.?$/.test(l.text));
  if (first < 0) return [];
  // USITC's warning on the section, when it hasn't been updated for later HTS changes
  const heading = lines.slice(Math.max(0, first - 40), first).map((l) => l.text).join(" ");
  const warning = heading.match(/\[(?:COMPILER'S )?NOTE:?\s*(Not updated[^\]]*)\]/i)?.[1];
  const chapters: OriginRuleChapter[] = [];
  let current: { chapter: number; page: number; lines: Line[] } | null = null;
  const flush = () => {
    if (!current) return;
    const { chapter } = current;
    const rules: OriginRule[] = [];
    const preamble: string[] = [];
    // A rule is "N. A change to…" (or "N, (A) …", a typo in the source), wherever it starts: some
    // start mid-line ("…method is used. 5. A change to…"). Numbers only go up.
    const pieces = paragraphs(current.lines).flatMap((p) => p.text.replace(RULE_MID, (_, at: string) => `\u0000${at}`).split("\u0000").map((text) => ({ page: p.page, text: text.trim() })));
    let last = 0;
    for (const p of pieces) {
      const numbered = p.text.match(RULE_START);
      const lettered = p.text.match(/^((?:Chapter|Heading|Subheading|Tariff item)s? rule(?: \d+)?):\s*([\s\S]*)/i);
      if (numbered && +numbered[1] > last) {
        last = +numbered[1];
        rules.push({ label: numbered[1], text: numbered[2], page: p.page, covers: coversOf(numbered[2], chapter) });
      } else if (lettered) {
        const label = lettered[1].replace(/ Rule/, " rule");
        const covers = /^Chapter/i.test(label) ? ([[String(chapter).padStart(2, "0"), String(chapter).padStart(2, "0")]] as [string, string][]) : coversOf(lettered[2], chapter);
        // A chapter's own rules are its notes, read with every rule in it. One may end with the
        // chapter's only rule ("…elvers. A change to headings 0301 through 0307…").
        if (/^Chapter/i.test(label)) {
          const single = !rules.length && lettered[2].match(SINGLE);
          preamble.push(`${label}: ${single ? single[1].trim() : lettered[2]}`);
          if (single) rules.push({ label: "Rule", text: single[2], page: p.page, covers: coversOf(single[2], chapter) });
        } else rules.push({ label, text: lettered[2], page: p.page, covers });
      } else if (rules.length) {
        const prev = rules[rules.length - 1];
        prev.text = `${prev.text}\n${p.text}`;
      } else if (p.text) {
        // A chapter with one rule doesn't number it: "…elvers. A change to headings 0301 through 0307…"
        const single = p.text.match(SINGLE);
        if (single) {
          if (single[1].trim()) preamble.push(single[1].trim());
          rules.push({ label: "Rule", text: single[2], page: p.page, covers: coversOf(single[2], chapter) });
        } else preamble.push(p.text);
      }
    }
    chapters.push({ revision, note, chapter, page: current.page, preamble: preamble.join("\n"), rules, ...(warning ? { warning } : {}) });
  };
  for (const l of lines.slice(first)) {
    const m = l.text.match(/^Chapter (\d{1,2})\.?$/);
    if (m && (!current || +m[1] > current.chapter)) {
      flush();
      current = { chapter: +m[1], page: l.page, lines: [] };
    } else current?.lines.push(l);
  }
  flush();
  return chapters;
};

export const parseGeneralNotes = (pages: string[], revision: string) => {
  const lines = linesOf(pages);
  const starts = noteStarts(lines);
  const end = endOfNotes(lines, pages);
  const ordered = Array.from(starts.entries()).sort((a, b) => a[1] - b[1]);
  const notes: GeneralNoteFile[] = [];
  const rules: OriginRuleChapter[] = [];
  const warnings: string[] = PROGRAM_NOTES.filter((n) => !starts.has(n)).map((n) => `General Note ${n}: start not found`);

  ordered.forEach(([note, at], i) => {
    // To the next note we know of. Notes we don't parse in between (19-24) are deleted or short.
    const next = ordered[i + 1]?.[1] ?? end;
    const body = lines.slice(at, next);
    const title = body[0].text.replace(/^\d{1,2}\.?\s+/, "").split(/\.\s/)[0].replace(/\.$/, "");
    const chapters = ruleChapters(body, note, revision);
    // The opening, up to the rules and the cap
    const rulesAt = body.findIndex((l) => /^Chapter 1\.?$/.test(l.text));
    const intro: { page: number; text: string }[] = [];
    let length = 0;
    let truncated = false;
    for (const p of paragraphs(rulesAt < 0 ? body : body.slice(0, rulesAt))) {
      if (length + p.text.length > INTRO_CHARS && intro.length) {
        truncated = true;
        break;
      }
      intro.push(p);
      length += p.text.length;
    }
    notes.push({
      revision,
      note,
      title,
      label: labelOf(pages[body[0].page - 1]),
      page: body[0].page,
      paragraphs: intro,
      truncated: truncated || rulesAt >= 0,
      ruleChapters: chapters.map((c) => c.chapter),
    });
    rules.push(...chapters);
  });
  return { notes, rules, warnings };
};

// An appendix's products: "CAS NAME" lines (some names have no CAS, and some wrap), under
// "Table N." headings; table 2 of the pharmaceutical appendix lists prefixes and suffixes
const APPENDIX_HEADER = [...HEADER, /APPENDIX/, /^\d{1,3}$/];
const CAS = /^(\d{2,7}-\d{2}-\d)\s*(.*)$/;
export const parseAppendix = (pages: string[], note: number, revision: string): AppendixFile => {
  const products: AppendixFile["products"] = [];
  const affixes: string[] = [];
  let table = 1;
  let prose = false;
  for (const raw of pages.join("\n").split("\n")) {
    const line = raw.trim().replace(/\.{3,}.*$/, "").trim();
    if (!line || APPENDIX_HEADER.some((h) => h.test(line))) continue;
    const t = line.match(/^Table (\d+)\.?$/);
    if (t) {
      table = +t[1];
      prose = true;
      continue;
    }
    if (line === "CAS NumberProduct Name" || /^CAS Number/.test(line)) continue;
    // The paragraph under a table heading, up to its first entry
    if (prose && (/[a-z]{3}/.test(line) || /\.$/.test(line)) && !CAS.test(line)) continue;
    prose = false;
    const last = products[products.length - 1];
    if (note === 13 && table === 2) {
      affixes.push(line);
      continue;
    }
    const m = line.match(CAS);
    if (m) products.push({ cas: m[1], name: m[2].trim(), table });
    else if (last?.name.endsWith("-")) last.name = last.name.slice(0, -1) + line;
    else if (last && /^[a-z(]/.test(line)) last.name = `${last.name} ${line}`;
    else products.push({ name: line, table });
  }
  return { revision, note, products, ...(affixes.length ? { affixes } : {}) };
};
