// The cited note text, from public/data/notes (written by `npm run notes:cited`): one file per
// note, each citation's text versioned by HTS revision.

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
export type NoteFile = Record<string, CitedVersion[]>;

// One request per note file, shared by every component that needs it
const files = new Map<string, Promise<NoteFile | null>>();
export const loadFile = (file: string) => {
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

// The version in force on the date. After the last verified revision, the latest one. Before the
// first, the earliest: the text is versioned by HTS revision, so a law that took effect before the
// revision publishing it (note 51 on August 22, Revision 17 on August 24) would otherwise show
// nothing for those days. `early` says the text shown was published later than the date.
export const versionOn = (
  versions: CitedVersion[],
  asOf: string,
): { version: CitedVersion; early: boolean } => {
  const found = versions.find((v) => v.from <= asOf && (!v.to || asOf < v.to));
  if (found) return { version: found, early: false };
  const first = versions[0];
  if (asOf < first.from) return { version: first, early: true };
  return { version: versions[versions.length - 1], early: false };
};

// The last day of a version ("to" is the first day it's no longer in force)
export const lastDay = (to: string) => {
  const d = new Date(`${to}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};
