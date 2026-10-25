// Downloads the current HTS revision's General Notes and the two appendices that grant duty-free
// treatment (pharmaceuticals, GN 13; dye intermediates, GN 14) from USITC, and writes what the
// savings questions show (libs/general-notes):
//   public/data/general-notes/gn-<n>.json            each program note's opening
//   public/data/general-notes/rules/gn-<n>/<ch>.json each agreement's rules of origin, by chapter
//   libs/general-notes/data/appendix-<n>.json         the appendices' products, searched server-side
// Current revision only: no backfill. Rerun it when a new revision changes the notes.
//
//   npm run notes:general
//
// Prints checks at the end; it fails if a program note or an agreement's rules can't be found.
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { extractText, getDocumentProxy } from "unpdf";
import { parseAppendix, parseGeneralNotes, PROGRAM_NOTES } from "../../libs/general-notes/parse";
import { rulesFor } from "../../libs/general-notes/types";

const BASE = "https://hts.usitc.gov/reststop";
const PUBLIC = join(process.cwd(), "public/data/general-notes");
const PRIVATE = join(process.cwd(), "libs/general-notes/data");

// Agreements with product-specific rules of origin by chapter (Morocco, Bahrain and Oman use a
// value-content rule instead; Israel, Jordan and Japan have none by chapter)
const WITH_RULES = [11, 25, 26, 28, 29, 32, 33, 34, 35];

const pagesOf = async (revision: string, filename: string) => {
  const response = await fetch(`${BASE}/file?release=${encodeURIComponent(revision)}&filename=${encodeURIComponent(filename)}`);
  if (!response.ok) throw new Error(`${filename}: USITC returned ${response.status}`);
  const pdf = await getDocumentProxy(new Uint8Array(await response.arrayBuffer()));
  const { text } = await extractText(pdf, { mergePages: false });
  return text as string[];
};

const write = (path: string, data: unknown) => {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(data));
};

const main = async () => {
  const current = await (await fetch(`${BASE}/currentRelease`)).json();
  const revision: string = current.name;
  console.log(`Revision ${revision}`);

  const [notesPages, pharmaPages, dyesPages] = await Promise.all([
    pagesOf(revision, "General Notes"),
    pagesOf(revision, "Pharmaceutical Appendix"),
    pagesOf(revision, "Intermediate Chemicals for Dyes"),
  ]);

  const { notes, rules, warnings } = parseGeneralNotes(notesPages, revision);
  const pharma = parseAppendix(pharmaPages, 13, revision);
  const dyes = parseAppendix(dyesPages, 14, revision);

  rmSync(PUBLIC, { recursive: true, force: true });
  for (const note of notes) write(join(PUBLIC, `gn-${note.note}.json`), note);
  for (const chapter of rules) write(join(PUBLIC, "rules", `gn-${chapter.note}`, `${chapter.chapter}.json`), chapter);
  write(join(PRIVATE, "appendix-13.json"), pharma);
  write(join(PRIVATE, "appendix-14.json"), dyes);

  // Checks
  const problems = [...warnings];
  for (const n of PROGRAM_NOTES) if (!notes.some((x) => x.note === n)) problems.push(`General Note ${n} missing`);
  for (const n of WITH_RULES) {
    const chapters = rules.filter((r) => r.note === n);
    if (chapters.length < 60) problems.push(`General Note ${n}: only ${chapters.length} chapters of rules`);
    const uncovered = chapters.flatMap((c) => c.rules.filter((r) => !r.covers.length && /^\d/.test(r.label)).map((r) => `${c.chapter}/${r.label}`));
    if (uncovered.length) console.log(`  GN ${n}: ${uncovered.length} numbered rules without codes (${uncovered.slice(0, 5).join(", ")}…)`);
  }
  const usmca94 = rules.find((r) => r.note === 11 && r.chapter === 94);
  if (!usmca94 || !rulesFor(usmca94, "9403.20.0050").length) problems.push("USMCA has no rule for 9403.20");
  if (pharma.products.length < 9000) problems.push(`Pharmaceutical appendix: only ${pharma.products.length} products`);
  if (!pharma.products.some((p) => p.name === "ABACAVIR" && p.cas === "136470-78-5")) problems.push("Pharmaceutical appendix: ABACAVIR missing");
  if (dyes.products.length < 100) problems.push(`Dyes appendix: only ${dyes.products.length} products`);

  console.log(`${notes.length} notes: ${notes.map((n) => `${n.note} ${n.label}`).join(", ")}`);
  console.log(`${rules.length} chapters of rules of origin across ${new Set(rules.map((r) => r.note)).size} agreements`);
  console.log(`Appendices: ${pharma.products.length} pharmaceuticals (${pharma.affixes?.length ?? 0} affixes), ${dyes.products.length} dye intermediates`);
  if (usmca94) console.log(`USMCA 9403.20: ${rulesFor(usmca94, "9403.20.0050").map((r) => `${r.label}. ${r.text}`).join(" | ")}`);
  if (problems.length) {
    console.error(`\n${problems.length} problems:\n${problems.join("\n")}`);
    process.exit(1);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
