"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { HtsLayerSelection } from "../interfaces/hts";

interface HtsContext {
  productDescription: string;
  setProductDescription: (value: string) => void;
  classificationProgression: HtsLayerSelection[];
  setClassificationProgression: (value: HtsLayerSelection[]) => void;
}

// Create the context
const HtsContext = createContext<HtsContext | undefined>(undefined);

// Context Provider
export const HtsProvider = ({ children }: { children: ReactNode }) => {
  const [productDescription, setProductDescription] = useState<string>("");
  const [classificationProgression, setClassificationProgression] = useState<
    HtsLayerSelection[]
  >([]);

  return (
    <HtsContext.Provider
      value={{
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
