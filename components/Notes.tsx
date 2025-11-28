"use client";

import { Note } from "./Note";
import { NoteI, notes, NoteType } from "../public/notes/notes";
import { Tab } from "../interfaces/tab";
import { classNames } from "../utilities/style";
import { useState } from "react";

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
      <div className="text-center py-12 px-4">
        <p className="text-base text-base-content/70">
          No notes found matching{" "}
          <span className="font-semibold text-base-content">
            &quot;{searchValue}&quot;
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Filter tabs and count */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div
          role="tablist"
          className="tabs tabs-boxed rounded-lg bg-base-200 p-1 w-fit"
        >
          {NoteTabs.map((tab) => (
            <a
              key={tab.value}
              role="tab"
              onClick={() => setActiveTab(tab.value as NoteType)}
              className={classNames(
                "tab transition-all duration-200 ease-in-out font-medium text-sm px-4 py-2 rounded-md",
                tab.value === activeTab
                  ? "tab-active bg-base-100 shadow-sm"
                  : "hover:text-base-content"
              )}
            >
              {tab.label}
            </a>
          ))}
        </div>
        <div className="badge badge-lg badge-ghost font-medium">
          {notesToDisplay.length}{" "}
          {notesToDisplay.length === 1 ? "note" : "notes"}
        </div>
      </div>

      {/* Notes grid */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
        {notesToDisplay.map((note) => {
          return <Note key={`note-${note.title}`} note={note} />;
        })}
      </div>
    </div>
  );
};
