"use client";

import { useEffect, useMemo, useState } from "react";
import { findNoteCitations } from "@/tariffs/engine-v2/citations";
import * as ui from "@/components/ui/styles";
import { CitedNote } from "./CitedNote";
import { loadFile, NoteFile } from "./noteFiles";

// The text of the note subdivisions a piece of legal text cites, for the entry's date, from
// public/data/notes (written by `npm run notes:cited`). Code lists are shown as a grid with the
// entered code highlighted; tables as tables. A citation that can't be found says so.
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
      <div className={ui.label}>
        Referenced notes
      </div>
      {found.map((citation) => (
        <CitedNote
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
