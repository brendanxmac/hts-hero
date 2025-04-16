"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { HtsLevelClassification } from "../interfaces/hts";
import { HtsElement } from "../interfaces/hts";
import { HtsLevel } from "../enums/hts";

interface ClassificationContextType {
  classificationProgression: HtsLevelClassification[];
  setClassificationProgression: (progression: HtsLevelClassification[]) => void;
  addToClassificationProgression: (
    level: HtsLevel,
    candidates: HtsElement[]
  ) => void;
  clearClassificationProgression: () => void;
}

const ClassificationContext = createContext<
  ClassificationContextType | undefined
>(undefined);

export const ClassificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [classificationProgression, setClassificationProgression] = useState<
    HtsLevelClassification[]
  >([]);

  const addToClassificationProgression = (
    level: HtsLevel,
    candidates: HtsElement[]
  ) => {
    setClassificationProgression((prev) => [...prev, { level, candidates }]);
  };

  const clearClassificationProgression = () => {
    setClassificationProgression([]);
  };

  return (
    <ClassificationContext.Provider
      value={{
        classificationProgression,
        setClassificationProgression,
        addToClassificationProgression,
        clearClassificationProgression,
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
