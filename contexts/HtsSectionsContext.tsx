"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { getHtsSectionsAndChapters } from "../libs/hts";
import { HtsSection, HtsSectionAndChapterBase } from "../interfaces/hts";

interface HtsSectionsContextType {
  sections: HtsSection[];
  loading: boolean;
  getSections: () => Promise<HtsSection[]>;
  findChapterByNumber: (
    chapterNumber: number
  ) => HtsSectionAndChapterBase | undefined;
}

const HtsSectionsContext = createContext<HtsSectionsContextType | undefined>(
  undefined
);

export const HtsSectionsProvider = ({ children }: { children: ReactNode }) => {
  const [sections, setSections] = useState<HtsSection[]>([]);
  const [loading, setLoading] = useState(false);

  const getSections = async () => {
    if (sections.length > 0) {
      return sections;
    }

    setLoading(true);
    try {
      const { sections: newSections } = await getHtsSectionsAndChapters();
      setSections(newSections);
      return newSections;
    } finally {
      setLoading(false);
    }
  };

  const findChapterByNumber = (chapterNumber: number) => {
    for (const section of sections) {
      const chapter = section.chapters.find(
        (ch) => ch.number === chapterNumber
      );
      if (chapter) {
        return chapter;
      }
    }
    return undefined;
  };

  return (
    <HtsSectionsContext.Provider
      value={{ sections, loading, getSections, findChapterByNumber }}
    >
      {children}
    </HtsSectionsContext.Provider>
  );
};

export const useHtsSections = () => {
  const context = useContext(HtsSectionsContext);
  if (context === undefined) {
    throw new Error("useHtsSections must be used within a HtsSectionsProvider");
  }
  return context;
};
