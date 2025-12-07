import { HtsElement, HtsSectionAndChapterBase } from "../interfaces/hts";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  getDirectChildrenElements,
  getElementsAtIndentLevel,
  getElementsInChapter,
} from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/16/solid";
import PDF from "./PDF";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useHts } from "../contexts/HtsContext";
import { SupabaseBuckets } from "../constants/supabase";
import Fuse, { IFuseOptions } from "fuse.js";
import { NoteI, notes, NoteType } from "../public/notes/notes";
import toast from "react-hot-toast";

interface Props {
  chapter: HtsSectionAndChapterBase;
}

export const Chapter = ({ chapter }: Props) => {
  const { number, description } = chapter;
  const { htsElements } = useHts();
  const [showNote, setShowNote] = useState<NoteI | null>(null);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();

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

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Chapter Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 border border-base-content/10 p-5">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            {/* Chapter Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-lg font-bold text-primary">{number}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                  Chapter
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-base-content leading-tight">
                  {description}
                </h2>
              </div>
            </div>

            {/* Notes Button/Dropdown */}
            <div className="flex gap-2">
              {chapter.number === 98 || chapter.number === 99 ? (
                <div
                  className="relative min-w-[200px] max-w-sm"
                  ref={notesDropdownRef}
                >
                  <button
                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-base-content/5 hover:bg-primary/10 border border-base-content/10 hover:border-primary/20 transition-all duration-200"
                    onClick={() => setIsNotesDropdownOpen(!isNotesDropdownOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="h-4 w-4 text-primary/70" />
                      <span className="text-sm font-medium">Select Notes</span>
                    </div>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-base-content/50 transition-transform duration-200 ${isNotesDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isNotesDropdownOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-base-100 border border-base-content/10 rounded-xl shadow-2xl shadow-black/10 overflow-hidden">
                      <div
                        className="max-h-60 overflow-y-auto"
                        ref={scrollContainerRef}
                      >
                        {chapterNotes.length > 0 ? (
                          chapterNotes.map((note: NoteI, index: number) => (
                            <div
                              key={index}
                              className={`px-4 py-3 cursor-pointer transition-colors ${
                                index === highlightedNoteIndex
                                  ? "bg-primary/10"
                                  : "hover:bg-base-200/60"
                              }`}
                              onClick={() => handleNoteSelect(note)}
                              onMouseEnter={() => {
                                setIsKeyboardNavigation(false);
                                setHighlightedNoteIndex(index);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <DocumentTextIcon className="shrink-0 h-4 w-4 text-primary" />
                                <span className="font-medium text-base-content">
                                  {note.title.includes("Subchapter")
                                    ? note.title.split(" - ")[1]
                                    : note.title}
                                </span>
                              </div>
                              <p className="text-xs text-base-content/60 mt-1 ml-6">
                                {note.description}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-base-content/50">
                            No notes found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-base-content/5 hover:bg-primary/10 border border-base-content/10 hover:border-primary/20 transition-all duration-200"
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
                >
                  <DocumentTextIcon className="h-4 w-4 text-primary/70" />
                  <span className="text-sm font-medium">Chapter Notes</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Headings Section */}
      <div className="flex flex-col gap-4">
        {/* Section Header with Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
              Headings
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-base-content/5 text-xs font-bold text-base-content/60">
              {filteredElements
                ? filteredElements.length
                : elementsWithChildrenAdded.length}
            </span>
          </div>

          {/* Filter Input */}
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-base-content/40" />
            </div>
            <input
              type="text"
              placeholder="Filter headings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-16 bg-base-100 rounded-xl border border-base-content/10 transition-all duration-200 placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 hover:border-primary/30 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-primary hover:text-primary/70 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Elements List */}
        <div className="flex flex-col gap-2">
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
