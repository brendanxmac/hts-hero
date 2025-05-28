"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { HtsElement } from "../interfaces/hts";
import { getHtsData } from "../libs/hts";

interface HtsContextType {
  htsElements: HtsElement[];
  fetchElements: () => Promise<void>;
}

const HtsContext = createContext<HtsContextType | undefined>(undefined);

export const HtsProvider = ({ children }: { children: ReactNode }) => {
  const [htsElements, setHtsElements] = useState<HtsElement[]>([]);

  const fetchElements = async () => {
    const elements = await getHtsData();
    setHtsElements(elements);
  };

  return (
    <HtsContext.Provider value={{ htsElements, fetchElements }}>
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
