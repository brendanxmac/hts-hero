import { NoteCitation } from "@/tariffs/engine-v2/citations";
import * as ui from "@/components/ui/styles";
import { formatDate } from "../lib/format";
import { lastDay, NoteFile, versionOn } from "./noteFiles";
import { NoteNode } from "./NoteNode";

// One cited note subdivision: its label, the dates its text was in force, and the text for the
// entry's date. `file` is undefined while it loads and null when it couldn't be.
export const CitedNote = ({
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
  const picked = versions?.length ? versionOn(versions, asOf) : undefined;
  const version = picked?.version;
  return (
    <div className="flex flex-col gap-2.5 rounded-md border border-base-300 bg-base-200 p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-base-content">
          {citation.label}
        </span>
        {version && picked?.early ? (
          <span className={ui.caption}>
            As first published in the HTS on {formatDate(version.from)}
          </span>
        ) : (
          version &&
          versions &&
          versions.length > 1 && (
            <span className={ui.caption}>
              Text in force {formatDate(version.from)}
              {version.to ? ` – ${formatDate(lastDay(version.to))}` : " onward"}
            </span>
          )
        )}
      </div>
      {file === undefined ? (
        <p className={ui.caption}>Loading…</p>
      ) : version ? (
        version.nodes.map((node, i) => (
          <NoteNode key={i} node={node} htsCode={htsCode} />
        ))
      ) : (
        <p className={ui.caption}>
          Text not available for this revision.
        </p>
      )}
    </div>
  );
};
