// Reading a note subdivision's text: its paragraphs, code lists and tables, and which listed
// codes cover the entered one.

const digits = (code: string) => code.replace(/\D/g, "");
const CODE = /^\d{4}\.\d{2}(?:\.\d{2,4})?(?:\.\d{2})?$/;

// A listed provision covers the entered code when the code starts with it ("0901.11" covers
// 0901.11.00.15), the same way the engine matches
export const covers = (listed: string, htsCode: string) =>
  digits(htsCode).startsWith(digits(listed));

export type Block =
  | { kind: "text"; text: string }
  | { kind: "codes"; codes: string[] }
  | { kind: "table"; rows: string[][] };

// Splits a subdivision's text into paragraphs, code lists and tables ("| a | b |" rows)
export const blocks = (text: string): Block[] => {
  const out: Block[] = [];
  let rows: string[][] = [];
  const flush = () => {
    if (!rows.length) return;
    const cells = rows.flat().filter(Boolean);
    if (cells.length && cells.every((c) => CODE.test(c))) {
      const last = out[out.length - 1];
      if (last?.kind === "codes") last.codes.push(...cells);
      else out.push({ kind: "codes", codes: cells });
    } else {
      out.push({ kind: "table", rows });
    }
    rows = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("|")) {
      rows.push(
        line
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim()),
      );
      continue;
    }
    flush();
    out.push({ kind: "text", text: line });
  }
  flush();
  return out;
};

// The subdivision's own marker: "50(a)(iii)(2)" → "(2)", "52" → "52."
export const marker = (citation: string) => {
  const m = citation.match(/(\([^)]+\)|\[\d+\])$/);
  return m ? m[1] : `${citation}.`;
};
