// Finds the Chapter 99 note subdivisions a piece of legal text cites, so the calculator can show
// their text ("Referenced notes"). Used by the page and by scripts/engine-v2/cited-notes.ts, which
// extracts the cited text from each verified revision's parsed notes.
//
// Handles "subdivision (a)(iv) of U.S. note 50", "subdivisions (c) and (d) of U.S. note 40",
// "subdivisions (c)(vi)–(viii) and (xi) of U.S. note 16", "(a)(ii) through (a)(vi) of this note"
// is skipped (no note number), "U.S. note 41(d)", "note 41(d) to this subchapter" and "U.S. note 52
// to this subchapter". Subchapter III unless another is named. General, statistical and chapter
// notes aren't Chapter 99 U.S. notes and are ignored.

export interface NoteCitation {
  key: string; // "sub-III/us-notes/41(d)", the revision checker's node key
  label: string; // "U.S. note 41(d)"
  file: string; // "sub-III-41": the file holding every cited subdivision of that note
}

const ROMAN = [
  "i",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
  "x",
  "xi",
  "xii",
  "xiii",
  "xiv",
  "xv",
  "xvi",
  "xvii",
  "xviii",
  "xix",
  "xx",
  "xxi",
  "xxii",
  "xxiii",
  "xxiv",
  "xxv",
];
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

// The values between two subdivision markers of the same kind, inclusive: (vi)–(viii), (c)–(f), (3)–(5)
const expandRange = (from: string, to: string): string[] | null => {
  if (/^\d+$/.test(from) && /^\d+$/.test(to)) {
    const a = Number(from);
    const b = Number(to);
    return b >= a && b - a < 60
      ? Array.from({ length: b - a + 1 }, (_, i) => String(a + i))
      : null;
  }
  for (const seq of [ROMAN, LETTERS]) {
    const a = seq.indexOf(from.toLowerCase());
    const b = seq.indexOf(to.toLowerCase());
    if (a >= 0 && b >= a)
      return seq
        .slice(a, b + 1)
        .map((v) =>
          from === from.toUpperCase() && /[A-Z]/.test(from)
            ? v.toUpperCase()
            : v,
        );
  }
  return null;
};

const parts = (chain: string) =>
  Array.from(chain.matchAll(/\(([A-Za-z0-9]{1,6})\)/g), (m) => m[1]);
const chainText = (p: string[]) => p.map((x) => `(${x})`).join("");

// What kind of marker a part is. "i", "v", "x" could be letters too, so they match either.
const kind = (part: string) =>
  /^\d+$/.test(part)
    ? "number"
    : ROMAN.includes(part.toLowerCase())
      ? /^[ivx]$/i.test(part)
        ? "either"
        : "roman"
      : "letter";
const kindsMatch = (a: string, b: string) =>
  a === b || a === "either" || b === "either";
const sameKind = (a: string, b: string) => kindsMatch(kind(a), kind(b));

// "(c)(vi)–(viii) and (xi)" → [c,vi], [c,vii], [c,viii], [c,xi]. A shorter item inherits the
// previous item's leading parts, if it's the same kind of marker as the part it replaces:
// in "(c)(ii), (iv) … and (e)", (iv) is under (c) but the letter (e) is its own subdivision.
const inherits = (item: string[], previous: string[], previousKind: string) =>
  item.length < previous.length &&
  (item.length === 1
    ? kindsMatch(kind(item[0]), previousKind)
    : sameKind(item[0], previous[previous.length - item.length]));

const expandList = (list: string): string[][] => {
  const out: string[][] = [];
  let previous: string[] = [];
  // The kind of the previous item's last part; a range "(ix)–(x)" is roman even though "x" alone
  // could be a letter
  let previousKind = "either";
  const remember = (item: string[], hint?: string) => {
    const last = kind(item[item.length - 1]);
    previousKind =
      last !== "either"
        ? last
        : hint && kind(hint) !== "either"
          ? kind(hint)
          : previousKind;
    previous = item;
  };
  const items = list.split(/\s*(?:,|\band\b|\bor\b)\s*/).filter(Boolean);
  for (const item of items) {
    const range = item.split(/\s*(?:–|-|—|\bthrough\b)\s*/).filter(Boolean);
    const first = parts(range[0]);
    if (!first.length) continue;
    const start = inherits(first, previous, previousKind)
      ? [...previous.slice(0, previous.length - first.length), ...first]
      : first;
    if (range.length === 2) {
      const endParts = parts(range[1]);
      const end =
        endParts.length < start.length
          ? [...start.slice(0, start.length - endParts.length), ...endParts]
          : endParts;
      const sameParent =
        end.length === start.length &&
        chainText(end.slice(0, -1)) === chainText(start.slice(0, -1));
      const values = sameParent
        ? expandRange(start[start.length - 1], end[end.length - 1])
        : null;
      if (values) {
        values.forEach((v) => out.push([...start.slice(0, -1), v]));
        remember(end, start[start.length - 1]);
        continue;
      }
      out.push(start, end);
      remember(end, start[start.length - 1]);
      continue;
    }
    out.push(start);
    remember(start);
  }
  return out;
};

const SUBCHAPTER = /\s+to\s+(?:this\s+)?subchapter(?:\s+([IVXLC]+))?/;
const SUBDIVISIONS = new RegExp(
  String.raw`subdivisions?\s+((?:\([A-Za-z0-9]{1,6}\))+(?:\s*(?:,|\band\b|\bor\b|–|-|—|\bthrough\b)\s*(?:\([A-Za-z0-9]{1,6}\))+)*)\s+of\s+(?:U\.\s?S\.\s+)?note\s+(\d{1,3})(${SUBCHAPTER.source})?`,
  "gi",
);
const DIRECT = new RegExp(
  String.raw`(general\s+|statistical\s+|additional\s+)?(U\.\s?S\.\s+)?note\s+(\d{1,3})((?:\([A-Za-z0-9]{1,6}\))*)(${SUBCHAPTER.source})?`,
  "gi",
);

const citation = (
  subchapter: string,
  note: string,
  chain: string[],
): NoteCitation => {
  const sub = subchapter.toUpperCase();
  return {
    key: `sub-${sub}/us-notes/${note}${chainText(chain)}`,
    label: `U.S. note ${note}${chainText(chain)}${sub === "III" ? "" : ` to subchapter ${sub}`}`,
    file: `sub-${sub}-${note}`,
  };
};

export const findNoteCitations = (text: string): NoteCitation[] => {
  const found: NoteCitation[] = [];
  const covered: [number, number][] = [];
  for (const m of Array.from(text.matchAll(SUBDIVISIONS))) {
    const subchapter = m[4] ?? "III";
    expandList(m[1]).forEach((chain) =>
      found.push(citation(subchapter, m[2], chain)),
    );
    covered.push([m.index ?? 0, (m.index ?? 0) + m[0].length]);
  }
  for (const m of Array.from(text.matchAll(DIRECT))) {
    const at = m.index ?? 0;
    if (covered.some(([a, b]) => at >= a && at < b)) continue;
    if (m[1]) continue; // general, statistical or additional notes
    // "note 16(c)" without "U.S." counts only when it says which subchapter, or has subdivisions
    if (!m[2] && !m[5] && !m[4]) continue;
    found.push(citation(m[6] ?? "III", m[3], parts(m[4] ?? "")));
  }
  const seen = new Set<string>();
  return found.filter((c) =>
    seen.has(c.key) ? false : (seen.add(c.key), true),
  );
};
