"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { HtsSection, HtsSectionAndChapterBase } from "../interfaces/hts";

export interface SectionCandidate {
  section: HtsSection;
  reasoning?: string;
}

export interface ChapterCandidate {
  chapter: HtsSectionAndChapterBase;
  sectionNumber: number;
  reasoning?: string;
}

interface SectionChapterDiscoveryContextType {
  // Section state
  sectionCandidates: SectionCandidate[];
  sectionReasoning: string | null;
  isFetchingSections: boolean;

  // Chapter state
  chapterCandidates: ChapterCandidate[];
  chapterReasoning: string | null;
  isFetchingChapters: boolean;

  // Discovery complete flags
  sectionDiscoveryComplete: boolean;
  chapterDiscoveryComplete: boolean;

  // Section actions
  setSectionCandidates: (candidates: SectionCandidate[]) => void;
  addSectionCandidate: (candidate: SectionCandidate) => void;
  removeSectionCandidate: (sectionNumber: number) => void;
  setSectionReasoning: (reasoning: string | null) => void;
  setIsFetchingSections: (isFetching: boolean) => void;
  setSectionDiscoveryComplete: (complete: boolean) => void;

  // Chapter actions
  setChapterCandidates: (candidates: ChapterCandidate[]) => void;
  addChapterCandidate: (candidate: ChapterCandidate) => void;
  removeChapterCandidate: (chapterNumber: number) => void;
  setChapterReasoning: (reasoning: string | null) => void;
  setIsFetchingChapters: (isFetching: boolean) => void;
  setChapterDiscoveryComplete: (complete: boolean) => void;

  // Reset
  resetDiscovery: () => void;
}

const SectionChapterDiscoveryContext = createContext<
  SectionChapterDiscoveryContextType | undefined
>(undefined);

export const SectionChapterDiscoveryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Section state
  const [sectionCandidates, setSectionCandidatesState] = useState<
    SectionCandidate[]
  >([]);
  const [sectionReasoning, setSectionReasoning] = useState<string | null>(null);
  const [isFetchingSections, setIsFetchingSections] = useState(false);
  const [sectionDiscoveryComplete, setSectionDiscoveryComplete] =
    useState(false);

  // Chapter state
  const [chapterCandidates, setChapterCandidatesState] = useState<
    ChapterCandidate[]
  >([]);
  const [chapterReasoning, setChapterReasoning] = useState<string | null>(null);
  const [isFetchingChapters, setIsFetchingChapters] = useState(false);
  const [chapterDiscoveryComplete, setChapterDiscoveryComplete] =
    useState(false);

  // Section actions
  const setSectionCandidates = useCallback((candidates: SectionCandidate[]) => {
    setSectionCandidatesState(candidates);
  }, []);

  const addSectionCandidate = useCallback((candidate: SectionCandidate) => {
    setSectionCandidatesState((prev) => [...prev, candidate]);
  }, []);

  const removeSectionCandidate = useCallback((sectionNumber: number) => {
    setSectionCandidatesState((prev) =>
      prev.filter((c) => c.section.number !== sectionNumber)
    );
  }, []);

  // Chapter actions
  const setChapterCandidates = useCallback((candidates: ChapterCandidate[]) => {
    setChapterCandidatesState(candidates);
  }, []);

  const addChapterCandidate = useCallback((candidate: ChapterCandidate) => {
    setChapterCandidatesState((prev) => [...prev, candidate]);
  }, []);

  const removeChapterCandidate = useCallback((chapterNumber: number) => {
    setChapterCandidatesState((prev) =>
      prev.filter((c) => c.chapter.number !== chapterNumber)
    );
  }, []);

  // Reset all discovery state
  const resetDiscovery = useCallback(() => {
    setSectionCandidatesState([]);
    setSectionReasoning(null);
    setIsFetchingSections(false);
    setSectionDiscoveryComplete(false);
    setChapterCandidatesState([]);
    setChapterReasoning(null);
    setIsFetchingChapters(false);
    setChapterDiscoveryComplete(false);
  }, []);

  return (
    <SectionChapterDiscoveryContext.Provider
      value={{
        // Section state
        sectionCandidates,
        sectionReasoning,
        isFetchingSections,
        sectionDiscoveryComplete,

        // Chapter state
        chapterCandidates,
        chapterReasoning,
        isFetchingChapters,
        chapterDiscoveryComplete,

        // Section actions
        setSectionCandidates,
        addSectionCandidate,
        removeSectionCandidate,
        setSectionReasoning,
        setIsFetchingSections,
        setSectionDiscoveryComplete,

        // Chapter actions
        setChapterCandidates,
        addChapterCandidate,
        removeChapterCandidate,
        setChapterReasoning,
        setIsFetchingChapters,
        setChapterDiscoveryComplete,

        // Reset
        resetDiscovery,
      }}
    >
      {children}
    </SectionChapterDiscoveryContext.Provider>
  );
};

export const useSectionChapterDiscovery = () => {
  const context = useContext(SectionChapterDiscoveryContext);
  if (context === undefined) {
    throw new Error(
      "useSectionChapterDiscovery must be used within a SectionChapterDiscoveryProvider"
    );
  }
  return context;
};
