"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Classification, HtsLevelClassification } from "../interfaces/hts";
import { HtsElement } from "../interfaces/hts";
import { HtsLevel } from "../enums/hts";

interface ClassificationContextType {
  classification: Classification;
  setClassification: (
    classification: Classification | ((prev: Classification) => Classification)
  ) => void;
  // Helper functions
  setProductDescription: (description: string) => void;
  setHtsDescription: (description: string) => void;
  setAnalysis: (analysis: string) => void;
  addToProgressionLevels: (
    level: HtsLevel,
    candidates: HtsElement[],
    selection?: HtsElement,
    reasoning?: string
  ) => void;
  updateProgressionLevel: (
    index: number,
    updates: Partial<HtsLevelClassification>
  ) => void;
  clearClassification: () => void;
}

const ClassificationContext = createContext<
  ClassificationContextType | undefined
>(undefined);

export const ClassificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [classification, setClassification] = useState<Classification>({
    productDescription: "",
    analysis: "",
    htsDescription: "",
    progressionLevels: [],
  });

  const setProductDescription = (description: string) => {
    setClassification((prev) => ({
      ...prev,
      productDescription: description,
    }));
  };

  const setHtsDescription = (description: string) => {
    setClassification((prev) => ({
      ...prev,
      htsDescription: description,
    }));
  };

  const setAnalysis = (analysis: string) => {
    setClassification((prev) => ({
      ...prev,
      analysis: analysis,
    }));
  };

  const addToProgressionLevels = (
    level: HtsLevel,
    candidates: HtsElement[],
    selection?: HtsElement,
    reasoning?: string
  ) => {
    setClassification((prev) => ({
      ...prev,
      progressionLevels: [
        ...prev.progressionLevels,
        {
          levelName: level,
          candidates,
          selection,
          reasoning,
        },
      ],
    }));
  };

  const updateProgressionLevel = (
    index: number,
    updates: Partial<HtsLevelClassification>
  ) => {
    setClassification((prev) => {
      // This code safely updates a specific progression level in the classification state
      // 1. First spread creates a new array copy to avoid mutating the original state
      const newProgressionLevels = [...prev.progressionLevels];

      // 2. For the progression level we want to update:
      // - First spread copies all existing properties from the original level
      // - Second spread overlays any new/updated properties on top
      // This ensures we keep all original properties while updating only what changed
      newProgressionLevels[index] = {
        ...newProgressionLevels[index], // Keep existing properties
        ...updates, // Override with any new values
      };

      // 3. Create new state object with updated progression levels
      return {
        ...prev,
        progressionLevels: newProgressionLevels,
      };
    });
  };

  const clearClassification = () => {
    setClassification({
      productDescription: "",
      analysis: "",
      htsDescription: "",
      progressionLevels: [],
    });
  };

  return (
    <ClassificationContext.Provider
      value={{
        classification,
        setClassification,
        setProductDescription,
        setHtsDescription,
        setAnalysis,
        addToProgressionLevels,
        updateProgressionLevel,
        clearClassification,
      }}
    >
      {children}
    </ClassificationContext.Provider>
  );
};

export const useClassification = () => {
  const context = useContext(ClassificationContext);
  if (context === undefined) {
    throw new Error(
      "useClassification must be used within a ClassificationProvider"
    );
  }
  return context;
};
