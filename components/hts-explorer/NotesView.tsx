"use client";

import { useState } from "react";
import { ArrowTopRightOnSquareIcon, DocumentTextIcon } from "@heroicons/react/16/solid";
import { normalizeUsitcHtsFileName, usitcHtsFileViewerTabUrl } from "@/libs/usitc-hts-file-url";
import { NoteI, notes, NoteType } from "@/public/notes/notes";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as tt from "@/components/ui/styles/tracker";
import { EmptyMessage } from "./EmptyMessage";

const FILTERS = [
  { id: NoteType.ANY, label: "All" },
  { id: NoteType.GENERAL, label: "General" },
  { id: NoteType.SECTION, label: "Section" },
  { id: NoteType.CHAPTER, label: "Chapter" },
] as const;

// The schedule's notes (general, section and chapter), filtered by the search and by kind
export const NotesView = ({ searchValue, matches }: { searchValue: string; matches: NoteI[] }) => {
  const [filter, setFilter] = useState<NoteType>(NoteType.ANY);
  const searching = Boolean(searchValue.trim());
  const shown = (searching ? matches : notes).filter(
    (n) => filter === NoteType.ANY || n.type === filter || n.type === NoteType.ANY
  );

  return (
    <section aria-label="HTS notes" className={`${tt.panel} overflow-hidden`}>
      <div className="flex flex-col gap-3 border-b border-base-300 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className={tt.title}>{searching ? "Matching notes" : "HTS notes"}</h3>
          <span className={tt.chip("neutral")}>{shown.length}</span>
        </div>
        <SegmentedControl<NoteType> label="Kind of note" options={FILTERS} value={filter} onChange={setFilter} size="sm" />
      </div>
      {shown.length > 0 ? (
        <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((note) => (
            <NoteCard key={note.title} note={note} />
          ))}
        </ul>
      ) : (
        <EmptyMessage
          icon={<DocumentTextIcon className="h-5 w-5" />}
          title="No notes found"
          description={searching ? `No notes match "${searchValue}".` : undefined}
        />
      )}
    </section>
  );
};

const NoteCard = ({ note }: { note: NoteI }) => {
  const file = normalizeUsitcHtsFileName(note.fileName);
  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          {note.title !== note.description && <span className={`${tt.eyebrow("primary")} block`}>{note.title}</span>}
          <span className="mt-0.5 block text-sm font-semibold leading-snug text-base-content">{note.description}</span>
        </span>
        {file ? (
          <ArrowTopRightOnSquareIcon className="mt-0.5 h-4 w-4 shrink-0 text-base-content/60 group-hover:text-primary" aria-hidden />
        ) : (
          <span className={tt.chip("neutral")}>N/A</span>
        )}
      </span>
      {note.specialTariffTreatmentCodes && note.specialTariffTreatmentCodes.length > 0 && (
        <span className="mt-3 flex flex-wrap items-center gap-1">
          <span className="mr-1 text-xs text-base-content/60">Programs</span>
          {note.specialTariffTreatmentCodes.map((code) => (
            <span key={code} className={tt.chip("primary")}>
              {code}
            </span>
          ))}
        </span>
      )}
    </>
  );

  return (
    <li>
      {file ? (
        <a
          href={usitcHtsFileViewerTabUrl(file)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${tt.tile} group flex h-full flex-col p-4 transition-colors hover:bg-primary/10`}
        >
          {body}
        </a>
      ) : (
        <div className={`${tt.tile} flex h-full flex-col p-4 opacity-60`}>{body}</div>
      )}
    </li>
  );
};
