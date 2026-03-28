import { HtsElement, HtsSectionAndChapterBase } from "../interfaces/hts";
import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
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
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useHts } from "../contexts/HtsContext";
import {
  normalizeUsitcHtsFileName,
  openUsitcHtsFileInNewTab,
} from "@/libs/usitc-hts-file-url";
import Fuse, { IFuseOptions } from "fuse.js";
import { NoteI, notes, NoteType } from "../public/notes/notes";
import toast from "react-hot-toast";
import { trackExplorerNavigatedToLevel } from "../libs/explorer-navigation";

interface Props {
  chapter: HtsSectionAndChapterBase;
  isModal?: boolean;
}

export const Chapter = ({ chapter, isModal = false }: Props) => {
  const pathname = usePathname();
  const { number, description } = chapter;
  const { htsElements } = useHts();
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
    const resolved = normalizeUsitcHtsFileName(note.fileName);
    if (resolved) {
      openUsitcHtsFileInNewTab(resolved);
    } else {
      toast.error("No document available for this note");
    }
    setIsNotesDropdownOpen(false);
    setHighlightedNoteIndex(-1);
    setIsKeyboardNavigation(false);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Chapter Header — typography aligned with Element.tsx */}
      <div className="relative overflow-hidden py-4">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <h1 className="text-primary text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide">
                Chapter {number}
              </h1>
              <h2 className="text-lg md:text-xl lg:text-2xl text-base-content font-semibold leading-snug">
                {description}
              </h2>
            </div>

            {/* Notes Button/Dropdown */}
            <div className="flex shrink-0 justify-end gap-2">
              {chapter.number === 98 || chapter.number === 99 ? (
                <div
                  className="relative w-full max-w-sm min-w-0 md:w-auto md:min-w-[200px]"
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
                              className={`px-4 py-3 cursor-pointer transition-colors ${index === highlightedNoteIndex
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
                                  {note.title}
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
                      (n) => n.title === `Chapter ${number.toString()}`
                    );
                    const resolved = note
                      ? normalizeUsitcHtsFileName(note.fileName)
                      : null;
                    if (resolved) {
                      openUsitcHtsFileInNewTab(resolved);
                    } else {
                      toast.error("No notes found for this chapter");
                    }
                  }}
                >
                  <DocumentTextIcon className="shrink-0 h-4 w-4 text-primary/70" />
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
                  trackExplorerNavigatedToLevel({
                    pathname,
                    isModal,
                    navigation_kind: "deeper_heading",
                    from_depth: breadcrumbs.length,
                    to_depth: breadcrumbs.length + 1,
                    hts_code: element.htsno || null,
                    chapter_number: chapter.number,
                  });
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
    </div>
  );
};
