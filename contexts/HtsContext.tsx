"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Fuse from "fuse.js";
import { HtsElement } from "../interfaces/hts";
import { getHtsData } from "../libs/hts";

interface HtsContextType {
  htsElements: HtsElement[];
  revision: string | null;
  isFetching: boolean;
  fetchElements: (revision: string) => Promise<void>;
}

const HtsContext = createContext<HtsContextType | undefined>(undefined);

export const HtsProvider = ({ children }: { children: ReactNode }) => {
  const [htsElements, setHtsElements] = useState<HtsElement[]>([]);
  const [revision, setRevision] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const fetchElements = async (revision: string) => {
    setIsFetching(true);
    try {
      const { data: elements, revisionName } = await getHtsData(revision);

      const coreElements = elements.filter((e) => e.chapter < 98);
      const elementsWithReferences = coreElements.filter((e) =>
        e.description.match(
          /\b\d{4}(?:\.\d{2}(?:\.(?:\d{4}|\d{2}(?:\.\d{2})?))?)?\b/g
        )
      );

      console.log("elementsWithReferences:", elementsWithReferences.length);

      const RANGE_REGEX =
        /(\b\d{4}(?:\.\d{2}(?:\.(?:\d{4}|\d{2}(?:\.\d{2})?))?)?\b)\s+(?:to|through)\s+(\b\d{4}(?:\.\d{2}(?:\.(?:\d{4}|\d{2}(?:\.\d{2})?))?)?\b)/gi;

      const elementsWithRanges = elementsWithReferences.filter((e) =>
        e.description.match(RANGE_REGEX)
      );
      console.log("elementsWithRanges:", elementsWithRanges.length);

      const normalizeHtsCode = (code: string): string => {
        return code.replace(/\./g, "").padEnd(10, "0");
      };

      const expandRange = (
        start: string,
        end: string,
        allElements: HtsElement[]
      ): HtsElement[] => {
        const startKey = normalizeHtsCode(start);
        const endKey = normalizeHtsCode(end);

        return allElements.filter((el) => {
          const elKey = normalizeHtsCode(el.htsno);
          return elKey >= startKey && elKey <= endKey;
        });
      };

      const findHtsElement = (
        htsno: string,
        allElements: HtsElement[],
        fuse: Fuse<HtsElement>
      ): HtsElement | null => {
        // Try exact match first
        const exactMatch = allElements.find((e) => e.htsno === htsno);
        if (exactMatch) return exactMatch;

        // Fall back to Fuse fuzzy search for closest match
        const fuseResults = fuse.search(htsno);
        if (fuseResults.length > 0) {
          return fuseResults[0].item;
        }

        return null;
      };

      const resolveRanges = (
        rangeText: string,
        allElements: HtsElement[]
      ): HtsElement[] => {
        const matches = Array.from(
          rangeText.matchAll(RANGE_REGEX)
        ) as RegExpMatchArray[];

        const results: HtsElement[] = [];
        let htsLevel: string | null = null;

        // Create Fuse instance for fuzzy htsno searching
        const fuse = new Fuse(allElements, {
          keys: ["htsno"],
          threshold: 0.3,
          includeScore: true,
        });

        for (const match of matches) {
          const start = match[1];
          const end = match[2];

          // Find start or end element using exact match first, then fuzzy fallback
          const startElement = findHtsElement(start, allElements, fuse);
          const endElement = findHtsElement(end, allElements, fuse);

          if (startElement) {
            htsLevel = startElement.indent;
          } else if (endElement) {
            htsLevel = endElement.indent;
          } else {
            console.error("🔴🔴 NO START OR END ELEMENT DETECTED 🔴🔴");
          }

          const expanded = expandRange(start, end, allElements);
          results.push(...expanded);
        }

        // console.log("HTS Level", htsLevel);
        console.log("Result Count", results.length);
        console.log(typeof htsLevel);

        const resultsAtSameHtsLevel = results.filter(
          (e) => e.indent == htsLevel
        );

        console.log("Results at Same HTS Level", resultsAtSameHtsLevel.length);

        return resultsAtSameHtsLevel;

        // Remove duplicates
        const seen = new Set<string>();
        return resultsAtSameHtsLevel.filter((e) => {
          if (seen.has(e.htsno)) return false;
          seen.add(e.htsno);
          return true;
        });
      };

      elementsWithRanges.map((e) => {
        const range = e.description.match(RANGE_REGEX);

        if (range) {
          console.log(`${range[0]}`);
          const resolvedRange = resolveRanges(e.description, coreElements);
          console.log(resolvedRange.map((r) => r.htsno));
        } else {
          console.error("Missed Range!");
          console.log(e.description);
        }
      });

      setHtsElements(elements);
      setRevision(revisionName);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <HtsContext.Provider
      value={{ htsElements, revision, isFetching, fetchElements }}
    >
      {children}
    </HtsContext.Provider>
  );
};

export const useHts = () => {
  const context = useContext(HtsContext);
  if (context === undefined) {
    throw new Error("useHts must be used within a HtsProvider");
  }
  return context;
};
