"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ClassifyTab } from "../components/workflow/ClassificationNavigation";

interface ClassifyTabContextType {
  activeTab: ClassifyTab;
  setActiveTab: (tab: ClassifyTab) => void;
}

const ClassifyTabContext = createContext<ClassifyTabContextType | undefined>(
  undefined
);

export function ClassifyTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<ClassifyTab>(ClassifyTab.CLASSIFY);

  return (
    <ClassifyTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ClassifyTabContext.Provider>
  );
}

export function useClassifyTab() {
  const context = useContext(ClassifyTabContext);
  if (context === undefined) {
    throw new Error("useClassifyTab must be used within a ClassifyTabProvider");
  }
  return context;
}
