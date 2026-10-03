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
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "fs";
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
      console.warn(
        `! ${revision.name}: no parsed notes in the revision checker; skipped`,
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
    for (const citation of Array.from(citations.values())) {
      const tree = subtree(nodes, citation.key);
      if (!tree) {
        missing.set(citation.key, [
          ...(missing.get(citation.key) ?? []),
          revision.name,
        ]);
        continue;
      }
      const list = versions.get(citation.key) ?? [];
      const last = list[list.length - 1];
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
