"use client";

import { Note } from "./Note";
import { NoteI, notes, NoteType } from "../public/notes/notes";
import { Tab } from "../interfaces/tab";
import { useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/16/solid";

interface NotesProps {
  filteredNotes?: NoteI[];
  searchValue?: string;
}

const NoteTabs: Tab[] = [
  {
    label: "All",
    value: NoteType.ANY,
  },
  {
    label: "General",
    value: NoteType.GENERAL,
  },
  {
    label: "Section",
    value: NoteType.SECTION,
  },
  {
    label: "Chapter",
    value: NoteType.CHAPTER,
  },
  {
    label: "Subchapter",
    value: NoteType.SUBCHAPTER,
  },
];

export const Notes = ({ filteredNotes, searchValue }: NotesProps) => {
  const [activeTab, setActiveTab] = useState(NoteType.ANY);
  const notesSet =
    filteredNotes && filteredNotes.length > 0 ? filteredNotes : notes;

  const notesToDisplay = notesSet.filter((note) =>
    activeTab === NoteType.ANY
      ? true
      : note.type === activeTab || note.type === NoteType.ANY
  );

  if (searchValue && filteredNotes.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col gap-4 justify-center items-center">
        <div className="w-16 h-16 rounded-2xl bg-base-content/5 border border-base-content/10 flex items-center justify-center">
          <DocumentTextIcon className="w-8 h-8 text-base-content/30" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-medium text-base-content/60">
            No notes found matching
          </span>
          <span className="text-sm font-semibold text-primary">
            &quot;{searchValue}&quot;
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filter tabs and count */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex p-1 gap-1 bg-base-200/60 rounded-xl border border-base-content/5 overflow-x-auto">
          {NoteTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as NoteType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                tab.value === activeTab
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-100/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Count Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
            Notes
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            {notesToDisplay.length}
          </span>
        </div>
      </div>

      {/* Notes grid */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
        {notesToDisplay.map((note) => {
          return <Note key={`note-${note.title}`} note={note} />;
        })}
      </div>
    </div>
  );
};
