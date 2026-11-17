// Extracts the text of every Chapter 99 note subdivision the engine's legal text cites, from each
// verified revision's parsed notes (the revision checker's notes.json), into
// public/data/notes/<sub-III-41>.json. The calculator loads a note's file when its legal text is
// opened ("Referenced notes"). A new version is stored only when a subdivision's text changes.
//
//   npm run notes:cited
//
// Needs the revision checker's Supabase service key (.env.local). Run it after adding a verified
// revision; /apply-revision does.
import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { AllRules } from "../../tariffs/engine-v2/data";
import {
  findNoteCitations,
  NoteCitation,
} from "../../tariffs/engine-v2/citations";
import { getVerifiedRevisions } from "../../tariffs/engine-v2/revisions";

interface ParsedNode {
  key: string;
  citation: string;
  parentKey: string | null;
  text: string;
}

// One subdivision and everything under it, as shown: its citation, depth below the cited one, text
export interface CitedNode {
  citation: string;
  depth: number;
  text: string;
}

export interface CitedVersion {
  from: string;
  to?: string;
  nodes: CitedNode[];
}

const OUT = join(process.cwd(), "public/data/notes");
const BUCKET = "hts-revision-diff-parsing";

// Revisions whose note text was checked unchanged from the revision before against USITC's own
// PDFs, but whose parse misses or garbles some subdivisions. There, a cited subdivision the parse
// lacks keeps the previous text (elsewhere, missing means deleted, and the text stops), and the
// listed subdivisions (with everything under them) ignore the parse.
// - 2026HTSRev23: a plain-text comparison of the Rev 22 and Rev 23 Chapter 99 PDFs shows no note
//   changed. The parse drops some subdivisions (e.g. 20(vvv)) and runs 16(c)(viii)–(xi) into
//   16(c)(vii) (tariffs/revision-diffs/2026HTSRev23/PLAN.md)
const NOTES_CHECKED_UNCHANGED: Record<string, string[]> = {
  "2026HTSRev23": ["sub-III/us-notes/16(c)"],
};
const badParse = (revision: string, key: string) =>
  (NOTES_CHECKED_UNCHANGED[revision] ?? []).some((k) => key === k || key.startsWith(`${k}(`));

const citedTexts = () => [
  ...AllRules.tariffs.map((t) => t.description),
  ...AllRules.inputs.flatMap((i) => [i.help ?? "", ...(i.citations ?? [])]),
];

const subtree = (nodes: ParsedNode[], key: string): CitedNode[] | null => {
  const root = nodes.find((n) => n.key === key);
  if (!root) return null;
  const children = new Map<string, ParsedNode[]>();
  nodes.forEach(
    (n) =>
      n.parentKey &&
      children.set(n.parentKey, [...(children.get(n.parentKey) ?? []), n]),
  );
  const out: CitedNode[] = [];
  const visit = (node: ParsedNode, depth: number) => {
    out.push({ citation: node.citation, depth, text: node.text });
    (children.get(node.key) ?? []).forEach((c) => visit(c, depth + 1));
  };
  visit(root, 0);
  return out;
};

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const citations = new Map<string, NoteCitation>();
  citedTexts().forEach((text) =>
    findNoteCitations(text).forEach((c) => citations.set(c.key, c)),
  );
  console.log(`${citations.size} cited subdivisions`);

  const { data: revisions, error } = await db
    .from("hts_revision_diff_revisions")
    .select("name, active_attempt_id");
  if (error) throw error;
  const { data: attempts } = await db
    .from("hts_revision_diff_attempts")
    .select("id, notes_path");

  const versions = new Map<string, CitedVersion[]>();
  const missing = new Map<string, string[]>();
  for (const revision of getVerifiedRevisions()) {
    const row = revisions?.find((r) => r.name === revision.name);
    const path = attempts?.find(
      (a) => a.id === row?.active_attempt_id,
    )?.notes_path;
    if (!path) {
      // Verified without the checker (2026HTSRev21–22 were checked against USITC's PDFs by hand):
      // carry each subdivision's latest text over this revision instead of leaving a gap
      let carried = 0;
      versions.forEach((list) => {
        const last = list[list.length - 1];
        if (last && last.to === revision.from) {
          last.to = revision.to;
          carried++;
        }
      });
      console.warn(
        `! ${revision.name}: no parsed notes in the revision checker; carried the previous text over it (${carried} subdivisions)`,
      );
      continue;
    }
    const { data, error: dlError } = await db.storage
      .from(BUCKET)
      .download(path);
    if (dlError || !data)
      throw new Error(`${revision.name}: ${dlError?.message}`);
    const nodes = (JSON.parse(await data.text()) as { nodes: ParsedNode[] })
      .nodes;
    const carriedOver: string[] = [];
    for (const citation of Array.from(citations.values())) {
      const tree = badParse(revision.name, citation.key) ? null : subtree(nodes, citation.key);
      const list = versions.get(citation.key) ?? [];
      const last = list[list.length - 1];
      // Missing (or badly parsed) in a revision checked unchanged, and in force just before: carry
      // that text over, and say so
      if (!tree && revision.name in NOTES_CHECKED_UNCHANGED && last && last.to === revision.from) {
        last.to = revision.to;
        carriedOver.push(citation.key);
        continue;
      }
      if (!tree) {
        missing.set(citation.key, [
          ...(missing.get(citation.key) ?? []),
          revision.name,
        ]);
        continue;
      }
      // Extend the previous version when the text is the same and the revisions are back to back
      if (
        last &&
        last.to === revision.from &&
        JSON.stringify(last.nodes) === JSON.stringify(tree)
      ) {
        last.to = revision.to;
      } else {
        list.push({ from: revision.from, to: revision.to, nodes: tree });
      }
      versions.set(citation.key, list);
    }
    console.log(`  ${revision.name}: read`);
    if (carriedOver.length)
      console.warn(
        `! ${revision.name}: carried the previous text over ${carriedOver.length} cited subdivisions missing or badly parsed here:\n    ${carriedOver.join("\n    ")}`,
      );
  }

  // One file per note, with every cited subdivision of it
  const files = new Map<string, Record<string, CitedVersion[]>>();
  versions.forEach((list, key) => {
    const file = citations.get(key)!.file;
    files.set(file, { ...(files.get(file) ?? {}), [key]: list });
  });
  mkdirSync(OUT, { recursive: true });
  readdirSync(OUT)
    .filter((f) => f.endsWith(".json"))
    .forEach((f) => rmSync(join(OUT, f)));
  let bytes = 0;
  files.forEach((content, file) => {
    const json = JSON.stringify(content);
    bytes += json.length;
    writeFileSync(join(OUT, `${file}.json`), json);
  });
  console.log(
    `Wrote ${files.size} files (${Math.round(bytes / 1024)} KB) to public/data/notes`,
  );

  const never = Array.from(citations.keys()).filter((k) => !versions.has(k));
  if (never.length)
    console.warn(
      `! Cited but not found in any verified revision (shown as "text not available"):\n  ${never.join("\n  ")}`,
    );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
