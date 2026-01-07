"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Fuse from "fuse.js";
import { HtsElement } from "../interfaces/hts";
import {
  getHtsData,
  getHtsElementsFromString,
  HTS_CODE_REGEX,
} from "../libs/hts";

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
      console.log("Got Core");
      const htsElementsWithHtsCodes = coreElements.filter((e) =>
        e.description.match(HTS_CODE_REGEX)
      );
      console.log("Got Matches with HTS Codes");
      console.log(htsElementsWithHtsCodes.length);
      // console.log(htsElementsWithHtsCodes.map((e) => e.description));

      // Create Fuse index ONCE for all lookups (major perf improvement)
      const fuse = new Fuse(coreElements, {
        keys: ["htsno"],
        threshold: 0.3,
        includeScore: true,
      });

      const elementsForHtsCodesWithHtsCodeReferences =
        htsElementsWithHtsCodes.map((e) => ({
          text: e.description,
          elements: getHtsElementsFromString(e.description, coreElements, fuse),
        }));
      console.log(
        elementsForHtsCodesWithHtsCodeReferences.filter(
          (e) => e.elements.length > 0
        )
      );

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
