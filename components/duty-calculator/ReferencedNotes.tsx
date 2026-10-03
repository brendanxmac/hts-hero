"use client";

import { useEffect, useMemo, useState } from "react";
import {
  findNoteCitations,
  NoteCitation,
} from "../../tariffs/engine-v2/citations";
import { formatDate } from "./format";
import { mono } from "./font";

// The text of the note subdivisions a piece of legal text cites, for the entry's date, from
// public/data/notes (written by `npm run notes:cited`). Code lists are shown as a grid with the
// entered code highlighted; tables as tables. A citation that can't be found says so.

interface CitedNode {
  citation: string;
  depth: number;
  text: string;
}
interface CitedVersion {
  from: string;
  to?: string;
  nodes: CitedNode[];
}
type NoteFile = Record<string, CitedVersion[]>;

// One request per note file, shared by every component that needs it
const files = new Map<string, Promise<NoteFile | null>>();
const loadFile = (file: string) => {
  if (!files.has(file)) {
    files.set(
      file,
      fetch(`/data/notes/${file}.json`)
        .then((r) => (r.ok ? (r.json() as Promise<NoteFile>) : null))
        .catch((): null => null),
    );
  }
  return files.get(file)!;
};

const digits = (code: string) => code.replace(/\D/g, "");
const CODE = /^\d{4}\.\d{2}(?:\.\d{2,4})?(?:\.\d{2})?$/;
// A listed provision covers the entered code when the code starts with it ("0901.11" covers
// 0901.11.00.15), the same way the engine matches
const covers = (listed: string, htsCode: string) =>
  digits(htsCode).startsWith(digits(listed));

// The version in force on the date; after the last verified revision, the latest one
const versionOn = (versions: CitedVersion[], asOf: string) =>
  versions.find((v) => v.from <= asOf && (!v.to || asOf < v.to)) ??
  (asOf >= versions[versions.length - 1].from
    ? versions[versions.length - 1]
    : undefined);

type Block =
  | { kind: "text"; text: string }
  | { kind: "codes"; codes: string[] }
  | { kind: "table"; rows: string[][] };

// Splits a subdivision's text into paragraphs, code lists and tables ("| a | b |" rows)
const blocks = (text: string): Block[] => {
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

const COLLAPSED = 60;

const CodeList = ({ codes, htsCode }: { codes: string[]; htsCode: string }) => {
  const [all, setAll] = useState(false);
  const matches = codes.filter((c) => covers(c, htsCode));
  // Collapsed, the entered code's matches come first so they're always visible
  const shown = all
    ? codes
    : [...matches, ...codes.filter((c) => !covers(c, htsCode))].slice(
        0,
        COLLAPSED,
      );
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12.5px] text-[var(--dc-text-2)]">
        {codes.length} {codes.length === 1 ? "provision" : "provisions"}
        {" · "}
        {matches.length ? (
          <span className="font-semibold text-[var(--dc-positive)]">
            {htsCode} is on this list ({matches.join(", ")})
          </span>
        ) : (
          <span>{htsCode} isn&apos;t on this list</span>
        )}
      </p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1">
        {shown.map((code, i) => (
          <li
            key={`${code}-${i}`}
            className={`${mono.className} rounded px-1.5 py-0.5 text-[12px] ${
              covers(code, htsCode)
                ? "bg-[var(--dc-positive-soft)] text-[var(--dc-positive)] font-semibold ring-1 ring-[var(--dc-positive)]"
                : "bg-[var(--dc-surface)] text-[var(--dc-text-2)] ring-1 ring-[var(--dc-border)]"
            }`}
          >
            {code}
          </li>
        ))}
      </ul>
      {codes.length > COLLAPSED && (
        <button
          type="button"
          className="self-start text-[12.5px] font-medium text-[var(--dc-accent)] hover:underline"
          onClick={() => setAll((x) => !x)}
        >
          {all ? "Show fewer" : `Show all ${codes.length}`}
        </button>
      )}
    </div>
  );
};

const Table = ({ rows }: { rows: string[][] }) => {
  const [head, ...body] = rows;
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--dc-border)] bg-[var(--dc-surface)]">
      <table className="w-full text-[12px] leading-snug">
        <thead className="bg-[var(--dc-surface-3)]">
          <tr>
            {head.map((cell, i) => (
              <th
                key={i}
                className="px-2.5 py-1.5 text-left font-semibold text-[var(--dc-text)] align-bottom"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r} className="border-t border-[var(--dc-border)]">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className="px-2.5 py-1.5 text-[var(--dc-text-2)] align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// The subdivision's own marker: "50(a)(iii)(2)" → "(2)", "52" → "52."
const marker = (citation: string) => {
  const m = citation.match(/(\([^)]+\)|\[\d+\])$/);
  return m ? m[1] : `${citation}.`;
};

const NoteNode = ({ node, htsCode }: { node: CitedNode; htsCode: string }) => {
  const parsed = blocks(node.text);
  // Lists of particular articles name their subheading in the text: highlight the one that covers
  // the entered code
  const mentioned = Array.from(
    node.text.matchAll(/\b\d{4}\.\d{2}(?:\.\d{2,4})?\b/g),
    (m) => m[0],
  );
  const isTable = parsed.some((b) => b.kind !== "text");
  const hit = !isTable && mentioned.some((c) => covers(c, htsCode));
  return (
    <div
      className={`flex flex-col gap-2 ${hit ? "rounded-md bg-[var(--dc-positive-soft)] px-2 py-1 -mx-2" : ""}`}
      style={{ marginLeft: node.depth * 16 }}
    >
      {parsed.length === 0 && (
        <p className="text-[12.5px] text-[var(--dc-text-2)]">
          <span className="font-semibold text-[var(--dc-text)]">
            {marker(node.citation)}
          </span>
        </p>
      )}
      {parsed.map((block, i) =>
        block.kind === "text" ? (
          <p
            key={i}
            className="text-[13px] leading-relaxed text-[var(--dc-text-2)]"
          >
            {i === 0 && (
              <span className="font-semibold text-[var(--dc-text)] mr-1.5">
                {marker(node.citation)}
              </span>
            )}
            {block.text}
            {hit && i === 0 && (
              <span className="ml-1.5 font-semibold text-[var(--dc-positive)]">
                ← {htsCode}
              </span>
            )}
          </p>
        ) : block.kind === "codes" ? (
          <CodeList key={i} codes={block.codes} htsCode={htsCode} />
        ) : (
          <Table key={i} rows={block.rows} />
        ),
      )}
    </div>
  );
};

const Citation = ({
  citation,
  file,
  asOf,
  htsCode,
}: {
  citation: NoteCitation;
  file: NoteFile | null | undefined;
  asOf: string;
  htsCode: string;
}) => {
  const versions = file?.[citation.key];
  const version = versions ? versionOn(versions, asOf) : undefined;
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-[var(--dc-border)] bg-[var(--dc-surface-2)] p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-[var(--dc-text)]">
          {citation.label}
        </span>
        {version && versions && versions.length > 1 && (
          <span className="text-[11.5px] text-[var(--dc-text-3)]">
            Text in force {formatDate(version.from)}
            {version.to ? ` – ${formatDate(version.to)}` : " onward"}
          </span>
        )}
      </div>
      {file === undefined ? (
        <p className="text-[12.5px] text-[var(--dc-text-3)]">Loading…</p>
      ) : version ? (
        version.nodes.map((node, i) => (
          <NoteNode key={i} node={node} htsCode={htsCode} />
        ))
      ) : versions ? (
        <p className="text-[12.5px] text-[var(--dc-text-3)]">
          Not in the HTS on this date.
        </p>
      ) : (
        <p className="text-[12.5px] text-[var(--dc-text-3)]">
          Text not available for this revision.
        </p>
      )}
    </div>
  );
};

export const ReferencedNotes = ({
  texts,
  citations = [],
  asOf,
  htsCode,
}: {
  texts: string[]; // legal text to look for citations in
  citations?: string[]; // extra citations to show ("U.S. note 41(d)")
  asOf: string;
  htsCode: string;
}) => {
  // Keyed on the text itself: callers pass new arrays on every render ([text]), and depending on
  // the arrays would re-run the effect below on every render, an endless loop once the file is
  // cached
  const sources = JSON.stringify([...texts, ...citations]);
  const found = useMemo(() => {
    const seen = new Set<string>();
    return (JSON.parse(sources) as string[])
      .flatMap((t) => findNoteCitations(t))
      .filter((c) => (seen.has(c.key) ? false : (seen.add(c.key), true)));
  }, [sources]);
  const fileList = Array.from(new Set(found.map((c) => c.file))).join(",");
  const [loaded, setLoaded] = useState<Record<string, NoteFile | null>>({});

  useEffect(() => {
    let live = true;
    fileList
      .split(",")
      .filter(Boolean)
      .forEach((file) =>
        loadFile(file).then((content) => {
          if (!live) return;
          // Only a change of state re-renders
          setLoaded((prev) =>
            file in prev && prev[file] === content
              ? prev
              : { ...prev, [file]: content },
          );
        }),
      );
    return () => {
      live = false;
    };
  }, [fileList]);

  if (!found.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-[var(--dc-text-3)]">
        Referenced notes
      </div>
      {found.map((citation) => (
        <Citation
          key={citation.key}
          citation={citation}
          file={citation.file in loaded ? loaded[citation.file] : undefined}
          asOf={asOf}
          htsCode={htsCode}
        />
      ))}
    </div>
  );
};
