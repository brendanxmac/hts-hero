"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { NavigatableElement } from "../components/Elements";
import { HtsElement } from "../interfaces/hts";

interface BreadcrumbsContextType {
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
  addBreadcrumb: (element: HtsElement) => void;
  removeBreadcrumb: (index: number) => void;
  clearBreadcrumbs: () => void;
}

const BreadcrumbsContext = createContext<BreadcrumbsContextType | undefined>(
  undefined
);

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbsContext);
  if (context === undefined) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbsProvider");
  }
  return context;
}

interface BreadcrumbsProviderProps {
  children: ReactNode;
}

export function BreadcrumbsProvider({ children }: BreadcrumbsProviderProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<NavigatableElement[]>([]);

  const addBreadcrumb = (element: HtsElement) => {
    setBreadcrumbs((prev) => [
      ...prev,
      {
        title:
          element.htsno ||
          element.description.split(" ").slice(0, 2).join(" ") + "...",
        element,
      },
    ]);
  };

  const removeBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const clearBreadcrumbs = () => {
    console.log("Clearing breadcrumbs");
    // Clear breadcrumbs, but keep the first one
    setBreadcrumbs((prev) => prev.slice(0, 1));
  };

  return (
    <BreadcrumbsContext.Provider
      value={{
        breadcrumbs,
        setBreadcrumbs,
        addBreadcrumb,
        removeBreadcrumb,
        clearBreadcrumbs,
      }}
    >
      {children}
    </BreadcrumbsContext.Provider>
  );
}
