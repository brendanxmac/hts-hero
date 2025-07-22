"use client";

import { Note } from "./Note";
import { notes, NoteType } from "../public/notes/notes";
import { Tab } from "../interfaces/tab";
import { classNames } from "../utilities/style";
import { useState } from "react";

interface NotesProps {
  filteredNotes?: typeof notes;
  searchValue?: string;
}

const NoteTabs: Tab[] = [
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
];

export const Notes = ({ filteredNotes, searchValue }: NotesProps) => {
  const [activeTab, setActiveTab] = useState(NoteType.GENERAL);

  const notesToDisplay =
    filteredNotes && filteredNotes.length > 0
      ? filteredNotes
      : notes.filter((note) => note.type === activeTab);

  if (searchValue && filteredNotes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No notes found matching &quot;{searchValue}&quot;
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {filteredNotes && filteredNotes.length === 0 && !searchValue && (
        <div
          role="tablist"
          className="w-full max-w-sm tabs tabs-xs tabs-boxed bg-primary/30 rounded-xl"
        >
          {NoteTabs.map((tab) => (
            <a
              key={tab.value}
              role="tab"
              onClick={() => setActiveTab(tab.value as NoteType)}
              className={classNames(
                "tab transition-all duration-200 ease-in text-white font-semibold",
                tab.value === activeTab && "tab-active"
              )}
            >
              {tab.label}
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
        {notesToDisplay.map((note) => {
          return <Note key={`note-${note.title}`} note={note} />;
        })}
      </div>
    </div>
  );
};
