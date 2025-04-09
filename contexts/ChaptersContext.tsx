"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { HtsElement } from "../interfaces/hts";
import { getHtsChapterData } from "../libs/hts";

interface ChapterData {
  number: number;
  elements: HtsElement[];
}

interface ChaptersContextState {
  chapters: ChapterData[];
  loadingChapters: number[]; // Keep track of chapters currently being fetched
}

interface ChaptersContextValue extends ChaptersContextState {
  fetchChapter: (chapterNumber: number) => Promise<void>;
  getChapterElements: (chapterNumber: number) => HtsElement[] | undefined;
}

const ChaptersContext = createContext<ChaptersContextValue | undefined>(
  undefined
);

interface ChaptersProviderProps {
  children: ReactNode;
}

export const ChaptersProvider = ({ children }: ChaptersProviderProps) => {
  const [state, setState] = useState<ChaptersContextState>({
    chapters: [],
    loadingChapters: [],
  });

  const fetchChapter = useCallback(
    async (chapterNumber: number) => {
      // If we already have this chapter's data, do nothing
      if (state.chapters.some((c) => c.number === chapterNumber)) {
        return;
      }

      // If we're already loading this chapter, do nothing
      if (state.loadingChapters.includes(chapterNumber)) {
        return;
      }

      try {
        // Mark chapter as loading
        setState((prev) => ({
          ...prev,
          loadingChapters: [...prev.loadingChapters, chapterNumber],
        }));

        const elements = await getHtsChapterData(String(chapterNumber));

        // Add the new chapter data and remove from loading state
        setState((prev) => ({
          chapters: [...prev.chapters, { number: chapterNumber, elements }],
          loadingChapters: prev.loadingChapters.filter(
            (num) => num !== chapterNumber
          ),
        }));
      } catch (error) {
        console.error(`Failed to fetch chapter ${chapterNumber}:`, error);
        // Remove from loading state on error
        setState((prev) => ({
          ...prev,
          loadingChapters: prev.loadingChapters.filter(
            (num) => num !== chapterNumber
          ),
        }));
      }
    },
    [state.chapters, state.loadingChapters]
  );

  const getChapterElements = useCallback(
    (chapterNumber: number): HtsElement[] | undefined => {
      return state.chapters.find((c) => c.number === chapterNumber)?.elements;
    },
    [state.chapters]
  );

  const value: ChaptersContextValue = {
    ...state,
    fetchChapter,
    getChapterElements,
  };

  return (
    <ChaptersContext.Provider value={value}>
      {children}
    </ChaptersContext.Provider>
  );
};

export const useChapters = () => {
  const context = useContext(ChaptersContext);
  if (context === undefined) {
    throw new Error("useChapters must be used within a ChaptersProvider");
  }
  return context;
};
