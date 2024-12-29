"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { HtsLevelSelection, HtsParsed } from "../interfaces/hts";

interface HtsContext {
  currentClassification: HtsParsed | undefined;
  setCurrentClassification: (classifcation: HtsParsed | undefined) => void;
  findingHts: boolean;
  setFindingHts: (value: boolean) => void;
  productDescription: string;
  setProductDescription: (value: string) => void;
  classificationProgression: HtsLevelSelection[];
  setClassificationProgression: (value: HtsLevelSelection[]) => void;
}

// Create the context
const HtsContext = createContext<HtsContext | undefined>(undefined);

// Context Provider
export const HtsProvider = ({ children }: { children: ReactNode }) => {
  const [currentClassification, setCurrentClassification] = useState(undefined);
  const [findingHts, setFindingHts] = useState<boolean>(false);
  const [productDescription, setProductDescription] = useState<string>("");
  const [classificationProgression, setClassificationProgression] = useState<
    HtsLevelSelection[]
  >([]);

  return (
    <HtsContext.Provider
      value={{
        currentClassification,
        setCurrentClassification,
        findingHts,
        setFindingHts,
        productDescription,
        setProductDescription,
        classificationProgression,
        setClassificationProgression,
      }}
    >
      {children}
    </HtsContext.Provider>
  );
};

export const useHtsContext = () => {
  const context = useContext(HtsContext);
  if (!context) {
    throw new Error("useHtsContext must be used within an AppProvider");
  }
  return context;
};
