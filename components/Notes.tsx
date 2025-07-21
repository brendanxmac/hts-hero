"use client";

import { Note } from "./Note";
import { notes, NoteType } from "../public/notes/notes";
import { Tab } from "../interfaces/tab";
import { classNames } from "../utilities/style";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { PrimaryLabel } from "./PrimaryLabel";
import { Color } from "../enums/style";

const NoteTabs: Tab[] = [
  {
    label: "All",
    value: NoteType.ALL,
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
];

export const Notes = () => {
  // const [activeTab, setActiveTab] = useState(NoteType.GENERAL);
  const [searchQuery, setSearchQuery] = useState("");

  if (notes.length === 0) return null;

  // Filter notes by active tab
  // const filteredNotesByTab = useMemo(() => {
  //   if (activeTab === NoteType.ALL) {
  //     return notes;
  //   }
  //   return notes.filter((note) => note.type === activeTab);
  // }, [activeTab]);

  // Configure Fuse.js for fuzzy searching
  const fuse = useMemo(() => {
    return new Fuse(notes, {
      keys: ["title", "description"],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
    });
  }, [notes]);

  // Filter notes by search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }

    const searchResults = fuse.search(searchQuery);
    return searchResults.map((result) => result.item);
  }, [searchQuery, fuse, notes]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-between">
        {/* <div className="flex gap-2 items-center">
          <PrimaryLabel value="Notes" color={Color.WHITE} />
          <div
            role="tablist"
            className="tabs tabs-boxed tabs-sm bg-primary/30 rounded-xl"
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
        </div> */}

        {/* Search Bar */}

        <input
          type="text"
          placeholder={`Search notes...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-[350px] input input-bordered input-md h-10 w-full focus:ring-0 focus:outline-none pr-8"
        />
      </div>
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
        {filteredNotes.map((note) => {
          return <Note key={`note-${note.title}`} note={note} />;
        })}
      </div>
      {searchQuery && filteredNotes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No notes found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};
