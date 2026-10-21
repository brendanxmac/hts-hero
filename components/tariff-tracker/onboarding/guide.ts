import { htsCodeDigitsOnly } from "../../../libs/hts-code";
import { findCountry } from "../parse";
import { SheetRow } from "./sheet";

// The guided fix flow (FixGuide), worked out from the sheet as it stands when the flow opens: the
// same mistake repeated on many rows first, fixed once for all of them, then every row left, one at a
// time. Cards don't change as rows get fixed; a card is done when none of its rows needs a fix.
// A code is only fixed for many rows at once when there's one right answer (a leading zero Excel
// dropped). A 6-digit HS code, or one padded with zeros, stands for many US lines: products that
// share it may each need a different one, so each row gets its own card and its own pick.

export type FixCard =
  | { kind: "country"; value: string; rows: number[] }
  | { kind: "code"; value: string; rows: number[] }
  // reason: what was wrong when the flow opened (the card keeps it as its title)
  | { kind: "row"; row: number; reason?: string };

const MIN_GROUP = 2;

export const fixCards = <T>(
  sheet: SheetRow<T>[],
  codeOk: (digits: string) => boolean,
  // The one code a written code can only mean, or null when it could mean several
  onlyFix: (code: string) => string | null = () => null
): FixCard[] => {
  const errors = sheet.filter((r) => r.kind === "error");
  const grouped = new Set<number>();
  const cards: FixCard[] = [];
  const groupBy = (key: (r: SheetRow<T>) => string | null) => {
    const by = new Map<string, number[]>();
    errors.forEach((r) => {
      if (grouped.has(r.index)) return;
      const k = key(r);
      if (k) by.set(k, [...(by.get(k) ?? []), r.index]);
    });
    return [...by.entries()].filter(([, rows]) => rows.length >= MIN_GROUP).sort((a, b) => b[1].length - a[1].length);
  };

  // The same unrecognized country, written the same way
  groupBy((r) => (r.country.trim() && !findCountry(r.country) ? r.country.trim() : null)).forEach(([value, rows]) => {
    cards.push({ kind: "country", value, rows });
    rows.forEach((i) => grouped.add(i));
  });
  // The same code that doesn't read and has only one right answer, written the same way
  groupBy((r) => {
    const digits = htsCodeDigitsOnly(r.code);
    return digits && !codeOk(digits) && onlyFix(r.code) ? digits : null;
  }).forEach(([, rows]) => {
    const value = sheet[rows[0]].code.trim();
    cards.push({ kind: "code", value, rows });
    rows.forEach((i) => grouped.add(i));
  });
  // Then each row left, and each grouped row with a second problem the group won't fix
  const countryBad = (r: SheetRow<T>) => !findCountry(r.country);
  const codeBad = (r: SheetRow<T>) => !codeOk(htsCodeDigitsOnly(r.code));
  errors
    .filter((r) => !grouped.has(r.index) || (countryBad(r) && codeBad(r)))
    .forEach((r) => cards.push({ kind: "row", row: r.index, reason: r.reason }));
  return cards;
};

export const cardRows = (card: FixCard) => (card.kind === "row" ? [card.row] : card.rows);

// Done: a group, when the thing it's about is fixed on every row (or the row is fixed or deleted);
// a row, when it reads
export const cardDone = <T>(card: FixCard, sheet: SheetRow<T>[], codeOk: (digits: string) => boolean) =>
  cardRows(card).every((i) => {
    const r = sheet[i];
    if (!r || r.kind !== "error") return true;
    if (card.kind === "country") return !!findCountry(r.country);
    if (card.kind === "code") return codeOk(htsCodeDigitsOnly(r.code));
    return false;
  });

// The column that best says what a row's product is, for context on the cards: one whose header
// sounds like a description, else the widest text column that isn't the code or the country
export const describingColumn = (rows: string[][], header: string[] | null, skip: (number | undefined)[]): number | null => {
  const width = Math.max(0, ...rows.slice(0, 100).map((r) => r.length));
  const candidates = Array.from({ length: width }, (_, i) => i).filter((i) => !skip.includes(i));
  const named = candidates.find((i) => /desc|product|item name|^item$|^name$|title|goods|merchandise/i.test(header?.[i] ?? ""));
  if (named !== undefined) return named;
  const textiness = (i: number) =>
    rows.slice(0, 100).reduce((sum, r) => sum + (/[a-z]{3,}/i.test(r[i] ?? "") && !/^[\d.,$\s-]+$/.test(r[i] ?? "") ? (r[i] ?? "").length : 0), 0);
  const best = candidates.sort((a, b) => textiness(b) - textiness(a))[0];
  return best !== undefined && textiness(best) > 0 ? best : null;
};
