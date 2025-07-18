"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import { Guide, GuideName } from "@/types/guides";
import { FeatureI } from "@/interfaces/ui";

interface GuideContextType {
  showGuide: (guideName: GuideName) => void;
  hideGuide: () => void;
  isGuideVisible: boolean;
  currentGuide: GuideName | null;
  guideSteps: FeatureI[];
  guides: Guide[];
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

interface GuideProviderProps {
  children: ReactNode;
  guides: Guide[];
}

export const GuideProvider = ({ children, guides }: GuideProviderProps) => {
  const [currentGuide, setCurrentGuide] = useState<GuideName | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(false);

  const showGuide = (guideName: GuideName) => {
    setCurrentGuide(guideName);
    setIsGuideVisible(true);
  };

  const hideGuide = () => {
    setIsGuideVisible(false);
  };

  const currentGuideConfig = guides.find((g) => g.name === currentGuide);
  const guideSteps = currentGuideConfig?.steps || [];

  return (
    <GuideContext.Provider
      value={{
        showGuide,
        hideGuide,
        isGuideVisible,
        currentGuide,
        guideSteps,
        guides,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
};

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error("useGuide must be used within a GuideProvider");
  }
  return context;
};
