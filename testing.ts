// Data Structure for Notes...

enum NoteType {
  NOTE = "note",
  ADDITIONAL_US_NOTE = "additionalUSNote",
  HEADING_NOTE = "headingNote",
  SUBHEADING_NOTE = "subheadingNote",
  US_SUBHEADING_NOTE = "usSubheadingNote",
  STATISTICAL_NOTE = "statisticalNote",
  GENERAL_NOTE = "generalNote",
}

interface HtsNote {
  id: string;
  path: string; // Section X Chapter Y, NoteType Z, NoteIndex A
  content: string;
  type: NoteType;
  section?: string; // represents if the note is directly from a section note
  chapter?: string; // represents if the note is directly from a chapter note
  subchapter?: string; // ONLY for 98 & 99 as far as I can tell
  listPosition?: string; // if from a list, position in the list --> 8/a/i, 8(a)(ii), 8(a)(iii), 8(b)
}

// Can Reference notes exactly
//   Proof of Research: We can get the exact citation that points to which note we referenced to make a decision
//     - This is what `path` represents (Section 3 Chapter 13, Note 8(a)(ii))
//     - listPosition gives us the ability to easily extract any individual note

// ✅ All notes from a Section/Chapter
//     select * from notes where section = x;
//     select * from notes where chapter = y;
// ✅ All notes of [noteType] from Section/Chapter
//     select * from notes where section = x and type = 'additionalUSNote';
//     select * from notes where chapter = y and type = 'additionalUSNote';
// ✅ All notes from a list with a given # within a [noteType] witin a Section/Chapter
//     SQL Only
//     select * from notes where section = x and type = 'additionalUSNote' and listPosition ~ '^8';
//     select * from notes where section = x and type = 'additionalUSNote' and LEFT(listPosition,1) = '8';
//     SQL + JS
//     const notes = select * from notes where section = x and type = 'additionalUSNote';
//     const listNotes = notes.filter(note => note.listPosition.startsWith('8'));
// ✅ Notes that do NOT have a listPosition
//      Just need to leave listPosition empty, and then populate content

function transformHierarchy(input: string): string {
  const parts = input.split("/");
  return (
    parts[0] +
    parts
      .slice(1)
      .map((segment) => `(${segment})`)
      .join("")
  );
}
// Example usage:
// "8/a"              "8(a)"
// "8/a/i"            "8(a)(i)"
// "8/a/ii/1"         "8(a)(ii)(1)"
// "10/b/iv/3"        "10(b)(iv)(3)"
// "xyz/123"          "xyz(123)(!@#)"
// "10/b/iv/3/2/2/2"  "10(b)(iv)(3)(2)(2)(2)"
// "xyz/123/!@#/22"   "xyz(123)(!@#)(22)"
// Does not work for examples where trailing "/" is present,
//  creates a trailing () for the last segment
