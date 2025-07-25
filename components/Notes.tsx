"use client";

import { Note } from "./Note";
import { NoteI, notes, NoteType } from "../public/notes/notes";
import { Tab } from "../interfaces/tab";
import { classNames } from "../utilities/style";
import { useState } from "react";
import { TertiaryLabel } from "./TertiaryLabel";

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
      <div className="text-center py-8 text-gray-500">
        No notes found matching &quot;{searchValue}&quot;
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-4">
      <div className="flex gap-2 items-center">
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
        <TertiaryLabel value={`${notesToDisplay.length} notes`} />
      </div>

      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
        {notesToDisplay.map((note) => {
          return <Note key={`note-${note.title}`} note={note} />;
        })}
      </div>
    </div>
  );
};
