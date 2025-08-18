"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import {
  NavigatableElement,
  NavigatableElementType,
} from "../components/Elements";
import {
  HtsElement,
  HtsSectionAndChapterBase,
  Navigatable,
} from "../interfaces/hts";

interface BreadcrumbsContextType {
  breadcrumbs: NavigatableElement[];
  setBreadcrumbs: (breadcrumbs: NavigatableElement[]) => void;
  addBreadcrumb: (navigatableElement: NavigatableElementType) => void;
  removeBreadcrumb: (index: number) => void;
  clearBreadcrumbs: () => void;
  resetBreadcrumbs: () => void;
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

  // TODO: this actually could not have the elements TYPE in it, but we need to figure out how to get it back
  const addBreadcrumb = (element: NavigatableElementType) => {
    const title =
      element.type === Navigatable.ELEMENT
        ? (element as HtsElement).htsno ||
          (element as HtsElement).description.split(" ").slice(0, 2).join(" ") +
            "..."
        : `Chapter ${(element as HtsSectionAndChapterBase).number}`;

    setBreadcrumbs((prev) => [
      ...prev,
      {
        title,
        element,
      },
    ]);
  };

  const removeBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const clearBreadcrumbs = () => {
    // Clear breadcrumbs, but keep the first one
    setBreadcrumbs((prev) => prev.slice(0, 1));
  };

  const resetBreadcrumbs = () => {
    // Completely clear all breadcrumbs
    setBreadcrumbs([]);
  };

  return (
    <BreadcrumbsContext.Provider
      value={{
        breadcrumbs,
        setBreadcrumbs,
        addBreadcrumb,
        removeBreadcrumb,
        clearBreadcrumbs,
        resetBreadcrumbs,
      }}
    >
      {children}
    </BreadcrumbsContext.Provider>
  );
}
