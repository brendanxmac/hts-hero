"use client";

import { Note } from "./Note";
import { notes, NoteType } from "../public/notes/notes";

interface NotesProps {
  filteredNotes?: typeof notes;
}

export const Notes = ({ filteredNotes = notes }: NotesProps) => {
  if (notes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
        {filteredNotes.map((note) => {
          return <Note key={`note-${note.title}`} note={note} />;
        })}
      </div>
    </div>
  );
};
