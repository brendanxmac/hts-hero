"use client";

import { Note } from "./Note";
import { notes } from "../public/notes/notes";

export const Notes = () => {
  if (notes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {notes.map((note) => {
        return <Note key={`note-${note.title}`} note={note} />;
      })}
    </div>
  );
};
