"use client";

import { createContext, useContext, useState, ReactNode } from "react";
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
