"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Classification, ClassificationProgression } from "../interfaces/hts";
import { HtsElement } from "../interfaces/hts";

interface ClassificationContextType {
  classification: Classification;
  setClassification: (
    classification: Classification | ((prev: Classification) => Classification)
  ) => void;
  // Helper functions
  setArticleDescription: (description: string) => void;
  setProgressionDescription: (description: string) => void;
  setArticleAnalysis: (analysis: string) => void;
  addLevel: (
    candidates: HtsElement[],
    selection?: HtsElement,
    reasoning?: string
  ) => void;
  updateLevel: (
    index: number,
    updates: Partial<ClassificationProgression>
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
    articleDescription: "",
    articleAnalysis: "",
    progressionDescription: "",
    levels: [],
  });

  const setArticleDescription = (description: string) => {
    setClassification((prev) => ({
      ...prev,
      articleDescription: description,
    }));
  };

  const setProgressionDescription = (description: string) => {
    setClassification((prev) => ({
      ...prev,
      progressionDescription: description,
    }));
  };

  const setArticleAnalysis = (analysis: string) => {
    setClassification((prev) => ({
      ...prev,
      articleAnalysis: analysis,
    }));
  };

  const addLevel = (
    candidates: HtsElement[],
    selection?: HtsElement,
    reasoning?: string
  ) => {
    setClassification((prev) => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          candidates,
          selection,
          reasoning,
        },
      ],
    }));
  };

  const updateLevel = (
    index: number,
    updates: Partial<ClassificationProgression>
  ) => {
    setClassification((prev) => {
      // This code safely updates a specific progression level in the classification state
      // 1. First spread creates a new array copy to avoid mutating the original state
      const newProgressionLevels = [...prev.levels];

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
        levels: newProgressionLevels,
      };
    });
  };

  const clearClassification = () => {
    setClassification({
      articleDescription: "",
      articleAnalysis: "",
      progressionDescription: "",
      levels: [],
      isComplete: false,
    });
  };

  return (
    <ClassificationContext.Provider
      value={{
        classification,
        setClassification,
        setArticleDescription,
        setProgressionDescription,
        setArticleAnalysis,
        addLevel,
        updateLevel,
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
