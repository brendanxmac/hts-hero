"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Classification, ClassificationProgression } from "../interfaces/hts";
import { HtsElement } from "../interfaces/hts";
import {
  createClassification,
  updateClassification,
} from "../libs/classification";

interface ClassificationContextType {
  classification?: Classification;
  classificationId?: string;
  setClassificationId: (id: string | null) => void;
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
    reasoning?: string,
    questions?: string[]
  ) => void;
  updateLevel: (
    index: number,
    updates: Partial<ClassificationProgression>
  ) => void;
  clearClassification: (keepArticleDescription?: boolean) => void;
  startNewClassification: (articleDescription?: string) => void;
  saveClassification: () => Promise<void>;
}

const ClassificationContext = createContext<
  ClassificationContextType | undefined
>(undefined);

export const ClassificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [classificationId, setClassificationId] = useState<string | null>(null);
  const [classification, setClassification] = useState<Classification>({
    notes: "",
    articleDescription: "",
    articleAnalysis: "",
    progressionDescription: "",
    levels: [],
    isComplete: false,
  });

  useEffect(() => {
    if (!classification || !classificationId) return;

    const timeoutId = setTimeout(() => {
      console.log("Saving classification");
      saveClassification();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [classification]);

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
    reasoning?: string,
    questions?: string[]
  ) => {
    setClassification((prev) => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          candidates,
          selection,
          reasoning,
          questions,
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
      notes: "",
    });
  };

  const saveClassification = async () => {
    if (!classificationId) {
      throw new Error("Classification ID is not set");
    }

    await updateClassification(classificationId, classification);
  };

  // This creates a record in the DB and sets up the context record for local changes
  const startNewClassification = async (articleDescription: string) => {
    const newClassification: Classification = {
      articleDescription,
      articleAnalysis: "",
      progressionDescription: "",
      levels: [],
      isComplete: false,
      notes: "",
    };
    const classificationRecord = await createClassification(newClassification);
    setClassificationId(classificationRecord.id);
    setClassification(newClassification);
  };

  return (
    <ClassificationContext.Provider
      value={{
        classification,
        classificationId,
        setClassificationId,
        setClassification,
        setArticleDescription,
        setProgressionDescription,
        setArticleAnalysis,
        addLevel,
        updateLevel,
        clearClassification,
        startNewClassification,
        saveClassification,
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
