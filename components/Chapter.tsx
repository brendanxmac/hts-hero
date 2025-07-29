import { HtsElement, HtsSectionAndChapterBase } from "../interfaces/hts";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  getDirectChildrenElements,
  getElementsAtIndentLevel,
  getElementsInChapter,
} from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import { DocumentTextIcon, FunnelIcon } from "@heroicons/react/24/solid";
import PDF from "./PDF";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { ButtonWithIcon } from "./ButtonWithIcon";
import { SecondaryLabel } from "./SecondaryLabel";
import { useHts } from "../contexts/HtsContext";
import { SupabaseBuckets } from "../constants/supabase";
import Fuse, { IFuseOptions } from "fuse.js";
import { NoteI, notes, NoteType } from "../public/notes/notes";
import toast from "react-hot-toast";
import { Color } from "../enums/style";
import { useHtsSections } from "../contexts/HtsSectionsContext";

interface Props {
  chapter: HtsSectionAndChapterBase;
}

export const Chapter = ({ chapter }: Props) => {
  const { number, description } = chapter;
  const { htsElements } = useHts();
  const { sections } = useHtsSections();
  const [showNote, setShowNote] = useState<NoteI | null>(null);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();

  // Find the section that contains this chapter
  const parentSection = useMemo(() => {
    return sections.find((section) =>
      section.chapters.some((ch) => ch.number === chapter.number)
    );
  }, [sections, chapter.number]);

  const chapterElements = getElementsInChapter(htsElements, number);
  const elementsAtIndentLevel = chapterElements
    ? getElementsAtIndentLevel(chapterElements, 0)
    : [];
  const elementsWithChildrenAdded = elementsAtIndentLevel.map((element) => {
    const directChildrenElements = getDirectChildrenElements(
      element,
      chapterElements || []
    );

    return {
      ...element,
      children: directChildrenElements,
    };
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Fuse.js configuration for searching
  const fuseOptions: IFuseOptions<HtsElement> = {
    keys: ["htsno", "description"],
    threshold: 0.1,
    ignoreLocation: true,
    findAllMatches: true,
  };

  // Filter elements based on search query
  const filteredElements = useMemo(() => {
    if (!searchQuery.trim()) {
      return elementsWithChildrenAdded;
    }

    const fuse = new Fuse(elementsWithChildrenAdded, fuseOptions);
    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [elementsWithChildrenAdded, searchQuery]);

  // Notes dropdown state
  const [isNotesDropdownOpen, setIsNotesDropdownOpen] = useState(false);
  const [highlightedNoteIndex, setHighlightedNoteIndex] = useState(-1);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const notesDropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get all notes for the current chapter
  const chapterNotes = useMemo(() => {
    return notes.filter(
      (note) =>
        note.title.includes(`Chapter ${chapter.number}`) &&
        (note.type === NoteType.CHAPTER || note.type === NoteType.SUBCHAPTER)
    );
  }, [chapter.number]);

  // Scroll highlighted option into view (only for keyboard navigation)
  useEffect(() => {
    if (
      highlightedNoteIndex >= 0 &&
      isKeyboardNavigation &&
      scrollContainerRef.current
    ) {
      const container = scrollContainerRef.current;
      const highlightedElement = container.children[
        highlightedNoteIndex
      ] as HTMLElement;

      if (highlightedElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();
        const padding = 4;

        if (elementRect.top < containerRect.top + padding) {
          const scrollAmount = containerRect.top - elementRect.top + padding;
          container.scrollTop -= scrollAmount;
        } else if (elementRect.bottom > containerRect.bottom - padding) {
          const scrollAmount =
            elementRect.bottom - containerRect.bottom + padding;
          container.scrollTop += scrollAmount;
        }
      }
    }
  }, [highlightedNoteIndex, isKeyboardNavigation]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notesDropdownRef.current &&
        !notesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotesDropdownOpen(false);
        setHighlightedNoteIndex(-1);
        setIsKeyboardNavigation(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNoteSelect = (note: NoteI) => {
    setShowNote(note);
    setIsNotesDropdownOpen(false);
    setHighlightedNoteIndex(-1);
    setIsKeyboardNavigation(false);
  };

  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (!isNotesDropdownOpen) return;

  //   switch (e.key) {
  //     case "ArrowDown":
  //       e.preventDefault();
  //       setIsKeyboardNavigation(true);
  //       setHighlightedNoteIndex((prev) =>
  //         prev < chapterNotes.length - 1 ? prev + 1 : 0
  //       );
  //       break;
  //     case "ArrowUp":
  //       e.preventDefault();
  //       setIsKeyboardNavigation(true);
  //       setHighlightedNoteIndex((prev) =>
  //         prev > 0 ? prev - 1 : chapterNotes.length - 1
  //       );
  //       break;
  //     case "Enter":
  //       e.preventDefault();
  //       if (highlightedNoteIndex >= 0 && chapterNotes[highlightedNoteIndex]) {
  //         handleNoteSelect(chapterNotes[highlightedNoteIndex]);
  //       }
  //       break;
  //     case "Escape":
  //       setIsNotesDropdownOpen(false);
  //       setHighlightedNoteIndex(-1);
  //       setIsKeyboardNavigation(false);
  //       break;
  //   }
  // };

  return (
    <div className="card flex flex-col w-full gap-4 md:gap-4 rounded-xl bg-base-100 border border-base-content/10 p-4 pt-2 sm:pt-6 transition duration-100 ease-in-out">
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex flex-col gap-2 text-xs">
          {parentSection && (
            <div key={`breadcrumb-${chapter.number}`}>
              <b className="text-accent">Section {parentSection.number}: </b>
              <span className="text-white">{parentSection.description}</span>
              <span className="text-white mx-2">›</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-[1px] bg-base-content/10" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <SecondaryLabel
            value={`Chapter ${number.toString()}`}
            color={Color.ACCENT}
          />
          <div className="w-full flex gap-4 justify-end">
            {chapter.number === 98 || chapter.number === 99 ? (
              <div
                className="w-full min-w-sm max-w-sm relative"
                ref={notesDropdownRef}
              >
                <div
                  className="px-3 py-1 border-2 border-base-content/10 rounded-lg cursor-pointer bg-base-100 flex gap-3 items-center justify-between hover:bg-primary/20 transition-colors min-h-10"
                  onClick={() => setIsNotesDropdownOpen(!isNotesDropdownOpen)}
                >
                  <div className="flex-1 flex items-center">
                    <span className="text-sm">Select Note to View</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform text-base-content/70 ${isNotesDropdownOpen ? "" : "rotate-180"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {isNotesDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-64 overflow-hidden">
                    <div
                      className="max-h-60 overflow-y-auto pb-1"
                      ref={scrollContainerRef}
                    >
                      {chapterNotes.length > 0 ? (
                        chapterNotes.map((note: NoteI, index: number) => (
                          <div
                            key={index}
                            className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                              index === highlightedNoteIndex
                                ? "bg-base-300 text-primary-content"
                                : "hover:bg-base-200"
                            }`}
                            onClick={() => handleNoteSelect(note)}
                            onMouseEnter={() => {
                              setIsKeyboardNavigation(false);
                              setHighlightedNoteIndex(index);
                            }}
                          >
                            <div className="flex flex-col">
                              <div className="flex gap-2 items-center">
                                <DocumentTextIcon className="shrink-0 h-4 w-4 text-primary" />
                                <span className={"text-primary font-medium"}>
                                  {note.title.includes("Subchapter")
                                    ? note.title.split(" - ")[1]
                                    : note.title}
                                </span>
                              </div>
                              <span className={"text-white/80 text-sm"}>
                                {note.description}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-base-content/60">
                          No notes foundf
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <ButtonWithIcon
                icon={<DocumentTextIcon className="h-4 w-4" />}
                label={`Chapter ${number.toString()} Notes`}
                onClick={() => {
                  const note = notes.find(
                    (note) => note.title === `Chapter ${number.toString()}`
                  );
                  if (note) {
                    setShowNote(note);
                  } else {
                    toast.error("No notes found for this chapter");
                  }
                }}
              />
            )}
          </div>
        </div>
        <h2 className="text-xl md:text-3xl font-bold text-white">
          {description}
        </h2>
      </div>

      <div className="flex flex-col gap-2 bg-base-100">
        <div className="w-full flex sm:justify-between sm:items-end gap-1 sm:gap-4 flex-col sm:flex-row">
          <SecondaryLabel value="Headings" />
          {/* Filter Bar */}
          <div className="flex-1 relative sm:max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Filter by description or code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1 text-sm bg-base-100 border-2 border-base-content/20 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn btn-link btn-sm text-xs hover:text-secondary no-underline"
                >
                  clear
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p>Elements: {filteredElements.length}</p>
          {filteredElements.map((element, i) => {
            return (
              <ElementSummary
                key={`${i}-${element.htsno}`}
                element={element}
                onClick={() => {
                  setBreadcrumbs([
                    ...breadcrumbs,
                    {
                      title: `${element.htsno || element.description.split(" ").slice(0, 2).join(" ") + "..."}`,
                      element: {
                        ...element,
                        chapter: chapter.number,
                      },
                    },
                  ]);
                }}
              />
            );
          })}
        </div>
      </div>
      {showNote && (
        <PDF
          title={`${showNote.title} Notes`}
          bucket={SupabaseBuckets.NOTES}
          filePath={showNote.filePath}
          isOpen={!!showNote}
          setIsOpen={(isOpen) => {
            if (!isOpen) {
              setShowNote(null);
            }
          }}
        />
      )}
    </div>
  );
};
