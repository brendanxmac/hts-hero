import { NextRequest, NextResponse } from "next/server";
import pharmaceuticals from "@/libs/general-notes/data/appendix-13.json";
import dyes from "@/libs/general-notes/data/appendix-14.json";
import type { AppendixFile } from "@/libs/general-notes/types";

// Searches an appendix to the HTS (GN 13 pharmaceuticals, GN 14 dye intermediates) by name or CAS
// number, so a savings question can say whether a product is listed without the browser
// downloading thousands of names. A pharmaceutical's salt, ester or hydrate counts when its name
// is a listed product plus one of the appendix's table 2 prefixes or suffixes.
//   GET /api/general-notes/appendix?note=13&q=abacavir sulfate

const APPENDICES: Record<string, AppendixFile> = { "13": pharmaceuticals as AppendixFile, "14": dyes as AppendixFile };
const LIMIT = 8;

const norm = (s: string) => s.toUpperCase().replace(/[‐-―]/g, "-").replace(/\s+/g, " ").trim();

export async function GET(req: NextRequest) {
  const note = req.nextUrl.searchParams.get("note") ?? "";
  const q = norm(req.nextUrl.searchParams.get("q") ?? "");
  const appendix = APPENDICES[note];
  if (!appendix) return NextResponse.json({ error: "Unknown appendix" }, { status: 400 });
  if (q.length < 3) return NextResponse.json({ revision: appendix.revision, matches: [] });

  const products = appendix.products.map((p) => ({ ...p, key: norm(p.name) }));
  type Match = { name: string; cas?: string; table: number; exact: boolean; via?: string };
  const matches: Match[] = [];
  const add = (m: Match) => {
    if (matches.length < LIMIT && !matches.some((x) => x.name === m.name)) matches.push(m);
  };

  if (/^\d{2,7}-\d{2}-\d$/.test(q)) {
    for (const p of products) if (p.cas === q) add({ name: p.name, cas: p.cas, table: p.table, exact: true });
  } else {
    for (const p of products) if (p.key === q) add({ name: p.name, cas: p.cas, table: p.table, exact: true });
    // A salt, ester or hydrate: the name with a listed prefix or suffix taken off
    for (const affix of appendix.affixes ?? []) {
      const a = norm(affix);
      const base = q.endsWith(` ${a}`) ? q.slice(0, -a.length - 1) : q.startsWith(`${a} `) ? q.slice(a.length + 1) : null;
      const p = base && products.find((x) => x.key === base && x.table === 1);
      if (p) add({ name: p.name, cas: p.cas, table: p.table, exact: true, via: affix });
    }
    for (const p of products) if (p.key.startsWith(q)) add({ name: p.name, cas: p.cas, table: p.table, exact: false });
    for (const p of products) if (p.key.includes(q)) add({ name: p.name, cas: p.cas, table: p.table, exact: false });
  }
  return NextResponse.json({ revision: appendix.revision, matches }, { headers: { "Cache-Control": "public, max-age=86400" } });
}
